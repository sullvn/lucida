import { resizeCanvas, TextureSource } from './util'
import { Image, MultiplyColor, ShaderFlow } from './shaders'

/**
 * Renderer class
 *
 * Encompasses the state of an HTML canvas, WebGL2 rendering
 * context, and any loaded images.
 */
export class Renderer {
  private canvas: HTMLCanvasElement | null
  private gl: WebGL2RenderingContext | null
  private flow: ShaderFlow | null

  public constructor() {
    this.gl = null
    this.canvas = null
    this.flow = null
  }

  /**
   * Refresh the canvas with a new rendered frame
   */
  public render(source: TextureSource) {
    const { canvas, flow } = this
    if (canvas === null) {
      throw new Error('Cannot render to null canvas')
    }

    // Update viewport
    resizeCanvas(canvas)

    // Render with flow
    if (flow === null) {
      throw new Error('Cannot use null shader')
    }

    flow.render([{ source }, { red: 3, green: 3, blue: 5 }])
  }

  public loadImage(source: TextureSource) {
    const { gl, flow } = this
    if (gl === null) {
      throw new Error('Cannot load image to null context')
    }
    if (flow === null) {
      throw new Error('Cannot load image to null flow')
    }

    this.render(source)
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

    this.flow = new ShaderFlow(gl, [new Image(gl), new MultiplyColor(gl)])
  }
}
