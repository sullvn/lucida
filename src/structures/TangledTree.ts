import { assertDefined } from '../util'
import { RoseTree } from './RoseTree'

/**
 * TangledTree
 *
 * Two equivalent definitions:
 *
 * - A rose tree where a node may have multiple parents
 * - A rooted, directed, acyclic graph
 *
 * It can be untangled to get a proper tree where nodes
 * can have at most one parent.
 */
export class TangledTree<T> {
  private lastKey: Key = -1
  private roots: Set<Key> = new Set()
  protected nodes: Map<Key, Node<T>> = new Map()

  /**
   * Add node as a new root to the tangled tree
   *
   * This node will cease to be a root when a future
   * addition claims it as its child.
   *
   * @param value value to store in the tree
   * @param childrenKeys keys of children
   */
  public add(value: T, childrenKeys: Key[] = []): Key {
    const { nodes, roots, lastKey } = this

    const key = (this.lastKey = lastKey + 1)
    const children = childrenKeys.map(k => assertDefined(nodes.get(k)))

    nodes.set(key, { value, children })

    roots.add(key)
    for (const ck of childrenKeys) {
      roots.delete(ck)
    }

    return key
  }

  /**
   * Root of tangled tree
   *
   * Will return an exception if there are multiple roots,
   * which will happen in the middle of construction.
   */
  public root(): Node<T> {
    const { roots, nodes } = this
    this.assertRoot()

    const rootKey = Array.from(roots.values())[0]
    const rootNode = nodes.get(rootKey)

    return assertDefined(rootNode)
  }

  /**
   * Untangle to a tree
   *
   * Effectively splits and copies shared children:
   *
   *        ●                 ●
   *       ↙ ↘               ↙ ↘
   *      ●   ●   becomes   ●   ●
   *       ↘ ↙              ↓   ↓
   *        ●               ●   ●
   */
  public untangle(): RoseTree<T> {
    // It's a one liner! This is due to RoseTree's constructor
    // recursively copying its argument.
    return new RoseTree(this.root())
  }

  /**
   * Assert a single root
   */
  public assertRoot(): void {
    const { roots } = this

    if (roots.size !== 1) {
      throw new TypeError('TangledTree requires one and only one root')
    }
  }
}

type Key = number

interface Node<T> {
  readonly value: T
  readonly children: Array<Node<T>>
}
