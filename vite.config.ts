import path, { resolve } from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import webExtension from "vite-plugin-web-extension";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), webExtension({
    additionalInputs: [
      "src/warning/index.html", //To vite process the page
    ],
  }), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  /* build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        // BUILD this Warning page into dist/warning/index.html
        warning: resolve(__dirname, "src/warning/index.html"),
      },
    },
  }, */
});