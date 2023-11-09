# html-stream

HTML generation with tagged template literals. Supports streaming and React style suspense.

## Usage

```js
import { render, html } from "html-stream"; // ESM
const { render, html } = require("html-stream"); // CJS

const writable = process.stdout; // Could be anything with a 'write' method such as a HTTP Response or Writable Stream.

render(process.stdout, html`<h1>Hello World it's ${new Date()}</h1>`);
```
