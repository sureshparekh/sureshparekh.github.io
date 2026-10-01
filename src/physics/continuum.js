import { C_CGS, H_CGS, K_CGS } from "./constants.js";

const HC_K = (H_CGS * C_CGS) / K_CGS * 1e8;

export function planck(lam, T) {
  const x = HC_K / (lam * T);
  if (x > 700) return 0;
  const lcm = lam * 1e-8;
  return (2 * H_CGS * C_CGS * C_CGS) / (lcm ** 5) / Math.expm1(x) * 1e-8;
}

export function diskPowerLaw(lam, lamRef) {
  return Math.pow(lam / lamRef, -7 / 3);
}

const PEI_SMC = [
  [185,   0.042, 90.0,  2.0],
  [27,    0.08,  5.50,  4.0],
  [0.005, 0.22, -1.95,  2.0],
  [0.010, 9.7,  -1.95,  2.0],
  [0.012, 18.0, -1.80,  2.0],
  [0.030, 25.0,  0.00,  2.0],
];
const PEI_RV = 2.93;

const K_MEMO = new Map();
export function kSMC(lam) {
  let v = K_MEMO.get(lam);
  if (v === undefined) { v = kSMCraw(lam); if (K_MEMO.size < 20000) K_MEMO.set(lam, v); }
  return v;
}
function kSMCraw(lam) {
  const l = lam * 1e-4;
  let xi = 0;
  for (const [a, li, b, n] of PEI_SMC) {
    xi += a / (Math.pow(l / li, n) + Math.pow(li / l, n) + b);
  }
  return xi * (1 + 1 / PEI_RV);
}

export const attenuate = (k, av) => Math.pow(10, -0.4 * av * k);
