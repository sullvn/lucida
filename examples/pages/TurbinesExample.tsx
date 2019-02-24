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
  bladeLength: number
}

interface GraphProps {
  length: number
  image: HTMLImageElement
}

export class TurbinesExample extends React.Component<{}, TurbinesExampleState> {
  state = {
    image: null,
    bladeLength: 20,
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
    const { image, bladeLength } = this.state

    let canvas = null
    if (image) {
      canvas = (
        <Canvas
          props={{ image, length: bladeLength }}
          style={{
            width: '1000px',
            height: '600px',
            border: '.1rem solid',
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
                subject: graph.add(Turbines, ({ length }) => ({ length }), {
                  input: graph.add(
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
        <input
          type="range"
          min={1}
          max={200}
          value={bladeLength}
          onChange={ev =>
            this.setState({ bladeLength: parseInt(ev.target.value) })
          }
        />
      </div>
    )
  }
}
