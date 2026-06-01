import { Hono } from "hono";
import { accepts } from "hono/accepts";
import { raw } from "hono/html";
import { render } from "./markdown.ts";
import { renderer } from "./renderer.tsx";

const HTML = "text/html";
const MARKDOWN = "text/markdown";
type Accept = typeof HTML | typeof MARKDOWN;

const app = new Hono<{
  Bindings: Env;
  Variables: { accept: Accept };
}>();

app.use(async (c, next) => {
  const accept = accepts(c, {
    header: "Accept",
    supports: [HTML, MARKDOWN],
    default: HTML,
  }) as Accept;
  c.set("accept", accept);
  await next();
});

app.use(renderer);

app.notFound((c) => {
  c.status(404);
  if (c.get("accept") === MARKDOWN) {
    return c.text("Not Found");
  }
  return c.render(<p>Not Found</p>, { title: c.req.path });
});

app.get("/:path{.+}", async (c) => {
  const path = c.req.param("path");

  if (path.endsWith("/")) {
    return c.notFound();
  }

  const object = await c.env.BUCKET.get(`${path}.md`);
  if (object === null) {
    return c.notFound();
  }

  const source = await object.text();

  if (c.get("accept") === MARKDOWN) {
    c.header("Content-Type", "text/markdown; charset=utf-8");
    return c.body(source);
  }

  const html = render(source);
  return c.render(raw(`<main>${html}</main>`), { title: c.req.path });
});

export default app;
