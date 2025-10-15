import { createContext } from "react";
import { type DocumentState } from "../../src/editor";

export const GraphViewContext = createContext<DocumentState>({
    state: "Unknown",
});
