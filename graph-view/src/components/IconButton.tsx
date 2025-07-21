import clsx from "clsx";
import { FunctionComponent } from "react";

export function IconButton(props: {
    icon: FunctionComponent;
    enabled?: boolean;
    onClick?: React.MouseEventHandler;
    title?: string;
}) {
    return (
        <div
            onClick={props.onClick}
            title={props.title}
            className={clsx("h-[20px] flex", {
                "fill-editor-foreground/75 hover:fill-editor-foreground cursor-pointer":
                    props.enabled === true || props.enabled === undefined,
                "fill-editor-foreground/25 cursor-auto":
                    props.enabled === false,
            })}
        >
            <props.icon />
        </div>
    );
}
