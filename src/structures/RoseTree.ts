/**
 * RoseTree
 *
 * A multi-way tree, where any node may have any number
 * of children.
 */
export class RoseTree<T> implements IRoseTree<T> {
  public readonly value: T
  public readonly children: Array<RoseTree<T>>

  public constructor({ value, children }: IRoseTree<T>) {
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

export interface IRoseTree<T> {
  readonly value: T
  readonly children: Array<IRoseTree<T>>
}
