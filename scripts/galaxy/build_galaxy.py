import json, time, sys
from pathlib import Path
import numpy as np

rng = np.random.default_rng(20261001)
QUICK = "--quick" in sys.argv
OUT = Path(__file__).resolve().parents[2] / "public" / "data"
if QUICK:
    OUT = Path("/tmp/claude-1000/-home-suresh-pwebsite/b1f12820-cb49-422b-95ed-9f215bcffee8/scratchpad/quick")
OUT.mkdir(parents=True, exist_ok=True)

G = 4.498e-12
KMS = 1.0227e-3

V0, RC = 190.0 * KMS, 3.5
MB, AB = 1.2e10, 0.45
MBH, EBH = 1.0e8, 0.04

EPS_SP, PITCH, OMEGA_P, R_SP = 0.045, np.radians(17), 17.0 * KMS, 4.5

def spiral_phi(x, y, t):
    R = np.hypot(x, y) + 1e-6
    ph = np.arctan2(y, x)
    amp = EPS_SP * V0 ** 2 * (R / R_SP) * np.exp(1 - R / R_SP) * np.tanh((R / 1.5) ** 2)
    return -amp * np.cos(2 * (ph - OMEGA_P * t) + 2 * np.log(R) / np.tan(PITCH))

def spiral_acc(x, y, t, h=0.02):
    return (-(spiral_phi(x + h, y, t) - spiral_phi(x - h, y, t)) / (2 * h),
            -(spiral_phi(x, y + h, t) - spiral_phi(x, y - h, t)) / (2 * h))

def ext_acc(x, y):
    r2 = x * x + y * y
    r = np.sqrt(r2) + 1e-9
    a = -V0 ** 2 / (r2 + RC ** 2)
    a += -G * MB / (r * (r + AB) ** 2)
    a += -G * MBH / (r2 + EBH ** 2) ** 1.5
    return a * x, a * y

L, NG, EPS = 40.0, 400, 0.15
DX = L / NG
NP = 2 * NG
kx = np.fft.fftfreq(NP, 1 / NP) * DX
X, Y = np.meshgrid(kx, kx, indexing="ij")
GREEN = np.fft.rfft2(-G / np.sqrt(X ** 2 + Y ** 2 + EPS ** 2))

def cic_weights(x, y):
    gx = (x + L / 2) / DX - 0.5
    gy = (y + L / 2) / DX - 0.5
    ix, iy = np.floor(gx).astype(np.int64), np.floor(gy).astype(np.int64)
    fx, fy = gx - ix, gy - iy
    return ix, iy, fx, fy

def deposit(x, y, m):
    ix, iy, fx, fy = cic_weights(x, y)
    rho = np.zeros(NG * NG)
    for dx, wx in ((0, 1 - fx), (1, fx)):
        for dy, wy in ((0, 1 - fy), (1, fy)):
            jx, jy = ix + dx, iy + dy
            ok = (jx >= 0) & (jx < NG) & (jy >= 0) & (jy < NG)
            rho += np.bincount((jx[ok] * NG + jy[ok]), weights=(m * wx * wy)[ok], minlength=NG * NG)
    return rho.reshape(NG, NG)

def interp(field, x, y):
    ix, iy, fx, fy = cic_weights(x, y)
    out = np.zeros_like(x)
    for dx, wx in ((0, 1 - fx), (1, fx)):
        for dy, wy in ((0, 1 - fy), (1, fy)):
            jx, jy = np.clip(ix + dx, 0, NG - 1), np.clip(iy + dy, 0, NG - 1)
            out += field[jx, jy] * wx * wy
    return out

def grid_acc(mass_grid):
    pad = np.zeros((NP, NP))
    pad[:NG, :NG] = mass_grid
    phi = np.fft.irfft2(np.fft.rfft2(pad) * GREEN, s=(NP, NP))[:NG, :NG]
    gx = -np.gradient(phi, DX, axis=0)
    gy = -np.gradient(phi, DX, axis=1)
    return gx, gy

CS2 = (11.0 * KMS) ** 2
from scipy.ndimage import gaussian_filter as _gf

def accel(x, y, m, t=0.0, gas=None):
    gx, gy = grid_acc(deposit(x, y, m))
    ax, ay = interp(gx, x, y), interp(gy, x, y)
    ex, ey = ext_acc(x, y)
    sx, sy = spiral_acc(x, y, t)
    ax += ex + sx; ay += ey + sy
    if gas is not None and gas.any():
        Sg = _gf(deposit(x[gas], y[gas], m[gas]), 1.0) + 1e-3 * (MG / NGAS)
        lnS = np.log(Sg)
        px, py = -CS2 * np.gradient(lnS, DX, axis=0), -CS2 * np.gradient(lnS, DX, axis=1)
        ax[gas] += interp(px, x[gas], y[gas]); ay[gas] += interp(py, x[gas], y[gas])
    return ax, ay

MS, RDS, NS = 3.6e10, 2.8, (60_000 if QUICK else 260_000)
MG, RDG, NGAS = 9.0e9, 4.5, (60_000 if QUICK else 230_000)
RMAX = 16.0

def sample_exp_disk(n, rd):
    R = rng.gamma(2.0, rd, n * 2)
    R = R[R < RMAX][:n]
    phi = rng.uniform(0, 2 * np.pi, n)
    return R, phi

Rs, ps = sample_exp_disk(NS, RDS)
Rg, pg = sample_exp_disk(NGAS, RDG)
ms = np.full(NS, MS / NS)
mg = np.full(NGAS, MG / NGAS)
x = np.concatenate([Rs * np.cos(ps), Rg * np.cos(pg)])
y = np.concatenate([Rs * np.sin(ps), Rg * np.sin(pg)])
m = np.concatenate([ms, mg])
is_gas = np.zeros(NS + NGAS, bool); is_gas[NS:] = True

ax0, ay0 = accel(x, y, m)
R_all = np.hypot(x, y)
ar = -(ax0 * x + ay0 * y) / (R_all + 1e-9)
bins = np.linspace(0, RMAX, 81)
rb = 0.5 * (bins[1:] + bins[:-1])
idx = np.clip(np.digitize(R_all, bins) - 1, 0, len(rb) - 1)
vc2_b = np.array([np.mean((ar * R_all)[idx == k]) if np.any(idx == k) else np.nan for k in range(len(rb))])
vc2_b = np.nan_to_num(np.maximum.accumulate(np.nan_to_num(vc2_b)) * 0 + vc2_b, nan=np.nanmean(vc2_b))
vc2_b = np.maximum(vc2_b, 1e-12)
Om2 = vc2_b / rb ** 2
kap2 = np.maximum(rb * np.gradient(Om2, rb) + 4 * Om2, 1e-12)

def kin(R, sigma_fn, rd):
    vc2 = np.interp(R, rb, vc2_b)
    k = np.sqrt(np.interp(R, rb, kap2))
    Om = np.sqrt(vc2) / np.maximum(R, 1e-3)
    sR = sigma_fn(R, k)
    vphi2 = vc2 + sR ** 2 * (1 - k ** 2 / (4 * Om ** 2) - 2 * R / rd)
    vphi = np.sqrt(np.maximum(vphi2, 0.3 * vc2))
    sphi = sR * k / (2 * Om)
    return rng.normal(0, sR), rng.normal(vphi, sphi)

def sig_star(R, k):
    Sigma = MS / (2 * np.pi * RDS ** 2) * np.exp(-R / RDS)
    s = 1.5 * 3.36 * G * Sigma / k
    return np.clip(s, 12 * KMS, 0.35 * np.sqrt(np.interp(R, rb, vc2_b)))

vRs, vps = kin(Rs, sig_star, RDS)
vRg, vpg = kin(Rg, lambda R, k: np.full_like(R, 9 * KMS), RDG)
vR = np.concatenate([vRs, vRg]); vp = np.concatenate([vps, vpg])
ph = np.arctan2(y, x)
vx = vR * np.cos(ph) - vp * np.sin(ph)
vy = vR * np.sin(ph) + vp * np.cos(ph)
birth = np.full(NS + NGAS, np.nan)

T_END, DT, SF_EVERY = (400.0 if QUICK else 640.0), 0.4, 5.0
TAU_STICK, SIG_TURB = 12.0, 6 * KMS
nsteps = int(T_END / DT)
t = 0.0
ax, ay = accel(x, y, m, 0.0, is_gas)
t0 = time.time()
for step in range(nsteps):
    vx += 0.5 * DT * ax; vy += 0.5 * DT * ay
    x += DT * vx; y += DT * vy
    ax, ay = accel(x, y, m, t + DT, is_gas)
    vx += 0.5 * DT * ax; vy += 0.5 * DT * ay
    t += DT
    g = is_gas
    gm = deposit(x[g], y[g], m[g]) + 1e-30
    mvx = interp(deposit(x[g], y[g], m[g] * vx[g]) / gm, x[g], y[g])
    mvy = interp(deposit(x[g], y[g], m[g] * vy[g]) / gm, x[g], y[g])
    f = DT / TAU_STICK
    vx[g] += (mvx - vx[g]) * f + rng.normal(0, SIG_TURB * np.sqrt(2 * f), g.sum())
    vy[g] += (mvy - vy[g]) * f + rng.normal(0, SIG_TURB * np.sqrt(2 * f), g.sum())
    if step % int(SF_EVERY / DT) == 0 and t > 40:
        Sg = gm / (DX * DX) / 1e6
        sfr = 1.6e-4 * np.maximum(Sg, 0) ** 1.4
        sfr[Sg < 4] = 0
        p = interp(sfr * SF_EVERY * 1e6 / np.maximum(Sg * 1e6, 1e-30), x[g], y[g])
        conv = rng.random(g.sum()) < np.clip(p, 0, 0.5)
        gi = np.flatnonzero(g)[conv]
        is_gas[gi] = False
        birth[gi] = t
    if step % 100 == 0:
        el = time.time() - t0
        print(f"t={t:6.1f} Myr  gas={is_gas.sum():6d}  new stars={np.isfinite(birth).sum():6d}  {el:5.0f}s", flush=True)

print(f"N-body done in {time.time() - t0:.0f}s")

R = np.hypot(x, y)
keep = R < 18
x, y, vx, vy, m, is_gas, birth, R = (a[keep] for a in (x, y, vx, vy, m, is_gas, birth, R))
vx, vy = vx / KMS, vy / KMS
new = np.isfinite(birth)
old = ~is_gas & ~new
age = np.empty(len(x))
age[old] = T_END + np.clip(rng.normal(7500 - 280 * R[old], 1800), 800, 11500)
age[new] = np.maximum(T_END - birth[new], 0.3)
age[is_gas] = 0

def sech2(n, h):
    return h * np.arctanh(rng.uniform(-0.999, 0.999, n))

hz = np.where(is_gas, 0.06 * (1 + (R / 10) ** 2), np.where(new, 0.06 + 0.12 * np.sqrt(age / 300), 0.18 + 0.06 * age / 1000))
z = sech2(len(x), hz)
vz = rng.normal(0, np.where(is_gas, 8, np.where(new, 10, 18 + 3 * age / 1000)))

ohgas = 8.85 - 0.045 * R
logZ = np.empty(len(x))
logZ[is_gas] = ohgas[is_gas] - 8.69 + rng.normal(0, 0.04, is_gas.sum())
logZ[new] = ohgas[new] - 8.69 + rng.normal(0, 0.05, new.sum())
logZ[old] = ohgas[old] - 8.69 - 0.035 * age[old] / 1000 + rng.normal(0, 0.12, old.sum())

NB = 70_000
u = rng.uniform(0, 1, NB)
rbul = AB * np.sqrt(u) / (1 - np.sqrt(u))
rbul = rbul[rbul < 6][:NB]
nb = len(rbul)
cth = rng.uniform(-1, 1, nb); phb = rng.uniform(0, 2 * np.pi, nb); sth = np.sqrt(1 - cth ** 2)
xb, yb, zb = rbul * sth * np.cos(phb), rbul * sth * np.sin(phb), 0.7 * rbul * cth
sb = np.sqrt(G * MB / (6 * AB) * 2 * (rbul / AB) * (1 + rbul / AB) ** 3 * np.log(1 + AB / rbul)
             - G * MB / (6 * AB) * 0 + 1e-12) / KMS
sb = np.clip(np.nan_to_num(sb, nan=120), 60, 220)
vbx, vby, vbz = (rng.normal(0, sb) for _ in range(3))
rotb = 60 * np.tanh(np.hypot(xb, yb) / 0.8)
vbx += -rotb * np.sin(phb); vby += rotb * np.cos(phb)
ageb = np.clip(rng.normal(10500, 900, nb), 7000, 12500)
logZb = np.clip(rng.normal(0.12, 0.12, nb) - 0.05 * rbul, -0.6, 0.4)
mb = np.full(nb, MB / nb * 0.6)

AXIS = np.array([np.sin(np.radians(35)), 0.0, np.cos(np.radians(35))])
HALF = np.radians(27)
NO = 36_000
ncl = 900
r_cl = 0.05 + 3.0 * rng.power(0.55, ncl)
sgn = np.where(rng.random(ncl) < 0.5, 1, -1)

def in_cone_dirs(n):
    ct = rng.uniform(np.cos(HALF), 1, n); ph_ = rng.uniform(0, 2 * np.pi, n); st = np.sqrt(1 - ct ** 2)
    a = AXIS; t1 = np.cross(a, [0, 1, 0]); t1 /= np.linalg.norm(t1); t2 = np.cross(a, t1)
    return (ct[:, None] * a + st[:, None] * (np.cos(ph_)[:, None] * t1 + np.sin(ph_)[:, None] * t2))

dcl = in_cone_dirs(ncl) * sgn[:, None]
owner = rng.integers(0, ncl, NO)
spread = 0.06 + 0.08 * r_cl[owner]
po = dcl[owner] * r_cl[owner, None] + rng.normal(0, 1, (NO, 3)) * spread[:, None]
ro = np.linalg.norm(po, axis=1)
vout = np.where(ro < 0.35, 950 * np.sqrt(ro / 0.35), 950 * (ro / 0.35) ** -0.45)
vo = po / ro[:, None] * vout[:, None] + rng.normal(0, 60, (NO, 3))
mo = np.full(NO, 3.0e3)

st = ~is_gas
S = dict(
    x=np.concatenate([x[st], xb]), y=np.concatenate([y[st], yb]), z=np.concatenate([z[st], zb]),
    vx=np.concatenate([vx[st], vbx]), vy=np.concatenate([vy[st], vby]), vz=np.concatenate([vz[st], vbz]),
    logAge=np.log10(np.concatenate([age[st], ageb]) * 1e6),
    logZ=np.concatenate([logZ[st], logZb]),
    logM=np.log10(np.concatenate([m[st], mb])),
)
gpos = np.stack([x[is_gas], y[is_gas], z[is_gas]], 1)
gvel = np.stack([vx[is_gas], vy[is_gas], vz[is_gas]], 1)
gpos = np.concatenate([gpos, po]); gvel = np.concatenate([gvel, vo])
gm_ = np.concatenate([m[is_gas], mo])
gZ = np.concatenate([logZ[is_gas], np.full(NO, 0.05) + rng.normal(0, 0.05, NO)])
outflow = np.zeros(len(gm_), bool); outflow[-NO:] = True
ng = len(gm_)

H3, edges = np.histogramdd(gpos, bins=(160, 160, 40), range=((-18, 18), (-18, 18), (-1.5, 1.5)), weights=gm_)
cellv = (36 / 160) ** 2 * (3 / 40)
ix_ = [np.clip(np.digitize(gpos[:, k], edges[k]) - 1, 0, H3.shape[k] - 1) for k in range(3)]
rho = H3[ix_[0], ix_[1], ix_[2]] / cellv

ya = 10 ** S["logAge"] / 1e6
young = ya < 20
logQ = np.where(ya < 3, 46.6, 46.6 - 4.2 * np.log10(np.maximum(ya, 3) / 3)) + S["logM"]
Qh, _ = np.histogramdd(np.stack([S["x"][young], S["y"][young], S["z"][young]], 1), bins=(160, 160, 40),
                       range=((-18, 18), (-18, 18), (-1.5, 1.5)), weights=10 ** logQ[young])
from scipy.ndimage import gaussian_filter
Qs = gaussian_filter(Qh, (1.0, 1.0, 0.8))
Hs = gaussian_filter(H3, (1.0, 1.0, 0.8)) + 1e-30
share = gm_ / Hs[ix_[0], ix_[1], ix_[2]]
Ha_sf = 1.37e-12 * 0.85 * Qs[ix_[0], ix_[1], ix_[2]] * share
Ha_sf[outflow] = 0

rg = np.linalg.norm(gpos, axis=1)
cosang = np.abs(gpos @ AXIS) / (rg + 1e-9)
lit = (cosang > np.cos(HALF + np.radians(4))) & (rg < 4.0)
Ha_agn = np.where(lit, gm_ / (rg ** 2 + 0.05 ** 2), 0.0)
Ha_agn *= 1.6e41 / Ha_agn.sum()

Ha_dig = gm_ * rho * (~outflow)
Ha_dig *= 0.2 * Ha_sf.sum() / Ha_dig.sum()

OH = 8.69 + gZ
N2_sf = np.clip((OH - 8.90) / 0.57, -2.4, -0.35)
O3N2_sf = (8.73 - OH) / 0.32
O3_sf = O3N2_sf + N2_sf
xr = np.clip(np.log10(np.maximum(rg, 0.05) / 0.3), -1, 1.2)
O3_agn = 1.05 - 0.25 * xr
lines = {}
Hb = Ha_sf / 2.86 + Ha_agn / 3.1 + Ha_dig / 2.86
lines["ha"] = Ha_sf + Ha_agn + Ha_dig
lines["hb"] = Hb
lines["oiii"] = (Ha_sf / 2.86) * 10 ** O3_sf + (Ha_agn / 3.1) * 10 ** O3_agn + (Ha_dig / 2.86) * 10 ** 0.1
lines["nii"] = Ha_sf * 10 ** N2_sf + Ha_agn * 0.85 + Ha_dig * 0.65
lines["sii"] = Ha_sf * (0.18 + 0.1 * np.clip(-gZ, 0, 1)) + Ha_agn * 0.55 + Ha_dig * 0.6
lines["oi"] = Ha_sf * 0.02 + Ha_agn * 0.14 + Ha_dig * 0.09
srcs = np.stack([Ha_sf, Ha_agn, Ha_dig], 1)
cls = np.argmax(srcs, 1).astype(float)
cls[lines["ha"] <= 0] = 2
ne = np.clip(np.where(cls == 1, 600 * np.maximum(rg / 0.3, 0.1) ** -1.0, 60 * np.sqrt(rho / np.median(rho))), 10, 5000)
sig = np.where(outflow, 160, np.where(cls == 1, 90, np.where(cls == 0, 22, 40))).astype(float)

def lg(a):
    return np.log10(np.maximum(a, 1e20))

Gd = dict(
    x=gpos[:, 0], y=gpos[:, 1], z=gpos[:, 2], vx=gvel[:, 0], vy=gvel[:, 1], vz=gvel[:, 2],
    logM=np.log10(gm_), logZ=gZ,
    logHa=lg(lines["ha"]), logHb=lg(lines["hb"]), logO3=lg(lines["oiii"]), logN2=lg(lines["nii"]),
    logS2=lg(lines["sii"]), logO1=lg(lines["oi"]), cls=cls, logNe=np.log10(ne), sig=sig,
)

def write(name, cols):
    order = list(cols.keys())
    n = len(cols[order[0]])
    blob = b"".join(np.asarray(cols[k], np.float16).tobytes() for k in order)
    return name, n, order, blob

parts = [write("stars", S), write("gas", Gd)]
meta = {"version": 1, "units": {"pos": "kpc", "vel": "km/s", "age": "log yr", "Z": "log Z/Zsun", "M": "log Msun", "L": "log erg/s"},
        "agn": {"axis": AXIS.tolist(), "halfOpening": float(np.degrees(HALF)), "Mbh": MBH,
                "logL5100": 43.6, "logLHaBroad": 42.7, "fwhmBroad": 3600},
        "sim": {"T_end_Myr": T_END, "N_body": int(NS + NGAS), "grid": NG, "box_kpc": L, "soft_kpc": EPS},
        "blocks": []}
off = 0
with open(OUT / "galaxy.bin", "wb") as fh:
    for name, n, order, blob in parts:
        meta["blocks"].append({"name": name, "count": int(n), "offset": off, "columns": order})
        fh.write(blob); off += len(blob)
        padn = (-off) % 4
        fh.write(b"\0" * padn); off += padn
stats = {k: [float(np.percentile(v, 1)), float(np.percentile(v, 99))] for k, v in {**{"s_" + k: v for k, v in S.items()}, **{"g_" + k: v for k, v in Gd.items()}}.items()}
meta["ranges"] = stats
(OUT / "galaxy.json").write_text(json.dumps(meta, indent=1))
print(f"stars {len(S['x'])}, gas {ng}, {off / 1e6:.1f} MB")
print("Ha total log", np.log10(lines["ha"].sum()), " SF", np.log10(Ha_sf.sum()), " AGN", np.log10(Ha_agn.sum()), " SFR(<10Myr) Msun/yr",
      (10 ** S["logM"][10 ** S["logAge"] < 1e7]).sum() / 1e7)
