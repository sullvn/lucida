import { BaseShader } from './BaseShader'
import { Size, ShaderInputs, InputsSizes } from '../Shader'
import { assertValid, createAttribute } from '../util'

export class Jitter extends BaseShader<{}, 'subject'> {
  private readonly subjectUniform: WebGLUniformLocation
  private readonly outputSizeUniform: WebGLUniformLocation

  public constructor(gl: WebGL2RenderingContext) {
    super(gl, { vertex: VERTEX_SHADER, fragment: FRAGMENT_SHADER })
    const { program, vertexArray } = this

    // Uniform locations
    this.subjectUniform = assertValid(
      gl.getUniformLocation(program, 'u_subject'),
      'Jitter shader: Cannot get subject uniform location',
    )
    this.outputSizeUniform = assertValid(
      gl.getUniformLocation(program, 'u_outputSize'),
      'Jitter shader: Cannot get outputSize uniform location',
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
    return { subject: size }
  }

  public render(
    _props: {},
    inputs: ShaderInputs<'subject'>,
    fb: WebGLFramebuffer | null,
    { width, height }: Size,
  ): void {
    const { gl, program, vertexArray, subjectUniform, outputSizeUniform } = this
    const { subject } = inputs

    // Use shader program and attributes
    gl.useProgram(program)
    gl.bindVertexArray(vertexArray)

    // Load texture uniforms
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, subject.texture)

    // Set uniforms
    gl.uniform1i(subjectUniform, 0)
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

const float PI = 3.14159265359;
const float SAMPLE_RADIUS = 20.;
const vec3 PARAMS_1 = vec3(12.9898, 78.233, 43758.5453123);
const vec3 PARAMS_2 = vec3(18.2112, 34.321, 53123.1937201);

uniform sampler2D u_subject;
uniform vec2 u_outputSize;

in vec2 v_texCoord;
out vec4 outColor;


// Noise
//
// Implementation as featured in:
//
//    https://thebookofshaders.com/10/
//
float random(vec2 st, vec3 params) {
  return fract(
    sin(dot(st.xy, params.xy)) * params.z
  );
}

void main() {
  vec2 pixelSize = 1. / u_outputSize;
  vec2 st = gl_FragCoord.xy / u_outputSize;

  float angle = 2. * PI * random(st, PARAMS_1);
  vec2 magnitude = SAMPLE_RADIUS * pixelSize * random(st, PARAMS_2);
  vec2 offset = magnitude * vec2(cos(angle), sin(angle));

  outColor = texture(u_subject, v_texCoord + 10. * offset);
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
