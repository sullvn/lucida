import { BaseShader } from './BaseShader'
import { assertValid, createAttribute } from '../util'
import { ShaderInputs, Size } from '../Shader'

export class HSV extends BaseShader<HSVProps, 'input'> {
  private readonly textureUniform: WebGLUniformLocation
  private readonly rotateHueUniform: WebGLUniformLocation

  public constructor(gl: WebGL2RenderingContext) {
    super(gl, { vertex: VERTEX_SHADER, fragment: FRAGMENT_SHADER })
    const { program, vertexArray } = this

    // Uniform locations
    this.textureUniform = assertValid(
      gl.getUniformLocation(program, 'u_texture'),
      'HSV shader: Cannot get texture uniform location',
    )

    this.rotateHueUniform = assertValid(
      gl.getUniformLocation(program, 'u_rotateHue'),
      'HSV shader: Cannot get rotateHue uniform location',
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

  public inputsSizes(_props: HSVProps, size: Size) {
    return { input: size }
  }

  public render(
    props: HSVProps,
    inputs: ShaderInputs<'input'>,
    fb: WebGLFramebuffer | null,
  ) {
    const { gl, program, vertexArray, textureUniform, rotateHueUniform } = this
    const { rotateHue = 0 } = props
    const {
      input: { texture, width, height },
    } = inputs

    // Use shader program and attributes
    gl.useProgram(program)
    gl.bindVertexArray(vertexArray)

    // Bind texture to an active texture unit
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Set uniforms
    gl.uniform1i(textureUniform, 0)
    gl.uniform1f(rotateHueUniform, rotateHue / 360)

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

interface HSVProps {
  rotateHue?: number
}

const VERTEX_SHADER = `\
#version 300 es

in vec4 a_vertex;
in vec2 a_texCoord;

out vec2 v_texCoord;

void main() {
  gl_Position = a_vertex;
  v_texCoord = a_texCoord;
}
`

const FRAGMENT_SHADER = `\
#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform float u_rotateHue;

in vec2 v_texCoord;
out vec4 outColor;

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

/**
 * HSV to RGB color space
 * 
 * Credit: http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
 */
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec4 textureColor = texture(u_texture, v_texCoord);
  vec3 hsv = rgb2hsv(textureColor.rgb);
  vec3 newHSV = vec3(hsv.x + u_rotateHue, hsv.yz);

  outColor = vec4(hsv2rgb(newHSV).xyz, textureColor.a);
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
