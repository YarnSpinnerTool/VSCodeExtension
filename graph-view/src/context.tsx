import { createContext } from "react";
import type { NodeInfo } from "../../src/nodes";

export type GraphViewState = { nodes: NodeInfo[] };
export const GraphViewContext = createContext<GraphViewState>({ nodes: [] });
