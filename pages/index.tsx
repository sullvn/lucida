import * as React from 'react'
import { onCanvasLoad } from '../src/init'

export default function WebGLSandbox() {
  return (
    <main>
      <canvas
        ref={onCanvasLoad}
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
    </main>
  )
}
