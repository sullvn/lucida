import { zip } from 'wu'

import {
  Shader,
  ShaderConstructor,
  Size,
  ShaderInput,
  ShaderInputs,
  equalSizes,
} from './Shader'
import { TangledTree, RoseTree } from './structures'
import { assertValid, createBuffer } from './util'
import { presizeTexture } from './util/presizeTexture'

/**
 * Shader Graph
 *
 * ## TODO
 *
 * 1. Fix image decoding on every render
 * 2. Use better terminology. Like kill 'size'.
 *    It sucks; use `space` and `resolution` instead.
 * 4. Documentation documentation documentation
 *
 * ## Future Todos
 *
 * 1. Resize nodes when graph props change
 */
export class ShaderGraph<GP = {}> {
  private definitionTree: TangledTree<AnyDefinitionNode<GP>> = new TangledTree()
  private executionTree: RoseTree<AnyExecutionNode<GP>> | null = null
  private lastRenderSize: Size | null = null

  public constructor(private readonly gl: WebGL2RenderingContext) {
    this.gl = gl
  }

  /**
   * Add shader node to graph
   *
   * A shader node comprises of:
   *
   * - Shader program to render props and inputs
   * - Props function for deriving shader props from
   *   the graph props
   * - Input dependencies key-value map
   *
   * @param constructShader shader program constructor
   * @param propsFn function to derive shader props from graph props
   * @param dependencies input dependencies key-value map
   */
  public add<SP, I extends string = never>(
    constructShader: ShaderConstructor<SP, I>,
    propsFn: PropsFn<GP, SP>,
    inputs: InputsKeys<I>,
  ): NodeKey {
    const { gl, definitionTree } = this

    const shader = new constructShader(gl)

    const inputsKeys = Object.keys(inputs)
    const inputsTreeKeys: number[] = Object.values(inputs)

    return definitionTree.add({ shader, propsFn, inputsKeys }, inputsTreeKeys)
  }

  /**
   * Render shader graph
   *
   * @param graphProps shader graph props
   */
  public render(graphProps: GP): void {
    const { lastRenderSize } = this

    const executionTree = this.getExecutionTree()
    const renderSize = this.renderSize()

    // Resolve node output resolutions if the canvas has changed size
    if (lastRenderSize === null || !equalSizes(lastRenderSize, renderSize)) {
      this.resolveNode(executionTree, renderSize, graphProps)
    }

    this.renderNode(executionTree, graphProps, true)
  }

  /**
   * Render a single shader node
   *
   * @param node shader graph node
   * @param graphProps shader graph props
   */
  private renderNode<SP, I extends string>(
    node: RoseTree<ExecutionNode<GP, SP, I>>,
    graphProps: GP,
    isRoot: boolean,
  ): void {
    const { propsFn, shader, inputsKeys, output } = node.value
    const { framebuffer, size } = assertValid(output)

    // Render input nodes first
    for (const inputNode of node.children) {
      this.renderNode(inputNode, graphProps, false)
    }

    // Get shader inputs
    const inputsOutputs = node.children.map(c =>
      outputAsInput(assertValid(c.value.output)),
    )

    const shaderInputs: ShaderInputs<I> = zip(inputsKeys, inputsOutputs).reduce(
      (sis, [key, input]) => ({ ...sis, [key]: input }),
      {} as ShaderInputs<I>,
    )

    // Render this node
    const props = propsFn(graphProps)
    const outputBuffer = isRoot ? null : framebuffer

    shader.render(props, shaderInputs, outputBuffer, size)
  }

  /**
   * Resolve output resolutions of a node and its inputs, recursively
   *
   * @param node shader graph node
   * @param renderSize output render size of node
   * @param graphProps shader graph props
   */
  private resolveNode<SP, I extends string>(
    node: RoseTree<ExecutionNode<GP, SP, I>>,
    renderSize: Size,
    graphProps: GP,
  ): void {
    const { gl } = this

    // Create node's pre-sized output framebuffer and texture
    const { width, height } = renderSize
    const { framebuffer, texture } = createBuffer(gl)
    presizeTexture(gl, texture, width, height)
    node.value.output = {
      size: renderSize,
      framebuffer,
      texture,
    }

    // Generate sizes of inputs' rendered outputs
    const { propsFn, shader, inputsKeys } = node.value
    const props = propsFn(graphProps)

    const inputsSizes = shader.inputsSizes(props, renderSize)
    const childrenSizes = inputsKeys.map(ik => inputsSizes[ik])
    const inputs = zip(node.children, childrenSizes)

    // Recursively resolve input nodes
    for (const [inputNode, inputRenderSize] of inputs) {
      this.resolveNode(inputNode, inputRenderSize, graphProps)
    }
  }

  /**
   * Get execution tree from cache or construction
   *
   * It is constructed from the definition tree.
   *
   * This involves untangling the execution tree and filling
   * the resulting tree with some runtime caches:
   *
   * - Framebuffers and textures
   * - Render sizes
   */
  private getExecutionTree(): RoseTree<AnyExecutionNode<GP>> {
    const { definitionTree, executionTree: maybeExecutionTree } = this

    // Prefer cached execution tree
    if (maybeExecutionTree !== null) {
      return maybeExecutionTree
    }

    // Otherwise create it from the definition tree if necessary
    this.executionTree = definitionTree.untangle().map(node => ({
      ...node,
      output: null,
    }))

    return this.executionTree
  }

  /**
   * Render size of final output
   *
   * Uses the `width` and `height` fields of the
   * canvas DOM element. These represent the actual
   * pixels you can draw to
   *
   * They do not represent how the canvas is
   * displayed on the page due to CSS. That is
   * `clientWidth` and `clientHeight`.
   */
  private renderSize(): Size {
    const { gl } = this

    return {
      width: gl.canvas.width,
      height: gl.canvas.height,
    }
  }
}

interface PropsFn<GP, SP> {
  (graphProps: GP): SP
}

interface DefinitionNode<P, SP, I extends string = never> {
  shader: Shader<SP, I>
  propsFn: PropsFn<P, SP>
  inputsKeys: I[]
}
type AnyDefinitionNode<P> = DefinitionNode<P, any, any>

interface ExecutionNode<P, SP, I extends string = never>
  extends DefinitionNode<P, SP, I> {
  output: ExecutionOutput | null
}
type AnyExecutionNode<P> = ExecutionNode<P, any, any>

interface ExecutionOutput {
  size: Size
  framebuffer: WebGLFramebuffer
  texture: WebGLTexture
}

/**
 * Execution output as input
 *
 * @param param0 execution output with size and texture
 */
function outputAsInput({ size, texture }: ExecutionOutput): ShaderInput {
  return { ...size, texture }
}

type InputsKeys<K extends string> = Record<K, NodeKey>
type NodeKey = number
