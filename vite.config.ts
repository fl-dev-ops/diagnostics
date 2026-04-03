import { defineConfig } from "vite-plus";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const config = defineConfig({
  staged: {
    "*.{js,jsx,ts,tsx,mjs,cjs,mts,cts,json,css,scss,md,mdx,html,yml,yaml}": "vp fmt --write",
    "*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}": "vp lint --fix",
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
      },
    }),
    viteReact(),
  ],
});

export default config;
