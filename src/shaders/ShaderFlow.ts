import { Shader, CanvasOutput, ShaderOutput } from './Shader'
import { assertValid } from '../util'

export class ShaderFlow {
  private buffers: ShaderBuffer[] = []

  // TODO: Assert shader pattern `input -> texture -> texture ...`
  //       when https://github.com/babel/babel/issues/8623 is fixed.
  public constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly flow: Shader[],
  ) {
    this.gl = gl
    this.flow = flow

    // Allocate two buffers for linear flows
    this.allocateBuffer()
    this.allocateBuffer()
  }

  public render(allProps: any[]): void {
    const { flow, buffers, gl } = this

    for (let i = 0; i < flow.length; i++) {
      const shader = flow[i]
      const props = allProps[i]
      const isLast = i === flow.length - 1

      const inputTextureUnit = i % 2
      const inputBuffer = buffers[i % 2]
      const outputBuffer = buffers[(i + 1) % 2]

      const commonInput = {
        width: gl.canvas.width,
        height: gl.canvas.height,
      }

      const input =
        i === 0
          ? commonInput
          : {
              ...commonInput,
              textureUnit: inputTextureUnit,
              texture: inputBuffer.texture,
              framebuffer: inputBuffer.framebuffer,
            }

      const output: ShaderOutput = isLast
        ? CANVAS_OUTPUT
        : {
            kind: 'framebuffer',
            texture: outputBuffer.texture,
            framebuffer: outputBuffer.framebuffer,
          }

      shader.render(input, output, props)
    }
  }

  private allocateBuffer(): void {
    const { gl, buffers } = this

    // Texture
    // TODO: Check for texture unit limit
    const textureUnit = buffers.length
    const texture = assertValid(gl.createTexture(), 'Cannot create texture')

    // Use texture in next available texture unit
    gl.activeTexture(gl.TEXTURE0 + textureUnit)
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

    // Add to buffer list
    this.buffers.push({ texture, framebuffer })
  }
}

interface ShaderBuffer {
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
}

const CANVAS_OUTPUT: CanvasOutput = {
  kind: 'canvas',
  texture: null,
  framebuffer: null,
}
