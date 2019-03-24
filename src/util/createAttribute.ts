/**
 * Create shader attribute
 *
 * @param gl WebGL2 rendering context
 * @param program shader program
 * @param vertexArray vertex array object
 * @param name name of attribute (variable name in shader source)
 * @param data typed attribute data
 * @param usage usage hint, such as `STATIC_DRAW`
 */
export function createAttribute(
  name: string,
  data: AttributeData,
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  vertexArray: WebGLVertexArrayObject,
  usage: AttributeUsage,
  layout: AttributeLayout,
): void {
  // Load attribute data into buffer
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, usage)

  // Enable the attribute with bound buffer
  const location = gl.getAttribLocation(program, name)
  gl.bindVertexArray(vertexArray)
  gl.enableVertexAttribArray(location)

  // Configure attribute data layout
  const { size, type, normalize = false, stride = 0, offset = 0 } = layout
  gl.vertexAttribPointer(location, size, type, normalize, stride, offset)
}

type AttributeData =
  | number
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Uint8ClampedArray
  | Float32Array
  | Float64Array
  | DataView
  | ArrayBuffer

type AttributeUsage = number

interface AttributeLayout {
  /**
   * Components per vertex
   */
  size: 1 | 2 | 3 | 4

  /**
   * Data type, such as:
   *
   * - `gl.BYTE`
   * - `gl.SHORT`
   * - `gl.UNSIGNED_BYTE`
   * - `gl.UNSIGNED_BYTE`
   * - `gl.UNSIGNED_SHORT`
   * - `gl.FLOAT`
   * - `gl.HALF_FLOAT`
   */
  type: number

  /**
   * Normalize non-floats into `[-1, 1]` or `[0, 1]` for
   * unsigned types.
   */
  normalize?: boolean

  /**
   * Width in bytes between each vertex
   */
  stride?: number

  /**
   * Bytes before the first vertex
   */
  offset?: number
}
