import init, { transform, WasmParserOptions } from "@ox-content/wasm";
import wasmModule from "@ox-content/wasm/ox_content_wasm_bg.wasm?module";

await init({ module_or_path: wasmModule });

type TransformResult = { html?: unknown };

export function render(source: string): string {
  const options = new WasmParserOptions();
  options.gfm = true;
  options.autolinks = true;
  options.footnotes = true;
  options.strikethrough = true;
  options.tables = true;
  options.taskLists = true;
  const result = transform(source, options) as TransformResult;
  return typeof result.html === "string" ? result.html : "";
}
