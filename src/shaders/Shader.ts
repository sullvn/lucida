import { createProgram, createShader } from '../util'

/**
 * Shader
 *
 * TODO: Support static compiled programs
 */
export abstract class Shader {
  protected readonly program: WebGLProgram
  protected readonly vertexArray: WebGLVertexArrayObject
  protected readonly gl: WebGL2RenderingContext

  public constructor(
    gl: WebGL2RenderingContext,
    vertexShader: string,
    fragmentShader: string,
  ) {
    this.gl = gl

    // Compile shader program
    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShader)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
    this.program = createProgram(gl, vs, fs)

    // Vertex array for attributes
    const vertexArray = gl.createVertexArray()
    if (vertexArray === null) {
      throw new Error('Cannot create vertex array')
    }
    this.vertexArray = vertexArray
  }

  public abstract render(width: number, height: number): void
}
