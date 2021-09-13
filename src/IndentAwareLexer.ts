import { CommonToken, Lexer, Token, Vocabulary } from 'antlr4ts';
import { YarnSpinnerLexer } from './YarnSpinnerLexer';

export default abstract class IndentAwareLexer extends Lexer {
    indents: number[] = [];

    pendingTokens: Token[] = [];

    nextToken(): Token {
        if (this._hitEOF && this.pendingTokens.length > 0) {
            // We have hit the EOF, but we have tokens still pending. Start
            // returning those tokens.
            return this.pendingTokens.shift() as Token;
        }
        else if (this.inputStream.size == 0) {
            // There's no more incoming symbols, and we don't have anything
            // pending, so we've hit the end of the file.
            this._hitEOF = true;

            // Return the EOF token.
            return new CommonToken(Lexer.EOF, "<EOF>");
        }
        else {
            // Get the next token, which will enqueue one or more new
            // tokens into the pending tokens queue.
            this.checkNextToken();

            if (this.pendingTokens.length > 0) {
                // Then, return a single token from the queue.
                return this.pendingTokens.shift() as Token;
            }
            else {
                // Nothing left in the queue. Return EOF.
                return this.emitEOF();
            }
        }
    }

    checkNextToken() {
        var currentToken = super.nextToken();

        switch (currentToken.type) {
            case YarnSpinnerLexer.NEWLINE:
                // Insert indents or dedents depending on the next token's
                // indentation, and enqueues the newline at the correct
                // place
                this.handleNewLineToken(currentToken);
                break;
            case Lexer.EOF:
                // Insert dedents before the end of the file, and then
                // enqueues the EOF.
                this.handleEndOfFileToken(currentToken);
                break;
            default:
                this.pendingTokens.push(currentToken);
                break;
        }
    }
    handleNewLineToken(currentToken: Token) {
        // We're about to go to a new line. Look ahead to see how indented
        // it is.

        // insert the current NEWLINE token
        this.pendingTokens.push(currentToken);

        const currentIndentationLength = this.getLengthOfNewlineToken(currentToken);

        var previousIndent: number;
        if (this.indents.length > 0) {
            previousIndent = this.indents[this.indents.length - 1];
        }
        else {
            previousIndent = 0;
        }

        if (currentIndentationLength > previousIndent) {
            // We are more indented on this line than on the previous line.
            // Insert an indentation token, and record the new indent
            // level.
            this.indents.push(currentIndentationLength);

            this.insertToken(`<indent to ${currentIndentationLength}>`, YarnSpinnerLexer.INDENT);
        }
        else if (currentIndentationLength < previousIndent) {
            // We are less indented on this line than on the previous line.
            // For each level of indentation we're now lower than, insert a
            // dedent token and remove that indentation level.
            while (currentIndentationLength < previousIndent) {
                // Remove this indent from the stack and generate a dedent
                // token for it.
                previousIndent = this.indents.pop() as number;
                this.insertToken(`<dedent from ${previousIndent}>`, YarnSpinnerLexer.DEDENT);

                // Figure out the level of indentation we're on - either
                // the top of the indent stack (if we have any indentations
                // left), or zero.
                if (this.indents.length > 0) {
                    previousIndent = this.indents[this.indents.length - 1];
                }
                else {
                    previousIndent = 0;
                }
            }
        }
    }
    getLengthOfNewlineToken(currentToken: Token): number {
        if (currentToken.type != YarnSpinnerLexer.NEWLINE) {
            throw new Error(`expected currentToken to be a NEWLINE (${YarnSpinnerLexer.NEWLINE}), not ${currentToken.type}`);
        }

        var length = 0;
        var sawSpaces = false;
        var sawTabs = false;

        for (var c of (currentToken.text as string)) {
            switch (c) {
                case ' ':
                    length += 1;
                    sawSpaces = true;
                    break;
                case '\t':
                    sawTabs = true;
                    length += 8;
                    break;
            }
        }

        if (sawSpaces && sawTabs) {
            // this.warnings.Add(new Warning { Token = currentToken,
            // Message = "Indentation contains tabs and spaces" });
        }

        return length;
    }
    handleEndOfFileToken(currentToken: Token) {
        // We're at the end of the file. Emit as many dedents as we
        // currently have on the stack.
        while (this.indents.length > 0) {
            var indent = this.indents.pop();
            this.insertToken(`<dedent: ${indent}>`, YarnSpinnerLexer.DEDENT);
        }

        // Finally, enqueue the EOF token.
        this.pendingTokens.push(currentToken);
    }
    insertToken(text: string, type: number) {
        const startIndex = this._tokenStartCharIndex + this.text.length;
        this.insertTokenFull(startIndex, startIndex - 1, text, type, this.line, this.charPositionInLine);
    }
    insertTokenFull(startIndex: number, stopIndex: number, text: string, type: number, line: any, column: any) {
        // var tokenFactorySourcePair = Tuple.Create((ITokenSource)this,
        // (ICharStream)this.InputStream);

        var token = new CommonToken(type, text, { source: this, stream: this.inputStream }, YarnSpinnerLexer.DEFAULT_TOKEN_CHANNEL, startIndex, stopIndex);

        token.line = line;
        token.charPositionInLine = column;


        this.pendingTokens.push(token);
    }
}
