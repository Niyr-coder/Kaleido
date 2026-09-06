#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Favorite skins per champion (Kaleido feature). File: favorites.json { "<champId>": [skinId, ...] }"""

from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Dict, List

from utils.core.paths import get_user_data_dir

_lock = threading.RLock()
MAX_PER_CHAMPION = 50


def _path() -> Path:
    return get_user_data_dir() / "favorites.json"


def load_favorites() -> Dict[str, List[int]]:
    try:
        p = _path()
        if not p.exists():
            return {}
        data = json.loads(p.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            return {}
        out: Dict[str, List[int]] = {}
        for k, v in data.items():
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


def favorites_for_champion(champion_id: int) -> List[int]:
    return list(load_favorites().get(str(int(champion_id)), []))


def is_favorite(champion_id: int, skin_id: int) -> bool:
    return int(skin_id) in favorites_for_champion(champion_id)


def toggle_favorite(champion_id: int, skin_id: int) -> bool:
    """Toggle a skin; returns True if it is a favorite after the call."""
    with _lock:
        data = load_favorites()
        key = str(int(champion_id))
        ids = data.get(key, [])
        sid = int(skin_id)
        if sid in ids:
            ids = [x for x in ids if x != sid]
            now_fav = False
        else:
            ids = ([sid] + ids)[:MAX_PER_CHAMPION]
            now_fav = True
        if ids:
            data[key] = ids
        else:
            data.pop(key, None)
        _save(data)
        return now_fav


def remove_favorite(champion_id: int, skin_id: int) -> None:
    with _lock:
        data = load_favorites()
        key = str(int(champion_id))
        ids = [x for x in data.get(key, []) if x != int(skin_id)]
        if ids:
            data[key] = ids
        else:
            data.pop(key, None)
        _save(data)


def all_entries() -> List[dict]:
    out = []
    for key, ids in load_favorites().items():
        for sid in ids:
            out.append({"championId": int(key), "skinId": sid})
    out.sort(key=lambda e: (e["championId"], e["skinId"]))
    return out
