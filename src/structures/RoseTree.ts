/**
 * BasicRoseTree
 *
 * A tree where nodes may have any number of
 * children.
 *
 * This is the basic shape of a rose tree without
 * any methods.
 */
export interface BasicRoseTree<T> {
  readonly value: T
  readonly children: BasicRoseTree<T>[]
}

/**
 * RoseTree
 *
 * A multi-way tree, where any node may have any number
 * of children.
 */
export class RoseTree<T> implements BasicRoseTree<T> {
  public readonly value: T
  public readonly children: RoseTree<T>[]

  public constructor({ value, children }: BasicRoseTree<T>) {
    this.value = value
    this.children = children.map(c => new RoseTree(c))
  }

  /**
   * Map data within tree, retaining structure
   *
   * @param fn mapping function to use on data
   */
  public map<U>(fn: (x: T) => U): RoseTree<U> {
    const { value, children } = this

    return new RoseTree({
      value: fn(value),
      children: children.map(c => c.map(fn)),
    })
  }
}
