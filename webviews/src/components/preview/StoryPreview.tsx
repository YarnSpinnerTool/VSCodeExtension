import SettingsIcon from "@vscode/codicons/src/icons/settings-gear.svg?react";
import type { StringTable } from "@yarnspinnertool/core";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import SpinnerIcon from "@/images/spinner.svg?react";
import YarnSpinnerLogo from "@/images/yarnspinner-logo.svg?react";

import { LineView } from "./LineView";
import { OptionView } from "./OptionView";
import type {
    DialogueAction,
    DialogueHistoryItem,
    PreviewSettings,
} from "./useYarn";

export function StoryPreview(props: {
    isLoading: boolean;
    history: DialogueHistoryItem[];
    nextAction: DialogueAction | null;
    errors: string[];
    stringTable: StringTable | null;
    onRestart: () => void;
    onRequestUpdate: () => void;
    settings: PreviewSettings;
    onUpdateSettings: (newSettings: PreviewSettings) => void;
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

    useEffect(() => {
        // When the spacebar or enter key is pressed, and the current action is
        // showing a line, advance to the next line
        const advanceLineOnKeyDown = (evt: KeyboardEvent) => {
            if (
                nextAction?.type == "present-line" &&
                (evt.key == " " || evt.key == "Enter")
            ) {
                nextAction.continue();
            }
        };
        window.addEventListener("keydown", advanceLineOnKeyDown);
        return () =>
            window.removeEventListener("keydown", advanceLineOnKeyDown);
    });

    const [showingSettings, setShowingSettings] = useState(false);

    return (
        <>
            {showingSettings && (
                <div
                    className={clsx(
                        "bg-editor-background/75 absolute top-0 left-0 z-10 size-full p-8",
                    )}
                >
                    <div className="border-panel-border bg-panel-background flex max-h-full w-full flex-col overflow-auto border p-4">
                        <div className="mb-4 flex items-center justify-between font-bold">
                            <div>Settings</div>
                            <div>
                                <vscode-button
                                    onClick={() => setShowingSettings(false)}
                                >
                                    Done
                                </vscode-button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <vscode-checkbox
                                id="show-details"
                                checked={props.settings.showDetails}
                                onChange={(e) =>
                                    props.onUpdateSettings({
                                        showDetails: e.currentTarget.checked,
                                    })
                                }
                            />
                            <label htmlFor="show-details">Show Details</label>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex h-full flex-col select-none">
                <div className="border-panel-border flex items-stretch justify-between border-b px-2 py-1 text-lg font-bold">
                    <div className="flex items-center gap-1">
                        <YarnSpinnerLogo className="h-7 fill-current" />
                        <div className="grow">Yarn Spinner Preview</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <vscode-button
                            iconOnly
                            onClick={() => setShowingSettings(true)}
                        >
                            <SettingsIcon />
                        </vscode-button>

                        <vscode-button
                            secondary
                            onClick={() => props.onRequestUpdate()}
                        >
                            {/* TODO: Temporarily using "Restart" as the label because
                        until hot-loading is in, updating will always restart
                        the dialogue */}
                            Restart
                        </vscode-button>
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
                                    <div
                                        className="text-red select-text"
                                        key={i}
                                    >
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
                        } else if (props.settings.showDetails) {
                            if (historyItem.type == "variable-change") {
                                let valueDisplay: string;
                                if (typeof historyItem.value === "boolean") {
                                    valueDisplay = historyItem.value
                                        ? "true"
                                        : "false";
                                } else {
                                    valueDisplay = historyItem.value.toString();
                                }
                                return (
                                    <div key={i} className="opacity-40">
                                        Variable{" "}
                                        <strong>{historyItem.variable}</strong>{" "}
                                        changed to{" "}
                                        <strong>{valueDisplay}</strong>
                                    </div>
                                );
                            } else if (historyItem.type == "command") {
                                return (
                                    <div key={i} className="opacity-40">
                                        &lt;&lt;{historyItem.command}&gt;&gt;
                                    </div>
                                );
                            } else if (historyItem.type == "node-jump") {
                                return (
                                    <div key={i} className="opacity-40">
                                        Starting node{" "}
                                        <strong>{historyItem.node}</strong>
                                    </div>
                                );
                            } else if (historyItem.type == "stop") {
                                return (
                                    <div key={i} className="opacity-40">
                                        Dialogue complete.
                                    </div>
                                );
                            }
                        }
                    })}
                    <div id="historyEnd" ref={scrollToBottomRef} />
                </div>
                {nextAction != null && (
                    <div className="border-panel-border flex shrink-0 flex-col gap-2 overflow-auto border-t p-2 px-10">
                        {nextAction?.type == "present-line" && (
                            <vscode-button
                                className="w-full"
                                onClick={() => nextAction.continue()}
                            >
                                Continue
                            </vscode-button>
                        )}
                        {nextAction?.type == "select-option" &&
                            nextAction.options
                                .filter((opt) => opt.isAvailable)
                                .map((opt, i) => (
                                    <div
                                        key={i}
                                        className="flex w-full items-center gap-2"
                                    >
                                        <div>{i + 1}.</div>
                                        <OptionView
                                            displayedIndex={i + 1}
                                            className="grow"
                                            option={opt}
                                            stringTable={
                                                props.stringTable ?? {}
                                            }
                                            onClick={() =>
                                                nextAction.continue(opt)
                                            }
                                        />
                                    </div>
                                ))}
                    </div>
                )}
            </div>
        </>
    );
}
