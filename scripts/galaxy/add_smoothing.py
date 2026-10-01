import json, sys
from pathlib import Path
import numpy as np
from scipy.spatial import cKDTree

NNB = 32

def main(base):
    base = Path(base)
    meta = json.loads(base.with_suffix(".json").read_text())
    buf = base.with_suffix(".bin").read_bytes()
    blocks = {}
    rng = np.random.default_rng(7)
    for b in meta["blocks"]:
        cols = {c: np.frombuffer(buf, np.float16, b["count"], b["offset"] + k * b["count"] * 2).astype(np.float64)
                for k, c in enumerate(b["columns"]) if c != "h"}
        if b["name"] == "stars" and not meta.get("youngZ"):
            age = 10 ** (cols["logAge"] - 6)
            y = age < 300
            hz = np.minimum(0.03 + 0.12 * np.sqrt(age[y] / 100), 0.25)
            cols["z"][y] = hz * np.arctanh(rng.uniform(-0.98, 0.98, y.sum()))
            meta["youngZ"] = True
        if b["name"] == "stars" and not meta.get("clumpZ"):
            xy = np.stack([cols["x"], cols["y"]], 1)
            d2, _ = cKDTree(xy).query(xy, k=NNB + 1, workers=-1)
            size = d2[:, -1]
            R = np.hypot(cols["x"], cols["y"])
            f = np.where(R > 2.5, np.clip(size / 0.45, 0.08, 1.0), 1.0)
            cols["z"] *= f
            meta["clumpZ"] = True
        pos = np.stack([cols["x"], cols["y"], cols["z"]], 1)
        d, _ = cKDTree(pos).query(pos, k=NNB + 1, workers=-1)
        cols["h"] = np.clip(d[:, -1], 0.004, 2.5)
        blocks[b["name"]] = cols
        print(f"{b['name']}: h median {np.median(cols['h']) * 1000:.0f} pc, 5–95% {np.percentile(cols['h'], 5) * 1000:.0f}–{np.percentile(cols['h'], 95) * 1000:.0f} pc")
    off, out = 0, []
    meta["blocks"] = []
    for name, cols in blocks.items():
        order = list(cols.keys())
        n = len(cols[order[0]])
        blob = b"".join(np.asarray(cols[k], np.float16).tobytes() for k in order)
        meta["blocks"].append({"name": name, "count": n, "offset": off, "columns": order})
        out.append(blob); off += len(blob)
        pad = (-off) % 4
        out.append(b"\0" * pad); off += pad
    base.with_suffix(".bin").write_bytes(b"".join(out))
    meta["smoothing"] = {"nngb": NNB, "kernel": "gaussian splat, size = 2h"}
    base.with_suffix(".json").write_text(json.dumps(meta, indent=1))
    print(f"wrote {off / 1e6:.1f} MB")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[2] / "public" / "data" / "galaxy")
