import { fragment, vertex } from './shaders'
import { createProgram, createShader, resizeCanvas } from './util'
import { createAttribute } from './util/createAttribute'

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

  gl.useProgram(program)

  const va = gl.createVertexArray()
  if (va === null) {
    throw new Error('Cannot create vertex array')
  }

  const positions = new Float32Array([0, 0, 0, 0.5, 0.7, 0])
  createAttribute('a_position', positions, gl, program, va, gl.STATIC_DRAW, {
    size: 2,
    type: gl.FLOAT,
  })

  const colorUniformLocation = gl.getUniformLocation(program, 'u_color')
  gl.uniform4f(colorUniformLocation, 1, 0, 0.5, 1)

  gl.bindVertexArray(va)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

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
