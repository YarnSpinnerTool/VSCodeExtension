import clsx from "clsx";
import { PropsWithChildren } from "react";

export function ButtonGroup(
    props: { direction: "vertical" | "horizontal" } & PropsWithChildren,
) {
    return (
        <div
            className={clsx(
                "flex gap-2 p-1 bg-editor-background shadow-md shadow-widget-shadow rounded-sm shrink-0",
                { "flex-col": props.direction === "vertical" },
            )}
        >
            {props.children}
        </div>
    );
}
