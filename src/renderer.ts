import { resizeCanvas } from './util'
import { Image, ImageSource, Fit, Mask } from './shaders'
import { ShaderGraph } from './ShaderGraph'

/**
 * Renderer class
 *
 * Encompasses the state of an HTML canvas, WebGL2 rendering
 * context, and any loaded images.
 */
export class Renderer {
  private graph: ShaderGraph<GraphProps> | null = null
  private subjectImage: ImageSource | null = null
  private maskImage: ImageSource | null = null

  /**
   * Refresh the canvas with a new rendered frame
   */
  public render() {
    const { graph, subjectImage, maskImage } = this

    // Render with flow
    if (graph === null) {
      throw new Error('Cannot use null shader')
    }

    if (subjectImage !== null && maskImage !== null) {
      graph.render({ subject: subjectImage, mask: maskImage })
    }
  }

  public loadImage(type: 'mask' | 'subject', source: ImageSource) {
    if (type === 'mask') {
      this.maskImage = source
    } else {
      this.subjectImage = source
    }

    this.render()
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
    const gl = canvas.getContext('webgl2')
    if (gl === null) {
      throw new Error('Cannot get WebGL 2 context')
    }

    resizeCanvas(canvas)

    const g = (this.graph = new ShaderGraph(gl))
    g.add(Fit, () => ({}), {
      input: g.add(Mask, () => ({}), {
        subject: g.add(Image, ({ subject }) => ({ source: subject }), {}),
        mask: g.add(Image, ({ mask }) => ({ source: mask }), {}),
      }),
    })
  }
}

interface GraphProps {
  subject: ImageSource
  mask: ImageSource
}
