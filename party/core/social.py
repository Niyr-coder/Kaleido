#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kaleido party social features: shared theme, party color, skin challenges and group roulette.

Everything here runs on the Python side. Skin-line data comes from the LCU
(/lol-game-data/assets/v1/skins.json + skinlines.json) and chroma colors from the
skin scraper cache. Actions on the local client go through callables provided by
the message handler (apply a skin, run the dice, show a toast, broadcast state).
"""

from __future__ import annotations

import random
import threading
import time
from typing import Callable, Dict, List, Optional, Set

from utils.core.logging import get_logger

log = get_logger()

PARTY_COLORS: Dict[str, str] = {
    "red": "#e03a3a",
    "blue": "#2f7bff",
    "green": "#3ccf5a",
    "yellow": "#f5d030",
    "purple": "#8b5cf6",
    "pink": "#ff5fb0",
    "orange": "#ff8a2a",
    "white": "#f0f0f0",
    "black": "#202020",
}

SUGGEST_COOLDOWN_S = 20.0


def _hex_to_rgb(value: str) -> Optional[tuple]:
    v = (value or "").strip().lstrip("#")
    if len(v) != 6:
        return None
    try:
        return tuple(int(v[i:i + 2], 16) for i in (0, 2, 4))
    except ValueError:
        return None


def _distance(a: tuple, b: tuple) -> float:
    # weighted RGB distance (perceptual-ish)
    return ((a[0] - b[0]) ** 2) * 0.3 + ((a[1] - b[1]) ** 2) * 0.59 + ((a[2] - b[2]) ** 2) * 0.11


class PartySocial:
    def __init__(
        self,
        shared_state,
        skin_scraper,
        get_party_manager: Callable[[], object],
        apply_skin: Callable[[int, str], tuple],
        run_dice: Callable[[], bool],
        send_toast: Callable[[str, str], None],
        broadcast_state: Callable[[], None],
        schedule: Callable[[object], None],
        skin_name: Callable[[int], Optional[str]],
    ):
        self.state = shared_state
        self.skin_scraper = skin_scraper
        self._get_pm = get_party_manager
        self._apply_skin = apply_skin
        self._run_dice = run_dice
        self._toast = lambda text, kind="info", action=None: (send_toast(text, kind, action) if action is not None else send_toast(text, kind))
        self._broadcast = broadcast_state
        self._schedule = schedule
        self._skin_name = skin_name

        self._skins: Optional[dict] = None          # skin_id -> {"name", "lines": set[int]}
        self._chroma_parent: Dict[int, int] = {}
        self._line_names: Dict[int, str] = {}
        self._lock = threading.Lock()
        self._last_suggest: Dict[int, float] = {}
        self._last_online: Dict[int, float] = {}

    # ------------------------------------------------------------------ data
    def _lcu(self):
        return getattr(self.skin_scraper, "lcu", None) if self.skin_scraper else None

    def _load_skin_lines(self) -> bool:
        if self._skins is not None:
            return True
        lcu = self._lcu()
        if not lcu:
            return False
        with self._lock:
            if self._skins is not None:
                return True
            try:
                raw = lcu.get("/lol-game-data/assets/v1/skins.json", timeout=5.0)
                lines = lcu.get("/lol-game-data/assets/v1/skinlines.json", timeout=5.0)
            except Exception as exc:
                log.debug(f"[SOCIAL] skins.json fetch failed: {exc}")
                return False
            if not isinstance(raw, dict) or not raw:
                return False
            skins: dict = {}
            chroma_parent: Dict[int, int] = {}
            for key, entry in raw.items():
                try:
                    sid = int(entry.get("id", key))
                except (TypeError, ValueError):
                    continue
                line_ids: Set[int] = set()
                for ln in entry.get("skinLines") or []:
                    try:
                        line_ids.add(int(ln.get("id")))
                    except (TypeError, ValueError, AttributeError):
                        continue
                skins[sid] = {"name": entry.get("name") or f"Skin {sid}", "lines": line_ids}
                for ch in entry.get("chromas") or []:
                    try:
                        chroma_parent[int(ch.get("id"))] = sid
                    except (TypeError, ValueError, AttributeError):
                        continue
            names: Dict[int, str] = {}
            for ln in (lines if isinstance(lines, list) else []):
                try:
                    names[int(ln.get("id"))] = str(ln.get("name") or "")
                except (TypeError, ValueError, AttributeError):
                    continue
            self._skins = skins
            self._chroma_parent = chroma_parent
            self._line_names = names
            log.info(f"[SOCIAL] Loaded {len(skins)} skins and {len(names)} skin lines from the LCU")
            return True

    def base_skin_id(self, skin_or_chroma_id: int) -> int:
        self._load_skin_lines()
        return self._chroma_parent.get(int(skin_or_chroma_id), int(skin_or_chroma_id))

    def lines_for_skin(self, skin_or_chroma_id: int) -> Set[int]:
        if not self._load_skin_lines():
            return set()
        entry = self._skins.get(self.base_skin_id(skin_or_chroma_id))
        return set(entry["lines"]) if entry else set()

    def line_name(self, line_id: int) -> str:
        self._load_skin_lines()
        return self._line_names.get(int(line_id)) or f"#{line_id}"

    def skins_of_champion_in_lines(self, champion_id: int, lines: Set[int]) -> List[int]:
        if not lines or not self._load_skin_lines():
            return []
        out = []
        for sid, entry in self._skins.items():
            if sid // 1000 == int(champion_id) and sid % 1000 != 0 and entry["lines"] & lines:
                out.append(sid)
        return sorted(out)

    def lines_of_champion(self, champion_id: int) -> Dict[int, List[int]]:
        """line_id -> skin ids of this champion in that line."""
        if not self._load_skin_lines():
            return {}
        out: Dict[int, List[int]] = {}
        for sid, entry in self._skins.items():
            if sid // 1000 == int(champion_id) and sid % 1000 != 0:
                for ln in entry["lines"]:
                    out.setdefault(ln, []).append(sid)
        return out

    # ------------------------------------------------------------------ helpers
    def _pm(self):
        return self._get_pm()

    def _my_champion(self) -> Optional[int]:
        champ = getattr(self.state, "locked_champ_id", None)
        return int(champ) if champ else None

    def _peer_name(self, summoner_id: int) -> str:
        pm = self._pm()
        try:
            peer = pm.party_state.peers.get(int(summoner_id))
            return peer.summoner_name if peer else str(summoner_id)
        except Exception:
            return str(summoner_id)

    def _name_of(self, skin_id: int) -> str:
        name = None
        try:
            name = self._skin_name(int(skin_id))
        except Exception:
            name = None
        if not name and self._load_skin_lines():
            entry = self._skins.get(self.base_skin_id(skin_id))
            name = entry["name"] if entry else None
        return name or f"Skin {skin_id}"

    def _current_selection_id(self) -> Optional[int]:
        """The skin/chroma Kaleido will inject for me right now (best effort)."""
        if getattr(self.state, "random_mode_active", False) and getattr(self.state, "random_skin_id", None):
            return int(self.state.random_skin_id)
        for attr in ("selected_chroma_id", "ui_skin_id", "last_hovered_skin_id"):
            value = getattr(self.state, attr, None)
            if value:
                return int(value)
        return None

    # ------------------------------------------------------------------ 2. shared theme
    def match_theme(self, peer_summoner_id: Optional[int] = None) -> tuple:
        pm = self._pm()
        if not pm or not pm.enabled:
            return False, "Party mode not enabled"
        champ = self._my_champion()
        if not champ:
            return False, "Lock a champion first"
        candidates = []
        peers = list(pm.party_state.peers.values())
        if peer_summoner_id is not None:
            peers = [p for p in peers if p.summoner_id == int(peer_summoner_id)]
        for peer in peers:
            sel = peer.skin_selection
            if not sel or not sel.skin_id:
                continue
            lines = self.lines_for_skin(sel.chroma_id or sel.skin_id)
            skins = self._allowed(champ, self.skins_of_champion_in_lines(champ, lines))
            if skins:
                candidates.append((peer, lines, skins))
        if not candidates:
            return False, "No matching theme for your champion"
        peer, lines, skins = candidates[0]
        target = skins[0]
        ok, msg = self._apply_skin(target, "theme")
        if ok:
            shared = lines & self.lines_for_skin(target)
            label = self.line_name(next(iter(shared))) if shared else self._name_of(target)
            return True, f"{label}: {self._name_of(target)}"
        return False, msg

    def on_peer_online(self, summoner_id: int, name: str) -> None:
        """A friend of the permanent group opened Kaleido: toast with an 'invite to lobby' action."""
        try:
            now = time.time()
            if now - self._last_online.get(int(summoner_id), 0.0) < 120:
                return
            self._last_online[int(summoner_id)] = now
            self._toast(f"{name} is online", "info", {"label": "Invite to lobby", "type": "invite", "summonerId": int(summoner_id)})
        except Exception as exc:
            log.debug(f"[SOCIAL] online toast failed: {exc}")

    def _allowed(self, champion_id: int, skin_ids) -> list:
        try:
            from utils.core import blacklist
            return blacklist.filter_allowed(champion_id, skin_ids, base_of=self.base_skin_id)
        except Exception:
            return list(skin_ids)

    def on_peer_skin(self, summoner_id: int, name: str, sel) -> None:
        """Suggest a matching theme when a friend picks a themed skin (throttled)."""
        try:
            champ = self._my_champion()
            if not champ or not sel or not sel.skin_id:
                return
            now = time.time()
            if now - self._last_suggest.get(int(summoner_id), 0.0) < SUGGEST_COOLDOWN_S:
                return
            lines = self.lines_for_skin(sel.chroma_id or sel.skin_id)
            skins = self.skins_of_champion_in_lines(champ, lines)
            if not skins:
                return
            self._last_suggest[int(summoner_id)] = now
            shared = lines & self.lines_for_skin(skins[0])
            label = self.line_name(next(iter(shared))) if shared else self._name_of(skins[0])
            self._toast(f"{name} → {label}. Ctrl+T", "info")
        except Exception as exc:
            log.debug(f"[SOCIAL] suggest failed: {exc}")

    # ------------------------------------------------------------------ 3. party color
    def set_color(self, color: Optional[str]) -> tuple:
        pm = self._pm()
        if not pm or not pm.enabled:
            return False, "Party mode not enabled"
        if color:
            key = str(color).lower()
            if key not in PARTY_COLORS:
                return False, "Unknown color"
            value = {"name": key, "hex": PARTY_COLORS[key]}
        else:
            value = None
        self._schedule(pm.set_room_value("color", value))
        return True, key if color else "cleared"

    def current_color(self) -> Optional[dict]:
        pm = self._pm()
        try:
            entry = pm.party_state.room.get("color") if pm else None
            value = entry.get("value") if isinstance(entry, dict) else None
            return value if isinstance(value, dict) and value.get("hex") else None
        except Exception:
            return None

    def best_chroma_for_color(self, base_skin_id: int, hex_color: str) -> Optional[tuple]:
        target = _hex_to_rgb(hex_color)
        if not target or not self.skin_scraper:
            return None
        try:
            chromas = self.skin_scraper.get_chromas_for_skin(int(base_skin_id)) or []
        except Exception:
            chromas = []
        best = None
        for ch in chromas:
            cid = ch.get("id")
            if not cid:
                continue
            for col in ch.get("colors") or []:
                rgb = _hex_to_rgb(str(col))
                if not rgb:
                    continue
                d = _distance(rgb, target)
                if best is None or d < best[0]:
                    best = (d, int(cid), ch.get("name") or f"Chroma {cid}")
        return (best[1], best[2]) if best else None

    def apply_color(self) -> tuple:
        color = self.current_color()
        if not color:
            return False, "No party color set"
        champ = self._my_champion()
        if not champ:
            return False, "Lock a champion first"
        current = self._current_selection_id()
        if not current:
            return False, "Hover a skin first"
        base = self.base_skin_id(current)
        if base // 1000 != champ:
            return False, "Hover a skin first"
        if base % 1000 == 0:
            return False, "The base skin has no chromas"
        best = self.best_chroma_for_color(base, color["hex"])
        if not best:
            return False, "This skin has no chromas"
        ok, msg = self._apply_skin(best[0], "party-color")
        return (True, best[1]) if ok else (False, msg)

    def on_room_changed(self, old: dict, new: dict) -> None:
        try:
            old_c = (old.get("color") or {}).get("value") if isinstance(old.get("color"), dict) else None
            new_c = (new.get("color") or {}).get("value") if isinstance(new.get("color"), dict) else None
            if new_c != old_c:
                by = (new.get("color") or {}).get("by_name") if new_c else None
                if new_c:
                    self._toast(f"{by or 'Party'}: color {new_c.get('name')}", "info")
                else:
                    self._toast("Party color cleared", "info")
        except Exception as exc:
            log.debug(f"[SOCIAL] room change failed: {exc}")
        self._broadcast()

    # ------------------------------------------------------------------ 4. skin challenge
    def challenge(self, to_summoner_id: int, skin_id: int) -> tuple:
        pm = self._pm()
        if not pm or not pm.enabled:
            return False, "Party mode not enabled"
        if int(to_summoner_id) not in pm.party_state.peers:
            return False, "Friend not connected"
        skin_id = int(skin_id)
        payload = {
            "skin_id": skin_id,
            "champion_id": self.base_skin_id(skin_id) // 1000,
            "skin_name": self._name_of(skin_id),
        }
        self._schedule(pm.send_event("challenge", payload, to=int(to_summoner_id)))
        return True, f"{self._peer_name(to_summoner_id)}: {payload['skin_name']}"

    def respond_challenge(self, accept: bool) -> tuple:
        pm = self._pm()
        if not pm:
            return False, "Party mode not enabled"
        pending = pm.party_state.pending_challenge
        if not pending:
            return False, "No pending challenge"
        pm.party_state.pending_challenge = None
        accepted = False
        message = "Challenge ignored"
        if accept:
            champ = self._my_champion()
            if champ and int(pending.get("champion_id") or 0) != champ:
                message = "Your friend picked a skin of another champion"
            elif not champ:
                message = "Lock a champion first"
            elif not self._allowed(champ, [int(pending["skin_id"])]):
                message = "That skin is on your blacklist"
            else:
                ok, msg = self._apply_skin(int(pending["skin_id"]), "challenge")
                accepted = bool(ok)
                message = pending.get("skin_name") or msg if ok else msg
        self._schedule(pm.send_event("challenge_result", {
            "accepted": accepted, "skin_name": pending.get("skin_name"), "reason": message,
        }, to=int(pending.get("from_id") or 0)))
        self._broadcast()
        return accepted or not accept, message

    # ------------------------------------------------------------------ 5. group roulette
    def roulette(self, mode: str = "all") -> tuple:
        pm = self._pm()
        if not pm or not pm.enabled:
            return False, "Party mode not enabled"
        mode = "theme" if str(mode) == "theme" else "all"
        data = {"mode": mode}
        if mode == "theme":
            champ = self._my_champion()
            if not champ:
                return False, "Lock a champion first"
            lines = self.lines_of_champion(champ)
            if not lines:
                return False, "Your champion has no themed skins"
            line_id = random.choice(list(lines.keys()))
            data["line_id"] = line_id
            data["line_name"] = self.line_name(line_id)
        self._schedule(pm.send_event("roulette", data))
        self._run_roulette_locally(data, by=pm.party_state.my_summoner_name or "You")
        return True, data.get("line_name") or "all"

    def _run_roulette_locally(self, data: dict, by: str) -> None:
        mode = data.get("mode")
        champ = self._my_champion()
        if mode == "theme" and champ and data.get("line_id") is not None:
            try:
                skins = self._allowed(champ, self.skins_of_champion_in_lines(champ, {int(data["line_id"])}))
            except (TypeError, ValueError):
                skins = []
            if skins:
                ok, _ = self._apply_skin(random.choice(skins), "roulette")
                if ok:
                    return
        self._run_dice()

    # ------------------------------------------------------------------ relay events
    def on_event(self, msg: dict) -> None:
        pm = self._pm()
        event = msg.get("event")
        data = msg.get("data") or {}
        sender = msg.get("from") or {}
        from_id = sender.get("summoner_id")
        from_name = sender.get("summoner_name") or self._peer_name(from_id or 0)
        try:
            if event == "challenge":
                pm.party_state.pending_challenge = {
                    "from_id": from_id, "from_name": from_name,
                    "skin_id": int(data.get("skin_id") or 0),
                    "champion_id": int(data.get("champion_id") or 0),
                    "skin_name": data.get("skin_name") or self._name_of(int(data.get("skin_id") or 0)),
                    "ts": int(time.time()),
                }
                self._toast(f"{from_name} → {pm.party_state.pending_challenge['skin_name']}", "info")
                self._broadcast()
            elif event == "challenge_result":
                if data.get("accepted"):
                    self._toast(f"{from_name} ✓ {data.get('skin_name') or ''}", "success")
                else:
                    self._toast(f"{from_name} ✗ {data.get('reason') or ''}", "info")
            elif event == "roulette":
                label = data.get("line_name") or ("theme" if data.get("mode") == "theme" else "all")
                self._toast(f"🎲 {from_name}: {label}", "info")
                self._run_roulette_locally(data, by=from_name)
                self._broadcast()
        except Exception as exc:
            log.debug(f"[SOCIAL] event {event} failed: {exc}")
