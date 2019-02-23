export interface Shader<P = {}, I extends string = never> {
  inputsSizes: (props: P, size: Size) => InputsSizes<I>
  render: (
    props: P,
    // TODO: Fix framebuffers being considered valid inputs
    inputs: ShaderInputs<I>,
    fb: WebGLFramebuffer | null,
    size: Size,
  ) => void
}

// TODO: Rename to 'Resolution'?
export interface Size {
  width: number
  height: number
}

/**
 * Equal sizes by width and height
 *
 * @param x First size
 * @param y Second size
 */
export function equalSizes(x: Size, y: Size): boolean {
  return x.width === y.width && x.height === y.height
}

export interface ShaderInput extends Size {
  texture: WebGLTexture
}

export type InputsSizes<K extends string> = Record<K, Size>
export type ShaderInputs<K extends string> = Record<K, ShaderInput>

export interface ShaderConstructor<P = {}, I extends string = never> {
  new (gl: WebGL2RenderingContext): Shader<P, I>
}
