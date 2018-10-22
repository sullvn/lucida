import { BaseShader } from './BaseShader'
import { assertValid, createAttribute } from '../util'
import { Size, ShaderInputs } from '../Shader'

export class Fit extends BaseShader<FitProps, 'input'> {
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

  public size({ size }: FitProps): Size {
    const { gl } = this

    return size
      ? size
      : {
          width: gl.canvas.width,
          height: gl.canvas.height,
        }
  }

  public render(
    props: FitProps,
    { input }: ShaderInputs<'input'>,
    fb: WebGLFramebuffer | null,
  ) {
    const {
      gl,
      program,
      vertexArray,
      textureUniform,
      inputSizeUniform,
      outputSizeUniform,
    } = this
    const { width, height } = this.size(props)

    // Use shader program and attributes
    gl.useProgram(program)
    gl.bindVertexArray(vertexArray)

    // Bind texture to an active texture unit
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, input.texture)

    // Set uniforms
    gl.uniform1i(textureUniform, 0)
    gl.uniform2f(inputSizeUniform, input.width, input.height)
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

export interface FitProps {
  size?: Size
}

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
