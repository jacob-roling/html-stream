# html-stream

HTML generation with tagged template literals. Supports streaming and React style suspense.

## Usage

```js
import { render, html } from "html-stream";

const writable = process.stdout; // Could be anything with a 'write' method such as a HTTP Response or Writable Stream.

render(process.stdout, html`<h1>Hello World it's ${new Date()}</h1>`);
```

Async templates are awaited blocking the renderer.

```js
import { render, html } from "html-stream";

render(process.stdout, html`<h1>${Promise.resolve(html`Hi there`)}</h1>`);
```

Async templates may be deferred and a fallback rendered in their place. The renderer will send down a script to swap the async template result into the fallbacks location in the dom.

```js
import { render, html, suspense } from "html-stream";
render(
  process.stdout,
  html`<p>I will be rendered straight away</p>
    ${suspense(
      html`I will be replaced in two seconds.`,
      new Promise((res) => {
        setTimeout(res(html`I am lazy loaded content.`), 2000);
      })
    )}
    <p>I will also be rendered straight away</p>`
);
```

Arrays are expected to be arrays of Templates.

```js
import { render, html } from "html-stream";

const fruit = ["apple", "banana", "pear"];

render(
  process.stdout,
  html`<ul>
    ${fruit.map((fruit) => html`<li>${fruit}</li>`)}
  </ul>`
);
```
