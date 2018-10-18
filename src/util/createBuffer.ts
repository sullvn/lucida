import { assertValid } from './asserts'

/**
 * Create buffer for shader output
 *
 * Includes:
 *
 * - Framebuffer
 * - Color texture attachment
 *
 * **NOTE:** Textures are *not* initialized
 *
 * @param gl WebGL rendering context
 */
export function createBuffer(gl: WebGL2RenderingContext): ShaderBuffer {
  // Texture
  const texture = assertValid(gl.createTexture(), 'Cannot create texture')
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // Don't repeat
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  // Don't require mipmaps
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  // Framebuffer
  const framebuffer = assertValid(
    gl.createFramebuffer(),
    'Cannot create framebuffer',
  )

  // Attach texture to framebuffer
  const mipmapLevel = 0
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    mipmapLevel,
  )

  return { texture, framebuffer }
}

export interface ShaderBuffer {
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
}
