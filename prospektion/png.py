"""Minimaler PNG-Schreiber (RGB, 8 Bit) ohne Zusatzabhängigkeit."""
import struct
import zlib

import numpy as np


def schreibe_png(pfad, rgb: np.ndarray) -> None:
    h, w, _ = rgb.shape
    roh = np.concatenate([np.zeros((h, 1), np.uint8), rgb.reshape(h, w * 3)], axis=1).tobytes()

    def chunk(typ, daten):
        c = typ + daten
        return struct.pack(">I", len(daten)) + c + struct.pack(">I", zlib.crc32(c))

    with open(pfad, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
                + chunk(b"IDAT", zlib.compress(roh, 9)) + chunk(b"IEND", b""))
