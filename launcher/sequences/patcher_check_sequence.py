"""
Patcher Check Sequence
Keeps the LTK injection patcher current by downloading it from League Toolkit's
repository when the local copy is missing, unreadable, expired or near expiry.
Runs as part of the launcher so the user never has to place the files by hand.
"""

from __future__ import annotations

import sys
from pathlib import Path

from utils.core.logging import get_logger, get_named_logger

log = get_logger()
updater_log = get_named_logger("updater", prefix="log_updater")


def _resolve_tools_dir() -> Path:
    """Locate injection/tools in both frozen and development layouts."""
    if getattr(sys, "frozen", False):
        if hasattr(sys, "_MEIPASS"):
            return Path(sys._MEIPASS) / "injection" / "tools"
        base_dir = Path(sys.executable).parent
        for dir_path in (base_dir / "injection" / "tools", base_dir / "_internal" / "injection" / "tools"):
            if dir_path.exists():
                return dir_path
        return base_dir / "injection" / "tools"
    return Path(__file__).parent.parent.parent / "injection" / "tools"


class PatcherCheckSequence:
    """Downloads/refreshes the LTK patcher binaries before the app starts."""

    def perform_patcher_check(self, dialog, dev_mode: bool = False) -> None:
        if dev_mode:
            updater_log.info("Patcher check skipped (dev mode)")
            return
        if sys.platform != "win32":
            return  # Patcher only applies on Windows

        updater_log.info("Starting LTK patcher check.")
        dialog.clear_transfer_text()
        dialog.set_detail("Checking the injection patcher…")
        dialog.set_status("Checking the injection patcher…")
        dialog.set_marquee(True)
        dialog.pump_messages()

        def status_callback(message: str) -> None:
            dialog.set_status(message)
            dialog.pump_messages()
            updater_log.info(f"Patcher check status: {message}")

        try:
            from injection.tools.patcher_downloader import ensure_ltk_patcher
            ok = ensure_ltk_patcher(_resolve_tools_dir(), status_callback=status_callback)
            if ok:
                updater_log.info("LTK patcher is ready.")
            else:
                # Not fatal: main shows a guided dialog if the patcher is still unusable.
                updater_log.warning("LTK patcher could not be prepared automatically.")
        except Exception as exc:  # noqa: BLE001
            log.error(f"Patcher check failed: {exc}")
            updater_log.exception("Patcher check raised an exception", exc_info=True)
            # Don't raise - let the app start and surface the guided dialog if needed.

        dialog.set_marquee(False)
        dialog.reset_progress()
        dialog.clear_transfer_text()
        dialog.pump_messages()
