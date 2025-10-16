import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import type { Line, OptionItem, StringTable } from "@yarnspinnertool/core";
import { Program, YarnVM } from "@yarnspinnertool/core";
import { clsx } from "clsx";
import { useEffect, useRef } from "react";
import { create } from "zustand";

import { base64ToBytes } from "@/utilities/base64ToBytes";

import YarnSpinnerLogo from "@/images/yarnspinner-logo.svg?react";

import type { CompiledYarnProgram } from "./testData";
import testData from "./testData";

type Store = {
    vm: YarnVM;
    history: (
        | { type: "line"; line: Line }
        | { type: "selected-option"; option: OptionItem }
        | { type: "command"; command: string }
    )[];
    runProgram: (data: CompiledYarnProgram) => void;
    currentState:
        | {
              type: "present-line";
              line: Line;
              continue: () => void;
          }
        | {
              type: "select-option";
              options: OptionItem[];
              continue: (option: OptionItem) => void;
          }
        | null;
};

const useYarn = create<Store>((set, get) => {
    const vm = new YarnVM();
    vm.lineCallback = (line, signal) =>
        new Promise((resolve) => {
            console.log("Run line", line);
            signal.onabort = () => resolve();
            set({
                history: [
                    ...get().history,
                    {
                        type: "line",
                        line: line,
                    },
                ],
                currentState: {
                    type: "present-line",
                    line: line,
                    continue: () => {
                        set({
                            currentState: null,
                        });
                        resolve();
                    },
                },
            });
        });

    vm.commandCallback = (command) => {
        console.log("Run command", command);
        set({ history: [...get().history, { type: "command", command }] });
        return Promise.resolve();
    };

    vm.optionCallback = (options, signal) => {
        console.log("Run options", options);
        return new Promise((resolve) => {
            signal.onabort = () => resolve(-1);

            set({
                currentState: {
                    type: "select-option",
                    options: options,
                    continue: (opt) => {
                        set({
                            history: [
                                ...get().history,
                                {
                                    type: "selected-option",
                                    option: opt,
                                },
                            ],
                            currentState: null,
                        });
                        resolve(opt.optionID);
                    },
                },
            });
        });
    };

    return {
        history: [],
        vm: vm,
        runProgram: (data, startNode = "Start") => {
            set({
                currentState: null,
                history: [],
            });
            const newProgram = Program.fromBinary(
                base64ToBytes(data.programData),
            );

            const { vm } = get();

            vm.loadProgram(newProgram);
            vm.setNode(startNode, true);
            void vm.start();
        },
        currentState: null,
    } satisfies Store;
});

function getLineText(
    line: Line,
    stringTable: StringTable | undefined,
):
    | {
          lineText: string;
          characterName: string | null;
          lineTextWithoutName: string;
      }
    | { error: string } {
    if (!stringTable) {
        return { error: `${line.id} (no string table)` };
    }
    const stringInfo = stringTable[line.id];
    if (!stringInfo) {
        return { error: `${line.id} (no entry found)` };
    }

    const lineText = line.substitutions.reduce<string>(
        (curr, item, idx) => curr.replace("{" + idx + "}", item.toString()),
        stringInfo,
    );

    const nameMatch = lineText.match(characterNameRegex);

    return {
        lineText,
        characterName: nameMatch != null ? nameMatch[1] : null,
        lineTextWithoutName: nameMatch != null ? nameMatch[2] : lineText,
    };
}
const characterNameRegex = /^([^:]+):\s*(.*)$/;

function LineView(props: {
    line: Line;
    isCurrent?: boolean;
    stringTable: StringTable;
    className?: string;
}) {
    const lineResult = getLineText(props.line, props.stringTable);
    return (
        <div
            title={props.line.id}
            className={clsx(
                "mx-8 box-content transition-opacity duration-200 select-text",
                {
                    "ps-3 opacity-50": !props.isCurrent,
                    "border-s-selected border-s-4 ps-2": props.isCurrent,
                },
                props.className,
            )}
        >
            <div>
                {"error" in lineResult ? (
                    lineResult.error
                ) : lineResult.characterName ? (
                    <>
                        <span className="font-bold after:content-[':_']">
                            {lineResult.characterName}
                        </span>
                        {lineResult.lineTextWithoutName}
                    </>
                ) : (
                    lineResult.lineText
                )}
            </div>
        </div>
    );
}

function OptionView(props: {
    option: OptionItem;
    stringTable: StringTable;
    onClick?: (option: OptionItem) => void;
    className?: string;
}) {
    const lineResult = getLineText(props.option.line, props.stringTable);
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

export type DialogueState =
    | null
    | { type: "line"; line: Line; continue: () => void }
    | {
          type: "options";
          options: OptionItem[];
          continue: (option: OptionItem) => void;
      };

export function StoryPreview() {
    const runProgram = useYarn((s) => s.runProgram);
    const history = useYarn((s) => s.history);
    const currentState = useYarn((s) => s.currentState);

    useEffect(() => {
        runProgram(testData);
    }, [runProgram]);

    const scrollToBottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottomRef.current?.scrollIntoView({
            block: "end",
            behavior: "smooth",
        });
    }, [history.length, currentState]);

    return (
        <div className="flex h-full flex-col select-none">
            <div className="border-panel-border flex items-stretch justify-between border-b px-2 py-1 text-lg font-bold">
                <div className="flex items-center gap-1">
                    <YarnSpinnerLogo className="h-7 fill-current" />
                    <div className="grow">Yarn Spinner Preview</div>
                </div>
                <div className="flex items-center">
                    <VSCodeButton
                        appearance="secondary"
                        onClick={() => runProgram(testData)}
                    >
                        Restart
                    </VSCodeButton>
                </div>
            </div>
            <div className="mx-auto flex w-[80%] grow flex-col gap-2 overflow-auto p-4">
                {history.map((historyItem, i) => {
                    if (historyItem.type == "line") {
                        return (
                            <LineView
                                line={historyItem.line}
                                key={i}
                                stringTable={testData.stringTable}
                                isCurrent={i == history.length - 1}
                            />
                        );
                    } else if (historyItem.type == "selected-option") {
                        return (
                            <LineView
                                line={historyItem.option.line}
                                key={i}
                                stringTable={testData.stringTable}
                                className="text-end"
                            />
                        );
                    } else if (historyItem.type == "command") {
                        return (
                            <div className="ms-20 opacity-40">
                                &lt;&lt;{historyItem.command}&gt;&gt;
                            </div>
                        );
                    }
                })}
                <div id="historyEnd" ref={scrollToBottomRef} />
            </div>
            {currentState != null && (
                <div className="border-panel-border flex shrink-0 flex-col gap-2 overflow-auto border-t p-2 px-10">
                    {currentState?.type == "present-line" && (
                        <VSCodeButton
                            className="w-full"
                            onClick={() => currentState.continue()}
                        >
                            Continue
                        </VSCodeButton>
                    )}
                    {currentState?.type == "select-option" &&
                        currentState.options.map((opt, i) => (
                            <OptionView
                                key={i}
                                className="w-full"
                                option={opt}
                                stringTable={testData.stringTable}
                                onClick={() => currentState.continue(opt)}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}
