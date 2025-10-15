import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { clsx } from "clsx";

import YarnSpinnerLogo from "@/images/yarnspinner-logo.svg?react";

type Line = { id: string; speaker?: string; text: string };

const lines: Line[] = [
    {
        id: "line:01",
        speaker: "Edmund",
        text: "This is your novel, Baldrick?",
    },
    {
        id: "line:02",
        speaker: "Baldrick",
        text: "Yeah. I can’t stand long books.",
    },
    {
        id: "line:03",
        speaker: "Edmund",
        text: "\"Once upon a time, there was a lovely little sausage called 'Baldrick', and it lived happily ever after.\"",
    },
    {
        id: "line:04",
        speaker: "Baldrick",
        text: "It’s semi-autobiographical.",
    },
    {
        id: "line:05",
        speaker: "Edmund",
        text: "And it’s completely utterly awful. Dr. Johnson will probably love it.",
    },
];

function LineView(props: { line: Line; isCurrent?: boolean }) {
    return (
        <div
            title={props.line.id}
            className={clsx("mx-8 select-text", "box-content", {
                "ps-3 opacity-50": !props.isCurrent,
                "border-s-selected border-s-4 ps-2": props.isCurrent,
            })}
        >
            {props.line.speaker && (
                <span className="me-1 font-bold after:content-[':']">
                    {props.line.speaker}
                </span>
            )}
            {props.line.text}
        </div>
    );
}

export function StoryPreview() {
    return (
        <div className="flex h-full flex-col select-none">
            <div className="border-panel-border flex items-stretch justify-between border-b px-2 py-1 text-lg font-bold">
                <div className="flex items-center gap-1">
                    <YarnSpinnerLogo className="h-7" />
                    <div className="grow">Yarn Spinner Preview</div>
                </div>
                <div className="flex items-center">
                    <VSCodeButton appearance="secondary">Restart</VSCodeButton>
                </div>
            </div>
            <div className="flex grow flex-col gap-2 overflow-auto p-4">
                {lines.map((line, i) => (
                    <LineView
                        line={line}
                        key={i}
                        isCurrent={i == lines.length - 1}
                    />
                ))}
            </div>
            <div className="border-panel-border flex flex-col gap-2 overflow-auto border-t p-1 p-2 px-10">
                {[1, 2, 3].map((_, i) => (
                    <div key={i}>
                        <VSCodeButton className="w-full">
                            Option {i + 1}
                        </VSCodeButton>
                    </div>
                ))}
            </div>
        </div>
    );
}
