import * as React from 'react'
import { Canvas, ShaderGraph, Image, Jitter } from '../../../src'
import { FileUpload } from '../components/FileUpload'

interface VideoFileExampleState {
  videoFileURL: string | null
  videoElement: HTMLVideoElement | null
  isVideoPlaying: boolean
  time: number | null
}

interface GraphProps {
  video: HTMLVideoElement
  time: number
}

export class VideoFileExample extends React.Component<
  {},
  VideoFileExampleState
> {
  public state: VideoFileExampleState = {
    videoFileURL: null,
    videoElement: null,
    isVideoPlaying: false,
    time: null,
  }

  public componentWillUnmount(): void {
    this.freeVideoFile()
  }

  private freeVideoFile(): void {
    const { videoFileURL } = this.state

    if (videoFileURL !== null) {
      URL.revokeObjectURL(videoFileURL)
    }
  }

  private onVideoFile = (videoFile: File) => {
    this.freeVideoFile()

    this.setState({
      videoFileURL: URL.createObjectURL(videoFile),
    })
  }

  private videoDidMount = (videoElement: HTMLVideoElement | null) => {
    this.setState({ videoElement })
  }

  public renderVideo(): JSX.Element {
    const { videoFileURL } = this.state

    if (videoFileURL === null) {
      return <p>No video</p>
    }

    return (
      <div style={{ visibility: 'hidden', width: 0, height: 0 }}>
        <video
          autoPlay
          loop
          src={videoFileURL}
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

  public renderCanvas(): JSX.Element {
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
          graph.add(Jitter, () => ({}), {
            subject: graph.add(
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

  public render(): JSX.Element {
    return (
      <div>
        {this.renderVideo()}
        {this.renderCanvas()}
        <FileUpload onUpload={this.onVideoFile} />
      </div>
    )
  }
}
