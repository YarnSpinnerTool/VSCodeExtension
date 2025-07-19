import { createContext } from "react";
import type { NodeInfo } from "../../src/nodes";

export type GraphViewState = {
    nodes: NodeInfo[];
    documentUri: string | null;
};
export const GraphViewContext = createContext<GraphViewState>({
    nodes: [],
    documentUri: null,
});
