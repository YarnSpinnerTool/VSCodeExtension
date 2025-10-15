import * as CurvedArrows from "curved-arrows";

import { NodeView } from "./NodeView";
import { NodeSize } from "./constants";
import { Position, Size } from "./util";

enum ArrowConstraints {
    None,
    LeftToRight,
    RightToLeft,
}

const VSCODE_COLOR_LINE_CHART = "var(--vscode-charts-lines)";
/**
 * Creates an SVG element that contains lines connecting the indicated nodes.
 * @param nodes The nodes to draw lines between.
 * @param arrowHeadSize The size of the arrowheads at the end of lines.
 * @param lineThickness The thickness of the lines.
 * @param color The color (as a hex value, CSS variable, or other CSS-compatible
 * color) of the lines.
 * @returns An SVGElement containing lines between the provided nodes.
 */
export function getLinesSVGForNodes(
    nodes: Iterable<NodeView>,
    arrowHeadSize = 9,
    lineThickness = 2,
    color = VSCODE_COLOR_LINE_CHART,
    constraints = ArrowConstraints.LeftToRight,
): SVGElement {
    type ArrowDescriptor = [
        sx: number,
        sy: number,
        c1x: number,
        c1y: number,
        c2x: number,
        c2y: number,
        ex: number,
        ey: number,
        ae: number,
        as: number,
        type: "Jump" | "Detour",
    ];

    let arrowDescriptors: ArrowDescriptor[] = [];

    const nodesWithExternalJumps: NodeView[] = [];

    for (const fromNode of nodes) {
        for (const toNode of fromNode.outgoingConnections) {
            try {
                let fromPosition = fromNode.position;

                let toPosition: Position;
                let fromSize: Size;
                let toSize: Size;

                fromSize = fromNode.size;

                switch (toNode.destinationType) {
                    case "Node":
                        toPosition = toNode.nodeView.position;
                        toSize = toNode.nodeView.size;
                        break;
                    case "NodeGroup":
                        toPosition = toNode.groupView.position;
                        toSize = toNode.groupView.size;
                        break;
                }

                var allowedDirections: CurvedArrows.ArrowOptions = {};

                switch (constraints) {
                    case ArrowConstraints.LeftToRight:
                        allowedDirections.allowedStartSides = [
                            "right",
                            "bottom",
                        ];
                        allowedDirections.allowedEndSides = ["left", "top"];
                        break;
                    case ArrowConstraints.RightToLeft:
                        allowedDirections.allowedStartSides = [
                            "left",
                            "bottom",
                        ];
                        allowedDirections.allowedEndSides = ["right", "top"];
                        break;
                    case ArrowConstraints.RightToLeft:
                        allowedDirections.allowedStartSides = [];
                        allowedDirections.allowedEndSides = [];
                        break;
                }

                const arrow = [
                    ...CurvedArrows.getBoxToBoxArrow(
                        fromPosition.x,
                        fromPosition.y,
                        fromSize.width,
                        fromSize.height,

                        toPosition.x,
                        toPosition.y,
                        toSize.width,
                        toSize.height,

                        {
                            padStart:
                                toNode.connectionType === "Detour"
                                    ? arrowHeadSize
                                    : 0,
                            padEnd: arrowHeadSize,
                            ...allowedDirections,
                        },
                    ),
                    toNode.connectionType,
                ] as ArrowDescriptor;
                arrowDescriptors.push(arrow);
            } catch (e) {
                console.error(e);
            }
        }

        if (fromNode.containsExternalJumps) {
            nodesWithExternalJumps.push(fromNode);
        }
    }

    const SVG = "http://www.w3.org/2000/svg";

    let svg = document.createElementNS(SVG, "svg");
    svg.style.position = "absolute";
    svg.style.left = "0";
    svg.style.top = "0";
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.overflow = "visible";
    svg.style.zIndex = "-1";
    svg.id = "lines";

    for (const arrow of arrowDescriptors) {
        let [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae, as, type] = arrow;

        let line = document.createElementNS(SVG, "path");

        line.setAttribute(
            "d",
            `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`,
        );
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", lineThickness.toString());
        line.setAttribute("fill", "none");

        svg.appendChild(line);

        svg.appendChild(getArrowHead("arrow-end", ex, ey, ae));

        if (type === "Detour") {
            // Show an arrow head at the start for detours
            svg.appendChild(getArrowHead("arrow-start", sx, sy, as));
        }
    }

    for (const node of nodesWithExternalJumps) {
        const startPos: Position = {
            x: node.position.x + node.size.width,
            y: node.position.y + node.size.height / 2,
        };
        const endPos: Position = {
            x: startPos.x + 50,
            y: startPos.y,
        };

        let line = document.createElementNS(SVG, "line");
        line.setAttribute("x1", startPos.x.toString());
        line.setAttribute("y1", startPos.y.toString());
        line.setAttribute("x2", endPos.x.toString());
        line.setAttribute("y2", endPos.y.toString());

        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", lineThickness.toString());
        line.setAttribute("fill", "none");
        line.id = "external-jumps-" + node.nodeName;

        svg.appendChild(line);

        svg.appendChild(getArrowHead("external-jump", endPos.x, endPos.y, 0));

        const externalJumpRadius = 5;
        const externalJumpCirclePos: Position = {
            x: endPos.x + arrowHeadSize * 2 + externalJumpRadius,
            y: endPos.y,
        };

        const externalJumpCircle = document.createElementNS(SVG, "circle");
        externalJumpCircle.setAttribute(
            "cx",
            externalJumpCirclePos.x.toString(),
        );
        externalJumpCircle.setAttribute(
            "cy",
            externalJumpCirclePos.y.toString(),
        );
        externalJumpCircle.setAttribute("r", externalJumpRadius.toString());
        externalJumpCircle.setAttribute("stroke", color);
        externalJumpCircle.setAttribute(
            "stroke-width",
            lineThickness.toString(),
        );
        externalJumpCircle.style.opacity = "0.5";

        externalJumpCircle.setAttribute("fill", "none");
        svg.appendChild(externalJumpCircle);
    }

    return svg;

    function getArrowHead(id: string, x: number, y: number, angleEnd: number) {
        let arrowHead = document.createElementNS(SVG, "polygon");

        arrowHead.setAttribute(
            "points",
            `0,${-arrowHeadSize} ${arrowHeadSize * 2},0, 0,${arrowHeadSize}`,
        );
        arrowHead.setAttribute(
            "transform",
            `translate(${x}, ${y}) rotate(${angleEnd})`,
        );
        arrowHead.setAttribute("fill", color);
        arrowHead.id = id;
        return arrowHead;
    }
}
