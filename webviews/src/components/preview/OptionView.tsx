import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import type { OptionItem, StringTable } from "@yarnspinnertool/core";
import { clsx } from "clsx";
import { useEffect } from "react";

import { getLineText } from "./getLineText";

export function OptionView(props: {
    option: OptionItem;
    stringTable: StringTable;
    displayedIndex?: number;
    onClick?: (option: OptionItem) => void;
    className?: string;
}) {
    const lineResult = getLineText(props.option.line, props.stringTable);

    const { displayedIndex, onClick, option } = props;

    useEffect(() => {
        const selectOnPress = (evt: KeyboardEvent) => {
            console.log(evt);
            if (
                displayedIndex !== undefined &&
                evt.key == displayedIndex.toString()
            ) {
                onClick?.(option);
            }
        };

        window.addEventListener("keydown", selectOnPress);
        return () => window.removeEventListener("keydown", selectOnPress);
    }, [displayedIndex, onClick, option]);

    return (
        <VSCodeButton
            className={clsx(props.className)}
            onClick={() => props.onClick?.(props.option)}
        >
            {"error" in lineResult
                ? "ERROR: " + lineResult.error
                : lineResult.lineTextWithoutName}
        </VSCodeButton>
    );
}
