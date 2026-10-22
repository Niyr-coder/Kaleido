#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LTK patcher auto-downloader (Kaleido).

The LTK patcher DLL carries a short end-of-life date (days to a couple of
weeks), so a copy bundled into a release goes stale fast and League Toolkit's
license only lets their *signed* binaries ship inside official LTK Manager
releases. Instead of making the user drop the files in by hand, Kaleido fetches
the current ones from League Toolkit's own repository at launch — the same
model it already uses for the CommunityDragon game hashes and the skin files.

Download happens only when the local copy is missing, unreadable, expired, or
about to expire, so GitHub is not hit on every launch.
"""

from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Callable, Optional

from utils.core.logging import get_logger
from .patcher import (
    LTK_PATCHER_DLL,
    LTK_PATCHER_HOST,
    check_ltk_patcher,
    read_dll_eol,
)

log = get_logger()

# League Toolkit ships the patcher binaries in its open-source manager repo.
# The LTK Patcher License grants free permission to use, copy and redistribute
# them; we only read them at runtime and never repackage them in our release.
LTK_PATCHER_BASE_URL = (
    "https://raw.githubusercontent.com/LeagueToolkit/ltk-manager/main/src-tauri/resources"
)
# Refresh when the current DLL expires within this margin, so a session started
# now does not hit the end-of-life mid-game.
REFRESH_MARGIN_SECONDS = 2 * 24 * 60 * 60  # 2 days


def _base_url() -> str:
    """Repo URL for the patcher, overridable from config.ini [General] ltk_patcher_url."""
    try:
        from config import get_config_option
        override = (get_config_option("General", "ltk_patcher_url") or "").strip()
        if override:
            return override.rstrip("/")
    except Exception:
        pass
    return LTK_PATCHER_BASE_URL


def needs_refresh(tools_dir: Path) -> bool:
    """Whether the local patcher is missing, unreadable, expired or near expiry."""
    status = check_ltk_patcher(tools_dir)
    if status.missing:
        return True
    if status.eol is None:  # present but not a recognizable LTK patcher DLL
        return True
    return time.time() > (status.eol - REFRESH_MARGIN_SECONDS)


def _download(url: str, timeout: int):
    import requests
    from config import APP_USER_AGENT

    resp = requests.get(url, headers={"User-Agent": APP_USER_AGENT}, timeout=timeout)
    resp.raise_for_status()
    return resp.content


def _write_atomic(target: Path, data: bytes) -> None:
    tmp = target.with_suffix(target.suffix + ".new")
    tmp.write_bytes(data)
    os.replace(tmp, target)


def ensure_ltk_patcher(
    tools_dir: Path,
    status_callback: Optional[Callable[[str], None]] = None,
    force: bool = False,
) -> bool:
    """Make sure a current LTK patcher is in tools_dir, downloading if needed.

    Returns True when the patcher is present and not past its end of life after
    this call, False otherwise (left as-is on any failure).
    """
    def report(msg: str) -> None:
        if status_callback:
            try:
                status_callback(msg)
            except Exception:
                pass

    tools_dir.mkdir(parents=True, exist_ok=True)

    if not force and not needs_refresh(tools_dir):
        log.debug("[LTK] Patcher is current, no download needed")
        return True

    try:
        timeout = _import_timeout()
        base = _base_url()
        log.info("[LTK] Refreshing LTK patcher from League Toolkit repository…")
        report("Updating the injection patcher…")

        # DLL first: validate it before touching the install, so a bad download
        # never replaces a working patcher.
        dll_bytes = _download(f"{base}/{LTK_PATCHER_DLL}", timeout)
        host_bytes = _download(f"{base}/{LTK_PATCHER_HOST}", timeout)

        tmp_dll = tools_dir / (LTK_PATCHER_DLL + ".check")
        tmp_dll.write_bytes(dll_bytes)
        new_eol = read_dll_eol(tmp_dll)
        tmp_dll.unlink(missing_ok=True)
        if new_eol is None:
            log.warning("[LTK] Downloaded DLL is not a recognizable patcher, keeping current files")
            report("Could not verify the downloaded patcher")
            return check_ltk_patcher(tools_dir).eol is not None and not check_ltk_patcher(tools_dir).expired
        if time.time() > new_eol:
            log.warning("[LTK] Downloaded DLL is already past its end of life; upstream may not have shipped the fix yet")
            report("The available patcher is outdated")
            return False

        _write_atomic(tools_dir / LTK_PATCHER_DLL, dll_bytes)
        _write_atomic(tools_dir / LTK_PATCHER_HOST, host_bytes)
        from datetime import datetime
        log.info(f"[LTK] Patcher updated (valid until {datetime.fromtimestamp(new_eol):%Y-%m-%d %H:%M})")
        report("Injection patcher updated")
        return True

    except Exception as e:
        log.warning(f"[LTK] Could not auto-update the patcher: {e}")
        report("Could not reach the patcher server")
        # Fall back to whatever is already on disk
        status = check_ltk_patcher(tools_dir)
        return (not status.missing) and status.eol is not None and not status.expired


def _import_timeout() -> int:
    try:
        from config import RATE_LIMIT_REQUEST_TIMEOUT
        return int(RATE_LIMIT_REQUEST_TIMEOUT)
    except Exception:
        return 30
