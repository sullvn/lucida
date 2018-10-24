import * as React from 'react'
import {
  Canvas,
  FileUpload,
  ShaderGraph,
  Image as ImageShader,
  Fit,
  Jitter,
} from '../src'

interface WebGLSandboxState {
  primary: HTMLImageElement | null
  secondary: HTMLImageElement | null
}

interface GraphProps {
  primary: HTMLImageElement
  secondary: HTMLImageElement
}

export default class WebGLSandbox extends React.Component<
  {},
  WebGLSandboxState
> {
  state = {
    primary: null,
    secondary: null,
  }

  private onImageLoad = (type: 'primary' | 'secondary') => (file: File) => {
    // Convert to data URI
    // NOTE: This seems awfully slow... look for alternatives
    const dataUri = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      // Free memory
      URL.revokeObjectURL(dataUri)
      this.setState({
        [type]: image,
      } as Pick<WebGLSandboxState, 'primary' | 'secondary'>)
    }

    image.src = dataUri
  }

  private createGraph(gl: WebGL2RenderingContext): ShaderGraph<GraphProps> {
    const graph = new ShaderGraph<GraphProps>(gl)
    graph.add(Fit, () => ({}), {
      input: graph.add(Jitter, () => ({}), {
        subject: graph.add(
          ImageShader,
          ({ primary }) => ({ source: primary }),
          {},
        ),
      }),
    })

    return graph
  }

  public render() {
    const { primary, secondary } = this.state

    let canvas = null
    if (primary !== null && secondary !== null) {
      canvas = (
        <Canvas
          props={{ primary, secondary }}
          graph={this.createGraph}
          style={{
            width: '600px',
            height: '400px',
            border: '0.5px solid white',
          }}
        />
      )
    }

    return (
      <main>
        {canvas}
        <style>
          {`
          * {
            box-sizing: border-box;
          }

          html {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;

            color: white;
            background: black;
          }
        `}
        </style>
        <label>
          Primary
          <FileUpload onUpload={this.onImageLoad('primary')} />
        </label>
        <label>
          Secondary
          <FileUpload onUpload={this.onImageLoad('secondary')} />
        </label>
      </main>
    )
  }
}
