import type { Context } from "hono";
import { Hono } from "hono";
import { raw } from "hono/html";
import { render } from "./markdown.ts";
import { renderer } from "./renderer.tsx";

type AppEnv = { Bindings: Env };

const app = new Hono<AppEnv>();

app.use(renderer);

function notFound(c: Context<AppEnv>, title: string) {
  c.status(404);
  return c.render(<p>Not Found</p>, { title });
}

app.get("/", (c) => notFound(c, "/"));

app.get("/:path{.+}", async (c) => {
  const path = c.req.param("path");
  const url = `/${path}`;

  if (path.endsWith("/")) {
    return notFound(c, url);
  }

  const object = await c.env.BUCKET.get(`${path}.md`);
  if (object === null) {
    return notFound(c, url);
  }

  const source = await object.text();
  const html = render(source);
  return c.render(raw(`<main>${html}</main>`), { title: url });
});

export default app;
