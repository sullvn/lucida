import { BaseShader } from './BaseShader'
import { assertValid, createAttribute } from '../util'
import { Size, ShaderInputs, InputsSizes } from '../Shader'

const VERTEX_SHADER = `\
#version 300 es

in vec2 a_vertex;
in vec2 a_texCoord;

uniform vec2 u_inputSize;
uniform vec2 u_outputSize;

out vec2 v_texCoord;

vec2 fitPosition(vec2 vertex, vec2 inputSize, vec2 outputSize) {
  vec2 scales = inputSize / outputSize;
  float fit = 1.0 / max(scales.x, scales.y);
  vec2 unitFit = fit * scales;

  return unitFit * vertex;
}

void main() {
  v_texCoord = a_texCoord;

  vec2 pos = fitPosition(a_vertex, u_inputSize, u_outputSize);
  gl_Position = vec4(pos.xy, 0, 1);
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

export interface FitProps {
  subjectSize: Size
}

export class Fit extends BaseShader<FitProps, 'subject'> {
  private readonly textureUniform: WebGLUniformLocation
  private readonly inputSizeUniform: WebGLUniformLocation
  private readonly outputSizeUniform: WebGLUniformLocation

  public constructor(gl: WebGL2RenderingContext) {
    super(gl, { vertex: VERTEX_SHADER, fragment: FRAGMENT_SHADER })
    const { program, vertexArray } = this

    // Uniform locations
    this.textureUniform = assertValid(
      gl.getUniformLocation(program, 'u_texture'),
      'Fit shader: Cannot get texture uniform location',
    )
    this.inputSizeUniform = assertValid(
      gl.getUniformLocation(program, 'u_inputSize'),
      'Fit shader: Cannot get inputSize uniform location',
    )
    this.outputSizeUniform = assertValid(
      gl.getUniformLocation(program, 'u_outputSize'),
      'Fit shader: Cannot get outputSize uniform location',
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

  public inputsSizes(
    { subjectSize }: FitProps,
    containerSize: Size,
  ): InputsSizes<'subject'> {
    const [s, c] = [subjectSize, containerSize]

    const fit = 1 / Math.max(s.width / c.width, s.height / c.height)
    const fitSize = { width: fit * s.width, height: fit * s.height }

    return { subject: fitSize }
  }

  public render(
    _props: {},
    { subject }: ShaderInputs<'subject'>,
    fb: WebGLFramebuffer | null,
    { width, height }: Size,
  ): void {
    const {
      gl,
      program,
      vertexArray,
      textureUniform,
      inputSizeUniform,
      outputSizeUniform,
    } = this

    // Use shader program and attributes
    gl.useProgram(program)
    gl.bindVertexArray(vertexArray)

    // Bind texture to an active texture unit
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, subject.texture)

    // Set uniforms
    gl.uniform1i(textureUniform, 0)
    gl.uniform2f(inputSizeUniform, subject.width, subject.height)
    gl.uniform2f(outputSizeUniform, width, height)

    // Use framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)

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
