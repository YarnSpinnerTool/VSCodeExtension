import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import type { StringTable } from "@yarnspinnertool/core";
import { useEffect, useRef } from "react";

import SpinnerIcon from "@/images/spinner.svg?react";
import YarnSpinnerLogo from "@/images/yarnspinner-logo.svg?react";

import { LineView } from "./LineView";
import { OptionView } from "./OptionView";
import type { DialogueAction, DialogueHistoryItem } from "./useYarn";

export function StoryPreview(props: {
    isLoading: boolean;
    history: DialogueHistoryItem[];
    nextAction: DialogueAction | null;
    errors: string[];
    stringTable: StringTable | null;
    onRestart: () => void;
    onRequestUpdate: () => void;
}) {
    const { history, nextAction } = props;

    // A ref to an element that's always at the very bottom of the history,
    // which we can scroll into view
    const scrollToBottomRef = useRef<HTMLDivElement>(null);

    const firstRender = useRef(true);

    useEffect(() => {
        // Scroll to the bottom of the history when our history length changes.
        // If this is the first render, jump to it instantly; otherwise, scroll
        // smoothly.
        scrollToBottomRef.current?.scrollIntoView({
            block: "end",
            behavior: firstRender.current ? "instant" : "smooth",
        });
        firstRender.current = false;
    }, [history.length, nextAction]);

    return (
        <div className="flex h-full flex-col select-none">
            <div className="border-panel-border flex items-stretch justify-between border-b px-2 py-1 text-lg font-bold">
                <div className="flex items-center gap-1">
                    <YarnSpinnerLogo className="h-7 fill-current" />
                    <div className="grow">Yarn Spinner Preview</div>
                </div>
                <div className="flex items-center gap-2">
                    <VSCodeButton
                        appearance="secondary"
                        onClick={() => props.onRequestUpdate()}
                    >
                        {/* TODO: Temporarily using "Restart" as the label because
                        until hot-loading is in, updating will always restart
                        the dialogue */}
                        Restart
                    </VSCodeButton>
                    {/* <VSCodeButton
                        appearance="secondary"
                        onClick={() => props.onRestart()}
                    >
                        Restart
                    </VSCodeButton> */}
                </div>
            </div>
            <div className="mx-auto flex w-[80%] grow flex-col gap-2 overflow-auto p-4">
                {props.isLoading && (
                    <div className="flex size-full flex-col items-center justify-center gap-3">
                        <div>Loading...</div>
                        <SpinnerIcon className="fill-selected size-10 animate-spin" />
                    </div>
                )}
                {props.errors.length > 0 && (
                    <>
                        <div className="font-bold">
                            Errors exist in your Yarn Spinner project.
                        </div>
                        {props.errors.map((e, i) => {
                            return (
                                <div className="text-red select-text" key={i}>
                                    {e}
                                </div>
                            );
                        })}
                    </>
                )}
                {history.map((historyItem, i) => {
                    if (historyItem.type == "line") {
                        return (
                            <LineView
                                line={historyItem.line}
                                key={i}
                                stringTable={props.stringTable ?? {}}
                                isCurrent={i == history.length - 1}
                            />
                        );
                    } else if (historyItem.type == "selected-option") {
                        return (
                            <LineView
                                line={historyItem.option.line}
                                key={i}
                                stringTable={props.stringTable ?? {}}
                                className="text-end"
                            />
                        );
                    } else if (historyItem.type == "command") {
                        return (
                            <div key={i} className="ms-20 opacity-40">
                                &lt;&lt;{historyItem.command}&gt;&gt;
                            </div>
                        );
                    }
                })}
                <div id="historyEnd" ref={scrollToBottomRef} />
            </div>
            {nextAction != null && (
                <div className="border-panel-border flex shrink-0 flex-col gap-2 overflow-auto border-t p-2 px-10">
                    {nextAction?.type == "present-line" && (
                        <VSCodeButton
                            className="w-full"
                            onClick={() => nextAction.continue()}
                        >
                            Continue
                        </VSCodeButton>
                    )}
                    {nextAction?.type == "select-option" &&
                        nextAction.options.map((opt, i) => (
                            <OptionView
                                key={i}
                                className="w-full"
                                option={opt}
                                stringTable={props.stringTable ?? {}}
                                onClick={() => nextAction.continue(opt)}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}
