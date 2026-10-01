export const C_KMS = 299792.458;
export const C_CGS = 2.99792458e10;
export const H_CGS = 6.62607015e-27;
export const K_CGS = 1.380649e-16;
export const SIGMA_SB = 5.670374e-5;
export const L_SUN = 3.828e33;
export const T_SUN = 5772;
export const G_PC = 4.30091e-3;
export const AU_PC = 4.84814e-6;

export const LAM_MIN = 1200;
export const LAM_MAX = 9800;
export const DV_PIX = 100;
export const DLNL = DV_PIX / C_KMS;
export const NLAM = Math.floor(Math.log(LAM_MAX / LAM_MIN) / DLNL) + 1;

export const LAM = new Float64Array(NLAM);
for (let i = 0; i < NLAM; i++) LAM[i] = LAM_MIN * Math.exp(i * DLNL);

export function lamIndex(l) {
  return Math.log(l / LAM_MIN) / DLNL;
}

export function interpLam(arr, l) {
  const f = lamIndex(l);
  if (f <= 0) return arr[0];
  if (f >= NLAM - 1) return arr[NLAM - 1];
  const i = Math.floor(f), w = f - i;
  return arr[i] * (1 - w) + arr[i + 1] * w;
}

export const LAM_REF = 3540;
export const LAM_5100 = 5100;
export const LAM_BALMER = 3646;
