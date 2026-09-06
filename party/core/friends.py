#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Permanent friend groups (Kaleido feature).

A group is a shared secret. Everyone who has the group code joins the same relay
room whenever Kaleido is running, so friends see each other online without
exchanging session tokens.

File: party_groups.json in the user data directory
{
  "active": "Krealos",
  "auto_join": true,
  "groups": [ {"name": "Krealos", "key": "<64 hex>", "created": 1757000000} ]
}
"""

from __future__ import annotations

import base64
import hashlib
import json
import secrets
import threading
import time
from pathlib import Path
from typing import List, Optional

from utils.core.paths import get_user_data_dir

GROUP_CODE_PREFIX = "KGRP1:"
MAX_GROUPS = 10
MAX_NAME = 24
_lock = threading.RLock()


def _path() -> Path:
    return get_user_data_dir() / "party_groups.json"


def _load() -> dict:
    try:
        raw = json.loads(_path().read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            raise ValueError
    except Exception:
        raw = {}
    groups = []
    for g in raw.get("groups") or []:
        if isinstance(g, dict) and isinstance(g.get("name"), str) and isinstance(g.get("key"), str) and len(g["key"]) == 64:
            groups.append({"name": g["name"], "key": g["key"].lower(), "created": int(g.get("created") or 0)})
    active = raw.get("active") if isinstance(raw.get("active"), str) else None
    if active and not any(g["name"] == active for g in groups):
        active = None
    return {"active": active, "auto_join": bool(raw.get("auto_join", True)), "groups": groups}


def _save(data: dict) -> bool:
    try:
        p = _path()
        p.parent.mkdir(parents=True, exist_ok=True)
        tmp = p.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(p)
        return True
    except Exception:
        return False


def normalize_name(name: object) -> Optional[str]:
    if not isinstance(name, str):
        return None
    cleaned = " ".join(name.strip().split())
    if not cleaned or len(cleaned) > MAX_NAME:
        return None
    return cleaned


def room_key_for(key_hex: str) -> str:
    """Relay room key derived from the group secret (never the secret itself)."""
    return hashlib.sha256(b"kgrp:" + bytes.fromhex(key_hex)).hexdigest()[:32]


def encode_code(name: str, key_hex: str) -> str:
    payload = json.dumps({"n": name, "k": key_hex}, separators=(",", ":")).encode("utf-8")
    return GROUP_CODE_PREFIX + base64.urlsafe_b64encode(payload).decode("ascii").rstrip("=")


def decode_code(code: str) -> Optional[dict]:
    code = "".join((code or "").split())
    if not code.startswith(GROUP_CODE_PREFIX):
        return None
    body = code[len(GROUP_CODE_PREFIX):]
    try:
        body += "=" * (-len(body) % 4)
        payload = json.loads(base64.urlsafe_b64decode(body.encode("ascii")).decode("utf-8"))
        name = normalize_name(payload.get("n"))
        key = str(payload.get("k") or "").lower()
        bytes.fromhex(key)
        if not name or len(key) != 64:
            return None
        return {"name": name, "key": key}
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_settings() -> dict:
    with _lock:
        return _load()


def list_groups() -> List[dict]:
    with _lock:
        data = _load()
        return [{"name": g["name"], "active": g["name"] == data["active"], "created": g["created"]} for g in data["groups"]]


def active_group() -> Optional[dict]:
    with _lock:
        data = _load()
        for g in data["groups"]:
            if g["name"] == data["active"]:
                return dict(g)
        return None


def auto_join_enabled() -> bool:
    with _lock:
        return _load()["auto_join"]


def set_auto_join(enabled: bool) -> bool:
    with _lock:
        data = _load()
        data["auto_join"] = bool(enabled)
        return _save(data)


def create_group(name: str) -> tuple[bool, str]:
    with _lock:
        cleaned = normalize_name(name)
        if cleaned is None:
            return False, "Invalid group name"
        data = _load()
        if any(g["name"].casefold() == cleaned.casefold() for g in data["groups"]):
            return False, "A group with that name already exists"
        if len(data["groups"]) >= MAX_GROUPS:
            return False, f"Maximum of {MAX_GROUPS} groups reached"
        data["groups"].append({"name": cleaned, "key": secrets.token_hex(32), "created": int(time.time())})
        data["active"] = cleaned
        if not _save(data):
            return False, "Could not save groups file"
        return True, cleaned


def join_group(code: str) -> tuple[bool, str]:
    with _lock:
        decoded = decode_code(code)
        if not decoded:
            return False, "Invalid group code"
        data = _load()
        for g in data["groups"]:
            if g["key"] == decoded["key"]:
                data["active"] = g["name"]
                _save(data)
                return True, g["name"]
        name = decoded["name"]
        base, i = name, 2
        while any(g["name"].casefold() == name.casefold() for g in data["groups"]):
            name = f"{base} {i}"[:MAX_NAME]
            i += 1
        if len(data["groups"]) >= MAX_GROUPS:
            return False, f"Maximum of {MAX_GROUPS} groups reached"
        data["groups"].append({"name": name, "key": decoded["key"], "created": int(time.time())})
        data["active"] = name
        if not _save(data):
            return False, "Could not save groups file"
        return True, name


def set_active(name: Optional[str]) -> tuple[bool, str]:
    with _lock:
        data = _load()
        if name is None:
            data["active"] = None
            return (_save(data), "Group deactivated")
        for g in data["groups"]:
            if g["name"].casefold() == str(name).casefold():
                data["active"] = g["name"]
                return (_save(data), g["name"])
        return False, "Group not found"


def leave_group(name: str) -> tuple[bool, str]:
    with _lock:
        data = _load()
        before = len(data["groups"])
        data["groups"] = [g for g in data["groups"] if g["name"].casefold() != str(name).casefold()]
        if len(data["groups"]) == before:
            return False, "Group not found"
        if data["active"] and not any(g["name"] == data["active"] for g in data["groups"]):
            data["active"] = None
        if not _save(data):
            return False, "Could not save groups file"
        return True, "Group removed"


def group_code(name: Optional[str] = None) -> Optional[str]:
    with _lock:
        data = _load()
        target = name or data["active"]
        for g in data["groups"]:
            if target and g["name"].casefold() == target.casefold():
                return encode_code(g["name"], g["key"])
        return None
