# Lucida

Lucida is a library for composing WebGL shaders together.

You can think of it as React for WebGL. You just have shaders instead of components and a shader graph instead of a component tree.

It offers the following goodies:

- React-like declarative programming
- Full power of a shader graph
- Maximum performance from minimal abstractions
- Dead simple integration for your existing shaders
- Designed for Typescript

## Mocked Up Example

```js
const sg = new ShaderGraph(gl)

const webcam = sg.shader(video)

sg.graph(composite,
  ({ width }) => ({ width, height: 1000, }),
  () => ({
    layers: [
      this.shader(color,
        () => ({ rgb: [0, 20, 31] }),
        () => ({ source: this.use(webcam) })
      })),
      this.shader(mask,
        () => ({})
        () => ({
          source: this.use(webcam),
          mask: this.shader(image,
            ({ maskImage }) => ({ source: maskImage }),
          )
        })
      )
    ],
  }),
)

sg.render({ width: 1200, maskImage: imageBlob })
```
