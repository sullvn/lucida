import { resizeCanvas } from './util'
import { Image, ImageSource, MultiplyColor } from './shaders'
import { ShaderGraph } from './ShaderGraph'

/**
 * Renderer class
 *
 * Encompasses the state of an HTML canvas, WebGL2 rendering
 * context, and any loaded images.
 */
export class Renderer {
  private gl: WebGL2RenderingContext | null
  private graph: ShaderGraph<GraphProps> | null

  public constructor() {
    this.gl = null
    this.graph = null
  }

  /**
   * Refresh the canvas with a new rendered frame
   */
  public render(source: ImageSource) {
    const { graph } = this

    // Render with flow
    if (graph === null) {
      throw new Error('Cannot use null shader')
    }

    graph.render({ image: source, red: 2 })
  }

  public loadImage(source: ImageSource) {
    const { gl, graph } = this
    if (gl === null) {
      throw new Error('Cannot load image to null context')
    }
    if (graph === null) {
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
    // Get rendering context
    const gl = (this.gl = canvas.getContext('webgl2'))
    if (gl === null) {
      throw new Error('Cannot get WebGL 2 context')
    }

    resizeCanvas(canvas)

    this.graph = new ShaderGraph(gl)
    this.graph.add(MultiplyColor, ({ red }) => ({ red }), {
      input: this.graph.add(Image, ({ image }) => ({ source: image }), {}),
    })
  }
}

interface GraphProps {
  image: ImageSource
  red: number
}
