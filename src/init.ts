import { fragment, vertex } from './shaders'

function init(el: HTMLCanvasElement) {
  const gl = el.getContext('webgl2')
  if (gl === null) {
    throw new Error('Cannot get WebGL 2 context')
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment)
  const program = createProgram(gl, vertexShader, fragmentShader)

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
  gl.bindVertexArray(va)

  const primitiveType = gl.TRIANGLES
  const drawOffset = 0
  const count = 3
  gl.drawArrays(primitiveType, drawOffset, count)
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram()
  if (program === null) {
    throw new Error('Cannot create shader program')
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }

  const errorLog = gl.getProgramInfoLog(program) || 'Cannot link shader program'
  gl.deleteProgram(program)
  throw new Error(errorLog)
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)
  if (shader === null) {
    throw new Error('Cannot create shader')
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  const errorLog = gl.getShaderInfoLog(shader) || 'Cannot compile shader'
  gl.deleteShader(shader)
  throw new Error(errorLog)
}

export function onCanvasLoad(el: HTMLCanvasElement | null) {
  if (el === null) {
    throw new Error('Cannot find canvas element')
  }

  if (INITIALIZED) {
    return
  }
  INITIALIZED = true

  resizeCanvas(el)
  init(el)
}

let INITIALIZED = false

function resizeCanvas(el: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1

  // Lookup size browser is displaying the canvas and
  // increase the natural size for Hi-DPI screens
  const width = Math.floor(el.clientWidth * dpr)
  const height = Math.floor(el.clientHeight * dpr)
  if (el.width === width && el.height === height) {
    return
  }

  el.width = width
  el.height = height
}
