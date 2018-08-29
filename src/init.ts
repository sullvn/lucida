import { fragment, vertex } from './shaders'
import { createProgram, createShader, resizeCanvas } from './util'

/**
 * Initialize WebGL canvas
 *
 * Resizes canvas, compiles shaders, sets up buffers, and
 * kicks off rendering.
 *
 * @param el HTML canvas DOM element
 */
function init(el: HTMLCanvasElement) {
  const gl = el.getContext('webgl2')
  if (gl === null) {
    throw new Error('Cannot get WebGL 2 context')
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment)
  const program = createProgram(gl, vertexShader, fragmentShader)

  const colorUniformLocation = gl.getUniformLocation(program, 'u_color')
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  const positions = [0, 0, 0, 0.5, 0.7, 0]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const va = gl.createVertexArray()
  gl.bindVertexArray(va)
  gl.enableVertexAttribArray(positionAttributeLocation)

  const size = 2
  const type = gl.FLOAT
  const normalize = false
  const stride = 0
  const pointerOffset = 0
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    pointerOffset,
  )

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.useProgram(program)

  gl.uniform4f(colorUniformLocation, 1, 0, 0.5, 1)
  gl.bindVertexArray(va)

  const primitiveType = gl.TRIANGLES
  const drawOffset = 0
  const count = 3
  gl.drawArrays(primitiveType, drawOffset, count)
}

export function onCanvasLoad(el: HTMLCanvasElement | null) {
  if (el === null) {
    throw new Error('Cannot find canvas element')
  }

  resizeCanvas(el)
  init(el)
}
