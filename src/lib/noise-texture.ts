function generateNoiseData(size: number, seed: number): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  let s = seed

  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }

  for (let i = 0; i < size * size; i++) {
    const idx = i * 4
    data[idx] = (rand() * 255) | 0
    data[idx + 1] = (rand() * 255) | 0
    data[idx + 2] = (rand() * 255) | 0
    data[idx + 3] = (rand() * 255) | 0
  }

  return data
}

export function createNoiseTexture(gl: WebGL2RenderingContext, size: number, seed: number): WebGLTexture | null {
  const tex = gl.createTexture()
  if (!tex) return null

  const data = generateNoiseData(size, seed)

  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  gl.bindTexture(gl.TEXTURE_2D, null)

  return tex
}