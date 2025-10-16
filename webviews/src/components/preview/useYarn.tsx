import type {
    ExecutionState,
    VariableStorage,
    YarnValue,
} from "@yarnspinnertool/core";
import {
    type Line,
    type OptionItem,
    Program,
    YarnVM,
} from "@yarnspinnertool/core";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { YarnData } from "@/extension/extension";

import { base64ToBytes } from "@/utilities/base64ToBytes";
import { vscode } from "@/utilities/vscode";

export type ProgramState = {
    currentNode: string;
    programCounter: number;
    pendingOptions: OptionItem[];
    vmStack: (boolean | number | string)[];
    vmExecutionState: ExecutionState;
    vmCallStack: {
        nodeName: string;
        instruction: number;
    }[];
};

function captureProgramState(vm: YarnVM): ProgramState | null {
    if (vm["currentNodeName"] == null) {
        // No node running, so no state to capture.
        return null;
    }
    return {
        currentNode: vm["currentNodeName"],
        pendingOptions: vm["optionSet"] as OptionItem[],
        programCounter: vm["programCounter"] as number,
        vmExecutionState: vm.state,
        vmStack: vm["stack"] as (boolean | number | string)[],
        vmCallStack: vm["callStack"] as {
            nodeName: string;
            instruction: number;
        }[],
    };
}

export type DialogueHistoryItem =
    | {
          type: "line";
          line: Line;
      }
    | {
          type: "selected-option";
          option: OptionItem;
      }
    | {
          type: "command";
          command: string;
      };

export type DialogueAction =
    | {
          type: "present-line";
          line: Line;
          continue: () => void;
      }
    | {
          type: "select-option";
          options: OptionItem[];
          continue: (option: OptionItem) => void;
      };

type Store = {
    vm: YarnVM;

    compiledProgram: YarnData | null;
    compiledProgramErrors: string[];

    variableStorage: Record<string, YarnValue>;

    history: DialogueHistoryItem[];
    startOrResumeProgram: (
        data: YarnData,
        options?: { restart?: boolean; startNode?: string },
    ) => void;
    setErrors: (errors: string[]) => void;

    programState: ProgramState | null;
    currentAction: DialogueAction | null;
};

const restoreVMState = (
    vm: YarnVM,
    originalProgram: Program,
    replacementProgram: Program,
    capturedState: ProgramState,
    variableStorage: VariableStorage,
) => {
    console.log("Hot reload began");

    const incomingNode = replacementProgram.nodes[capturedState.currentNode];
    if (!incomingNode) {
        console.warn(
            `Can't hot reload: no node ${vm.currentNodeName} in incoming program`,
        );
        return false;
    }

    if (
        originalProgram != replacementProgram &&
        (vm["callStack"] as unknown[]).length > 0
    ) {
        // We can't hot-reload while detoured, because we can't be sure that the
        // instruction pointer stored in the call stack points to the right
        // place anymore.
        console.warn(`Can't hot reload: unable to hot reload while detoured`);
        return false;
    }

    if (
        capturedState.programCounter < 0 ||
        capturedState.programCounter >= incomingNode.instructions.length
    ) {
        console.warn(
            `Can't hot reload: invalid new program counter ${capturedState.programCounter} (must be 0 <= x < ${incomingNode.instructions.length})`,
        );
        return false;
    }

    vm.loadProgram(replacementProgram);

    vm["currentNode"] = incomingNode;
    vm["optionSet"] = capturedState.pendingOptions;
    vm["stack"] = capturedState.vmStack;
    vm["_state"] = capturedState.vmExecutionState;
    vm["programCounter"] = Math.max(capturedState.programCounter, 0);
    vm["callStack"] = capturedState.vmCallStack;

    vm.variableStorage = { ...vm.variableStorage, ...variableStorage };

    return true;
};

export const useYarn = create<Store>()(
    persist(
        (set, get) => {
            console.log("Create state");
            const vm = new YarnVM();
            vm.onVariableSet = (variable, value) => {
                set({
                    variableStorage: Object.fromEntries([
                        ...Object.entries(get().variableStorage),
                        [variable, value],
                    ]),
                });
            };
            vm.lineCallback = (line, signal) =>
                new Promise((resolve) => {
                    console.log("Run line", line);
                    signal.onabort = () => resolve();

                    set({
                        programState: captureProgramState(vm),
                        history: [
                            ...get().history,
                            {
                                type: "line",
                                line: line,
                            },
                        ],
                        currentAction: {
                            type: "present-line",
                            line: line,
                            continue: () => {
                                set({
                                    currentAction: null,
                                });
                                resolve();
                            },
                        },
                    });
                });

            vm.commandCallback = (command) => {
                console.log("Run command", command);

                set({
                    programState: captureProgramState(vm),
                    history: [...get().history, { type: "command", command }],
                });
                return Promise.resolve();
            };

            vm.optionCallback = (options, signal) => {
                console.log("Run options", options);
                return new Promise((resolve) => {
                    signal.onabort = () => resolve(-1);

                    set({
                        programState: captureProgramState(vm),
                        currentAction: {
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
                                    currentAction: null,
                                });
                                resolve(opt.optionID);
                            },
                        },
                    });
                });
            };

            vm.dialogueCompleteCallback = () => {
                set({
                    programState: captureProgramState(vm),
                });
                return Promise.resolve();
            };

            const startOrResumeProgram = (
                data: YarnData,
                options?: {
                    resumeFrom?: {
                        state: ProgramState;
                        variableStorage: VariableStorage;
                    };
                    startNode?: string;
                },
            ) => {
                const newProgram = Program.fromBinary(
                    base64ToBytes(data.programData),
                );

                if (
                    options?.resumeFrom &&
                    restoreVMState(
                        vm,
                        newProgram,
                        newProgram,
                        options.resumeFrom.state,
                        options.resumeFrom.variableStorage,
                    )
                ) {
                    // Resume the dialogue
                    void vm.start();
                } else {
                    // Start a new run
                    set({
                        compiledProgram: data,
                        compiledProgramErrors: [],

                        programState: null,

                        currentAction: null,
                        history: [],
                    });
                    vm.loadProgram(newProgram);
                    vm.setNode(options?.startNode ?? "Start", true);
                    // Start the dialogue
                    void vm.start();
                }
            };

            return {
                history: [],
                vm: vm,
                compiledProgram: null,
                compiledProgramErrors: [],
                variableStorage: {},
                programState: null,
                currentAction: null,
                startOrResumeProgram,

                setErrors: (errors) => {
                    set({ compiledProgramErrors: errors });
                },
            } satisfies Store;
        },
        {
            name: "yarn-storage",
            partialize: (state) => ({
                // Select only the properties that can be serialized
                compiledProgram: state.compiledProgram,
                compiledProgramErrors: state.compiledProgramErrors,
                history: state.history,
                programState: state.programState,
                variableStorage: state.variableStorage,
            }),

            merge: (persistedState, currentState) => {
                // Merge in the loaded state into the current state, and then,
                // if we have a program state to work with, attempt to hot-load
                // it into the VM. If that works, set up the currentAction to
                // resume the VM in the same way as if it had never been
                // interrupted.
                const newState = {
                    ...currentState,
                    ...(persistedState as Store),
                };
                if (newState.compiledProgram && newState.programState) {
                    const program = Program.fromBinary(
                        base64ToBytes(newState.compiledProgram.programData),
                    );
                    const didResume = restoreVMState(
                        newState.vm,
                        program,
                        program,
                        newState.programState,
                        newState.variableStorage,
                    );
                    if (didResume) {
                        switch (newState.vm.state) {
                            case "stopped":
                                // We're stopped, so no action to take.
                                break;
                            case "waiting-on-option-selection":
                                newState.currentAction = {
                                    type: "select-option",
                                    options: newState.vm[
                                        "optionSet"
                                    ] as OptionItem[],
                                    continue: (optionItem) => {
                                        useYarn.setState({
                                            history: [
                                                ...useYarn.getState().history,
                                                {
                                                    type: "selected-option",
                                                    option: optionItem,
                                                },
                                            ],
                                            currentAction: null,
                                        });
                                        newState.vm.selectOption(
                                            optionItem.optionID,
                                        );
                                        void newState.vm.start();
                                    },
                                };
                                break;
                            case "waiting-for-continue":
                                newState.currentAction = {
                                    type: "present-line",
                                    line: newState.history.findLast(
                                        (i) => i.type == "line",
                                    )?.line ?? {
                                        id: "unknown",
                                        substitutions: [],
                                    },
                                    continue: () => {
                                        // We're currently "paused" on the
                                        // instruction that runs the line. To
                                        // continue, we manually advance to the
                                        // next instruction and start.
                                        newState.vm["programCounter"] += 1;
                                        useYarn.setState({
                                            currentAction: null,
                                        });
                                        return void newState.vm.start();
                                    },
                                };
                                break;
                            case "running":
                                // The VM was captured while it was still
                                // running, so just restart it.
                                void newState.vm.start();
                                break;
                        }
                    }
                }
                return newState;
            },

            storage: {
                getItem() {
                    return {
                        state: vscode.getState() as Store | null | undefined,
                    };
                },
                setItem(name, value) {
                    vscode.setState(value.state);
                },
                removeItem() {
                    vscode.setState(undefined);
                },
            },
        },
    ),
);
