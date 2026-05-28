export function dotProduct(a: Float32Array, b: Float32Array, dim: number): number {
  let sum = 0;
  for (let i = 0; i < dim; i++) sum += a[i] * b[i];
  return sum;
}

export function l2Norm(v: Float32Array, dim: number): number {
  let sum = 0;
  for (let i = 0; i < dim; i++) sum += v[i] * v[i];
  return Math.sqrt(sum);
}

export function normalize(v: Float32Array, dim: number): Float32Array {
  const norm = l2Norm(v, dim);
  if (norm === 0) return v;
  const out = new Float32Array(dim);
  for (let i = 0; i < dim; i++) out[i] = v[i] / norm;
  return out;
}

export function lerpVectors(
  a: Float32Array,
  b: Float32Array,
  alpha: number,
  dim: number
): Float32Array {
  const out = new Float32Array(dim);
  for (let i = 0; i < dim; i++) out[i] = (1 - alpha) * a[i] + alpha * b[i];
  return normalize(out, dim);
}
