import * as React from 'react'
import {
  Canvas,
  ShaderGraph,
  Fit,
  Turbines,
  Image as ImageShader,
  HSV,
} from '../../src'
import { FileUpload } from '../components/FileUpload'

interface TurbinesExampleState {
  image: HTMLImageElement | null
  bladeLength: number
  rotateHue: number
}

interface GraphProps {
  length: number
  image: HTMLImageElement
  rotateHue: number
}

export class TurbinesExample extends React.Component<{}, TurbinesExampleState> {
  public state = {
    image: null,
    bladeLength: 20,
    rotateHue: 0,
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
    const { image, bladeLength, rotateHue } = this.state

    let canvas = null
    if (image) {
      canvas = (
        <Canvas
          props={{ image, length: bladeLength, rotateHue }}
          style={{
            width: '1200px',
            height: '1800px',
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
                  input: graph.add(HSV, ({ rotateHue }) => ({ rotateHue }), {
                    input: graph.add(
                      ImageShader,
                      ({ image }) => ({ source: image }),
                      {},
                    ),
                  }),
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
        <input
          type="range"
          min={0}
          max={360}
          value={rotateHue}
          onChange={ev =>
            this.setState({ rotateHue: parseFloat(ev.target.value) })
          }
        />
      </div>
    )
  }
}
