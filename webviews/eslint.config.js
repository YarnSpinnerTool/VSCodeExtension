import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist", "backend", "vite.config.ts"] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
        ],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "@typescript-eslint/consistent-type-imports": "error",
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "no-restricted-imports": "off",
            "@typescript-eslint/no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            regex: "^\\.[^/]",
                            message:
                                "Do not import files outside the current directory by path; use @/* instead",
                        },
                        {
                            regex: "^@/extension/",
                            message:
                                "Only type imports are allowed from the extension. Use 'import type' instead.",
                            allowTypeImports: true,
                        },
                    ],
                },
            ],
        },
    },
    eslintConfigPrettier,
);
