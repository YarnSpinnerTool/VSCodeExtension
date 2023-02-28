import * as CurvedArrows from 'curved-arrows';
import { NodeView } from "./NodeView";
import { NodeSize } from "./constants";

enum ArrowConstraints {
    None,
    LeftToRight,
    RightToLeft,
}

const VSCODE_COLOR_LINE_CHART = 'var(--vscode-charts-lines)';
/**
 * Creates an SVG element that contains lines connecting the indicated nodes.
 * @param nodes The nodes to draw lines between.
 * @param arrowHeadSize The size of the arrowheads at the end of lines.
 * @param lineThickness The thickness of the lines.
 * @param color The color (as a hex value, CSS variable, or other CSS-compatible
 * color) of the lines.
 * @returns An SVGElement containing lines between the provided nodes.
 */
export function getLinesSVGForNodes(nodes: Iterable<NodeView>, arrowHeadSize = 9, lineThickness = 2, color = VSCODE_COLOR_LINE_CHART, constraints = ArrowConstraints.LeftToRight): SVGElement {

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
        as: number
    ];

    let arrowDescriptors: ArrowDescriptor[] = [];

    for (const fromNode of nodes) {
        for (const toNode of fromNode.outgoingConnections) {
            let fromPosition = fromNode.position;
            let toPosition = toNode.position;
            let fromSize = NodeSize;
            let toSize = NodeSize;

            var allowedDirections: CurvedArrows.ArrowOptions = {};

            switch (constraints) {
                case ArrowConstraints.LeftToRight:
                    allowedDirections.allowedStartSides = ['right', 'bottom']
                    allowedDirections.allowedEndSides = ['left', 'top']
                    break;
                case ArrowConstraints.RightToLeft:
                    allowedDirections.allowedStartSides = ['left', 'bottom']
                    allowedDirections.allowedEndSides = ['right', 'top']
                    break;
                case ArrowConstraints.RightToLeft:
                    allowedDirections.allowedStartSides = []
                    allowedDirections.allowedEndSides = []
                    break;
            }

            const arrow = CurvedArrows.getBoxToBoxArrow(
                fromPosition.x,
                fromPosition.y,
                fromSize.width,
                fromSize.height,

                toPosition.x,
                toPosition.y,
                toSize.width,
                toSize.height,

                {
                    padEnd: arrowHeadSize,
                    ...allowedDirections
                }
            ) as ArrowDescriptor;

            arrowDescriptors.push(arrow);
        }
    }

    const SVG = 'http://www.w3.org/2000/svg';

    let svg = document.createElementNS(SVG, 'svg');
    svg.style.position = 'absolute';
    svg.style.left = '0';
    svg.style.top = '0';
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.overflow = "visible";
    svg.style.zIndex = "-1";
    svg.id = "lines";

    for (const arrow of arrowDescriptors) {
        let [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = arrow;

        let line = document.createElementNS(SVG, 'path');

        line.setAttribute("d", `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", lineThickness.toString());
        line.setAttribute("fill", "none");

        svg.appendChild(line);

        let arrowHead = document.createElementNS(SVG, 'polygon');

        arrowHead.setAttribute('points', `0,${-arrowHeadSize} ${arrowHeadSize *
            2},0, 0,${arrowHeadSize}`);
        arrowHead.setAttribute('transform', `translate(${ex}, ${ey}) rotate(${ae})`);
        arrowHead.setAttribute('fill', color);

        svg.appendChild(arrowHead);
    }

    return svg;
}
