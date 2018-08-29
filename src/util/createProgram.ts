/**
 * Create shader program
 *
 * @param gl WebGL rendering context
 * @param vertexShader compiled vertex shader
 * @param fragmentShader compoiled fragment shader
 */
export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram()
  if (program === null) {
    throw new Error('Cannot create shader program')
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }

  const errorLog = gl.getProgramInfoLog(program) || 'Cannot link shader program'
  gl.deleteProgram(program)
  throw new Error(errorLog)
}
