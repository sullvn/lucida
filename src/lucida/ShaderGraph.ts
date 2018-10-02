import { Shader, ShaderInputs, ShaderOutput } from './Shader'
import { ShaderNode } from './ShaderNode'

export class ShaderGraph<P = {}> {
  public constructor(private readonly gl: WebGL2RenderingContext) {}

  public add<S, D>(
    shader: Shader<S, DepsOutputs<D>>,
    props: PropsFn<P, S>,
    deps: DepsFn<D>,
  ): ShaderNode {
    return {}
  }

  public render(props: P): void {}
}

interface PropsFn<P, S> {
  (graphProps: P): S
}

interface DepsFn<D> {
  (): D
}

type DepsOutputs<D> = {
  [K in keyof D]: D[K] extends any[] ? ShaderOutput[] : ShaderOutput
}
