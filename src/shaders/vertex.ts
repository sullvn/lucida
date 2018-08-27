export default `#version 300 es

in vec4 a_position;

// Vertex
void main() {
  gl_Position = a_position;
}
`
