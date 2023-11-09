import { html, suspense } from "../src/index.js";
import wait from "./utils/wait.js";

const loadingSection = () => html`<article aria-busy="true"></article>`;

const productSuggestions = () => html`<article>
  <h3>Product Suggestions</h3>
  <p>Here's what you should buy next.</p>
</article>`;

const productDetails = () => html`<article>
  <header>
    <h1>Product Title</h1>
    <h2>$50.0 AUD</h2>
  </header>
  <p>Here's some details about the product.</p>
</article>`;

const shoppingBag = () => html`<article>
  <h3>Shopping Bag</h3>
  <p>Here's what's in your bag.</p>
</article>`;

export default (streamed = true) => html`<!DOCTYPE html>
  <html lang="en" data-theme="dark">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"
      />
    </head>
    <body>
      ${streamed
        ? html`
            <main class="container">
              <header>
                <article>
                  <h1>Page Header</h1>
                  <p>Here's is some page links.</p>
                </article>
              </header>

              <div class="grid">
                ${suspense(loadingSection(), wait(productSuggestions(), 2000))}
                ${productDetails()}
                ${suspense(loadingSection(), wait(shoppingBag(), 4000))}
              </div>

              <article>
                <h3>Page Footer</h3>
                <p>Here's some information about our company.</p>
              </article>
            </main>
          `
        : wait(
            html`
              <main class="container">
                <header>
                  <article>
                    <h1>Page Header</h1>
                    <p>Here's is some page links.</p>
                  </article>
                </header>

                <div class="grid">
                  ${productSuggestions()} ${productDetails()} ${shoppingBag()}
                </div>

                <article>
                  <h3>Page Footer</h3>
                  <p>Here's some information about our company.</p>
                </article>
              </main>
            `,
            4000
          )}
      <style>
        article {
          margin: 0.5rem 0;
        }
      </style>
    </body>
  </html>`;
