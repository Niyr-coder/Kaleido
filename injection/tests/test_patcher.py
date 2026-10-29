"""Tests for PE timestamp reading and the game-build EOL gate."""

import struct
import tempfile
import time
import unittest
from pathlib import Path

from injection.tools.patcher import LtkPatcherStatus, read_pe_timestamp


def _fake_pe(timestamp: int) -> bytes:
    """Minimal PE: MZ header, e_lfanew at 0x3C, 'PE\\0\\0' + COFF timestamp at +8."""
    pe_off = 0x80
    buf = bytearray(pe_off + 24)
    buf[0:2] = b"MZ"
    struct.pack_into("<I", buf, 0x3C, pe_off)
    buf[pe_off:pe_off + 4] = b"PE\0\0"
    struct.pack_into("<I", buf, pe_off + 8, timestamp)
    return bytes(buf)


class PeTimestampTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_reads_timestamp(self):
        p = self.dir / "game.exe"
        p.write_bytes(_fake_pe(1_700_000_000))
        self.assertEqual(read_pe_timestamp(p), 1_700_000_000)

    def test_non_pe_returns_none(self):
        p = self.dir / "junk.exe"
        p.write_bytes(b"not a pe at all")
        self.assertIsNone(read_pe_timestamp(p))

    def test_missing_file_returns_none(self):
        self.assertIsNone(read_pe_timestamp(self.dir / "nope.exe"))


class RejectsGameTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)
        self.eol = 1_700_000_000

    def _status(self, eol):
        return LtkPatcherStatus(host=Path("h"), dll=Path("d"), missing=[], eol=eol)

    def _game(self, ts):
        p = self.dir / "League of Legends.exe"
        p.write_bytes(_fake_pe(ts))
        return p

    def test_build_older_than_eol_is_accepted(self):
        game = self._game(self.eol - 10)
        self.assertFalse(self._status(self.eol).rejects_game(game))

    def test_build_newer_than_eol_is_rejected(self):
        game = self._game(self.eol + 10)
        self.assertTrue(self._status(self.eol).rejects_game(game))

    def test_calendar_past_eol_still_injects_old_build(self):
        # EOL already in the past by wall-clock, but the game build predates it.
        past_eol = int(time.time()) - 3600
        game = self._game(past_eol - 3600)
        self.assertFalse(self._status(past_eol).rejects_game(game))

    def test_unknown_build_does_not_block(self):
        self.assertFalse(self._status(self.eol).rejects_game(self.dir / "missing.exe"))

    def test_invalid_dll_rejects(self):
        self.assertTrue(self._status(None).rejects_game(self._game(self.eol - 10)))


if __name__ == "__main__":
    unittest.main()
