import { ShaderInput, ShaderOutput } from './Shader'
import { InputShader } from './InputShader'
import { assertValid, loadTexture } from '../util'
import { createAttribute } from '../util/createAttribute'

export class Image extends InputShader<ImageProps> {
  private readonly textureUniform: WebGLUniformLocation
  private readonly resolutionUniform: WebGLUniformLocation
  private readonly sizeUniform: WebGLUniformLocation

  public constructor(gl: WebGL2RenderingContext) {
    super(gl, VERTEX_SHADER, FRAGMENT_SHADER)
    const { program, vertexArray } = this

    // Uniform locations
    this.textureUniform = assertValid(
      gl.getUniformLocation(program, 'u_texture'),
      'Image shader: Cannot get texture uniform location',
    )
    this.resolutionUniform = assertValid(
      gl.getUniformLocation(program, 'u_resolution'),
      'Image shader: Cannot get resolution uniform location',
    )
    this.sizeUniform = assertValid(
      gl.getUniformLocation(program, 'u_size'),
      'Image shader: Cannot get size uniform location',
    )

    // Square geometry
    createAttribute(
      'a_vertex',
      VERTICES,
      gl,
      program,
      vertexArray,
      gl.STATIC_DRAW,
      { size: 2, type: gl.FLOAT },
    )

    createAttribute(
      'a_texCoord',
      TEXTURE_COORDS,
      gl,
      program,
      vertexArray,
      gl.STATIC_DRAW,
      {
        size: 2,
        type: gl.FLOAT,
      },
    )
  }

  public render(input: ShaderInput, output: ShaderOutput, props: ImageProps) {
    const { width, height } = input
    const { source } = props
    const {
      gl,
      program,
      vertexArray,
      textureUniform,
      resolutionUniform,
      sizeUniform,
    } = this

    // Use shader program and attributes
    gl.useProgram(program)
    gl.bindVertexArray(vertexArray)

    // Use texture
    const texture = loadTexture(gl, source)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Set uniforms
    gl.uniform1i(textureUniform, 0)
    gl.uniform2f(resolutionUniform, width, height)
    gl.uniform2f(sizeUniform, source.width, source.height)

    // Use framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, output.framebuffer)

    // Clear and render to viewport
    gl.viewport(0, 0, width, height)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const primitiveType = gl.TRIANGLES
    const drawOffset = 0
    const count = 6
    gl.drawArrays(primitiveType, drawOffset, count)
  }
}

export interface ImageProps {
  source: ImageSource
}

export type ImageSource =
  | ImageData
  | ImageBitmap
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement

const VERTEX_SHADER = `\
#version 300 es

in vec4 a_vertex;
in vec2 a_texCoord;

uniform vec2 u_resolution;
uniform vec2 u_size;

out vec2 v_texCoord;

void main() {
  u_resolution * vec2(1., 1.);
  u_size * vec2(1., 1.);

  gl_Position = a_vertex;
  v_texCoord = a_texCoord;
}
`

const FRAGMENT_SHADER = `\
#version 300 es

precision mediump float;

uniform sampler2D u_texture;

in vec2 v_texCoord;
out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texCoord);
}
`

// prettier-ignore
const VERTICES = new Float32Array([
  -1, -1,
  1, 1,
  -1, 1,

  -1, -1,
  1, -1,
  1, 1,
])

// prettier-ignore
const TEXTURE_COORDS = new Float32Array([
  0, 0,
  1, 1,
  0, 1,

  0, 0,
  1, 0,
  1, 1,
])
