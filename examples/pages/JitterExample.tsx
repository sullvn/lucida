import * as React from 'react'
import {
  Canvas,
  ShaderGraph,
  Fit,
  Jitter,
  Image as ImageShader,
} from '../../src'
import { FileUpload } from '../components/FileUpload'

interface JitterExampleState {
  image: HTMLImageElement | null
}

interface GraphProps {
  image: HTMLImageElement
}

export class JitterExample extends React.Component<{}, JitterExampleState> {
  public state = {
    image: null,
  }

  private onImageLoad = (file: File) => {
    // Convert to data URI
    // NOTE: This seems awfully slow... look for alternatives
    const dataUri = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      // Free memory
      URL.revokeObjectURL(dataUri)
      this.setState({ image })
    }

    image.src = dataUri
  }

  public render(): JSX.Element {
    const { image } = this.state

    let canvas = null
    if (image) {
      canvas = (
        <Canvas
          props={{ image }}
          style={{
            width: '1200px',
            height: '700px',
          }}
        >
          {gl => {
            const graph = new ShaderGraph<GraphProps>(gl)
            graph.add(
              Fit,
              ({ image }) => ({
                subjectSize: image,
              }),
              {
                subject: graph.add(Jitter, () => ({}), {
                  subject: graph.add(
                    ImageShader,
                    ({ image }) => ({ source: image }),
                    {},
                  ),
                }),
              },
            )

            return graph
          }}
        </Canvas>
      )
    }

    return (
      <div>
        {canvas}
        <label>
          Image
          <FileUpload onUpload={this.onImageLoad} />
        </label>
      </div>
    )
  }
}
