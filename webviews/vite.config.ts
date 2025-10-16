import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { UserConfig, defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

function isDevelopment(config: { mode: string }) {
    return config.mode.endsWith("development");
}

function getViewName(config: { mode: string }) {
    const name = config.mode.split(":")[0];

    switch (name) {
        case "graph-view":
        case "preview":
            return name;
        default:
            throw new Error(`${config.mode} is not a valid view name`);
    }
}

// https://vitejs.dev/config/
export default defineConfig((config) => {
    const viewName = getViewName(config);

    const publicDir = viewName ? `./src/public/${viewName}` : "assets";
    const outDir = viewName ? `./build/${viewName}` : "./build";

    return {
        plugins: [
            tsconfigPaths(),
            react(),
            tailwindcss(),
            svgr(),
            analyzer({
                enabled: isDevelopment(config),
                analyzerMode: "static",
                fileName: viewName ? `stats-${viewName}.html` : "stats.html",
                openAnalyzer: false,
            }),
        ],
        esbuild: {
            minifyIdentifiers: isDevelopment(config) ? false : undefined,
        },
        publicDir: path.resolve(__dirname, publicDir),
        build: {
            sourcemap: isDevelopment(config) ? "inline" : false,
            reportCompressedSize: isDevelopment(config) == false,
            outDir,
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, `src/${viewName}.html`),
                },
                output: {
                    entryFileNames: `assets/[name].js`,
                    chunkFileNames: `assets/[name].js`,
                    assetFileNames: `assets/[name].[ext]`,
                },
                plugins: [
                    {
                        name: "html-path-rewrite",
                        generateBundle(_, bundle) {
                            for (const key in bundle) {
                                if (
                                    bundle[key].type === "asset" &&
                                    bundle[key].fileName.endsWith(".html")
                                ) {
                                    // Rewrite the path for the HTML file
                                    bundle[key].fileName = "index.html";
                                }
                            }
                        },
                    },
                ],
            },
        },
    } satisfies UserConfig;
});
