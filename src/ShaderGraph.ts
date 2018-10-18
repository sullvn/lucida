import {
  Shader,
  ShaderConstructor,
  ShaderInputs,
  Size,
  ShaderInput,
} from './Shader'
import { createBuffer, ShaderBuffer, assertDefined } from './util'
import { DAG } from './structures'

export class ShaderGraph<P = {}> {
  private nextKey: NodeKey = 0
  private nodes: Map<NodeKey, ShaderNode<P, any, any>> = new Map()
  private graph: DAG<NodeKey> = new DAG()

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
    propsFn: PropsFn<P, SP>,
    dependencies: ShaderDependencies<I>,
  ): NodeKey {
    const { gl, nextKey, nodes, graph } = this

    // Cheaply create unique keys
    const key = nextKey
    this.nextKey += 1

    // Store shader with props function and shader dependencies
    nodes.set(key, {
      shader: new constructShader(gl),
      buffer: createBuffer(gl),
      size: { width: 0, height: 0 },
      propsFn,
      dependencies,
    })

    // Place shader in graph, leading from dependencies
    const depsKeys: number[] = Object.values(dependencies)
    for (const dk of depsKeys) {
      graph.addEdge(dk, key)
    }

    return key
  }

  public render(graphProps: P): void {
    const { gl, graph, nodes } = this

    const asInput = (nk: NodeKey) => {
      const n = assertDefined(nodes.get(nk))
      return {
        ...n.size,
        texture: n.buffer.texture,
      } as ShaderInput
    }

    for (const { key, terminal } of graph.traverse()) {
      const node = assertDefined(nodes.get(key))
      const { shader, propsFn, dependencies, buffer, size: oldSize } = node

      const props = propsFn(graphProps)
      const inputs = Object.entries(dependencies).reduce(
        (is, [ik, nk]) => {
          is[ik] = asInput(nk)
          return is
        },
        {} as ShaderInputs<any>,
      )

      const newSize = (node.size = shader.size(props, inputs))
      if (newSize.width !== oldSize.width || newSize.height !== oldSize.width) {
        gl.bindTexture(gl.TEXTURE_2D, buffer.texture)
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          newSize.width,
          newSize.height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        )
      }

      const fb = terminal ? null : buffer.framebuffer
      shader.render(props, inputs, fb)
    }
  }
}

type NodeKey = number

interface PropsFn<P, SP> {
  (graphProps: P): SP
}

interface ShaderNode<P, SP, I extends string = never> {
  shader: Shader<SP, I>
  buffer: ShaderBuffer
  size: Size
  propsFn: PropsFn<P, SP>
  dependencies: ShaderDependencies<I>
}

type ShaderDependencies<K extends string> = Record<K, NodeKey>
