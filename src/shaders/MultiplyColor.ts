import { BaseShader } from './BaseShader'
import { assertValid, createAttribute } from '../util'
import { ShaderInputs, Size } from '../Shader'

export class MultiplyColor extends BaseShader<MultiplyColorProps, 'input'> {
  private readonly textureUniform: WebGLUniformLocation
  private readonly multiplyUniform: WebGLUniformLocation

  public constructor(gl: WebGL2RenderingContext) {
    super(gl, { vertex: VERTEX_SHADER, fragment: FRAGMENT_SHADER })
    const { program, vertexArray } = this

    // Uniform locations
    this.textureUniform = assertValid(
      gl.getUniformLocation(program, 'u_texture'),
      'MultiplyColor shader: Cannot get texture uniform location',
    )

    this.multiplyUniform = assertValid(
      gl.getUniformLocation(program, 'u_multiply'),
      'MultiplyColor shader: Cannot get multiply uniform location',
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

  public inputsSizes(_props: MultiplyColorProps, size: Size) {
    return { input: size }
  }

  public render(
    props: MultiplyColorProps,
    inputs: ShaderInputs<'input'>,
    fb: WebGLFramebuffer | null,
  ) {
    const { gl, program, vertexArray, textureUniform, multiplyUniform } = this
    const { red = 1, green = 1, blue = 1, alpha = 1 } = props
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
    gl.uniform4f(multiplyUniform, red, green, blue, alpha)

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

interface MultiplyColorProps {
  red?: number
  green?: number
  blue?: number
  alpha?: number
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
uniform vec4 u_multiply;

in vec2 v_texCoord;
out vec4 outColor;

void main() {
  vec4 textureColor = texture(u_texture, v_texCoord);
  outColor = textureColor * u_multiply;
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
