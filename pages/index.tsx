import * as React from 'react'
import { FileUpload, Renderer } from '../src'

interface WebGLSandboxState {
  renderer: Renderer
}

export default class WebGLSandbox extends React.Component<
  {},
  WebGLSandboxState
> {
  state = {
    renderer: new Renderer(),
  }

  public onCanvasLoad = (el: HTMLCanvasElement | null) => {
    if (el === null) {
      return
    }

    this.state.renderer.initialize(el)
  }

  public onImageLoad = (file: File) => {
    // Convert to data URI
    // NOTE: This seems awfully slow... look for alternatives
    const dataUri = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      // Free memory
      URL.revokeObjectURL(dataUri)
      this.state.renderer.loadImage(image)
    }

    image.src = dataUri
  }

  public render() {
    return (
      <main>
        <canvas
          ref={this.onCanvasLoad}
          style={{
            width: '600px',
            height: '400px',
            border: '0.5px solid white',
          }}
        />
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

            background: black;
          }
        `}
        </style>
        <FileUpload onUpload={this.onImageLoad} />
      </main>
    )
  }
}
