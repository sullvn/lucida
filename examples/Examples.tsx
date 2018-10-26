import * as React from 'react'
import { JitterExample } from './pages/JitterExample'

interface ExamplesState {
  example: ExampleKey
}

enum ExampleKey {
  JITTER = 'jitter',
}

const ExamplesMap: Record<ExampleKey, typeof React.Component> = {
  jitter: JitterExample,
}

export class Examples extends React.Component<{}, ExamplesState> {
  state = {
    example: ExampleKey.JITTER,
  }

  private setExample = (example: ExampleKey) => () => {
    this.setState({ example })
  }

  public render() {
    const { example } = this.state
    const Example = ExamplesMap[example]

    return (
      <div id="examples">
        <header>
          <h1>Lucida Examples</h1>
          <a href="#jitter" onClick={this.setExample(ExampleKey.JITTER)}>
            Jitter
          </a>
        </header>
        <main>
          <Example />
        </main>
        <style>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          a:link, a:visited {
            color: inherit;
          }

          #examples {
            display: flex;
            height: 100vh;
            padding: 2rem;

            color: #02111b;
            background: #fcfcfc;
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
          }

          header {
            display: flex;
            flex-direction: column;
            flex-shrink: 0;

            margin-right: 2rem;
          }

          h1 {
            margin-top: 0;
          }

          main {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-grow: 1;
          }
        `}</style>
      </div>
    )
  }
}
