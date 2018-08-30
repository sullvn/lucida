import { fragment, vertex } from './shaders'
import {
  createProgram,
  createShader,
  resizeCanvas,
  loadTexture,
  TextureSource,
} from './util'
import { createAttribute } from './util/createAttribute'

/**
 * Renderer class
 *
 * Encompasses the state of an HTML canvas, WebGL2 rendering
 * context, and any loaded images.
 */
export class Renderer {
  private canvas: HTMLCanvasElement | null
  private gl: WebGL2RenderingContext | null

  public constructor() {
    this.gl = null
    this.canvas = null
  }

  /**
   * Refresh the canvas with a new rendered frame
   */
  public render() {
    const { canvas, gl } = this
    if (gl === null || canvas === null) {
      throw new Error('Cannot render to null canvas or context')
    }

    // Update viewport
    resizeCanvas(canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    // Render data
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const primitiveType = gl.TRIANGLES
    const drawOffset = 0
    const count = 6
    gl.drawArrays(primitiveType, drawOffset, count)
  }

  public loadImage(source: TextureSource) {
    const { gl } = this
    if (gl === null) {
      throw new Error('Cannot load image to null context')
    }

    loadTexture(gl, source)
  }

  /**
   * Initialize renderer
   *
   * Compiles shaders, sets up buffers, and
   * kicks off rendering.
   *
   * @param el Canvas DOM element
   */
  public initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    // Get rendering context
    const gl = (this.gl = canvas.getContext('webgl2'))
    if (gl === null) {
      throw new Error('Cannot get WebGL 2 context')
    }

    // Compile shader program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment)
    const program = createProgram(gl, vertexShader, fragmentShader)

    gl.useProgram(program)

    // Setup default texture as a 1x1 repeating pixel
    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255]),
    )

    // Setup vertex array for attributes
    const va = gl.createVertexArray()
    if (va === null) {
      throw new Error('Cannot create vertex array')
    }

    // Create attributes
    // prettier-ignore
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,

      -1, 1,
      1, -1,
      1, 1,
    ])
    createAttribute('a_position', positions, gl, program, va, gl.STATIC_DRAW, {
      size: 2,
      type: gl.FLOAT,
    })

    // prettier-ignore
    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,

      0, 0,
      1, 1,
      1, 0,
    ])
    createAttribute('a_texCoord', texCoords, gl, program, va, gl.STATIC_DRAW, {
      size: 2,
      type: gl.FLOAT,
    })

    // Create uniforms
    const textureLocation = gl.getUniformLocation(program, 'u_texture')
    gl.uniform1i(textureLocation, 0)

    // Use vertex attributes for rendering
    gl.bindVertexArray(va)
  }
}
