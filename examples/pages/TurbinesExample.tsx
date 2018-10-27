import * as React from 'react'
import {
  Canvas,
  ShaderGraph,
  Fit,
  Turbines,
  Image as ImageShader,
} from '../../src'
import { FileUpload } from '../components/FileUpload'

interface TurbinesExampleState {
  image: HTMLImageElement | null
}

interface GraphProps {
  length: number
  image: HTMLImageElement
}

export class TurbinesExample extends React.Component<{}, TurbinesExampleState> {
  state = {
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

  public render() {
    const { image } = this.state

    let canvas = null
    if (image) {
      canvas = (
        <Canvas
          props={{ image, length: 100 }}
          style={{
            width: '600px',
            height: '400px',
            border: '.1rem solid',
          }}
        >
          {gl => {
            const graph = new ShaderGraph<GraphProps>(gl)
            graph.add(Fit, () => ({}), {
              input: graph.add(Turbines, ({ length }) => ({ length }), {
                input: graph.add(
                  ImageShader,
                  ({ image }) => ({ source: image }),
                  {},
                ),
              }),
            })

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
