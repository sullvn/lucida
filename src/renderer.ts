import { resizeCanvas, TextureSource } from './util'
import { ImageShader } from './shaders/ImageShader'

/**
 * Renderer class
 *
 * Encompasses the state of an HTML canvas, WebGL2 rendering
 * context, and any loaded images.
 */
export class Renderer {
  private canvas: HTMLCanvasElement | null
  private gl: WebGL2RenderingContext | null
  private shader: ImageShader | null

  public constructor() {
    this.gl = null
    this.canvas = null
    this.shader = null
  }

  /**
   * Refresh the canvas with a new rendered frame
   */
  public render() {
    const { canvas, gl, shader } = this
    if (gl === null || canvas === null) {
      throw new Error('Cannot render to null canvas or context')
    }

    // Update viewport
    resizeCanvas(canvas)

    // Render with shader
    if (shader === null) {
      throw new Error('Cannot use null shader')
    }

    shader.render(gl.canvas.width, gl.canvas.height)
  }

  public loadImage(source: TextureSource) {
    const { gl, shader } = this
    if (gl === null) {
      throw new Error('Cannot load image to null context')
    }
    if (shader === null) {
      throw new Error('Cannot load image to null shader')
    }

    shader.loadImage(source)
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

    this.shader = new ImageShader(gl)
  }
}
