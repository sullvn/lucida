import { Shader, ShaderInput, ShaderOutput } from './Shader'

export abstract class TextureShader<P = {}> extends Shader<P> {
  public abstract render(
    input: TextureShaderInput,
    output: ShaderOutput,
    props?: P,
  ): void
}

export interface TextureShaderInput extends ShaderInput {
  textureUnit: number
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
}
