> ## Documentation Index
> Fetch the complete documentation index at: https://bun.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# import, require, and test Svelte components with bun test

Bun's [Plugin API](/runtime/plugins) lets you add custom loaders to your project. The `test.preload` option in `bunfig.toml` lets you configure your loader to start before your tests run.

Firstly, install `@testing-library/svelte`, `svelte`, and `@happy-dom/global-registrator`.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add @testing-library/svelte svelte@5 @happy-dom/global-registrator
```

Then, save this plugin in your project.

```ts svelte-loader.ts icon="https://mintcdn.com/bun-1dd33a4e/JUhaF6Mf68z_zHyy/icons/typescript.svg?fit=max&auto=format&n=JUhaF6Mf68z_zHyy&q=85&s=7ac549adaea8d5487d8fbd58cc3ea35b" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { plugin } from "bun";
import { compile } from "svelte/compiler";
import { readFileSync } from "fs";
import { beforeEach, afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

beforeEach(async () => {
  await GlobalRegistrator.register();
});

afterEach(async () => {
  await GlobalRegistrator.unregister();
});

plugin({
  title: "svelte loader",
  setup(builder) {
    builder.onLoad({ filter: /\.svelte(\?[^.]+)?$/ }, ({ path }) => {
      try {
        const source = readFileSync(path.substring(0, path.includes("?") ? path.indexOf("?") : path.length), "utf-8");

        const result = compile(source, {
          filename: path,
          generate: "client",
          dev: false,
        });

        return {
          contents: result.js.code,
          loader: "js",
        };
      } catch (err) {
        throw new Error(`Failed to compile Svelte component: ${err.message}`);
      }
    });
  },
});
```

***

Add this to `bunfig.toml` to tell Bun to preload the plugin, so it loads before your tests run.

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Tell Bun to load this plugin before your tests run
preload = ["./svelte-loader.ts"]

# This also works:
# test.preload = ["./svelte-loader.ts"]
```

***

Add an example `.svelte` file in your project.

```html Counter.svelte icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<script>
  export let initialCount = 0;
  let count = initialCount;
</script>

<p>Count: {count}</p>
<button on:click={() => (count += 1)}>+1</button>
```

***

Now you can `import` or `require` `*.svelte` files in your tests, and it will load the Svelte component as a JavaScript module.

```ts hello-svelte.test.ts icon="https://mintcdn.com/bun-1dd33a4e/JUhaF6Mf68z_zHyy/icons/typescript.svg?fit=max&auto=format&n=JUhaF6Mf68z_zHyy&q=85&s=7ac549adaea8d5487d8fbd58cc3ea35b" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";
import { render, fireEvent } from "@testing-library/svelte";
import Counter from "./Counter.svelte";

test("Counter increments when clicked", async () => {
  const { getByText, queryByText } = render(Counter);
  const button = getByText("+1");

  // Initial state
  expect(getByText("Count: 0")).toBeTruthy();

  // Click the increment button
  await fireEvent.click(button);

  // Check the new state
  expect(queryByText("Count: 0")).toBeNull();
  expect(getByText("Count: 1")).toBeTruthy();
});
```

***

Use `bun test` to run your tests.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test
```


Built with [Mintlify](https://mintlify.com).
