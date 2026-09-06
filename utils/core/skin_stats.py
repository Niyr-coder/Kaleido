#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Personal skin statistics from the local history (Kaleido). Nothing leaves the machine."""

from __future__ import annotations

from typing import Dict, List, Optional

from utils.core import skin_history

MIN_GAMES_FOR_LUCK = 3


def compute(limit: int = 12) -> dict:
    """Aggregate wins/losses per (champion, skin) from history entries that have a result."""
    per_skin: Dict[tuple, dict] = {}
    per_champ: Dict[int, dict] = {}
    total = {"games": 0, "wins": 0}
    for e in skin_history.list_entries(limit=10000):
        result = e.get("result")
        if result not in ("win", "loss"):
            continue
        champ = e.get("championId")
        sid = e.get("skinId")
        custom = e.get("custom")
        if champ is None or (sid is None and not custom):
            continue
        key = (int(champ), int(sid) if sid is not None else f"custom:{custom}")
        agg = per_skin.setdefault(key, {"championId": int(champ), "skinId": sid, "custom": custom, "games": 0, "wins": 0})
        agg["games"] += 1
        agg["wins"] += 1 if result == "win" else 0
        c = per_champ.setdefault(int(champ), {"championId": int(champ), "games": 0, "wins": 0})
        c["games"] += 1
        c["wins"] += 1 if result == "win" else 0
        total["games"] += 1
        total["wins"] += 1 if result == "win" else 0

    skins: List[dict] = []
    for agg in per_skin.values():
        agg["winrate"] = round(100.0 * agg["wins"] / agg["games"]) if agg["games"] else 0
        skins.append(agg)
    for c in per_champ.values():
        c["winrate"] = round(100.0 * c["wins"] / c["games"]) if c["games"] else 0

    lucky: Optional[dict] = None
    eligible = [s for s in skins if s["games"] >= MIN_GAMES_FOR_LUCK]
    if eligible:
        lucky = max(eligible, key=lambda s: (s["winrate"], s["games"]))
    unlucky: Optional[dict] = None
    if len(eligible) >= 2:
        unlucky = min(eligible, key=lambda s: (s["winrate"], -s["games"]))
        if unlucky is lucky:
            unlucky = None

    most_played = sorted(skins, key=lambda s: (-s["games"], -s["winrate"]))[:limit]
    return {
        "total": {**total, "winrate": round(100.0 * total["wins"] / total["games"]) if total["games"] else 0},
        "lucky": lucky,
        "unlucky": unlucky,
        "mostPlayed": most_played,
        "champions": sorted(per_champ.values(), key=lambda c: -c["games"])[:limit],
        "minGames": MIN_GAMES_FOR_LUCK,
    }
