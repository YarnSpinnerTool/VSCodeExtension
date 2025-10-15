import { createContext } from "react";
import { type DocumentState } from "@/extension/editor";

export const GraphViewContext = createContext<DocumentState>({
    state: "Unknown",
});
