import { NodeInfo } from "./nodes";

/** Decomposes a DOMMatrix into its translation, rotation, scale and skew (where possible).
 * @param mat: The matrix to decompose.
 */
export function decomposeTransformMatrix(mat: DOMMatrix) {
    var a = mat.a;
    var b = mat.b;
    var c = mat.c;
    var d = mat.d;
    var e = mat.e;
    var f = mat.f;

    var delta = a * d - b * c;

    let result = {
        translation: { x: e, y: f },
        rotation: 0,
        scale: { x: 0, y: 0 },
        skew: { x: 0, y: 0 },
    };

    // Apply QR-like decomposition of the 2D matrix.
    if (a != 0 || b != 0) {
        var r = Math.sqrt(a * a + b * b);
        result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
        result.scale = { x: r, y: delta / r };
        result.skew = { x: Math.atan((a * c + b * d) / (r * r)), y: 0 };
    } else if (c != 0 || d != 0) {
        var s = Math.sqrt(c * c + d * d);
        result.rotation =
            Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
        result.scale = { x: delta / s, y: s };
        result.skew = { x: 0, y: Math.atan((a * c + b * d) / (s * s)) };
    } else {
        // a = b = c = d = 0
    }

    return result;
}

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export function getWindowSize(): Size {
    let viewport = window.visualViewport;
    if (viewport == null) {
        throw new Error("Failed to get window visual viewport");
        ;
    }
    return {
        width: viewport.width,
        height: viewport.height
    }
}

/**
 * Returns the coordinates of the center of the window.
 * @returns The center of the window.
 */
export function getWindowCenter(): Position {
    const size = getWindowSize();

    return {
        x: Math.round(size.width / 2),
        y: Math.round(size.height / 2),
    }
}

export function getPositionFromNodeInfo(node: NodeInfo) : Position | null {
    // Try and find a 'position' header in this node, and parse it; if
    // we can't find one, or can't parse it, default to (0,0). 
    const positionString = node.headers.find(h => h.key == "position")?.value;

    if (positionString) {
        try {
            const elements = positionString.split(",").map(i => parseInt(i));
            return { x: elements[0], y: elements[1] };
        } catch (e) {
            return null;
        }
    } else {
        return null;
    }
}