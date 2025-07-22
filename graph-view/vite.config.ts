import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig((config) => ({
    plugins: [react(), tailwindcss(), svgr()],
    build: {
        sourcemap: config.mode === "development" ? "inline" : false,
        reportCompressedSize: config.mode !== "development",
        outDir: "build",
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
            },
        },
    },
}));
