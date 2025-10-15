import React from "react";
import { createRoot } from "react-dom/client";

import GraphViewApp from "./GraphViewApp";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Failed to find root!");
}

const root = createRoot(rootElement);

root.render(
    <React.StrictMode>
        <GraphViewApp />
    </React.StrictMode>,
);
