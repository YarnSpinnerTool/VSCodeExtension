import { YarnSpinnerLexer } from './YarnSpinnerLexer';
import { DialogueContext, HeaderContext, Jump_statementContext, NodeContext, YarnSpinnerParser } from './YarnSpinnerParser';
import * as antlr4ts from 'antlr4ts';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker'
import { ParserRuleContext, RecognitionException, Recognizer, Token } from 'antlr4ts';
import { ANTLRErrorListener } from 'antlr4ts';
import { YarnSpinnerParserListener } from './YarnSpinnerParserListener'

interface Error {
    line: number
    column: number
    length: number
    message: string
}

class ErrorListener implements ANTLRErrorListener<Token | number> {

    errors: Error[] = []

    syntaxError(recognizer: Recognizer<Token, any>, offendingSymbol: Token | number | undefined, line: number, charPositionInLine: number, msg: string, e: RecognitionException | undefined): void {

        var length: number;

        if (typeof offendingSymbol === 'number') {
            length = 1;
        } else {
            length = offendingSymbol?.text?.length ?? 1;
        }

        this.errors.push({
            line: line,
            column: charPositionInLine,
            length: length,
            message: msg,
        })
    }
}

interface Position {
    line: number;
    character: number
}

export class NodeInfo {
    title: string = "";
    position: { x: number, y: number } = { x: 0, y: 0 }
    destinations: string[] = []
    tags: string[] = []
    line: number = 0
    bodyLine: number = 0

    start: Position = { line: 0, character: 0 };
    end: Position = { line: 0, character: 0 };
}

export class SerializedParseNode {
    line: number = 0;
    column: number = 0;
    name: string = "";
    text: string = "";
    channel: string = "";
    children: SerializedParseNode[] = [];


    constructor(data: any | undefined) {

        if (!data) {
            return;
        }

        this.line = data["line"] || 0;
        this.column = data["column"] || 0;
        this.text = data["text"] || "";
        this.name = data["name"] || "";
        this.channel = data["channel"] || "";

        for (var child of data["children"] || []) {
            this.children.push(new SerializedParseNode(child));
        }
    }
}

export function parse(inputSource: string): { tree: SerializedParseNode, errors: Error[], parseContext: DialogueContext } {

    const errorListener = new ErrorListener();

    // Set up our lexer
    const chars = antlr4ts.CharStreams.fromString(inputSource);
    const lexer = new YarnSpinnerLexer(chars);

    // Set up our parser, using tokens from the lexer
    const tokens = new antlr4ts.CommonTokenStream(lexer);
    const parser = new YarnSpinnerParser(tokens);

    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);
    lexer.removeErrorListeners();
    lexer.addErrorListener(errorListener);

    // Parse the tokens!
    const tree = parser.dialogue();

    var stack: [ParseTree, SerializedParseNode | undefined][] = [];

    stack.push([tree, undefined]);

    var root = new SerializedParseNode(null);

    while (stack.length > 0) {
        const current = stack.pop();
        if (!current) {
            break;
        }
        const node = current[0];
        const parent = current[1];

        var newNode = new SerializedParseNode(null);

        if (!parent) {
            root = newNode;
        } else {
            parent.children.push(newNode);
        }



        if (typeof (node.payload as Token).tokenIndex !== 'undefined') {
            const token = node.payload as Token;

            newNode.channel = token.channel != YarnSpinnerLexer.DEFAULT_TOKEN_CHANNEL ? YarnSpinnerLexer.channelNames[token.channel] : "";

            newNode.name = YarnSpinnerLexer.VOCABULARY.getSymbolicName(token.type) || "";
            newNode.text = token.text || "";
            newNode.line = token.line;
            newNode.column = token.charPositionInLine;
        } else {
            const rule = node.payload as ParserRuleContext;

            var start = rule.start;
            newNode.name = YarnSpinnerParser.ruleNames[rule.ruleIndex];
            newNode.line = start.line;
            newNode.column = start.charPositionInLine;

            // Go through the list of children in reverse order and push
            // them onto the stack - we reverse them so that the next node
            // we traverse is the first child, and so on
            rule.children?.slice().reverse().forEach(child => {
                stack.push([child, newNode]);
            });
        }
    }

    return { tree: root, errors: errorListener.errors, parseContext: tree };
}

export function getNodeInfo(parseTree: DialogueContext): NodeInfo[] {
    class NodeListener implements YarnSpinnerParserListener {
        private currentNode?: NodeInfo

        jumps: { from: string, to: string }[] = []

        nodeInfos: NodeInfo[] = []

        enterNode(ctx: NodeContext) {
            this.currentNode = new NodeInfo()
            this.nodeInfos.push(this.currentNode)
            this.currentNode.line = ctx.start.line
            this.currentNode.bodyLine = ctx.BODY_START().symbol.line + 1;

            this.currentNode.start = { line: ctx.start.line - 1, character: ctx.start.charPositionInLine };
        }

        exitHeader(ctx: HeaderContext) {

            if (!this.currentNode) {
                throw new Error("Internal error: can't parse a header if we aren't in a node");
            }

            var headerKey = ctx._header_key.text;

            var headerValue = ctx._header_value?.text ?? "";

            if (headerKey === "title") {
                this.currentNode.title = headerValue;
            }

            if (headerKey === "position") {
                var coords = headerValue.trim().split(",").map(val => parseInt(val))

                if (coords.length == 2) {
                    this.currentNode.position = {
                        x: coords[0],
                        y: coords[1]
                    }
                }
            }

            if (headerKey === "tags") {
                this.currentNode.tags = headerValue.trim().split(" ");
            }
        }

        exitJump_statement(ctx: Jump_statementContext) {
            this.jumps.push({
                from: this.currentNode?.title ?? "<error!>",
                to: ctx._destination.text ?? "<error!>"
            })
        }

        exitNode(ctx: NodeContext) {
            if (!this.currentNode) {
                throw new Error('Internal error: Exited node but this.currentNode was undefined');
            }
            if (!ctx.stop) {
                // We don't have a stop token for some reason? use the
                // start token instead (this will effectively make this
                // node have a zero-length Range)
                this.currentNode.end = this.currentNode.start;
                return;
            }
            const stopTokenText = (ctx.stop?.text ?? "");

            this.currentNode.end = { line: ctx.stop.line - 1, character: ctx.start.charPositionInLine + stopTokenText.length };
        }
    }

    const listener = new NodeListener()

    ParseTreeWalker.DEFAULT.walk(listener as YarnSpinnerParserListener, parseTree);

    function getNode(title: string): NodeInfo | undefined {
        return listener.nodeInfos.filter(n => n.title === title)[0]
    };

    for (var link of listener.jumps) {
        const from = getNode(link.from);
        const to = getNode(link.to);

        if (from && to) {
            from.destinations.push(to.title);
        }
    }

    return listener.nodeInfos;
}