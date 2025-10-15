import React from "react";
import { createRoot } from "react-dom/client";
import PreviewApp from "./PreviewApp";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Failed to find root!");
}

const root = createRoot(rootElement);

root.render(
    <React.StrictMode>
        <PreviewApp />
    </React.StrictMode>,
);
