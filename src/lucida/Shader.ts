export interface Shader<P = {}, I extends string = never> {
  render: (
    props: P,
    // TODO: Fix framebuffers being considered valid inputs
    inputs: ShaderInputs<I>,
    fb: WebGLFramebuffer | null,
  ) => ShaderOutput
}

export interface ShaderOutput {
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
