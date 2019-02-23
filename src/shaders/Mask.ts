import { BaseShader } from './BaseShader'
import { Size, ShaderInputs } from '../Shader'
import { assertValid, createAttribute } from '../util'

export class Mask extends BaseShader<{}, 'subject' | 'mask'> {
  private readonly subjectUniform: WebGLUniformLocation
  private readonly maskUniform: WebGLUniformLocation

  public constructor(gl: WebGL2RenderingContext) {
    super(gl, { vertex: VERTEX_SHADER, fragment: FRAGMENT_SHADER })
    const { program, vertexArray } = this

    // Uniform locations
    this.subjectUniform = assertValid(
      gl.getUniformLocation(program, 'u_subject'),
      'Mask shader: Cannot get subject uniform location',
    )
    this.maskUniform = assertValid(
      gl.getUniformLocation(program, 'u_mask'),
      'Mask shader: Cannot get mask uniform location',
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

  public inputsSizes(_props: {}, size: Size) {
    return { subject: size, mask: size }
  }

  public render(
    _props: {},
    inputs: ShaderInputs<'subject' | 'mask'>,
    fb: WebGLFramebuffer | null,
    { width, height }: Size,
  ): void {
    const { gl, program, vertexArray, subjectUniform, maskUniform } = this
    const { subject, mask } = inputs

    // Use shader program and attributes
    gl.useProgram(program)
    gl.bindVertexArray(vertexArray)

    // Load texture uniforms
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, subject.texture)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, mask.texture)

    // Set uniforms
    gl.uniform1i(subjectUniform, 0)
    gl.uniform1i(maskUniform, 1)

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

uniform sampler2D u_subject;
uniform sampler2D u_mask;

in vec2 v_texCoord;
out vec4 outColor;

void main() {
  outColor = texture(u_mask, v_texCoord) * texture(u_subject, v_texCoord);
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
