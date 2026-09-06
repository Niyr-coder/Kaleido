#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Remembered chroma per skin (Kaleido). File: chroma_memory.json { "<baseSkinId>": chromaId }

When a base skin is going to be injected and the player did not open the chroma wheel in
this champion select, the chroma used last time with that skin is injected instead.
"""

from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Dict, List, Optional

from utils.core.paths import get_user_data_dir

_lock = threading.RLock()


def _path() -> Path:
    return get_user_data_dir() / "chroma_memory.json"


def load_memory() -> Dict[str, int]:
    try:
        p = _path()
        if not p.exists():
            return {}
        data = json.loads(p.read_text(encoding="utf-8"))
        out: Dict[str, int] = {}
        for k, v in (data.items() if isinstance(data, dict) else []):
            try:
                out[str(int(k))] = int(v)
            except (TypeError, ValueError):
                continue
        return out
    except Exception:
        return {}


def _save(data: Dict[str, int]) -> bool:
    try:
        p = _path()
        p.parent.mkdir(parents=True, exist_ok=True)
        tmp = p.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(p)
        return True
    except Exception:
        return False


def remembered_chroma(base_skin_id: int) -> Optional[int]:
    return load_memory().get(str(int(base_skin_id)))


def remember(base_skin_id: int, chroma_id: int) -> None:
    with _lock:
        data = load_memory()
        data[str(int(base_skin_id))] = int(chroma_id)
        _save(data)


def forget(base_skin_id: int) -> None:
    with _lock:
        data = load_memory()
        if data.pop(str(int(base_skin_id)), None) is not None:
            _save(data)


def all_entries() -> List[dict]:
    out = [{"baseSkinId": int(k), "chromaId": v, "championId": int(k) // 1000} for k, v in load_memory().items()]
    out.sort(key=lambda e: e["baseSkinId"])
    return out


def record_injected(injected_id: int, chroma_id_map: Optional[dict]) -> None:
    """Called after an injection: a chroma updates the memory of its base skin."""
    try:
        injected_id = int(injected_id)
    except (TypeError, ValueError):
        return
    info = chroma_id_map.get(injected_id) if isinstance(chroma_id_map, dict) else None
    base = None
    if isinstance(info, dict):
        base = info.get("skinId")
    if base is None:
        # Fallback: chroma ids are base skin id + small offset (and base skins end in a multiple of 1000 offset)
        try:
            from utils.core.utilities import get_base_skin_id_for_chroma
            base = get_base_skin_id_for_chroma(injected_id, chroma_id_map)
        except Exception:
            base = None
    if base and int(base) != injected_id:
        remember(int(base), injected_id)
