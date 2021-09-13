import { YarnSpinnerLexer } from './YarnSpinnerLexer';
import { BodyContext, DialogueContext, HeaderContext, Jump_statementContext, NodeContext, YarnSpinnerParser } from './YarnSpinnerParser';
import * as antlr4ts from 'antlr4ts';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker'
import { ParserRuleContext, RecognitionException, Recognizer, Token } from 'antlr4ts';
import { ANTLRErrorListener } from 'antlr4ts';
import { YarnSpinnerParserListener } from './YarnSpinnerParserListener'

interface Error {
    line : number
    column : number
    length : number
    message : string
}

class ErrorListener implements ANTLRErrorListener<Token | number> {

    errors : Error[] = []

    syntaxError(recognizer: Recognizer<Token, any>, offendingSymbol: Token | number | undefined, line: number, charPositionInLine: number, msg: string, e: RecognitionException | undefined): void {

        var length : number;

        if (typeof offendingSymbol === 'number' ) {
            length = 1;
        } else {
            length = offendingSymbol?.text?.length ?? 1;
        }

        this.errors.push({
            line : line,
            column : charPositionInLine,
            length : length,
            message : msg,
        })
    }
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

export function parse(inputSource: string): {tree: SerializedParseNode, errors: Error[], parseContext: DialogueContext} {

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

    return {tree: root, errors: errorListener.errors, parseContext: tree};
}

