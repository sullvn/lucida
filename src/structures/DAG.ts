import wu from 'wu'
import { assertDefined } from '../util'

/**
 * Directed Acyclic Graph
 *
 * A two-way representation of a
 * directed acyclic graph.
 */
export class DAG<T> {
  protected nodes: Map<T, Node<T>> = new Map()

  public constructor(edges: [T, T][] = []) {
    for (const [src, dst] of edges) {
      this.addEdge(src, dst)
    }
  }

  public addEdge(src: T, dst: T): DAG<T> {
    const { nodes } = this

    this.addNode(src).addNode(dst)
    if (src === dst) {
      return this
    }

    const srcNode = assertDefined(nodes.get(src))
    const dstNode = assertDefined(nodes.get(dst))

    srcNode.out.add(dst)
    dstNode.in.add(src)

    return this
  }

  /**
   * Traverse the directed graph in topological order
   *
   * Options:
   *
   * - Reverse
   *
   * A quick sketch:
   *
   *      o -> o -> o -> o -> o
   *            \_______7
   *
   *    forward ->    <- reverse
   */
  public *traverse(
    options: TraverseOptions = {},
  ): IterableIterator<TraverseResult<T>> {
    const { nodes } = this
    const { reverse = false } = options

    const forwardNodes = reverse
      ? (node: Node<T>) => node.in
      : (node: Node<T>) => node.out
    const backwardNodes = reverse
      ? (node: Node<T>) => node.out
      : (node: Node<T>) => node.in

    // Find roots of graph
    // Roots are nodes with no dependencies.
    const roots = wu(nodes.values())
      .filter(node => backwardNodes(node).size === 0)
      .map<[T, FrontierNode<T>]>(node => [
        node.id,
        { id: node.id, unexploredBack: 0 },
      ])

    const frontier = new Map(roots)

    // Explore all nodes in the frontier
    //
    // For each node:
    //
    // 1. Find a node with entirely explored neighbor nodes from
    //    the backwards perspective. Input nodes while going
    //    forwards; output nodes while going backwards.
    // 2. Remove it from the frontier
    // 3. Add forward nodes to frontier, if not already there.
    //    They are output nodes while going forwards; input
    //    nodes while going backwards.
    // 4. Consider this node as explored
    //
    while (frontier.size > 0) {
      // 1. Find a node with entirely explored backwards nodes
      const maybeNext = wu(frontier.values()).find(f => f.unexploredBack === 0)
      const next = assertDefined(maybeNext)

      // 2. Remove it from the frontier
      frontier.delete(next.id)

      const node = assertDefined(nodes.get(next.id))

      for (const fwdId of forwardNodes(node)) {
        // 3. Add forward nodes to frontier, if not already there
        if (!frontier.has(fwdId)) {
          const fwdNode = assertDefined(nodes.get(fwdId))
          frontier.set(fwdId, {
            id: fwdId,
            unexploredBack: backwardNodes(fwdNode).size,
          })
        }

        // 4. Consider this node as an explored input for outputs
        const frontierNode = assertDefined(frontier.get(fwdId))
        frontierNode.unexploredBack -= 1
      }

      yield {
        key: next.id,
        origin: backwardNodes(node).size === 0,
        terminal: forwardNodes(node).size === 0,
      }
    }
  }

  private addNode(id: T): DAG<T> {
    const { nodes } = this
    if (nodes.has(id)) {
      return this
    }

    nodes.set(id, {
      id,
      in: new Set(),
      out: new Set(),
    })

    return this
  }
}

export interface Node<T> {
  id: T
  in: Set<T>
  out: Set<T>
}

export interface TraverseResult<T> {
  key: T
  origin: boolean
  terminal: boolean
}

export interface TraverseOptions {
  reverse?: boolean
}

interface FrontierNode<T> {
  id: T
  unexploredBack: number
}
