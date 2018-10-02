import { createShader, createProgram } from '../util'

export abstract class Shader<S = {}, I extends ShaderInputs = {}> {
  public readonly sources: ShaderSources

  protected readonly program: WebGLProgram
  protected readonly vertexArray: WebGLVertexArrayObject
  protected readonly gl: WebGL2RenderingContext

  public constructor(gl: WebGL2RenderingContext, sources: ShaderSources) {
    this.gl = gl
    this.sources = sources

    // Compile shader program
    const vs = createShader(gl, gl.VERTEX_SHADER, sources.vertex)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, sources.fragment)
    this.program = createProgram(gl, vs, fs)

    // Vertex array for attributes
    const vertexArray = gl.createVertexArray()
    if (vertexArray === null) {
      throw new Error('Cannot create vertex array')
    }
    this.vertexArray = vertexArray
  }

  public abstract render(
    props: ShaderProps<S, I>,
    fb: WebGLFramebuffer | null,
  ): ShaderOutput
}

export interface ShaderSources {
  vertex: string
  fragment: string
}

export type ShaderProps<S, I> = S & I

export interface ShaderOutput {
  texture: WebGLTexture
  width: number
  height: number
}

export interface ShaderInputs {
  [key: string]: ShaderOutput | ShaderOutput[]
}
