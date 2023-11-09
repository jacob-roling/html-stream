import { escape } from "html-escaper";
// import umap from "umap";

export type Template = Iterable<string | Promise<Template>>;

const { isArray } = Array;

const deferredTemplates: Promise<Template>[] = [];

// function update(value, i) {
//   return this[i](value);
// }

// const cache = umap(new WeakMap());

// const {length} = values;
// const updates = cache.get(parts) || parse;

// if (length) {
//   yield* values.map(update, updates);
// }

export function* html(parts: TemplateStringsArray, ...values: any[]): Template {
  let i = 0;

  while (i < parts.length - 1) {
    const part = parts[i] as string;
    yield part;

    const value = values[i];
    const valueType = typeof value;

    if (value === null || value === undefined || value === false) {
      i++;
      continue;
    } else if (value instanceof Suspense) {
      const id = deferredTemplates.length;
      yield* html`<!--$?--><template id="F:${id}"></template
        >${value.fallback}<!--/$-->`;
      deferredTemplates.push(
        new Promise(async (res) =>
          res(html`<div hidden id="S:${id}">${await value.asyncTemplate}</div>
            <script>
              $swapFallback("F:${id}", "S:${id}");
              document.currentScript.remove();
            </script>`)
        )
      );
    } else if (value instanceof SafeHTML) {
      yield value.html;
    } else if (typeof value.then === "function") {
      yield value;
    } else if (valueType === "function") {
      yield* value();
    } else if (isArray(value)) {
      for (const template of value as Template[]) {
        yield* template;
      }
    } else if (valueType === "object") {
      yield* value;
    } else {
      yield escape(value);
    }

    i++;
  }

  yield parts[i] as string;
}

export interface Writable {
  write(part: string): void;
}

export async function render(writer: Writable, template: Template) {
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
    </script>`);
  }

  while (deferredTemplates.length > 0) {
    const currentDeferred = deferredTemplates.splice(
      0,
      deferredTemplates.length
    );

    await Promise.allSettled(
      currentDeferred.map(async (asyncTemplate) =>
        asyncTemplate.then(async (template) => {
          for (const part of template) {
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
      `<script>document.getElementById("swap-script").remove();document.currentScript.remove();</script>`
    );
  }

  writer.write("\n");
}

class Suspense {
  constructor(fallback: Template, asyncTemplate: Promise<Template>) {
    this.fallback = fallback;
    this.asyncTemplate = asyncTemplate;
  }

  declare fallback: Template;
  declare asyncTemplate: Promise<Template>;
}

export function suspense(fallback: Template, asyncTemplate: Promise<Template>) {
  return new Suspense(fallback, asyncTemplate);
}

class SafeHTML {
  constructor(html: string) {
    this.html = html;
  }

  declare html: string;
}

export function safe(html: string) {
  return new SafeHTML(html);
}
