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

export function slerpVectors(
  a: Float32Array,
  b: Float32Array,
  fraction: number,
  dim: number
): Float32Array {
  const start = normalize(a, dim);
  const end = normalize(b, dim);
  const t = Math.min(1, Math.max(0, fraction));
  const cosTheta = Math.min(1, Math.max(-1, dotProduct(start, end, dim)));

  if (Math.abs(cosTheta) > 0.9995) {
    return lerpVectors(start, end, t, dim);
  }

  const theta = Math.acos(cosTheta);
  const sinTheta = Math.sin(theta);
  const startWeight = Math.sin((1 - t) * theta) / sinTheta;
  const endWeight = Math.sin(t * theta) / sinTheta;
  const out = new Float32Array(dim);

  for (let i = 0; i < dim; i++) {
    out[i] = startWeight * start[i] + endWeight * end[i];
  }

  return normalize(out, dim);
}
