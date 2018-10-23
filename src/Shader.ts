export interface Shader<P = {}, I extends string = never> {
  size: (props: P, inputs: ShaderInputs<I>) => Size
  render: (
    props: P,
    // TODO: Fix framebuffers being considered valid inputs
    inputs: ShaderInputs<I>,
    fb: WebGLFramebuffer | null,
  ) => void
}

// TODO: Rename to 'Resolution'?
export interface Size {
  width: number
  height: number
}

export interface ShaderInput {
  texture: WebGLTexture
  width: number
  height: number
}

export interface ShaderConstructor<P = {}, I extends string = never> {
  new (gl: WebGL2RenderingContext): Shader<P, I>
}

export type ShaderInputs<K extends string> = Record<K, ShaderInput>
