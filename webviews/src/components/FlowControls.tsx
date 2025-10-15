import { useReactFlow, useViewport } from "@xyflow/react";
import { IconButton } from "./IconButton";

import IconZoomIn from "../images/zoom-in.svg?react";
import IconZoomOut from "../images/zoom-out.svg?react";
import IconZoomFit from "../images/zoom-fit.svg?react";
import IconLock from "../images/lock.svg?react";
import IconUnlock from "../images/unlock.svg?react";

export function FlowControls(props: {
    interactive: boolean;
    onInteractiveChanged: (value: boolean) => void;
    maxZoom: number;
    minZoom: number;
}) {
    const viewport = useViewport();
    const flow = useReactFlow();

    const currentZoom = viewport.zoom;
    const zoomInAvailable = currentZoom < props.maxZoom;
    const zoomOutAvailable = currentZoom > props.minZoom;
    return (
        <>
            <IconButton
                icon={IconZoomIn}
                title="Zoom In"
                enabled={zoomInAvailable}
                onClick={() => void flow.zoomIn()}
            />
            <IconButton
                icon={IconZoomOut}
                title="Zoom Out"
                enabled={zoomOutAvailable}
                onClick={() => void flow.zoomOut()}
            />
            <IconButton
                icon={IconZoomFit}
                title="Zoom to Fit"
                onClick={() => void flow.fitView()}
            />
            <IconButton
                icon={props.interactive ? IconUnlock : IconLock}
                title={props.interactive ? "Lock View" : "Unlock View"}
                onClick={() => props.onInteractiveChanged(!props.interactive)}
            />
        </>
    );
}
