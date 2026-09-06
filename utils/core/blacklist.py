#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Blacklisted skins per champion (Kaleido). File: blacklist.json { "<champId>": [skinId, ...] }

Blacklisted skins are never picked by the dice, the party roulette, theme matching
or accepted from a challenge.
"""

from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Dict, List

from utils.core.paths import get_user_data_dir

_lock = threading.RLock()


def _path() -> Path:
    return get_user_data_dir() / "blacklist.json"


def load_blacklist() -> Dict[str, List[int]]:
    try:
        p = _path()
        if not p.exists():
            return {}
        data = json.loads(p.read_text(encoding="utf-8"))
        out: Dict[str, List[int]] = {}
        for k, v in (data.items() if isinstance(data, dict) else []):
            try:
                key = str(int(k))
            except (TypeError, ValueError):
                continue
            ids = []
            for x in (v if isinstance(v, list) else []):
                try:
                    ids.append(int(x))
                except (TypeError, ValueError):
                    continue
            if ids:
                out[key] = ids
        return out
    except Exception:
        return {}


def _save(data: Dict[str, List[int]]) -> bool:
    try:
        p = _path()
        p.parent.mkdir(parents=True, exist_ok=True)
        tmp = p.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(p)
        return True
    except Exception:
        return False


def blacklist_for_champion(champion_id: int) -> List[int]:
    return list(load_blacklist().get(str(int(champion_id)), []))


def is_blacklisted(champion_id: int, skin_id: int) -> bool:
    return int(skin_id) in blacklist_for_champion(champion_id)


def toggle_blacklist(champion_id: int, skin_id: int) -> bool:
    """Toggle a skin; returns True if it is blacklisted after the call."""
    with _lock:
        data = load_blacklist()
        key = str(int(champion_id))
        ids = data.get(key, [])
        sid = int(skin_id)
        if sid in ids:
            ids = [x for x in ids if x != sid]
            now = False
        else:
            ids = [sid] + ids
            now = True
        if ids:
            data[key] = ids
        else:
            data.pop(key, None)
        _save(data)
        return now


def remove_blacklist(champion_id: int, skin_id: int) -> None:
    with _lock:
        data = load_blacklist()
        key = str(int(champion_id))
        ids = [x for x in data.get(key, []) if x != int(skin_id)]
        if ids:
            data[key] = ids
        else:
            data.pop(key, None)
        _save(data)


def all_entries() -> List[dict]:
    out = []
    for key, ids in load_blacklist().items():
        for sid in ids:
            out.append({"championId": int(key), "skinId": sid})
    out.sort(key=lambda e: (e["championId"], e["skinId"]))
    return out


def filter_allowed(champion_id: int, skin_ids, base_of=None) -> list:
    """Drop blacklisted ids (a chroma is blacklisted when its base skin is)."""
    banned = set(blacklist_for_champion(champion_id))
    if not banned:
        return list(skin_ids)
    out = []
    for sid in skin_ids:
        base = base_of(sid) if base_of else sid
        if int(sid) in banned or int(base) in banned:
            continue
        out.append(sid)
    return out
