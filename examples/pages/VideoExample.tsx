import * as React from 'react'
import { Canvas, ShaderGraph, Image, Turbines } from '../../src'

interface VideoExampleState {
  videoStream: MediaStream
  videoElement: HTMLVideoElement | null
  isVideoPlaying: boolean
  time: number | null
}

interface GraphProps {
  video: HTMLVideoElement
  time: number
}

export class VideoExample extends React.Component<{}, VideoExampleState> {
  state: VideoExampleState = {
    videoStream: new MediaStream(),
    videoElement: null,
    isVideoPlaying: false,
    time: null,
  }

  public componentDidMount() {
    this.getVideoStream()
  }

  public componentWillUnmount() {
    const { videoStream } = this.state

    for (const track of videoStream.getTracks()) {
      track.stop()
    }
  }

  private async getVideoStream() {
    const videoStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    })

    this.setState({ videoStream })
  }

  private videoDidMount = (videoElement: HTMLVideoElement | null) => {
    const { videoStream } = this.state

    if (videoElement === null) {
      return
    }

    videoElement.srcObject = videoStream

    this.setState({ videoElement })
  }

  public renderVideo() {
    const { videoStream } = this.state

    if (!videoStream.active) {
      return <p>No video</p>
    }

    return (
      <div style={{ visibility: 'hidden', width: 0, height: 0 }}>
        <video
          autoPlay
          ref={this.videoDidMount}
          onPlay={() => {
            this.setState({ isVideoPlaying: true })
          }}
          onPause={() => {
            this.setState({ isVideoPlaying: false })
          }}
        />
      </div>
    )
  }

  public renderCanvas() {
    const { videoElement, isVideoPlaying, time } = this.state

    if (videoElement === null || !isVideoPlaying) {
      return <p>No canvas</p>
    }

    requestAnimationFrame(frameTime => this.setState({ time: frameTime }))
    if (time === null) {
      return <p>No canvas</p>
    }

    const aspectRatio = videoElement.scrollWidth / videoElement.scrollHeight

    return (
      <Canvas
        props={{ video: videoElement, time }}
        style={{
          width: '1000px',
          height: `${1000 / aspectRatio}px`,
        }}
      >
        {gl => {
          const graph = new ShaderGraph<GraphProps>(gl)
          graph.add(Turbines, () => ({ length: 40 }), {
            input: graph.add(
              Image,
              ({ video, time }) => ({ source: video, time }),
              {},
            ),
          })
          return graph
        }}
      </Canvas>
    )
  }

  public render() {
    return (
      <div>
        {this.renderVideo()}
        {this.renderCanvas()}
      </div>
    )
  }
}
