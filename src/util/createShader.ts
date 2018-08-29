/**
 * Create WebGL shader
 *
 * @param gl WebGL2 rendering context
 * @param type `VERTEX_SHADER` or `FRAGMENT_SHADER`
 * @param source shader source code text
 */
export function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)
  if (shader === null) {
    throw new Error('Cannot create shader')
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  const errorLog = gl.getShaderInfoLog(shader) || 'Cannot compile shader'
  gl.deleteShader(shader)
  throw new Error(errorLog)
}
