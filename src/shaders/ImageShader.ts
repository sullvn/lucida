import { Shader } from './Shader'
import { createAttribute } from '../util/createAttribute'
import { TextureSource, loadTexture } from '../util'

export class ImageShader extends Shader {
  private defaultTexture: WebGLTexture | null = null
  private texture: WebGLTexture | null = null
  private textureUniform: WebGLUniformLocation

  public constructor(gl: WebGL2RenderingContext) {
    super(gl, VERTEX_SHADER, FRAGMENT_SHADER)
    const { program, vertexArray } = this

    this.setupDefaultTexture()

    // Texture uniform
    const textureUniform = gl.getUniformLocation(program, 'u_texture')
    if (textureUniform === null) {
      throw new Error('Cannot get uniform location')
    }
    this.textureUniform = textureUniform

    // Square geometry
    // prettier-ignore
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,

      -1, 1,
      1, -1,
      1, 1,
    ])
    createAttribute(
      'a_position',
      positions,
      gl,
      program,
      vertexArray,
      gl.STATIC_DRAW,
      {
        size: 2,
        type: gl.FLOAT,
      },
    )

    // prettier-ignore
    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,

      0, 0,
      1, 1,
      1, 0,
    ])
    createAttribute(
      'a_texCoord',
      texCoords,
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

  public loadImage(source: TextureSource) {
    const { gl } = this

    this.texture = loadTexture(gl, source)
  }

  /**
   * Setup default texture
   *
   * As a 1x1 repeating pixel
   */
  private setupDefaultTexture() {
    const { gl, defaultTexture } = this

    if (defaultTexture !== null) {
      return
    }

    const texture = gl.createTexture()
    if (texture === null) {
      throw new Error('Cannot create default texture')
    }

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // prettier-ignore
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255]),
    )

    this.defaultTexture = texture
  }

  public render(width: number, height: number) {
    const {
      gl,
      program,
      vertexArray,
      textureUniform,
      texture,
      defaultTexture,
    } = this

    // Use shader program and attributes
    gl.useProgram(program)
    gl.bindVertexArray(vertexArray)

    // Use texture
    const t = texture || defaultTexture

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, t)

    // Set uniforms
    gl.uniform1i(textureUniform, 0)

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

in vec4 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;

void main() {
  gl_Position = a_position;

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
