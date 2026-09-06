#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
System tray manager for Rose
"""

import threading
from pathlib import Path
from typing import Optional, Callable
import pystray
from PIL import Image, ImageDraw
from utils.core.logging import get_logger
from utils.core.paths import get_user_data_dir, open_folder_in_explorer
from config import (
    APP_VERSION,
    TRAY_READY_MAX_WAIT_S, TRAY_READY_CHECK_INTERVAL_S,
    TRAY_THREAD_JOIN_TIMEOUT_S, TRAY_ICON_WIDTH, TRAY_ICON_HEIGHT,
    TRAY_ICON_ELLIPSE_COORDS, TRAY_ICON_BORDER_WIDTH,
    TRAY_ICON_FONT_SIZE, TRAY_ICON_TEXT_X, TRAY_ICON_TEXT_Y
)

log = get_logger()


class TrayManager:
    """Manages the system tray icon for Rose"""
    
    def __init__(self, quit_callback: Optional[Callable] = None):
        """
        Initialize the tray manager
        
        Args:
            quit_callback: Function to call when user clicks "Quit"
        """
        self.quit_callback = quit_callback
        self.icon = None
        self.tray_thread = None
        self._stop_event = threading.Event()
        self._locked_icon_image = None
        self._unlocked_icon_image = None
        self._base_icon_image = None  # Current base icon (locked or unlocked)
        
    def _create_icon_image(self) -> Image.Image:
        """Create a simple icon image for the tray"""
        # Create a 128x128 icon with a simple design (doubled from 64x64)
        width, height = TRAY_ICON_WIDTH, TRAY_ICON_HEIGHT
        image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        
        # Draw a simple "SC" logo (Rose)
        # Background circle (scaled 2x)
        draw.ellipse(TRAY_ICON_ELLIPSE_COORDS, fill=(0, 100, 200, 255), outline=(0, 50, 100, 255), width=TRAY_ICON_BORDER_WIDTH)
        
        # "SC" text
        try:
            # Try to use a font if available
            from PIL import ImageFont
            font = ImageFont.truetype("arial.ttf", TRAY_ICON_FONT_SIZE)
        except (OSError, FileNotFoundError, ImportError) as e:
            log.debug(f"Could not load Arial font: {e}")
            # Fallback to default font
            font = ImageFont.load_default()
        except Exception as e:
            log.debug(f"Unexpected error loading font: {e}")
            # Fallback to default font
            font = ImageFont.load_default()
        
        # Draw "SC" text (scaled 2x)
        draw.text((TRAY_ICON_TEXT_X, TRAY_ICON_TEXT_Y), "SC", fill=(255, 255, 255, 255), font=font)
        
        return image
    
    def _load_icon_from_file(self, icon_name: str) -> Optional[Image.Image]:
        """Try to load icon from assets folder
        
        Args:
            icon_name: Name of the icon file (e.g., "tray_starting.png", "tray_ready.png")
        """
        try:
            # Use proper asset path resolution for PyInstaller compatibility
            from utils.core.paths import get_asset_path
            icon_path = get_asset_path(icon_name)
            
            if icon_path.exists():
                log.debug(f"Loading tray icon from: {icon_path}")
                with Image.open(icon_path) as img:
                    # Convert to RGBA and resize to 128x128 (doubled from 64x64)
                    img = img.convert('RGBA')
                    img = img.resize((128, 128), Image.Resampling.LANCZOS)
                    return img.copy()  # Return a copy to avoid issues with closed files
            else:
                log.warning(f"Icon '{icon_name}' not found at: {icon_path}")
        except Exception as e:
            log.error(f"Failed to load icon '{icon_name}': {e}")
        return None
    
    def _load_icons(self):
        """Load locked and unlocked icons"""
        # Load locked icon
        self._locked_icon_image = self._load_icon_from_file("tray_starting.png")
        
        # Load golden unlocked icon
        self._unlocked_icon_image = self._load_icon_from_file("tray_ready.png")
        
        # Fallback to icon.png if none exist
        if not self._locked_icon_image and not self._unlocked_icon_image:
            try:
                # Handle both frozen (PyInstaller) and development environments
                import sys
                if getattr(sys, 'frozen', False):
                    # Running as compiled executable (PyInstaller)
                    base_dir = Path(sys.executable).parent
                    # Try multiple locations for PyInstaller
                    possible_paths = [
                        base_dir / "icon.png",  # Direct path
                        base_dir / "_internal" / "icon.png",  # _internal folder
                    ]
                else:
                    # Running as Python script
                    base_dir = Path(__file__).parent.parent
                    possible_paths = [base_dir / "icon.png"]
                
                # Try each possible path
                for icon_path_png in possible_paths:
                    if icon_path_png.exists():
                        log.debug(f"Loading fallback icon from: {icon_path_png}")
                        with Image.open(icon_path_png) as img:
                            img = img.convert('RGBA')
                            img = img.resize((128, 128), Image.Resampling.LANCZOS)
                            self._locked_icon_image = img.copy()
                            self._unlocked_icon_image = img.copy()
                        break
            except Exception as e:
                log.warning(f"Failed to load fallback icon: {e}")
    
    def _get_icon_image(self) -> Image.Image:
        """Get the icon image, trying file first, then creating a default one"""
        # Try to load icons from files
        self._load_icons()
        
        # Use locked icon as the initial base icon
        if self._locked_icon_image:
            return self._locked_icon_image
        
        # Fallback to created icon if no files found
        return self._create_icon_image()
    
    def _on_quit(self, icon, item):
        try:
            if getattr(self, "_stop_refresher", None):
                self._stop_refresher.set()
        except Exception:
            pass
        """Handle quit menu item click"""
        log.info("Quit requested from system tray")
        try:
            # Set stop event immediately to signal shutdown
            self._stop_event.set()
            
            # Call the quit callback (sets state.stop = True)
            if self.quit_callback:
                self.quit_callback()
        except SystemExit:
            # Handle sys.exit() calls gracefully
            log.info("System exit requested from quit callback")
        except Exception as e:
            log.error(f"Error in quit callback: {e}")
        finally:
            # Stop the tray icon (this will hide it from system tray)
            try:
                icon.stop()
                log.debug("Tray icon stopped from quit handler")
            except Exception as e:
                log.debug(f"Error stopping tray icon: {e}")
    
    def _on_icon_click(self, icon, item):
        """Handle left click on tray icon - do nothing"""
        # Left click does nothing, only right click shows menu
        pass
    
    def _on_settings(self, icon, item):
        """Open the injection threshold settings dialog."""
        log.info("Settings requested from system tray")
        try:
            from utils.integration.tray_settings import show_injection_settings_dialog

            show_injection_settings_dialog()
        except Exception as e:
            log.error(f"Failed to open settings dialog: {e}")
            try:
                from utils.system.admin_utils import show_message_box_threaded

                show_message_box_threaded(
                    f"Failed to open settings dialog:\n\n{e}",
                    "Kaleido Settings",
                    0x10,  # MB_ICONERROR
                )
            except Exception:
                log.debug("Unable to show error message box for settings dialog failure")

    def _on_open_mods(self, icon, item):
        """Open the user mods folder in the file explorer."""
        log.info("Open Mods Folder requested from system tray")
        try:
            open_folder_in_explorer(get_user_data_dir() / "mods")
        except Exception as e:
            log.error(f"Failed to open mods folder: {e}")

    # ----- Kaleido status lines (evaluated every time the menu opens) -----
    @staticmethod
    def _status_profile(item=None) -> str:
        try:
            from utils.core import profiles as skin_profiles
            return f"Perfil: {skin_profiles.get_active_profile_name()}"
        except Exception:
            return "Perfil: -"

    @staticmethod
    def _status_last_skin(item=None) -> str:
        try:
            from datetime import datetime
            from utils.core import skin_history
            last = skin_history.last_entry()
            if not last:
                return "Última skin: ninguna todavía"
            when = datetime.fromtimestamp(int(last.get("ts") or 0)).strftime("%d/%m %H:%M")
            what = last.get("custom") or (f"skin {last.get('skinId')}" if last.get("skinId") else "?")
            res = {"win": " · victoria", "loss": " · derrota", "remake": " · remake"}.get(last.get("result") or "", "")
            return f"Última skin: {what} ({when}){res}"
        except Exception:
            return "Última skin: -"

    @staticmethod
    def _status_skins_count(item=None) -> str:
        try:
            from utils.core.paths import get_skins_dir
            root = get_skins_dir()
            n = sum(1 for p in root.rglob("*") if p.is_file() and p.suffix.lower() in (".zip", ".fantome"))
            return f"Skins descargadas: {n}"
        except Exception:
            return "Skins descargadas: -"

    def _pause_label(self, item=None) -> str:
        state = getattr(self, "shared_state", None)
        paused = bool(getattr(state, "pause_next_injection", False)) if state else False
        return "Reactivar Kaleido (siguiente partida)" if paused else "Pausar Kaleido una partida"

    def _on_toggle_pause(self, icon, item):
        state = getattr(self, "shared_state", None)
        if state is None:
            return
        state.pause_next_injection = not bool(getattr(state, "pause_next_injection", False))
        log.info(f"[Kaleido] Pause next injection (tray): {state.pause_next_injection}")
        try:
            self.icon.update_menu()
        except Exception:
            pass

    def notify(self, title: str, message: str) -> None:
        """Show a Windows notification from the tray icon (best-effort)."""
        try:
            if self.icon and hasattr(self.icon, "notify"):
                self.icon.notify(message, title)
        except Exception as e:
            log.debug(f"Tray notification failed: {e}")

    def notify_pending_new_skins(self) -> None:
        """Kaleido: the launcher leaves state/new_skins.json when the sync downloaded new skins."""
        try:
            from utils.core.paths import get_state_dir
            import json as _json
            marker = get_state_dir() / "new_skins.json"
            if not marker.exists():
                return
            data = _json.loads(marker.read_text(encoding="utf-8"))
            marker.unlink(missing_ok=True)
            count = int(data.get("count") or 0)
            if count <= 0:
                return
            sample = ", ".join(str(x) for x in (data.get("sample") or [])[:3])
            msg = f"{count} skin{'s' if count != 1 else ''} nueva{'s' if count != 1 else ''} descargada{'s' if count != 1 else ''}"
            if sample:
                msg += f": {sample}"
            self.notify("Kaleido", msg)
            log.info(f"[Kaleido] New skins notification: {msg}")
        except Exception as e:
            log.debug(f"New skins notification failed: {e}")

    def _create_menu(self) -> pystray.Menu:
        """Create the context menu for the tray icon"""
        return pystray.Menu(
            pystray.MenuItem(f"Kaleido v{APP_VERSION}", None, enabled=False),
            pystray.MenuItem(self._status_profile, None, enabled=False),
            pystray.MenuItem(self._status_last_skin, None, enabled=False),
            pystray.MenuItem(self._status_skins_count, None, enabled=False),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem(self._pause_label, self._on_toggle_pause),
            pystray.MenuItem("Open Mods Folder", self._on_open_mods),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Quit", self._on_quit),
        )
    
    def _run_tray(self):
        """Run the tray icon in a separate thread"""
        try:
            # Store base icon for later use
            self._base_icon_image = self._get_icon_image()
            icon_image = self._base_icon_image
            menu = self._create_menu()
            
            self.icon = pystray.Icon(
                "Kaleido",
                icon_image,
                "Kaleido by Krealos",
                menu,
                default_action=self._on_icon_click
            )
            
            log.info("System tray icon started")

            # Kaleido: the status lines in the menu are callables; pystray on Windows only
            # re-evaluates them on update_menu(), so refresh them periodically.
            def _menu_refresher():
                while self.icon is not None and not self._stop_refresher.is_set():
                    if self._stop_refresher.wait(30):
                        break
                    try:
                        self.icon.update_menu()
                    except Exception as exc:  # noqa: BLE001
                        log.debug(f"Tray menu refresh failed: {exc}")

            self._stop_refresher = threading.Event()
            threading.Thread(target=_menu_refresher, name="KaleidoTrayMenu", daemon=True).start()
            # Use run_detached to prevent blocking the main thread
            self.icon.run_detached()
        except Exception as e:
            log.error(f"Failed to start system tray: {e}")
    
    def start(self):
        """Start the system tray icon"""
        if self.tray_thread and self.tray_thread.is_alive():
            log.warning("System tray is already running")
            return
        
        try:
            self.tray_thread = threading.Thread(target=self._run_tray, daemon=True)
            self.tray_thread.start()
            log.info("System tray manager started - no console window")
        except Exception as e:
            log.error(f"Failed to start system tray manager: {e}")
    
    def stop(self):
        """Stop the system tray icon"""
        if self.icon:
            try:
                self.icon.stop()
                log.info("System tray icon stopped")
            except Exception as e:
                log.error(f"Failed to stop system tray icon: {e}")
        
        if self.tray_thread and self.tray_thread.is_alive():
            self.tray_thread.join(timeout=TRAY_THREAD_JOIN_TIMEOUT_S)
    
    def is_running(self) -> bool:
        """Check if the tray icon is running"""
        return self.icon is not None and self.tray_thread is not None and self.tray_thread.is_alive()
    
    def wait_for_quit(self, timeout: Optional[float] = None) -> bool:
        """
        Wait for quit signal from tray
        
        Args:
            timeout: Maximum time to wait in seconds
            
        Returns:
            True if quit was requested, False if timeout
        """
        return self._stop_event.wait(timeout)
    
    def set_status(self, status: str):
        """
        Update the tray icon to show the specified status
        
        Args:
            status: "locked" or "unlocked"
        """
        # Wait for tray icon to be ready (up to 5 seconds)
        max_wait = TRAY_READY_MAX_WAIT_S
        wait_interval = TRAY_READY_CHECK_INTERVAL_S
        elapsed = 0.0
        
        while (not self.icon or not self._base_icon_image) and elapsed < max_wait:
            threading.Event().wait(wait_interval)
            elapsed += wait_interval
        
        if not self.icon or not self._base_icon_image:
            return
        
        try:
            if status == "locked":
                # Show locked icon
                if self._locked_icon_image:
                    self.icon.icon = self._locked_icon_image
                    log.info("Wilted icon shown")
            elif status == "unlocked":
                # Show golden unlocked icon
                if self._unlocked_icon_image:
                    self.icon.icon = self._unlocked_icon_image
                    log.info("Bloomed icon shown")
                # Kaleido: tell the user about skins added by the startup sync
                self.notify_pending_new_skins()
            else:
                log.warning(f"Unknown status: {status}")
        except Exception as e:
            log.error(f"Failed to update tray icon: {e}")
    
    def set_downloading(self, is_downloading: bool):
        """
        Update the tray icon to show downloading status (legacy method for compatibility)
        
        Args:
            is_downloading: True to show locked icon, False to show golden unlocked icon
        """
        if is_downloading:
            self.set_status("locked")
        else:
            self.set_status("unlocked")
