export function loadTexture(gl: WebGL2RenderingContext, source: TextureSource) {
  // Create texture
  const texture = gl.createTexture()
  if (texture === null) {
    throw new Error('Cannot create texture')
  }

  // Bind texture to the first active texture unit
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // Don't repeat
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  // Don't require mipmaps
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  // Load texture data into texture unit
  const mipmapLevel = 0
  const internalFormat = gl.RGBA
  const srcFormat = gl.RGBA
  const srcType = gl.UNSIGNED_BYTE
  gl.texImage2D(
    gl.TEXTURE_2D,
    mipmapLevel,
    internalFormat,
    srcFormat,
    srcType,
    source,
  )
}

export type TextureSource =
  | ImageData
  | ImageBitmap
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement
