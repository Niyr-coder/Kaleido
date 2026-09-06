#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skin profiles (Kaleido feature).

A profile is a named snapshot of the historic map (champion -> last used skin /
chroma / custom mod). The live files historic.json and historic_targets.json
always hold the *active* profile; switching profiles snapshots the live files
into the current profile and loads the target profile into the live files.

File: profiles.json in the user data directory
{
  "active": "Default",
  "profiles": {
    "Default": { "historic": { "<champId>": <skinId|"path:...">, ... },
                 "targets":  { "<champId>": <targetSkinId>, ... } }
  }
}
"""

from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Dict, List, Optional, Union

from utils.core.paths import get_user_data_dir
from utils.core.historic import (
    load_historic_map,
    load_historic_target_map,
    replace_historic_maps,
    clear_historic_entry,
)

DEFAULT_PROFILE_NAME = "Default"
MAX_PROFILE_NAME_LENGTH = 32
MAX_PROFILES = 20

_lock = threading.RLock()


def _profiles_file_path() -> Path:
    return get_user_data_dir() / "profiles.json"


def _empty_profile() -> Dict[str, dict]:
    return {"historic": {}, "targets": {}}


def _live_snapshot() -> Dict[str, dict]:
    return {
        "historic": dict(load_historic_map()),
        "targets": dict(load_historic_target_map()),
    }


def _load() -> dict:
    """Load profiles.json, creating a Default profile from the live files if missing."""
    p = _profiles_file_path()
    data: Optional[dict] = None
    if p.exists():
        try:
            with p.open("r", encoding="utf-8") as f:
                raw = json.load(f)
            if isinstance(raw, dict) and isinstance(raw.get("profiles"), dict):
                data = raw
        except Exception:
            data = None

    if data is None:
        data = {"active": DEFAULT_PROFILE_NAME, "profiles": {DEFAULT_PROFILE_NAME: _live_snapshot()}}
        _save(data)
        return data

    profiles = data["profiles"]
    if not profiles:
        profiles[DEFAULT_PROFILE_NAME] = _live_snapshot()
    active = data.get("active")
    if not isinstance(active, str) or active not in profiles:
        data["active"] = next(iter(profiles))
    for name, prof in list(profiles.items()):
        if not isinstance(prof, dict):
            profiles[name] = _empty_profile()
            continue
        prof.setdefault("historic", {})
        prof.setdefault("targets", {})
    return data


def _save(data: dict) -> bool:
    p = _profiles_file_path()
    try:
        p.parent.mkdir(parents=True, exist_ok=True)
        tmp = p.with_suffix(".json.tmp")
        with tmp.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        tmp.replace(p)
        return True
    except Exception:
        return False


def _snapshot_active(data: dict) -> None:
    """Copy the live historic files into the active profile."""
    data["profiles"][data["active"]] = _live_snapshot()


def normalize_name(name: object) -> Optional[str]:
    if not isinstance(name, str):
        return None
    cleaned = " ".join(name.strip().split())
    if not cleaned or len(cleaned) > MAX_PROFILE_NAME_LENGTH:
        return None
    return cleaned


def _find_existing(data: dict, name: str) -> Optional[str]:
    lowered = name.casefold()
    for existing in data["profiles"]:
        if existing.casefold() == lowered:
            return existing
    return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_active_profile_name() -> str:
    with _lock:
        return _load()["active"]


def list_profiles() -> List[dict]:
    """Return [{"name": str, "count": int, "active": bool}, ...] (active profile counted live)."""
    with _lock:
        data = _load()
        active = data["active"]
        result = []
        for name, prof in data["profiles"].items():
            count = len(load_historic_map()) if name == active else len(prof.get("historic", {}))
            result.append({"name": name, "count": count, "active": name == active})
        return result


def get_active_entries() -> List[dict]:
    """Return the live entries of the active profile."""
    historic = load_historic_map()
    targets = load_historic_target_map()
    entries = []
    for champ_key, value in historic.items():
        try:
            champ_id = int(champ_key)
        except (TypeError, ValueError):
            continue
        entries.append({
            "championId": champ_id,
            "value": value,
            "targetId": targets.get(champ_key),
        })
    entries.sort(key=lambda e: e["championId"])
    return entries


def switch_profile(name: str) -> tuple[bool, str]:
    with _lock:
        data = _load()
        target = _find_existing(data, name or "")
        if target is None:
            return False, "Profile not found"
        if target == data["active"]:
            return True, "Profile already active"
        _snapshot_active(data)
        prof = data["profiles"][target]
        if not replace_historic_maps(prof.get("historic", {}), prof.get("targets", {})):
            return False, "Could not write historic files"
        data["active"] = target
        if not _save(data):
            return False, "Could not save profiles file"
        return True, "Profile switched"


def create_profile(name: str, copy_current: bool = False, activate: bool = True) -> tuple[bool, str]:
    with _lock:
        cleaned = normalize_name(name)
        if cleaned is None:
            return False, "Invalid profile name"
        data = _load()
        if _find_existing(data, cleaned):
            return False, "A profile with that name already exists"
        if len(data["profiles"]) >= MAX_PROFILES:
            return False, f"Maximum of {MAX_PROFILES} profiles reached"
        _snapshot_active(data)
        data["profiles"][cleaned] = _live_snapshot() if copy_current else _empty_profile()
        if activate:
            prof = data["profiles"][cleaned]
            if not replace_historic_maps(prof["historic"], prof["targets"]):
                return False, "Could not write historic files"
            data["active"] = cleaned
        if not _save(data):
            return False, "Could not save profiles file"
        return True, "Profile created"


def rename_profile(name: str, new_name: str) -> tuple[bool, str]:
    with _lock:
        cleaned = normalize_name(new_name)
        if cleaned is None:
            return False, "Invalid profile name"
        data = _load()
        existing = _find_existing(data, name or "")
        if existing is None:
            return False, "Profile not found"
        clash = _find_existing(data, cleaned)
        if clash and clash != existing:
            return False, "A profile with that name already exists"
        data["profiles"] = {
            (cleaned if k == existing else k): v for k, v in data["profiles"].items()
        }
        if data["active"] == existing:
            data["active"] = cleaned
        if not _save(data):
            return False, "Could not save profiles file"
        return True, "Profile renamed"


def delete_profile(name: str) -> tuple[bool, str]:
    with _lock:
        data = _load()
        existing = _find_existing(data, name or "")
        if existing is None:
            return False, "Profile not found"
        if len(data["profiles"]) <= 1:
            return False, "Cannot delete the last profile"
        was_active = data["active"] == existing
        data["profiles"].pop(existing, None)
        if was_active:
            fallback = next(iter(data["profiles"]))
            prof = data["profiles"][fallback]
            if not replace_historic_maps(prof.get("historic", {}), prof.get("targets", {})):
                return False, "Could not write historic files"
            data["active"] = fallback
        if not _save(data):
            return False, "Could not save profiles file"
        return True, "Profile deleted"


def remove_entry(champion_id: int) -> tuple[bool, str]:
    """Remove a champion's saved skin from the active profile (live files)."""
    with _lock:
        try:
            clear_historic_entry(int(champion_id))
        except Exception:
            return False, "Could not remove entry"
        data = _load()
        _snapshot_active(data)
        _save(data)
        return True, "Entry removed"


# ---------------------------------------------------------------------------
# Automatic profile rules (by game mode / by assigned role)
# ---------------------------------------------------------------------------
MODE_KEYS = ("CLASSIC", "ARAM", "URF", "ARENA", "SWIFTPLAY", "OTHER")
ROLE_KEYS = ("TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY")


def normalize_game_mode(game_mode: Optional[str], queue_id: Optional[int] = None) -> str:
    gm = (game_mode or "").upper()
    if queue_id == 480 or gm in ("SWIFTPLAY", "SWIFT_PLAY"):
        return "SWIFTPLAY"
    if gm in ("CLASSIC", "ARAM", "URF", "ARENA"):
        return gm
    if gm in ("CHERRY",):
        return "ARENA"
    if gm in ("ARURF",):
        return "URF"
    return "OTHER" if gm else "CLASSIC"


def normalize_role(position: Optional[str]) -> Optional[str]:
    pos = (position or "").upper()
    aliases = {"TOP": "TOP", "JUNGLE": "JUNGLE", "MIDDLE": "MIDDLE", "MID": "MIDDLE",
               "BOTTOM": "BOTTOM", "BOT": "BOTTOM", "ADC": "BOTTOM", "UTILITY": "UTILITY", "SUPPORT": "UTILITY"}
    return aliases.get(pos)


def get_auto_rules() -> dict:
    with _lock:
        data = _load()
        rules = data.get("autoRules") if isinstance(data.get("autoRules"), dict) else {}
        by_mode = {k: v for k, v in (rules.get("byMode") or {}).items() if isinstance(v, str)}
        by_role = {k: v for k, v in (rules.get("byRole") or {}).items() if isinstance(v, str)}
        return {"byMode": by_mode, "byRole": by_role}


def set_auto_rule(kind: str, key: str, profile: Optional[str]) -> tuple[bool, str]:
    with _lock:
        data = _load()
        bucket = "byMode" if kind == "mode" else "byRole" if kind == "role" else None
        if bucket is None:
            return False, "Invalid rule kind"
        key = str(key or "").upper()
        if (bucket == "byMode" and key not in MODE_KEYS) or (bucket == "byRole" and key not in ROLE_KEYS):
            return False, "Invalid rule key"
        rules = data.get("autoRules") if isinstance(data.get("autoRules"), dict) else {}
        rules.setdefault("byMode", {})
        rules.setdefault("byRole", {})
        if profile:
            existing = _find_existing(data, profile)
            if existing is None:
                return False, "Profile not found"
            rules[bucket][key] = existing
        else:
            rules[bucket].pop(key, None)
        data["autoRules"] = rules
        if not _save(data):
            return False, "Could not save profiles file"
        return True, "Rule saved"


def resolve_auto_profile(game_mode: Optional[str], queue_id: Optional[int], position: Optional[str]) -> Optional[str]:
    """Return the profile name a champ select should use, or None when no rule matches.
    Role rules win over mode rules (a role is only assigned in Summoner's Rift draft modes)."""
    rules = get_auto_rules()
    role = normalize_role(position)
    if role and rules["byRole"].get(role):
        return rules["byRole"][role]
    mode = normalize_game_mode(game_mode, queue_id)
    return rules["byMode"].get(mode)


# ---------------------------------------------------------------------------
# Export / import (shareable codes)
# ---------------------------------------------------------------------------
EXPORT_PREFIX = "KPROF1:"


def export_profile(name: str) -> tuple[bool, str]:
    import base64
    import zlib

    with _lock:
        data = _load()
        existing = _find_existing(data, name or "")
        if existing is None:
            return False, "Profile not found"
        if existing == data["active"]:
            prof = _live_snapshot()
        else:
            prof = data["profiles"][existing]
        payload = {"name": existing, "historic": prof.get("historic", {}), "targets": prof.get("targets", {})}
        raw = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        code = base64.urlsafe_b64encode(zlib.compress(raw, 9)).decode("ascii").rstrip("=")
        return True, EXPORT_PREFIX + code


def import_profile(code: str, new_name: Optional[str] = None, activate: bool = False) -> tuple[bool, str]:
    import base64
    import zlib

    code = (code or "").strip()
    if not code.startswith(EXPORT_PREFIX):
        return False, "Invalid profile code"
    body = code[len(EXPORT_PREFIX):]
    try:
        body += "=" * (-len(body) % 4)
        raw = zlib.decompress(base64.urlsafe_b64decode(body.encode("ascii")))
        payload = json.loads(raw.decode("utf-8"))
        historic = payload.get("historic") or {}
        targets = payload.get("targets") or {}
        if not isinstance(historic, dict) or not isinstance(targets, dict):
            raise ValueError("bad payload")
    except Exception:
        return False, "Invalid profile code"

    with _lock:
        data = _load()
        base_name = normalize_name(new_name) or normalize_name(payload.get("name")) or "Imported"
        candidate, i = base_name, 2
        while _find_existing(data, candidate):
            candidate = f"{base_name} {i}"[:MAX_PROFILE_NAME_LENGTH]
            i += 1
        if len(data["profiles"]) >= MAX_PROFILES:
            return False, f"Maximum of {MAX_PROFILES} profiles reached"
        clean_hist: Dict[str, Union[int, str]] = {}
        for k, v in historic.items():
            try:
                key = str(int(k))
            except (TypeError, ValueError):
                continue
            if isinstance(v, int) or (isinstance(v, str) and v.startswith("path:")):
                clean_hist[key] = v
        clean_targets: Dict[str, int] = {}
        for k, v in targets.items():
            try:
                clean_targets[str(int(k))] = int(v)
            except (TypeError, ValueError):
                continue
        _snapshot_active(data)
        data["profiles"][candidate] = {"historic": clean_hist, "targets": clean_targets}
        if activate:
            if not replace_historic_maps(clean_hist, clean_targets):
                return False, "Could not write historic files"
            data["active"] = candidate
        if not _save(data):
            return False, "Could not save profiles file"
        return True, candidate


def skin_ids_for_champion_across_profiles(champion_id: int) -> List[int]:
    """All skin/chroma ids saved for a champion in any profile (custom mods excluded)."""
    key = str(int(champion_id))
    ids: List[int] = []
    with _lock:
        data = _load()
        live = load_historic_map().get(key)
        values = [live] + [p.get("historic", {}).get(key) for n, p in data["profiles"].items() if n != data["active"]]
    for v in values:
        if isinstance(v, int) and v not in ids:
            ids.append(v)
    return ids


def snapshot_active_profile() -> None:
    """Persist the live files into the active profile (best-effort)."""
    with _lock:
        try:
            data = _load()
            _snapshot_active(data)
            _save(data)
        except Exception:
            pass
