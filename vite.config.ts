import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
/* import { viteStaticCopy } from 'vite-plugin-static-copy'; */
import webExtension from "vite-plugin-web-extension";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), webExtension(), tailwindcss()],
    resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});