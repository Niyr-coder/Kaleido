#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Skin usage history (Kaleido feature).

history.json: {"entries": [ {ts, championId, skinId|null, custom|null, profile, gameMode, queueId, result}, ... ]}
Newest first. Entries are recorded from the historic hook (every successful injection writes a historic entry),
and the result (win/loss) is filled in at EndOfGame when the LCU exposes it.
"""

from __future__ import annotations

import json
import threading
import time
from pathlib import Path
from typing import List, Optional, Union

from utils.core.paths import get_user_data_dir

_lock = threading.RLock()
MAX_ENTRIES = 300
RESULT_WINDOW_S = 3 * 60 * 60  # only attach a result to an injection that happened in the last 3 hours


def _path() -> Path:
    return get_user_data_dir() / "history.json"


def _load() -> List[dict]:
    try:
        p = _path()
        if not p.exists():
            return []
        data = json.loads(p.read_text(encoding="utf-8"))
        entries = data.get("entries") if isinstance(data, dict) else None
        return [e for e in (entries or []) if isinstance(e, dict)]
    except Exception:
        return []


def _save(entries: List[dict]) -> bool:
    try:
        p = _path()
        p.parent.mkdir(parents=True, exist_ok=True)
        tmp = p.with_suffix(".json.tmp")
        tmp.write_text(json.dumps({"entries": entries[:MAX_ENTRIES]}, ensure_ascii=False, indent=1), encoding="utf-8")
        tmp.replace(p)
        return True
    except Exception:
        return False


def record_injection(
    champion_id: int,
    value: Union[int, str],
    profile: Optional[str] = None,
    game_mode: Optional[str] = None,
    queue_id: Optional[int] = None,
) -> dict:
    """Append an injection to the history. `value` is a skin/chroma id or a "path:..." custom mod."""
    with _lock:
        entries = _load()
        entry = {
            "ts": int(time.time()),
            "championId": int(champion_id),
            "skinId": int(value) if isinstance(value, int) else None,
            "custom": str(value)[5:] if isinstance(value, str) and value.startswith("path:") else None,
            "profile": profile,
            "gameMode": game_mode,
            "queueId": queue_id,
            "result": None,
        }
        # De-duplicate: same champion/skin within 2 minutes = same champ select (re-injection)
        if entries:
            last = entries[0]
            if (
                last.get("championId") == entry["championId"]
                and last.get("skinId") == entry["skinId"]
                and last.get("custom") == entry["custom"]
                and entry["ts"] - int(last.get("ts") or 0) < 120
            ):
                last["ts"] = entry["ts"]
                _save(entries)
                return last
        entries.insert(0, entry)
        _save(entries)
        return entry


def set_last_result(result: str) -> bool:
    """Attach 'win' / 'loss' / 'remake' to the most recent entry without a result."""
    if result not in ("win", "loss", "remake"):
        return False
    with _lock:
        entries = _load()
        now = int(time.time())
        for e in entries:
            if e.get("result") is None and now - int(e.get("ts") or 0) <= RESULT_WINDOW_S:
                e["result"] = result
                _save(entries)
                return True
        return False


def list_entries(limit: int = 30) -> List[dict]:
    return _load()[: max(1, int(limit))]


def recent_skins_for_champion(champion_id: int, limit: int = 5) -> List[int]:
    """Distinct skin/chroma ids used for a champion, most recent first (custom mods excluded)."""
    out: List[int] = []
    for e in _load():
        if e.get("championId") != int(champion_id):
            continue
        sid = e.get("skinId")
        if isinstance(sid, int) and sid not in out:
            out.append(sid)
            if len(out) >= limit:
                break
    return out


def last_entry() -> Optional[dict]:
    entries = _load()
    return entries[0] if entries else None


def clear() -> None:
    with _lock:
        _save([])


# --- context + hook used by utils.core.historic -------------------------------
_context = {"gameMode": None, "queueId": None}


def set_context(game_mode: Optional[str], queue_id: Optional[int]) -> None:
    _context["gameMode"] = game_mode
    _context["queueId"] = queue_id


def on_historic_written(champion_id: int, value: Union[int, str]) -> None:
    try:
        from utils.core import profiles as skin_profiles
        profile = skin_profiles.get_active_profile_name()
    except Exception:
        profile = None
    record_injection(champion_id, value, profile=profile,
                     game_mode=_context.get("gameMode"), queue_id=_context.get("queueId"))
