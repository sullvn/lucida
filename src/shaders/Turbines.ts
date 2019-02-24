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

  public inputsSizes(_props: TurbinesProps, size: Size) {
    return { input: size }
  }

  public render(
    props: TurbinesProps,
    inputs: ShaderInputs<'input'>,
    fb: WebGLFramebuffer | null,
    { width, height }: Size,
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

const float PI = 3.14159265359;
const float SQRT_3 = 1.73205080756;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_turbineLength;

in vec2 a_vertex;
out vec4 v_color;

/**
 * RGB to HSV color space
 * 
 * Credit: http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
 */
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

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

mat2 fanRotation(vec4 color) {
  float hue = rgb2hsv(color.rgb).x;
  float angle = 2.0 * PI * hue;

  mat2 rotation = mat2(
    cos(angle), sin(angle),
    -sin(angle), cos(angle)
  );

  return rotation;
}

void main() {
  float index = float(gl_InstanceID);

  vec2 center = fanCenter(index, u_resolution, u_turbineLength);
  vec2 textureCenter = .5 * (center + vec2(1., 1.));
  vec2 scale = vec2(1., .2) * u_turbineLength / min(u_resolution.x, u_resolution.y);
  vec4 color = texture(u_texture, textureCenter);
  mat2 rotate = fanRotation(color);

  gl_Position = vec4(rotate * (scale * a_vertex) + center, 0., 1.);
  v_color = color;
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
