/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // so you can use `describe`, `it`, `expect` without imports
    environment: "node",
    exclude: ["generated/*", "node_modules/*"],
  },
});
