import * as wu from 'wu'
import { assertDefined } from '../util'

/**
 * Directed Acyclic Graph
 *
 * A two-way representation of a
 * directed acyclic graph.
 */
export class DAG {
  protected nodes: Map<ID, Node> = new Map()

  public constructor(edges: [ID, ID][] = []) {
    for (const [src, dst] of edges) {
      this.addEdge(src, dst)
    }
  }

  public addEdge(srcId: ID, dstId: ID): DAG {
    const { nodes } = this

    this.addNode(srcId).addNode(dstId)
    if (srcId === dstId) {
      return this
    }

    const src = assertDefined(nodes.get(srcId))
    const dst = assertDefined(nodes.get(dstId))

    src.out.add(dstId)
    dst.in.add(srcId)

    return this
  }

  /**
   * Traverse the graph in topological order
   */
  public *traverse(): IterableIterator<ID> {
    const { nodes } = this

    // Find roots of graph
    // Roots are nodes with no dependencies.
    const roots = wu(nodes.values())
      .filter(node => node.in.size === 0)
      .map<[ID, FrontierNode]>(node => [
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

      yield next.id
    }
  }

  private addNode(id: ID): DAG {
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

export type ID = string

export interface Node {
  id: ID
  in: Set<ID>
  out: Set<ID>
}

interface FrontierNode {
  id: ID
  unexploredIn: number
}
