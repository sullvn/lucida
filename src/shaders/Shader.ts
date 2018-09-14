import { createProgram, createShader } from '../util'

/**
 * Shader
 *
 * TODO:
 *   - Support static compiled programs
 *   - Allow linking multiple shader sources together
 */
export abstract class Shader<P = {}> {
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

  public abstract render(
    input: ShaderInput,
    output: ShaderOutput,
    props?: P,
  ): void
}

export interface ShaderInput {
  width: number
  height: number
}

export type ShaderOutput = FramebufferOutput | CanvasOutput

export interface FramebufferOutput {
  kind: 'framebuffer'
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
}

export interface CanvasOutput {
  kind: 'canvas'
  texture: null
  framebuffer: null
}
