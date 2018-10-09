import { createShader, createProgram } from '../util'
import { ShaderOutput, Shader, ShaderInputs } from '../Shader'

export abstract class BaseShader<P = {}, I extends string = never>
  implements Shader<P, I> {
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
    props: P,
    inputs: ShaderInputs<I>,
    fb: WebGLFramebuffer | null,
  ): ShaderOutput
}

export interface ShaderSources {
  vertex: string
  fragment: string
}
