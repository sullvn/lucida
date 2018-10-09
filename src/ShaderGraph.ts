import { Shader, ShaderConstructor, ShaderInputs, ShaderOutput } from './Shader'
import { assertValid } from './util'

export class ShaderGraph<P = {}> {
  private graph: ShaderNode<P, any, any>[] = []
  private buffers: ShaderBuffer[] = []

  public constructor(private readonly gl: WebGL2RenderingContext) {
    this.gl = gl

    this.allocateBuffer()
    this.allocateBuffer()
  }

  /**
   * Add a sahder to the
   * @param constructShader
   * @param props
   * @param deps
   */
  public add<SP, I extends string = never>(
    constructShader: ShaderConstructor<SP, I>,
    props: PropsFn<P, SP>,
  ): void {
    const { gl, graph } = this

    graph.push({
      shader: new constructShader(gl),
      propsFn: props,
    })
  }

  public render(props: P): void {
    const { gl, graph, buffers } = this

    let inputs: ShaderInputs<any> = {}
    let output: ShaderOutput = {
      width: gl.canvas.width,
      height: gl.canvas.height,
    }

    for (let i = 0; i < graph.length; i++) {
      const { shader, propsFn } = graph[i]

      const isLast = i === graph.length - 1
      const inputBuffer = buffers[i % 2]
      const outputBuffer = buffers[(i + 1) % 2]
      const framebuffer = isLast ? null : outputBuffer.framebuffer

      const shaderProps = propsFn(props)

      inputs = {
        input: {
          texture: inputBuffer.texture,
          width: output.width,
          height: output.height,
        },
      }

      output = shader.render(shaderProps, inputs, framebuffer)
    }
  }

  private allocateBuffer(): void {
    const { gl, buffers } = this

    // Texture
    // TODO: Check for texture unit limit
    // TODO: Initialize texture with blank data
    const textureUnit = buffers.length
    const texture = assertValid(gl.createTexture(), 'Cannot create texture')

    // Use texture in next available texture unit
    gl.activeTexture(gl.TEXTURE0 + textureUnit)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Initialize texture memory
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.canvas.width,
      gl.canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    )

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

    // Add to buffer list
    this.buffers.push({ texture, framebuffer })
  }
}

interface PropsFn<P, SP> {
  (graphProps: P): SP
}

interface ShaderNode<P, SP, I extends string = never> {
  shader: Shader<SP, I>
  propsFn: PropsFn<P, SP>
}

interface ShaderBuffer {
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
}
