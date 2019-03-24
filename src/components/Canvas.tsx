import * as React from 'react'
import { ShaderGraph } from '../ShaderGraph'
import { assertValid, resizeCanvas } from '../util'

interface CanvasProps<P> extends CanvasDOMProps {
  children: (gl: WebGL2RenderingContext) => ShaderGraph<P>
  props: P
}

export class Canvas<P> extends React.Component<CanvasProps<P>> {
  private graph: ShaderGraph<P> | null = null

  private onLoad = (el: HTMLCanvasElement | null) => {
    const { children: createGraph } = this.props

    if (el === null) {
      return
    }

    resizeCanvas(el)

    const gl = assertValid(
      el.getContext('webgl2'),
      'Cannot get WebGL 2 context',
    )

    this.graph = createGraph(gl)
    this.renderGraph()
  }

  public componentDidUpdate({ props: oldProps }: CanvasProps<P>): void {
    const { props: newProps } = this.props

    if (newProps !== oldProps) {
      this.renderGraph()
    }
  }

  private renderGraph(): void {
    const { graph: maybeGraph } = this
    const { props } = this.props

    const graph = assertValid(maybeGraph, 'Cannot render null shader graph')

    graph.render(props)
  }

  public render(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children: _children, props: _props, ...domProps } = this.props

    return <canvas {...domProps} ref={this.onLoad} />
  }
}

type CanvasDOMProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
>
