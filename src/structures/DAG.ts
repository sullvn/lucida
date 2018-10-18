import * as wu from 'wu'
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
   * Traverse the graph in topological order
   */
  public *traverse(): IterableIterator<TraverseResult<T>> {
    const { nodes } = this

    // Find roots of graph
    // Roots are nodes with no dependencies.
    const roots = wu(nodes.values())
      .filter(node => node.in.size === 0)
      .map<[T, FrontierNode<T>]>(node => [
        node.id,
        { id: node.id, unexploredIn: 0 },
      ])

    const frontier = new Map(roots)

    // Explore all nodes in the frontier
    //
    // For each node:
    //
    // 1. Find a node with entirely explored input nodes
    // 2. Remove it from the frontier
    // 3. Add output nodes to frontier, if not already there
    // 4. Consider this node as an explored input for outputs
    //
    while (frontier.size > 0) {
      // 1. Find a node with entirely explored input nodes
      const maybeNext = wu(frontier.values()).find(f => f.unexploredIn === 0)
      const next = assertDefined(maybeNext)

      // 2. Remove it from the frontier
      frontier.delete(next.id)

      const node = assertDefined(nodes.get(next.id))

      for (const outId of node.out) {
        // 3. Add output nodes to frontier, if not already there
        if (!frontier.has(outId)) {
          const outNode = assertDefined(nodes.get(outId))
          frontier.set(outId, { id: outId, unexploredIn: outNode.in.size })
        }

        // 4. Consider this node as an explored input for outputs
        const frontierNode = assertDefined(frontier.get(outId))
        frontierNode.unexploredIn -= 1
      }

      yield {
        key: next.id,
        origin: node.in.size === 0,
        terminal: node.out.size === 0,
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

interface FrontierNode<T> {
  id: T
  unexploredIn: number
}
