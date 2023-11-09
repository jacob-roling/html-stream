import { render } from "../src/index.js";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
// import { serveStatic } from "@hono/node-server/serve-static";
import productPage from "./productPage.js";

const app = new Hono();

app.use("*", logger());

app.get("/", (c) => {
  c.header("Content-Type", "text/html; charset=utf-8");
  return c.stream((writable) => render(writable, productPage(false)));
});

app.get("/stream", (c) => {
  c.header("Content-Type", "text/html; charset=utf-8");
  c.header("Transfer-Encoding", "chunked");
  return c.stream((writable) => render(writable, productPage()));
});

serve(app, ({ port }) => {
  console.log(`Server listening on http://localhost:${port}`);
});

// render(process.stdout, productPage());
