import { escape } from 'html-escaper';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const { isArray } = Array;
const deferredTemplates = [];
function* html(parts, ...values) {
  let i = 0;
  while (i < parts.length - 1) {
    const part = parts[i];
    yield part;
    const value = values[i];
    const valueType = typeof value;
    if (value === null || value === void 0 || value === false) {
      i++;
      continue;
    } else if (value instanceof Suspense) {
      const id = deferredTemplates.length;
      yield* html`<!--$?--><template id="F:${id}"></template
        >${value.fallback}<!--/$-->`;
      deferredTemplates.push(
        new Promise(
          async (res) => res(html(_a || (_a = __template(['<div hidden id="S:', '">', '</div>\n            <script>\n              $swapFallback("F:', '", "S:', '");\n              document.currentScript.remove();\n            <\/script>'])), id, await value.asyncTemplate, id, id))
        )
      );
    } else if (typeof value.then === "function") {
      yield value;
    } else if (valueType === "function") {
      yield* value();
    } else if (isArray(value)) {
      for (const template of value) {
        yield* template;
      }
    } else if (valueType === "object") {
      yield* value;
    } else {
      yield escape(value);
    }
    i++;
  }
  yield parts[i];
}
async function render(writer, template) {
  for (const part of template) {
    if (typeof part === "string") {
      writer.write(part);
    } else {
      await render(writer, await part);
    }
  }
  const hasDeferred = deferredTemplates.length > 0;
  if (hasDeferred) {
    writer.write(`<script id="swap-script">
      function $swapFallback(a, b) {
        a = document.getElementById(a);
        b = document.getElementById(b);
        b.parentNode.removeChild(b);
        if (a) {
          a = a.previousSibling;
          let f = a.parentNode,
            c = a.nextSibling,
            e = 0;
          do {
            if (c && 8 === c.nodeType) {
              let d = c.data;
              if ("/$" === d)
                if (0 === e) break;
                else e--;
              else ("$" !== d && "$?" !== d && "$!" !== d) || e++;
            }
            d = c.nextSibling;
            f.removeChild(c);
            c = d;
          } while (c);
          for (; b.firstChild; ) f.insertBefore(b.firstChild, c);
          a.data = "$";
          c.parentNode.removeChild(c);
          a.parentNode.removeChild(a);
        }
      }
    <\/script>`);
  }
  while (deferredTemplates.length > 0) {
    const currentDeferred = deferredTemplates.splice(
      0,
      deferredTemplates.length
    );
    await Promise.allSettled(
      currentDeferred.map(
        async (asyncTemplate) => asyncTemplate.then(async (template2) => {
          for (const part of template2) {
            if (typeof part === "string") {
              writer.write(part);
            } else {
              await render(writer, await part);
            }
          }
        })
      )
    );
  }
  if (hasDeferred) {
    writer.write(
      `<script>document.getElementById("swap-script").remove();document.currentScript.remove();<\/script>`
    );
  }
  writer.write("\n");
}
class Suspense {
  constructor(fallback, asyncTemplate) {
    this.fallback = fallback;
    this.asyncTemplate = asyncTemplate;
  }
}
function suspense(fallback, asyncTemplate) {
  return new Suspense(fallback, asyncTemplate);
}

export { html, render, suspense };
