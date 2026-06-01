import { Hono } from "hono";
import { raw } from "hono/html";
import { render } from "./markdown.ts";
import { renderer } from "./renderer.tsx";

const app = new Hono<{ Bindings: Env }>();

app.use(renderer);

app.notFound((c) => {
  c.status(404);
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
  const html = render(source);
  return c.render(raw(`<main>${html}</main>`), { title: c.req.path });
});

export default app;
