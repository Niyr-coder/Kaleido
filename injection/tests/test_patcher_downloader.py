"""Unit tests for the LTK patcher auto-downloader (no network, no real binaries)."""

import sys
import tempfile
import time
import types
import unittest
from pathlib import Path
from unittest.mock import patch

from injection.tools import patcher_downloader as pd
from injection.tools.patcher import LtkPatcherStatus

FAR_FUTURE = int(time.time()) + 90 * 24 * 60 * 60
SOON = int(time.time()) + 60 * 60  # within the refresh margin
PAST = int(time.time()) - 60 * 60


def _status(missing=None, eol=FAR_FUTURE):
    return LtkPatcherStatus(host=Path("h"), dll=Path("d"), missing=missing or [], eol=eol)


def _fake_requests(dll=b"DLLDATA", host=b"HOSTDATA", boom=None):
    def get(url, **kw):
        if boom:
            raise boom
        class R:
            content = dll if url.endswith("ltk_patcher_dll.dll") else host
            def raise_for_status(self):
                pass
        return R()
    return types.SimpleNamespace(get=get)


class NeedsRefreshTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.tools = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_missing_needs_refresh(self):
        with patch.object(pd, "check_ltk_patcher", return_value=_status(missing=["ltk_patcher_dll.dll"])):
            self.assertTrue(pd.needs_refresh(self.tools))

    def test_unreadable_dll_needs_refresh(self):
        with patch.object(pd, "check_ltk_patcher", return_value=_status(eol=None)):
            self.assertTrue(pd.needs_refresh(self.tools))

    def test_near_expiry_needs_refresh(self):
        with patch.object(pd, "check_ltk_patcher", return_value=_status(eol=SOON)):
            self.assertTrue(pd.needs_refresh(self.tools))

    def test_fresh_does_not_need_refresh(self):
        with patch.object(pd, "check_ltk_patcher", return_value=_status(eol=FAR_FUTURE)):
            self.assertFalse(pd.needs_refresh(self.tools))


class EnsureTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.tools = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_downloads_and_validates(self):
        with patch.object(pd, "read_dll_eol", return_value=FAR_FUTURE), \
             patch.dict(sys.modules, {"requests": _fake_requests(dll=b"NEWDLL", host=b"NEWHOST")}):
            ok = pd.ensure_ltk_patcher(self.tools, force=True)
        self.assertTrue(ok)
        self.assertEqual((self.tools / pd.LTK_PATCHER_DLL).read_bytes(), b"NEWDLL")
        self.assertEqual((self.tools / pd.LTK_PATCHER_HOST).read_bytes(), b"NEWHOST")
        self.assertFalse((self.tools / (pd.LTK_PATCHER_DLL + ".check")).exists())

    def test_rejects_unrecognized_download(self):
        (self.tools / pd.LTK_PATCHER_DLL).write_bytes(b"GOODOLD")
        (self.tools / pd.LTK_PATCHER_HOST).write_bytes(b"GOODHOSTOLD")
        with patch.object(pd, "read_dll_eol", return_value=None), \
             patch.object(pd, "check_ltk_patcher", return_value=_status(eol=FAR_FUTURE)), \
             patch.dict(sys.modules, {"requests": _fake_requests(dll=b"junk")}):
            pd.ensure_ltk_patcher(self.tools, force=True)
        self.assertEqual((self.tools / pd.LTK_PATCHER_DLL).read_bytes(), b"GOODOLD")

    def test_installs_latest_even_if_calendar_eol_passed(self):
        # Empty dir, download whose EOL is already in the past by wall-clock:
        # still installed, because usability is decided by game build, not time.
        with patch.object(pd, "read_dll_eol", return_value=PAST), \
             patch.dict(sys.modules, {"requests": _fake_requests(dll=b"BESTAVAIL")}):
            ok = pd.ensure_ltk_patcher(self.tools, force=True)
        self.assertTrue(ok)
        self.assertEqual((self.tools / pd.LTK_PATCHER_DLL).read_bytes(), b"BESTAVAIL")

    def test_keeps_current_when_download_is_older(self):
        (self.tools / pd.LTK_PATCHER_DLL).write_bytes(b"CURRENT")
        (self.tools / pd.LTK_PATCHER_HOST).write_bytes(b"CURRENTHOST")
        # current EOL far future, downloaded EOL older -> keep current, no write
        with patch.object(pd, "read_dll_eol", return_value=PAST), \
             patch.object(pd, "check_ltk_patcher", return_value=_status(eol=FAR_FUTURE)), \
             patch.dict(sys.modules, {"requests": _fake_requests(dll=b"OLDER")}):
            ok = pd.ensure_ltk_patcher(self.tools, force=True)
        self.assertTrue(ok)
        self.assertEqual((self.tools / pd.LTK_PATCHER_DLL).read_bytes(), b"CURRENT")

    def test_network_error_leaves_disk_untouched(self):
        (self.tools / pd.LTK_PATCHER_DLL).write_bytes(b"KEEP")
        (self.tools / pd.LTK_PATCHER_HOST).write_bytes(b"KEEPHOST")
        with patch.object(pd, "check_ltk_patcher", return_value=_status(eol=FAR_FUTURE)), \
             patch.dict(sys.modules, {"requests": _fake_requests(boom=OSError("offline"))}):
            ok = pd.ensure_ltk_patcher(self.tools, force=True)
        self.assertTrue(ok)  # the on-disk copy is still healthy
        self.assertEqual((self.tools / pd.LTK_PATCHER_DLL).read_bytes(), b"KEEP")

    def test_skips_network_when_current(self):
        def counting_get(url, **kw):
            raise AssertionError("must not download when current")

        with patch.object(pd, "check_ltk_patcher", return_value=_status(eol=FAR_FUTURE)), \
             patch.dict(sys.modules, {"requests": types.SimpleNamespace(get=counting_get)}):
            ok = pd.ensure_ltk_patcher(self.tools)  # not forced
        self.assertTrue(ok)


if __name__ == "__main__":
    unittest.main()
