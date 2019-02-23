/**
 * Presize texture before rendering to it's framebuffer
 *
 * @param gl WebGL 2 rendering context
 * @param texture WebGL texture
 * @param width width in pixels
 * @param height height in pixels
 */
export function presizeTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  width: number,
  height: number,
): void {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  )
}
