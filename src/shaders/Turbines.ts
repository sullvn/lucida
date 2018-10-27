import { BaseShader } from './BaseShader'
import { assertValid, createAttribute } from '../util'
import { ShaderInputs, Size } from '../Shader'

export class Turbines extends BaseShader<TurbinesProps, 'input'> {
  private readonly textureUniform: WebGLUniformLocation
  private readonly resolutionUniform: WebGLUniformLocation
  private readonly turbineLengthUniform: WebGLUniformLocation

  public constructor(gl: WebGL2RenderingContext) {
    super(gl, { vertex: VERTEX_SHADER, fragment: FRAGMENT_SHADER })
    const { program, vertexArray } = this

    // Uniform locations
    this.textureUniform = assertValid(
      gl.getUniformLocation(program, 'u_texture'),
      'Turbines shader: Cannot get texture uniform location',
    )
    this.resolutionUniform = assertValid(
      gl.getUniformLocation(program, 'u_resolution'),
      'Turbines shader: Cannot get resolution uniform location',
    )
    this.turbineLengthUniform = assertValid(
      gl.getUniformLocation(program, 'u_turbineLength'),
      'Turbines shader: Cannot get turbineLength uniform location',
    )

    // Fan geometry
    createAttribute(
      'a_vertex',
      VERTICES,
      gl,
      program,
      vertexArray,
      gl.STATIC_DRAW,
      { size: 2, type: gl.FLOAT },
    )
  }

  public size(_props: TurbinesProps, { input }: ShaderInputs<'input'>): Size {
    const { width, height } = input
    return { width, height }
  }

  public render(
    props: TurbinesProps,
    inputs: ShaderInputs<'input'>,
    fb: WebGLFramebuffer | null,
  ) {
    const {
      gl,
      program,
      vertexArray,
      textureUniform,
      resolutionUniform,
      turbineLengthUniform,
    } = this
    const { length } = props
    const {
      input: { texture },
    } = inputs
    const { width, height } = this.size(props, inputs)

    // Turbine count is number of square cells which fit
    // in the output resolution
    const turbineCount =
      Math.floor(width / length) * Math.floor(height / length)

    // Use shader program and attributes
    gl.useProgram(program)
    gl.bindVertexArray(vertexArray)

    // Bind texture to an active texture unit
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Set uniforms
    gl.uniform1i(textureUniform, 0)
    gl.uniform2f(resolutionUniform, width, height)
    gl.uniform1f(turbineLengthUniform, length)

    // Use framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)

    // Clear and render to viewport
    gl.viewport(0, 0, width, height)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const primitiveType = gl.TRIANGLES
    const drawOffset = 0
    const count = 6
    gl.drawArraysInstanced(primitiveType, drawOffset, count, turbineCount)
  }
}

type TurbinesProps = {
  length: number
}

const VERTEX_SHADER = `\
#version 300 es

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_turbineLength;

in vec4 a_vertex;
out vec4 v_color;

vec2 fanCell(float index, vec2 resolution, float turbineLength) {
  float columns = floor(resolution.x / turbineLength);

  float column = mod(index, columns);
  float row = floor(index / columns);

  return vec2(column, row);
}

vec2 fanCenter(float index, vec2 resolution, float turbineLength) {
  vec2 cell = fanCell(index, resolution, turbineLength);

  vec2 absPxCenter = turbineLength * (cell + vec2(.5, .5));
  vec2 pxCenter = 2. * absPxCenter / resolution - vec2(1., 1.);

  return pxCenter;
}

void main() {
  float index = float(gl_InstanceID);

  vec2 center = fanCenter(index, u_resolution, u_turbineLength);
  vec2 textureCenter = .5 * (center + vec2(1., 1.));
  float scale = u_turbineLength / min(u_resolution.x, u_resolution.y);

  gl_Position = scale * a_vertex + vec4(center, 0., 1.);
  v_color = texture(u_texture, textureCenter);
}
`

const FRAGMENT_SHADER = `\
#version 300 es
precision mediump float;

in vec4 v_color;
out vec4 outColor;

void main() {
  outColor = v_color;
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
