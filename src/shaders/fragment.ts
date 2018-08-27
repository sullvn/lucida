export default `#version 300 es

precision mediump float;

uniform vec4 u_color;
out vec4 outColor;

// Fragment
void main() {
  outColor = u_color;
}
`
