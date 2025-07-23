import { NodeInfo } from "../../../src/nodes";

export function getNodeColour(n: NodeInfo): string | null {
    return n.headers.find((h) => h.key === "color")?.value ?? null;
}
