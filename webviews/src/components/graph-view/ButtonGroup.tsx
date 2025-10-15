import clsx from "clsx";
import type { PropsWithChildren } from "react";

export function ButtonGroup(
    props: { direction: "vertical" | "horizontal" } & PropsWithChildren,
) {
    return (
        <div
            className={clsx(
                "bg-editor-background shadow-widget-shadow flex shrink-0 gap-2 rounded-sm p-1 shadow-md",
                { "flex-col": props.direction === "vertical" },
            )}
        >
            {props.children}
        </div>
    );
}
