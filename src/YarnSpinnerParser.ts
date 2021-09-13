// Generated from src/YarnSpinnerParser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { YarnSpinnerParserListener } from "./YarnSpinnerParserListener";
import { YarnSpinnerParserVisitor } from "./YarnSpinnerParserVisitor";


export class YarnSpinnerParser extends Parser {
	public static readonly INDENT = 1;
	public static readonly DEDENT = 2;
	public static readonly WS = 3;
	public static readonly COMMENT = 4;
	public static readonly NEWLINE = 5;
	public static readonly ID = 6;
	public static readonly BODY_START = 7;
	public static readonly HEADER_DELIMITER = 8;
	public static readonly HASHTAG = 9;
	public static readonly REST_OF_LINE = 10;
	public static readonly BODY_WS = 11;
	public static readonly BODY_END = 12;
	public static readonly SHORTCUT_ARROW = 13;
	public static readonly COMMAND_START = 14;
	public static readonly EXPRESSION_START = 15;
	public static readonly TEXT_ESCAPE = 16;
	public static readonly TEXT_COMMENT = 17;
	public static readonly TEXT = 18;
	public static readonly TEXT_COMMANDHASHTAG_WS = 19;
	public static readonly TEXT_COMMANDHASHTAG_COMMENT = 20;
	public static readonly TEXT_COMMANDHASHTAG_ERROR = 21;
	public static readonly HASHTAG_WS = 22;
	public static readonly HASHTAG_TEXT = 23;
	public static readonly EXPR_WS = 24;
	public static readonly KEYWORD_TRUE = 25;
	public static readonly KEYWORD_FALSE = 26;
	public static readonly KEYWORD_NULL = 27;
	public static readonly OPERATOR_ASSIGNMENT = 28;
	public static readonly OPERATOR_LOGICAL_LESS_THAN_EQUALS = 29;
	public static readonly OPERATOR_LOGICAL_GREATER_THAN_EQUALS = 30;
	public static readonly OPERATOR_LOGICAL_EQUALS = 31;
	public static readonly OPERATOR_LOGICAL_LESS = 32;
	public static readonly OPERATOR_LOGICAL_GREATER = 33;
	public static readonly OPERATOR_LOGICAL_NOT_EQUALS = 34;
	public static readonly OPERATOR_LOGICAL_AND = 35;
	public static readonly OPERATOR_LOGICAL_OR = 36;
	public static readonly OPERATOR_LOGICAL_XOR = 37;
	public static readonly OPERATOR_LOGICAL_NOT = 38;
	public static readonly OPERATOR_MATHS_ADDITION_EQUALS = 39;
	public static readonly OPERATOR_MATHS_SUBTRACTION_EQUALS = 40;
	public static readonly OPERATOR_MATHS_MULTIPLICATION_EQUALS = 41;
	public static readonly OPERATOR_MATHS_MODULUS_EQUALS = 42;
	public static readonly OPERATOR_MATHS_DIVISION_EQUALS = 43;
	public static readonly OPERATOR_MATHS_ADDITION = 44;
	public static readonly OPERATOR_MATHS_SUBTRACTION = 45;
	public static readonly OPERATOR_MATHS_MULTIPLICATION = 46;
	public static readonly OPERATOR_MATHS_DIVISION = 47;
	public static readonly OPERATOR_MATHS_MODULUS = 48;
	public static readonly LPAREN = 49;
	public static readonly RPAREN = 50;
	public static readonly COMMA = 51;
	public static readonly EXPRESSION_AS = 52;
	public static readonly STRING = 53;
	public static readonly FUNC_ID = 54;
	public static readonly EXPRESSION_END = 55;
	public static readonly VAR_ID = 56;
	public static readonly DOT = 57;
	public static readonly NUMBER = 58;
	public static readonly COMMAND_WS = 59;
	public static readonly COMMAND_IF = 60;
	public static readonly COMMAND_ELSEIF = 61;
	public static readonly COMMAND_ELSE = 62;
	public static readonly COMMAND_SET = 63;
	public static readonly COMMAND_ENDIF = 64;
	public static readonly COMMAND_CALL = 65;
	public static readonly COMMAND_DECLARE = 66;
	public static readonly COMMAND_JUMP = 67;
	public static readonly COMMAND_ENUM = 68;
	public static readonly COMMAND_CASE = 69;
	public static readonly COMMAND_ENDENUM = 70;
	public static readonly COMMAND_LOCAL = 71;
	public static readonly COMMAND_END = 72;
	public static readonly COMMAND_TEXT_END = 73;
	public static readonly COMMAND_EXPRESSION_START = 74;
	public static readonly COMMAND_TEXT = 75;
	public static readonly TYPE_STRING = 76;
	public static readonly TYPE_NUMBER = 77;
	public static readonly TYPE_BOOL = 78;
	public static readonly RULE_dialogue = 0;
	public static readonly RULE_file_hashtag = 1;
	public static readonly RULE_node = 2;
	public static readonly RULE_header = 3;
	public static readonly RULE_body = 4;
	public static readonly RULE_statement = 5;
	public static readonly RULE_line_statement = 6;
	public static readonly RULE_line_formatted_text = 7;
	public static readonly RULE_hashtag = 8;
	public static readonly RULE_line_condition = 9;
	public static readonly RULE_expression = 10;
	public static readonly RULE_value = 11;
	public static readonly RULE_variable = 12;
	public static readonly RULE_function_call = 13;
	public static readonly RULE_if_statement = 14;
	public static readonly RULE_if_clause = 15;
	public static readonly RULE_else_if_clause = 16;
	public static readonly RULE_else_clause = 17;
	public static readonly RULE_set_statement = 18;
	public static readonly RULE_call_statement = 19;
	public static readonly RULE_command_statement = 20;
	public static readonly RULE_command_formatted_text = 21;
	public static readonly RULE_shortcut_option_statement = 22;
	public static readonly RULE_shortcut_option = 23;
	public static readonly RULE_declare_statement = 24;
	public static readonly RULE_jump_statement = 25;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"dialogue", "file_hashtag", "node", "header", "body", "statement", "line_statement", 
		"line_formatted_text", "hashtag", "line_condition", "expression", "value", 
		"variable", "function_call", "if_statement", "if_clause", "else_if_clause", 
		"else_clause", "set_statement", "call_statement", "command_statement", 
		"command_formatted_text", "shortcut_option_statement", "shortcut_option", 
		"declare_statement", "jump_statement",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		"'---'", undefined, "'#'", undefined, undefined, "'==='", "'->'", "'<<'", 
		undefined, "'\\'", undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, "'true'", "'false'", "'null'", undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, "'+='", "'-='", "'*='", "'%='", "'/='", 
		"'+'", "'-'", "'*'", "'/'", "'%'", "'('", "')'", "','", "'as'", undefined, 
		undefined, "'}'", undefined, "'.'", undefined, undefined, undefined, undefined, 
		undefined, undefined, "'endif'", undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, "'{'", undefined, 
		"'string'", "'number'", "'bool'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "INDENT", "DEDENT", "WS", "COMMENT", "NEWLINE", "ID", "BODY_START", 
		"HEADER_DELIMITER", "HASHTAG", "REST_OF_LINE", "BODY_WS", "BODY_END", 
		"SHORTCUT_ARROW", "COMMAND_START", "EXPRESSION_START", "TEXT_ESCAPE", 
		"TEXT_COMMENT", "TEXT", "TEXT_COMMANDHASHTAG_WS", "TEXT_COMMANDHASHTAG_COMMENT", 
		"TEXT_COMMANDHASHTAG_ERROR", "HASHTAG_WS", "HASHTAG_TEXT", "EXPR_WS", 
		"KEYWORD_TRUE", "KEYWORD_FALSE", "KEYWORD_NULL", "OPERATOR_ASSIGNMENT", 
		"OPERATOR_LOGICAL_LESS_THAN_EQUALS", "OPERATOR_LOGICAL_GREATER_THAN_EQUALS", 
		"OPERATOR_LOGICAL_EQUALS", "OPERATOR_LOGICAL_LESS", "OPERATOR_LOGICAL_GREATER", 
		"OPERATOR_LOGICAL_NOT_EQUALS", "OPERATOR_LOGICAL_AND", "OPERATOR_LOGICAL_OR", 
		"OPERATOR_LOGICAL_XOR", "OPERATOR_LOGICAL_NOT", "OPERATOR_MATHS_ADDITION_EQUALS", 
		"OPERATOR_MATHS_SUBTRACTION_EQUALS", "OPERATOR_MATHS_MULTIPLICATION_EQUALS", 
		"OPERATOR_MATHS_MODULUS_EQUALS", "OPERATOR_MATHS_DIVISION_EQUALS", "OPERATOR_MATHS_ADDITION", 
		"OPERATOR_MATHS_SUBTRACTION", "OPERATOR_MATHS_MULTIPLICATION", "OPERATOR_MATHS_DIVISION", 
		"OPERATOR_MATHS_MODULUS", "LPAREN", "RPAREN", "COMMA", "EXPRESSION_AS", 
		"STRING", "FUNC_ID", "EXPRESSION_END", "VAR_ID", "DOT", "NUMBER", "COMMAND_WS", 
		"COMMAND_IF", "COMMAND_ELSEIF", "COMMAND_ELSE", "COMMAND_SET", "COMMAND_ENDIF", 
		"COMMAND_CALL", "COMMAND_DECLARE", "COMMAND_JUMP", "COMMAND_ENUM", "COMMAND_CASE", 
		"COMMAND_ENDENUM", "COMMAND_LOCAL", "COMMAND_END", "COMMAND_TEXT_END", 
		"COMMAND_EXPRESSION_START", "COMMAND_TEXT", "TYPE_STRING", "TYPE_NUMBER", 
		"TYPE_BOOL",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(YarnSpinnerParser._LITERAL_NAMES, YarnSpinnerParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return YarnSpinnerParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "YarnSpinnerParser.g4"; }

	// @Override
	public get ruleNames(): string[] { return YarnSpinnerParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return YarnSpinnerParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(YarnSpinnerParser._ATN, this);
	}
	// @RuleVersion(0)
	public dialogue(): DialogueContext {
		let _localctx: DialogueContext = new DialogueContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, YarnSpinnerParser.RULE_dialogue);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			{
			this.state = 55;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === YarnSpinnerParser.HASHTAG) {
				{
				{
				this.state = 52;
				this.file_hashtag();
				}
				}
				this.state = 57;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 59;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 58;
				this.node();
				}
				}
				this.state = 61;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === YarnSpinnerParser.ID);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public file_hashtag(): File_hashtagContext {
		let _localctx: File_hashtagContext = new File_hashtagContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, YarnSpinnerParser.RULE_file_hashtag);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 63;
			this.match(YarnSpinnerParser.HASHTAG);
			this.state = 64;
			_localctx._text = this.match(YarnSpinnerParser.HASHTAG_TEXT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public node(): NodeContext {
		let _localctx: NodeContext = new NodeContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, YarnSpinnerParser.RULE_node);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 67;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 66;
				this.header();
				}
				}
				this.state = 69;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === YarnSpinnerParser.ID);
			this.state = 71;
			this.match(YarnSpinnerParser.BODY_START);
			this.state = 72;
			this.body();
			this.state = 73;
			this.match(YarnSpinnerParser.BODY_END);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public header(): HeaderContext {
		let _localctx: HeaderContext = new HeaderContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, YarnSpinnerParser.RULE_header);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 75;
			_localctx._header_key = this.match(YarnSpinnerParser.ID);
			this.state = 76;
			this.match(YarnSpinnerParser.HEADER_DELIMITER);
			this.state = 78;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === YarnSpinnerParser.REST_OF_LINE) {
				{
				this.state = 77;
				_localctx._header_value = this.match(YarnSpinnerParser.REST_OF_LINE);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public body(): BodyContext {
		let _localctx: BodyContext = new BodyContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, YarnSpinnerParser.RULE_body);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 83;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << YarnSpinnerParser.INDENT) | (1 << YarnSpinnerParser.SHORTCUT_ARROW) | (1 << YarnSpinnerParser.COMMAND_START) | (1 << YarnSpinnerParser.EXPRESSION_START) | (1 << YarnSpinnerParser.TEXT))) !== 0)) {
				{
				{
				this.state = 80;
				this.statement();
				}
				}
				this.state = 85;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public statement(): StatementContext {
		let _localctx: StatementContext = new StatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, YarnSpinnerParser.RULE_statement);
		let _la: number;
		try {
			this.state = 102;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 86;
				this.line_statement();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 87;
				this.if_statement();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 88;
				this.set_statement();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 89;
				this.shortcut_option_statement();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 90;
				this.call_statement();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 91;
				this.command_statement();
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 92;
				this.declare_statement();
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 93;
				this.jump_statement();
				}
				break;

			case 9:
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 94;
				this.match(YarnSpinnerParser.INDENT);
				this.state = 98;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << YarnSpinnerParser.INDENT) | (1 << YarnSpinnerParser.SHORTCUT_ARROW) | (1 << YarnSpinnerParser.COMMAND_START) | (1 << YarnSpinnerParser.EXPRESSION_START) | (1 << YarnSpinnerParser.TEXT))) !== 0)) {
					{
					{
					this.state = 95;
					this.statement();
					}
					}
					this.state = 100;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 101;
				this.match(YarnSpinnerParser.DEDENT);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public line_statement(): Line_statementContext {
		let _localctx: Line_statementContext = new Line_statementContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, YarnSpinnerParser.RULE_line_statement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 104;
			this.line_formatted_text();
			this.state = 106;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === YarnSpinnerParser.COMMAND_START) {
				{
				this.state = 105;
				this.line_condition();
				}
			}

			this.state = 111;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === YarnSpinnerParser.HASHTAG) {
				{
				{
				this.state = 108;
				this.hashtag();
				}
				}
				this.state = 113;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 114;
			this.match(YarnSpinnerParser.NEWLINE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public line_formatted_text(): Line_formatted_textContext {
		let _localctx: Line_formatted_textContext = new Line_formatted_textContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, YarnSpinnerParser.RULE_line_formatted_text);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 125;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				this.state = 125;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case YarnSpinnerParser.TEXT:
					{
					this.state = 117;
					this._errHandler.sync(this);
					_alt = 1;
					do {
						switch (_alt) {
						case 1:
							{
							{
							this.state = 116;
							this.match(YarnSpinnerParser.TEXT);
							}
							}
							break;
						default:
							throw new NoViableAltException(this);
						}
						this.state = 119;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 9, this._ctx);
					} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
					}
					break;
				case YarnSpinnerParser.EXPRESSION_START:
					{
					this.state = 121;
					this.match(YarnSpinnerParser.EXPRESSION_START);
					this.state = 122;
					this.expression(0);
					this.state = 123;
					this.match(YarnSpinnerParser.EXPRESSION_END);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 127;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === YarnSpinnerParser.EXPRESSION_START || _la === YarnSpinnerParser.TEXT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public hashtag(): HashtagContext {
		let _localctx: HashtagContext = new HashtagContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, YarnSpinnerParser.RULE_hashtag);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 129;
			this.match(YarnSpinnerParser.HASHTAG);
			this.state = 130;
			_localctx._text = this.match(YarnSpinnerParser.HASHTAG_TEXT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public line_condition(): Line_conditionContext {
		let _localctx: Line_conditionContext = new Line_conditionContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, YarnSpinnerParser.RULE_line_condition);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 132;
			this.match(YarnSpinnerParser.COMMAND_START);
			this.state = 133;
			this.match(YarnSpinnerParser.COMMAND_IF);
			this.state = 134;
			this.expression(0);
			this.state = 135;
			this.match(YarnSpinnerParser.COMMAND_END);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public expression(): ExpressionContext;
	public expression(_p: number): ExpressionContext;
	// @RuleVersion(0)
	public expression(_p?: number): ExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExpressionContext = new ExpressionContext(this._ctx, _parentState);
		let _prevctx: ExpressionContext = _localctx;
		let _startState: number = 20;
		this.enterRecursionRule(_localctx, 20, YarnSpinnerParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 147;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case YarnSpinnerParser.LPAREN:
				{
				_localctx = new ExpParensContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 138;
				this.match(YarnSpinnerParser.LPAREN);
				this.state = 139;
				this.expression(0);
				this.state = 140;
				this.match(YarnSpinnerParser.RPAREN);
				}
				break;
			case YarnSpinnerParser.OPERATOR_MATHS_SUBTRACTION:
				{
				_localctx = new ExpNegativeContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 142;
				(_localctx as ExpNegativeContext)._op = this.match(YarnSpinnerParser.OPERATOR_MATHS_SUBTRACTION);
				this.state = 143;
				this.expression(8);
				}
				break;
			case YarnSpinnerParser.OPERATOR_LOGICAL_NOT:
				{
				_localctx = new ExpNotContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 144;
				(_localctx as ExpNotContext)._op = this.match(YarnSpinnerParser.OPERATOR_LOGICAL_NOT);
				this.state = 145;
				this.expression(7);
				}
				break;
			case YarnSpinnerParser.KEYWORD_TRUE:
			case YarnSpinnerParser.KEYWORD_FALSE:
			case YarnSpinnerParser.KEYWORD_NULL:
			case YarnSpinnerParser.STRING:
			case YarnSpinnerParser.FUNC_ID:
			case YarnSpinnerParser.VAR_ID:
			case YarnSpinnerParser.NUMBER:
				{
				_localctx = new ExpValueContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 146;
				this.value();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 166;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 14, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 164;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 13, this._ctx) ) {
					case 1:
						{
						_localctx = new ExpMultDivModContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, YarnSpinnerParser.RULE_expression);
						this.state = 149;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 150;
						(_localctx as ExpMultDivModContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & ((1 << (YarnSpinnerParser.OPERATOR_MATHS_MULTIPLICATION - 46)) | (1 << (YarnSpinnerParser.OPERATOR_MATHS_DIVISION - 46)) | (1 << (YarnSpinnerParser.OPERATOR_MATHS_MODULUS - 46)))) !== 0))) {
							(_localctx as ExpMultDivModContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 151;
						this.expression(7);
						}
						break;

					case 2:
						{
						_localctx = new ExpAddSubContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, YarnSpinnerParser.RULE_expression);
						this.state = 152;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 153;
						(_localctx as ExpAddSubContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === YarnSpinnerParser.OPERATOR_MATHS_ADDITION || _la === YarnSpinnerParser.OPERATOR_MATHS_SUBTRACTION)) {
							(_localctx as ExpAddSubContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 154;
						this.expression(6);
						}
						break;

					case 3:
						{
						_localctx = new ExpComparisonContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, YarnSpinnerParser.RULE_expression);
						this.state = 155;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 156;
						(_localctx as ExpComparisonContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 29)) & ~0x1F) === 0 && ((1 << (_la - 29)) & ((1 << (YarnSpinnerParser.OPERATOR_LOGICAL_LESS_THAN_EQUALS - 29)) | (1 << (YarnSpinnerParser.OPERATOR_LOGICAL_GREATER_THAN_EQUALS - 29)) | (1 << (YarnSpinnerParser.OPERATOR_LOGICAL_LESS - 29)) | (1 << (YarnSpinnerParser.OPERATOR_LOGICAL_GREATER - 29)))) !== 0))) {
							(_localctx as ExpComparisonContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 157;
						this.expression(5);
						}
						break;

					case 4:
						{
						_localctx = new ExpEqualityContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, YarnSpinnerParser.RULE_expression);
						this.state = 158;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 159;
						(_localctx as ExpEqualityContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === YarnSpinnerParser.OPERATOR_LOGICAL_EQUALS || _la === YarnSpinnerParser.OPERATOR_LOGICAL_NOT_EQUALS)) {
							(_localctx as ExpEqualityContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 160;
						this.expression(4);
						}
						break;

					case 5:
						{
						_localctx = new ExpAndOrXorContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, YarnSpinnerParser.RULE_expression);
						this.state = 161;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 162;
						(_localctx as ExpAndOrXorContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (YarnSpinnerParser.OPERATOR_LOGICAL_AND - 35)) | (1 << (YarnSpinnerParser.OPERATOR_LOGICAL_OR - 35)) | (1 << (YarnSpinnerParser.OPERATOR_LOGICAL_XOR - 35)))) !== 0))) {
							(_localctx as ExpAndOrXorContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 163;
						this.expression(3);
						}
						break;
					}
					}
				}
				this.state = 168;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 14, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public value(): ValueContext {
		let _localctx: ValueContext = new ValueContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, YarnSpinnerParser.RULE_value);
		try {
			this.state = 176;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case YarnSpinnerParser.NUMBER:
				_localctx = new ValueNumberContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 169;
				this.match(YarnSpinnerParser.NUMBER);
				}
				break;
			case YarnSpinnerParser.KEYWORD_TRUE:
				_localctx = new ValueTrueContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 170;
				this.match(YarnSpinnerParser.KEYWORD_TRUE);
				}
				break;
			case YarnSpinnerParser.KEYWORD_FALSE:
				_localctx = new ValueFalseContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 171;
				this.match(YarnSpinnerParser.KEYWORD_FALSE);
				}
				break;
			case YarnSpinnerParser.VAR_ID:
				_localctx = new ValueVarContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 172;
				this.variable();
				}
				break;
			case YarnSpinnerParser.STRING:
				_localctx = new ValueStringContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 173;
				this.match(YarnSpinnerParser.STRING);
				}
				break;
			case YarnSpinnerParser.KEYWORD_NULL:
				_localctx = new ValueNullContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 174;
				this.match(YarnSpinnerParser.KEYWORD_NULL);
				}
				break;
			case YarnSpinnerParser.FUNC_ID:
				_localctx = new ValueFuncContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 175;
				this.function_call();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public variable(): VariableContext {
		let _localctx: VariableContext = new VariableContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, YarnSpinnerParser.RULE_variable);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 178;
			this.match(YarnSpinnerParser.VAR_ID);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public function_call(): Function_callContext {
		let _localctx: Function_callContext = new Function_callContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, YarnSpinnerParser.RULE_function_call);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 180;
			this.match(YarnSpinnerParser.FUNC_ID);
			this.state = 181;
			this.match(YarnSpinnerParser.LPAREN);
			this.state = 183;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << YarnSpinnerParser.KEYWORD_TRUE) | (1 << YarnSpinnerParser.KEYWORD_FALSE) | (1 << YarnSpinnerParser.KEYWORD_NULL))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (YarnSpinnerParser.OPERATOR_LOGICAL_NOT - 38)) | (1 << (YarnSpinnerParser.OPERATOR_MATHS_SUBTRACTION - 38)) | (1 << (YarnSpinnerParser.LPAREN - 38)) | (1 << (YarnSpinnerParser.STRING - 38)) | (1 << (YarnSpinnerParser.FUNC_ID - 38)) | (1 << (YarnSpinnerParser.VAR_ID - 38)) | (1 << (YarnSpinnerParser.NUMBER - 38)))) !== 0)) {
				{
				this.state = 182;
				this.expression(0);
				}
			}

			this.state = 189;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === YarnSpinnerParser.COMMA) {
				{
				{
				this.state = 185;
				this.match(YarnSpinnerParser.COMMA);
				this.state = 186;
				this.expression(0);
				}
				}
				this.state = 191;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 192;
			this.match(YarnSpinnerParser.RPAREN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public if_statement(): If_statementContext {
		let _localctx: If_statementContext = new If_statementContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, YarnSpinnerParser.RULE_if_statement);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 194;
			this.if_clause();
			this.state = 198;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 18, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 195;
					this.else_if_clause();
					}
					}
				}
				this.state = 200;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 18, this._ctx);
			}
			this.state = 202;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 19, this._ctx) ) {
			case 1:
				{
				this.state = 201;
				this.else_clause();
				}
				break;
			}
			this.state = 204;
			this.match(YarnSpinnerParser.COMMAND_START);
			this.state = 205;
			this.match(YarnSpinnerParser.COMMAND_ENDIF);
			this.state = 206;
			this.match(YarnSpinnerParser.COMMAND_END);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public if_clause(): If_clauseContext {
		let _localctx: If_clauseContext = new If_clauseContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, YarnSpinnerParser.RULE_if_clause);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 208;
			this.match(YarnSpinnerParser.COMMAND_START);
			this.state = 209;
			this.match(YarnSpinnerParser.COMMAND_IF);
			this.state = 210;
			this.expression(0);
			this.state = 211;
			this.match(YarnSpinnerParser.COMMAND_END);
			this.state = 215;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 20, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 212;
					this.statement();
					}
					}
				}
				this.state = 217;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 20, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public else_if_clause(): Else_if_clauseContext {
		let _localctx: Else_if_clauseContext = new Else_if_clauseContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, YarnSpinnerParser.RULE_else_if_clause);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 218;
			this.match(YarnSpinnerParser.COMMAND_START);
			this.state = 219;
			this.match(YarnSpinnerParser.COMMAND_ELSEIF);
			this.state = 220;
			this.expression(0);
			this.state = 221;
			this.match(YarnSpinnerParser.COMMAND_END);
			this.state = 225;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 21, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 222;
					this.statement();
					}
					}
				}
				this.state = 227;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 21, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public else_clause(): Else_clauseContext {
		let _localctx: Else_clauseContext = new Else_clauseContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, YarnSpinnerParser.RULE_else_clause);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 228;
			this.match(YarnSpinnerParser.COMMAND_START);
			this.state = 229;
			this.match(YarnSpinnerParser.COMMAND_ELSE);
			this.state = 230;
			this.match(YarnSpinnerParser.COMMAND_END);
			this.state = 234;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 22, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 231;
					this.statement();
					}
					}
				}
				this.state = 236;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 22, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public set_statement(): Set_statementContext {
		let _localctx: Set_statementContext = new Set_statementContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, YarnSpinnerParser.RULE_set_statement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 237;
			this.match(YarnSpinnerParser.COMMAND_START);
			this.state = 238;
			this.match(YarnSpinnerParser.COMMAND_SET);
			this.state = 239;
			this.variable();
			this.state = 240;
			_localctx._op = this._input.LT(1);
			_la = this._input.LA(1);
			if (!(((((_la - 28)) & ~0x1F) === 0 && ((1 << (_la - 28)) & ((1 << (YarnSpinnerParser.OPERATOR_ASSIGNMENT - 28)) | (1 << (YarnSpinnerParser.OPERATOR_MATHS_ADDITION_EQUALS - 28)) | (1 << (YarnSpinnerParser.OPERATOR_MATHS_SUBTRACTION_EQUALS - 28)) | (1 << (YarnSpinnerParser.OPERATOR_MATHS_MULTIPLICATION_EQUALS - 28)) | (1 << (YarnSpinnerParser.OPERATOR_MATHS_MODULUS_EQUALS - 28)) | (1 << (YarnSpinnerParser.OPERATOR_MATHS_DIVISION_EQUALS - 28)))) !== 0))) {
				_localctx._op = this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			this.state = 241;
			this.expression(0);
			this.state = 242;
			this.match(YarnSpinnerParser.COMMAND_END);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public call_statement(): Call_statementContext {
		let _localctx: Call_statementContext = new Call_statementContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, YarnSpinnerParser.RULE_call_statement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 244;
			this.match(YarnSpinnerParser.COMMAND_START);
			this.state = 245;
			this.match(YarnSpinnerParser.COMMAND_CALL);
			this.state = 246;
			this.function_call();
			this.state = 247;
			this.match(YarnSpinnerParser.COMMAND_END);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public command_statement(): Command_statementContext {
		let _localctx: Command_statementContext = new Command_statementContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, YarnSpinnerParser.RULE_command_statement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 249;
			this.match(YarnSpinnerParser.COMMAND_START);
			this.state = 250;
			this.command_formatted_text();
			this.state = 251;
			this.match(YarnSpinnerParser.COMMAND_TEXT_END);
			{
			this.state = 255;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === YarnSpinnerParser.HASHTAG) {
				{
				{
				this.state = 252;
				this.hashtag();
				}
				}
				this.state = 257;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public command_formatted_text(): Command_formatted_textContext {
		let _localctx: Command_formatted_textContext = new Command_formatted_textContext(this._ctx, this.state);
		this.enterRule(_localctx, 42, YarnSpinnerParser.RULE_command_formatted_text);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 265;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === YarnSpinnerParser.COMMAND_EXPRESSION_START || _la === YarnSpinnerParser.COMMAND_TEXT) {
				{
				this.state = 263;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case YarnSpinnerParser.COMMAND_TEXT:
					{
					this.state = 258;
					this.match(YarnSpinnerParser.COMMAND_TEXT);
					}
					break;
				case YarnSpinnerParser.COMMAND_EXPRESSION_START:
					{
					this.state = 259;
					this.match(YarnSpinnerParser.COMMAND_EXPRESSION_START);
					this.state = 260;
					this.expression(0);
					this.state = 261;
					this.match(YarnSpinnerParser.EXPRESSION_END);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 267;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public shortcut_option_statement(): Shortcut_option_statementContext {
		let _localctx: Shortcut_option_statementContext = new Shortcut_option_statementContext(this._ctx, this.state);
		this.enterRule(_localctx, 44, YarnSpinnerParser.RULE_shortcut_option_statement);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 269;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 268;
					this.shortcut_option();
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 271;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 26, this._ctx);
			} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public shortcut_option(): Shortcut_optionContext {
		let _localctx: Shortcut_optionContext = new Shortcut_optionContext(this._ctx, this.state);
		this.enterRule(_localctx, 46, YarnSpinnerParser.RULE_shortcut_option);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 273;
			this.match(YarnSpinnerParser.SHORTCUT_ARROW);
			this.state = 274;
			this.line_statement();
			this.state = 283;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 28, this._ctx) ) {
			case 1:
				{
				this.state = 275;
				this.match(YarnSpinnerParser.INDENT);
				this.state = 279;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << YarnSpinnerParser.INDENT) | (1 << YarnSpinnerParser.SHORTCUT_ARROW) | (1 << YarnSpinnerParser.COMMAND_START) | (1 << YarnSpinnerParser.EXPRESSION_START) | (1 << YarnSpinnerParser.TEXT))) !== 0)) {
					{
					{
					this.state = 276;
					this.statement();
					}
					}
					this.state = 281;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 282;
				this.match(YarnSpinnerParser.DEDENT);
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public declare_statement(): Declare_statementContext {
		let _localctx: Declare_statementContext = new Declare_statementContext(this._ctx, this.state);
		this.enterRule(_localctx, 48, YarnSpinnerParser.RULE_declare_statement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 285;
			this.match(YarnSpinnerParser.COMMAND_START);
			this.state = 286;
			this.match(YarnSpinnerParser.COMMAND_DECLARE);
			this.state = 287;
			this.variable();
			this.state = 288;
			this.match(YarnSpinnerParser.OPERATOR_ASSIGNMENT);
			this.state = 289;
			this.value();
			this.state = 292;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === YarnSpinnerParser.EXPRESSION_AS) {
				{
				this.state = 290;
				this.match(YarnSpinnerParser.EXPRESSION_AS);
				this.state = 291;
				_localctx._type = this.match(YarnSpinnerParser.FUNC_ID);
				}
			}

			this.state = 294;
			this.match(YarnSpinnerParser.COMMAND_END);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public jump_statement(): Jump_statementContext {
		let _localctx: Jump_statementContext = new Jump_statementContext(this._ctx, this.state);
		this.enterRule(_localctx, 50, YarnSpinnerParser.RULE_jump_statement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 296;
			this.match(YarnSpinnerParser.COMMAND_START);
			this.state = 297;
			this.match(YarnSpinnerParser.COMMAND_JUMP);
			this.state = 298;
			_localctx._destination = this.match(YarnSpinnerParser.ID);
			this.state = 299;
			this.match(YarnSpinnerParser.COMMAND_END);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 10:
			return this.expression_sempred(_localctx as ExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(_localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 6);

		case 1:
			return this.precpred(this._ctx, 5);

		case 2:
			return this.precpred(this._ctx, 4);

		case 3:
			return this.precpred(this._ctx, 3);

		case 4:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03P\u0130\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x03\x02\x07\x028" +
		"\n\x02\f\x02\x0E\x02;\v\x02\x03\x02\x06\x02>\n\x02\r\x02\x0E\x02?\x03" +
		"\x03\x03\x03\x03\x03\x03\x04\x06\x04F\n\x04\r\x04\x0E\x04G\x03\x04\x03" +
		"\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x05\x05Q\n\x05\x03\x06\x07" +
		"\x06T\n\x06\f\x06\x0E\x06W\v\x06\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07" +
		"\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x07\x07c\n\x07\f\x07\x0E\x07" +
		"f\v\x07\x03\x07\x05\x07i\n\x07\x03\b\x03\b\x05\bm\n\b\x03\b\x07\bp\n\b" +
		"\f\b\x0E\bs\v\b\x03\b\x03\b\x03\t\x06\tx\n\t\r\t\x0E\ty\x03\t\x03\t\x03" +
		"\t\x03\t\x06\t\x80\n\t\r\t\x0E\t\x81\x03\n\x03\n\x03\n\x03\v\x03\v\x03" +
		"\v\x03\v\x03\v\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x05\f\x96\n\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f" +
		"\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x07\f\xA7\n\f\f\f\x0E\f\xAA\v\f\x03" +
		"\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\xB3\n\r\x03\x0E\x03\x0E\x03" +
		"\x0F\x03\x0F\x03\x0F\x05\x0F\xBA\n\x0F\x03\x0F\x03\x0F\x07\x0F\xBE\n\x0F" +
		"\f\x0F\x0E\x0F\xC1\v\x0F\x03\x0F\x03\x0F\x03\x10\x03\x10\x07\x10\xC7\n" +
		"\x10\f\x10\x0E\x10\xCA\v\x10\x03\x10\x05\x10\xCD\n\x10\x03\x10\x03\x10" +
		"\x03\x10\x03\x10\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x07\x11\xD8\n" +
		"\x11\f\x11\x0E\x11\xDB\v\x11\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x07" +
		"\x12\xE2\n\x12\f\x12\x0E\x12\xE5\v\x12\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x07\x13\xEB\n\x13\f\x13\x0E\x13\xEE\v\x13\x03\x14\x03\x14\x03\x14\x03" +
		"\x14\x03\x14\x03\x14\x03\x14\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03" +
		"\x16\x03\x16\x03\x16\x03\x16\x07\x16\u0100\n\x16\f\x16\x0E\x16\u0103\v" +
		"\x16\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x07\x17\u010A\n\x17\f\x17" +
		"\x0E\x17\u010D\v\x17\x03\x18\x06\x18\u0110\n\x18\r\x18\x0E\x18\u0111\x03" +
		"\x19\x03\x19\x03\x19\x03\x19\x07\x19\u0118\n\x19\f\x19\x0E\x19\u011B\v" +
		"\x19\x03\x19\x05\x19\u011E\n\x19\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x05\x1A\u0127\n\x1A\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03" +
		"\x1B\x03\x1B\x03\x1B\x03\x1B\x02\x02\x03\x16\x1C\x02\x02\x04\x02\x06\x02" +
		"\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A" +
		"\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x02" +
		"4\x02\x02\b\x03\x0202\x03\x02./\x04\x02\x1F \"#\x04\x02!!$$\x03\x02%\'" +
		"\x04\x02\x1E\x1E)-\x02\u0144\x029\x03\x02\x02\x02\x04A\x03\x02\x02\x02" +
		"\x06E\x03\x02\x02\x02\bM\x03\x02\x02\x02\nU\x03\x02\x02\x02\fh\x03\x02" +
		"\x02\x02\x0Ej\x03\x02\x02\x02\x10\x7F\x03\x02\x02\x02\x12\x83\x03\x02" +
		"\x02\x02\x14\x86\x03\x02\x02\x02\x16\x95\x03\x02\x02\x02\x18\xB2\x03\x02" +
		"\x02\x02\x1A\xB4\x03\x02\x02\x02\x1C\xB6\x03\x02\x02\x02\x1E\xC4\x03\x02" +
		"\x02\x02 \xD2\x03\x02\x02\x02\"\xDC\x03\x02\x02\x02$\xE6\x03\x02\x02\x02" +
		"&\xEF\x03\x02\x02\x02(\xF6\x03\x02\x02\x02*\xFB\x03\x02\x02\x02,\u010B" +
		"\x03\x02\x02\x02.\u010F\x03\x02\x02\x020\u0113\x03\x02\x02\x022\u011F" +
		"\x03\x02\x02\x024\u012A\x03\x02\x02\x0268\x05\x04\x03\x0276\x03\x02\x02" +
		"\x028;\x03\x02\x02\x0297\x03\x02\x02\x029:\x03\x02\x02\x02:=\x03\x02\x02" +
		"\x02;9\x03\x02\x02\x02<>\x05\x06\x04\x02=<\x03\x02\x02\x02>?\x03\x02\x02" +
		"\x02?=\x03\x02\x02\x02?@\x03\x02\x02\x02@\x03\x03\x02\x02\x02AB\x07\v" +
		"\x02\x02BC\x07\x19\x02\x02C\x05\x03\x02\x02\x02DF\x05\b\x05\x02ED\x03" +
		"\x02\x02\x02FG\x03\x02\x02\x02GE\x03\x02\x02\x02GH\x03\x02\x02\x02HI\x03" +
		"\x02\x02\x02IJ\x07\t\x02\x02JK\x05\n\x06\x02KL\x07\x0E\x02\x02L\x07\x03" +
		"\x02\x02\x02MN\x07\b\x02\x02NP\x07\n\x02\x02OQ\x07\f\x02\x02PO\x03\x02" +
		"\x02\x02PQ\x03\x02\x02\x02Q\t\x03\x02\x02\x02RT\x05\f\x07\x02SR\x03\x02" +
		"\x02\x02TW\x03\x02\x02\x02US\x03\x02\x02\x02UV\x03\x02\x02\x02V\v\x03" +
		"\x02\x02\x02WU\x03\x02\x02\x02Xi\x05\x0E\b\x02Yi\x05\x1E\x10\x02Zi\x05" +
		"&\x14\x02[i\x05.\x18\x02\\i\x05(\x15\x02]i\x05*\x16\x02^i\x052\x1A\x02" +
		"_i\x054\x1B\x02`d\x07\x03\x02\x02ac\x05\f\x07\x02ba\x03\x02\x02\x02cf" +
		"\x03\x02\x02\x02db\x03\x02\x02\x02de\x03\x02\x02\x02eg\x03\x02\x02\x02" +
		"fd\x03\x02\x02\x02gi\x07\x04\x02\x02hX\x03\x02\x02\x02hY\x03\x02\x02\x02" +
		"hZ\x03\x02\x02\x02h[\x03\x02\x02\x02h\\\x03\x02\x02\x02h]\x03\x02\x02" +
		"\x02h^\x03\x02\x02\x02h_\x03\x02\x02\x02h`\x03\x02\x02\x02i\r\x03\x02" +
		"\x02\x02jl\x05\x10\t\x02km\x05\x14\v\x02lk\x03\x02\x02\x02lm\x03\x02\x02" +
		"\x02mq\x03\x02\x02\x02np\x05\x12\n\x02on\x03\x02\x02\x02ps\x03\x02\x02" +
		"\x02qo\x03\x02\x02\x02qr\x03\x02\x02\x02rt\x03\x02\x02\x02sq\x03\x02\x02" +
		"\x02tu\x07\x07\x02\x02u\x0F\x03\x02\x02\x02vx\x07\x14\x02\x02wv\x03\x02" +
		"\x02\x02xy\x03\x02\x02\x02yw\x03\x02\x02\x02yz\x03\x02\x02\x02z\x80\x03" +
		"\x02\x02\x02{|\x07\x11\x02\x02|}\x05\x16\f\x02}~\x079\x02\x02~\x80\x03" +
		"\x02\x02\x02\x7Fw\x03\x02\x02\x02\x7F{\x03\x02\x02\x02\x80\x81\x03\x02" +
		"\x02\x02\x81\x7F\x03\x02\x02\x02\x81\x82\x03\x02\x02\x02\x82\x11\x03\x02" +
		"\x02\x02\x83\x84\x07\v\x02\x02\x84\x85\x07\x19\x02\x02\x85\x13\x03\x02" +
		"\x02\x02\x86\x87\x07\x10\x02\x02\x87\x88\x07>\x02\x02\x88\x89\x05\x16" +
		"\f\x02\x89\x8A\x07J\x02\x02\x8A\x15\x03\x02\x02\x02\x8B\x8C\b\f\x01\x02" +
		"\x8C\x8D\x073\x02\x02\x8D\x8E\x05\x16\f\x02\x8E\x8F\x074\x02\x02\x8F\x96" +
		"\x03\x02\x02\x02\x90\x91\x07/\x02\x02\x91\x96\x05\x16\f\n\x92\x93\x07" +
		"(\x02\x02\x93\x96\x05\x16\f\t\x94\x96\x05\x18\r\x02\x95\x8B\x03\x02\x02" +
		"\x02\x95\x90\x03\x02\x02\x02\x95\x92\x03\x02\x02\x02\x95\x94\x03\x02\x02" +
		"\x02\x96\xA8\x03\x02\x02\x02\x97\x98\f\b\x02\x02\x98\x99\t\x02\x02\x02" +
		"\x99\xA7\x05\x16\f\t\x9A\x9B\f\x07\x02\x02\x9B\x9C\t\x03\x02\x02\x9C\xA7" +
		"\x05\x16\f\b\x9D\x9E\f\x06\x02\x02\x9E\x9F\t\x04\x02\x02\x9F\xA7\x05\x16" +
		"\f\x07\xA0\xA1\f\x05\x02\x02\xA1\xA2\t\x05\x02\x02\xA2\xA7\x05\x16\f\x06" +
		"\xA3\xA4\f\x04\x02\x02\xA4\xA5\t\x06\x02\x02\xA5\xA7\x05\x16\f\x05\xA6" +
		"\x97\x03\x02\x02\x02\xA6\x9A\x03\x02\x02\x02\xA6\x9D\x03\x02\x02\x02\xA6" +
		"\xA0\x03\x02\x02\x02\xA6\xA3\x03\x02\x02\x02\xA7\xAA\x03\x02\x02\x02\xA8" +
		"\xA6\x03\x02\x02\x02\xA8\xA9\x03\x02\x02\x02\xA9\x17\x03\x02\x02\x02\xAA" +
		"\xA8\x03\x02\x02\x02\xAB\xB3\x07<\x02\x02\xAC\xB3\x07\x1B\x02\x02\xAD" +
		"\xB3\x07\x1C\x02\x02\xAE\xB3\x05\x1A\x0E\x02\xAF\xB3\x077\x02\x02\xB0" +
		"\xB3\x07\x1D\x02\x02\xB1\xB3\x05\x1C\x0F\x02\xB2\xAB\x03\x02\x02\x02\xB2" +
		"\xAC\x03\x02\x02\x02\xB2\xAD\x03\x02\x02\x02\xB2\xAE\x03\x02\x02\x02\xB2" +
		"\xAF\x03\x02\x02\x02\xB2\xB0\x03\x02\x02\x02\xB2\xB1\x03\x02\x02\x02\xB3" +
		"\x19\x03\x02\x02\x02\xB4\xB5\x07:\x02\x02\xB5\x1B\x03\x02\x02\x02\xB6" +
		"\xB7\x078\x02\x02\xB7\xB9\x073\x02\x02\xB8\xBA\x05\x16\f\x02\xB9\xB8\x03" +
		"\x02\x02\x02\xB9\xBA\x03\x02\x02\x02\xBA\xBF\x03\x02\x02\x02\xBB\xBC\x07" +
		"5\x02\x02\xBC\xBE\x05\x16\f\x02\xBD\xBB\x03\x02\x02\x02\xBE\xC1\x03\x02" +
		"\x02\x02\xBF\xBD\x03\x02\x02\x02\xBF\xC0\x03\x02\x02\x02\xC0\xC2\x03\x02" +
		"\x02\x02\xC1\xBF\x03\x02\x02\x02\xC2\xC3\x074\x02\x02\xC3\x1D\x03\x02" +
		"\x02\x02\xC4\xC8\x05 \x11\x02\xC5\xC7\x05\"\x12\x02\xC6\xC5\x03\x02\x02" +
		"\x02\xC7\xCA\x03\x02\x02\x02\xC8\xC6\x03\x02\x02\x02\xC8\xC9\x03\x02\x02" +
		"\x02\xC9\xCC\x03\x02\x02\x02\xCA\xC8\x03\x02\x02\x02\xCB\xCD\x05$\x13" +
		"\x02\xCC\xCB\x03\x02\x02\x02\xCC\xCD\x03\x02\x02\x02\xCD\xCE\x03\x02\x02" +
		"\x02\xCE\xCF\x07\x10\x02\x02\xCF\xD0\x07B\x02\x02\xD0\xD1\x07J\x02\x02" +
		"\xD1\x1F\x03\x02\x02\x02\xD2\xD3\x07\x10\x02\x02\xD3\xD4\x07>\x02\x02" +
		"\xD4\xD5\x05\x16\f\x02\xD5\xD9\x07J\x02\x02\xD6\xD8\x05\f\x07\x02\xD7" +
		"\xD6\x03\x02\x02\x02\xD8\xDB\x03\x02\x02\x02\xD9\xD7\x03\x02\x02\x02\xD9" +
		"\xDA\x03\x02\x02\x02\xDA!\x03\x02\x02\x02\xDB\xD9\x03\x02\x02\x02\xDC" +
		"\xDD\x07\x10\x02\x02\xDD\xDE\x07?\x02\x02\xDE\xDF\x05\x16\f\x02\xDF\xE3" +
		"\x07J\x02\x02\xE0\xE2\x05\f\x07\x02\xE1\xE0\x03\x02\x02\x02\xE2\xE5\x03" +
		"\x02\x02\x02\xE3\xE1\x03\x02\x02\x02\xE3\xE4\x03\x02\x02\x02\xE4#\x03" +
		"\x02\x02\x02\xE5\xE3\x03\x02\x02\x02\xE6\xE7\x07\x10\x02\x02\xE7\xE8\x07" +
		"@\x02\x02\xE8\xEC\x07J\x02\x02\xE9\xEB\x05\f\x07\x02\xEA\xE9\x03\x02\x02" +
		"\x02\xEB\xEE\x03\x02\x02\x02\xEC\xEA\x03\x02\x02\x02\xEC\xED\x03\x02\x02" +
		"\x02\xED%\x03\x02\x02\x02\xEE\xEC\x03\x02\x02\x02\xEF\xF0\x07\x10\x02" +
		"\x02\xF0\xF1\x07A\x02\x02\xF1\xF2\x05\x1A\x0E\x02\xF2\xF3\t\x07\x02\x02" +
		"\xF3\xF4\x05\x16\f\x02\xF4\xF5\x07J\x02\x02\xF5\'\x03\x02\x02\x02\xF6" +
		"\xF7\x07\x10\x02\x02\xF7\xF8\x07C\x02\x02\xF8\xF9\x05\x1C\x0F\x02\xF9" +
		"\xFA\x07J\x02\x02\xFA)\x03\x02\x02\x02\xFB\xFC\x07\x10\x02\x02\xFC\xFD" +
		"\x05,\x17\x02\xFD\u0101\x07K\x02\x02\xFE\u0100\x05\x12\n\x02\xFF\xFE\x03" +
		"\x02\x02\x02\u0100\u0103\x03\x02\x02\x02\u0101\xFF\x03\x02\x02\x02\u0101" +
		"\u0102\x03\x02\x02\x02\u0102+\x03\x02\x02\x02\u0103\u0101\x03\x02\x02" +
		"\x02\u0104\u010A\x07M\x02\x02\u0105\u0106\x07L\x02\x02\u0106\u0107\x05" +
		"\x16\f\x02\u0107\u0108\x079\x02\x02\u0108\u010A\x03\x02\x02\x02\u0109" +
		"\u0104\x03\x02\x02\x02\u0109\u0105\x03\x02\x02\x02\u010A\u010D\x03\x02" +
		"\x02\x02\u010B\u0109\x03\x02\x02\x02\u010B\u010C\x03\x02\x02\x02\u010C" +
		"-\x03\x02\x02\x02\u010D\u010B\x03\x02\x02\x02\u010E\u0110\x050\x19\x02" +
		"\u010F\u010E\x03\x02\x02\x02\u0110\u0111\x03\x02\x02\x02\u0111\u010F\x03" +
		"\x02\x02\x02\u0111\u0112\x03\x02\x02\x02\u0112/\x03\x02\x02\x02\u0113" +
		"\u0114\x07\x0F\x02\x02\u0114\u011D\x05\x0E\b\x02\u0115\u0119\x07\x03\x02" +
		"\x02\u0116\u0118\x05\f\x07\x02\u0117\u0116\x03\x02\x02\x02\u0118\u011B" +
		"\x03\x02\x02\x02\u0119\u0117\x03\x02\x02\x02\u0119\u011A\x03\x02\x02\x02" +
		"\u011A\u011C\x03\x02\x02\x02\u011B\u0119\x03\x02\x02\x02\u011C\u011E\x07" +
		"\x04\x02\x02\u011D\u0115\x03\x02\x02\x02\u011D\u011E\x03\x02\x02\x02\u011E" +
		"1\x03\x02\x02\x02\u011F\u0120\x07\x10\x02\x02\u0120\u0121\x07D\x02\x02" +
		"\u0121\u0122\x05\x1A\x0E\x02\u0122\u0123\x07\x1E\x02\x02\u0123\u0126\x05" +
		"\x18\r\x02\u0124\u0125\x076\x02\x02\u0125\u0127\x078\x02\x02\u0126\u0124" +
		"\x03\x02\x02\x02\u0126\u0127\x03\x02\x02\x02\u0127\u0128\x03\x02\x02\x02" +
		"\u0128\u0129\x07J\x02\x02\u01293\x03\x02\x02\x02\u012A\u012B\x07\x10\x02" +
		"\x02\u012B\u012C\x07E\x02\x02\u012C\u012D\x07\b\x02\x02\u012D\u012E\x07" +
		"J\x02\x02\u012E5\x03\x02\x02\x02 9?GPUdhlqy\x7F\x81\x95\xA6\xA8\xB2\xB9" +
		"\xBF\xC8\xCC\xD9\xE3\xEC\u0101\u0109\u010B\u0111\u0119\u011D\u0126";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!YarnSpinnerParser.__ATN) {
			YarnSpinnerParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(YarnSpinnerParser._serializedATN));
		}

		return YarnSpinnerParser.__ATN;
	}

}

export class DialogueContext extends ParserRuleContext {
	public node(): NodeContext[];
	public node(i: number): NodeContext;
	public node(i?: number): NodeContext | NodeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NodeContext);
		} else {
			return this.getRuleContext(i, NodeContext);
		}
	}
	public file_hashtag(): File_hashtagContext[];
	public file_hashtag(i: number): File_hashtagContext;
	public file_hashtag(i?: number): File_hashtagContext | File_hashtagContext[] {
		if (i === undefined) {
			return this.getRuleContexts(File_hashtagContext);
		} else {
			return this.getRuleContext(i, File_hashtagContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_dialogue; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterDialogue) {
			listener.enterDialogue(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitDialogue) {
			listener.exitDialogue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitDialogue) {
			return visitor.visitDialogue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class File_hashtagContext extends ParserRuleContext {
	public _text!: Token;
	public HASHTAG(): TerminalNode { return this.getToken(YarnSpinnerParser.HASHTAG, 0); }
	public HASHTAG_TEXT(): TerminalNode { return this.getToken(YarnSpinnerParser.HASHTAG_TEXT, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_file_hashtag; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterFile_hashtag) {
			listener.enterFile_hashtag(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitFile_hashtag) {
			listener.exitFile_hashtag(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitFile_hashtag) {
			return visitor.visitFile_hashtag(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NodeContext extends ParserRuleContext {
	public BODY_START(): TerminalNode { return this.getToken(YarnSpinnerParser.BODY_START, 0); }
	public body(): BodyContext {
		return this.getRuleContext(0, BodyContext);
	}
	public BODY_END(): TerminalNode { return this.getToken(YarnSpinnerParser.BODY_END, 0); }
	public header(): HeaderContext[];
	public header(i: number): HeaderContext;
	public header(i?: number): HeaderContext | HeaderContext[] {
		if (i === undefined) {
			return this.getRuleContexts(HeaderContext);
		} else {
			return this.getRuleContext(i, HeaderContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_node; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterNode) {
			listener.enterNode(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitNode) {
			listener.exitNode(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitNode) {
			return visitor.visitNode(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class HeaderContext extends ParserRuleContext {
	public _header_key!: Token;
	public _header_value!: Token;
	public HEADER_DELIMITER(): TerminalNode { return this.getToken(YarnSpinnerParser.HEADER_DELIMITER, 0); }
	public ID(): TerminalNode { return this.getToken(YarnSpinnerParser.ID, 0); }
	public REST_OF_LINE(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.REST_OF_LINE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_header; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterHeader) {
			listener.enterHeader(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitHeader) {
			listener.exitHeader(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitHeader) {
			return visitor.visitHeader(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BodyContext extends ParserRuleContext {
	public statement(): StatementContext[];
	public statement(i: number): StatementContext;
	public statement(i?: number): StatementContext | StatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementContext);
		} else {
			return this.getRuleContext(i, StatementContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_body; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterBody) {
			listener.enterBody(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitBody) {
			listener.exitBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitBody) {
			return visitor.visitBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementContext extends ParserRuleContext {
	public line_statement(): Line_statementContext | undefined {
		return this.tryGetRuleContext(0, Line_statementContext);
	}
	public if_statement(): If_statementContext | undefined {
		return this.tryGetRuleContext(0, If_statementContext);
	}
	public set_statement(): Set_statementContext | undefined {
		return this.tryGetRuleContext(0, Set_statementContext);
	}
	public shortcut_option_statement(): Shortcut_option_statementContext | undefined {
		return this.tryGetRuleContext(0, Shortcut_option_statementContext);
	}
	public call_statement(): Call_statementContext | undefined {
		return this.tryGetRuleContext(0, Call_statementContext);
	}
	public command_statement(): Command_statementContext | undefined {
		return this.tryGetRuleContext(0, Command_statementContext);
	}
	public declare_statement(): Declare_statementContext | undefined {
		return this.tryGetRuleContext(0, Declare_statementContext);
	}
	public jump_statement(): Jump_statementContext | undefined {
		return this.tryGetRuleContext(0, Jump_statementContext);
	}
	public INDENT(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.INDENT, 0); }
	public DEDENT(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.DEDENT, 0); }
	public statement(): StatementContext[];
	public statement(i: number): StatementContext;
	public statement(i?: number): StatementContext | StatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementContext);
		} else {
			return this.getRuleContext(i, StatementContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_statement; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterStatement) {
			listener.enterStatement(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitStatement) {
			listener.exitStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitStatement) {
			return visitor.visitStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Line_statementContext extends ParserRuleContext {
	public line_formatted_text(): Line_formatted_textContext {
		return this.getRuleContext(0, Line_formatted_textContext);
	}
	public NEWLINE(): TerminalNode { return this.getToken(YarnSpinnerParser.NEWLINE, 0); }
	public line_condition(): Line_conditionContext | undefined {
		return this.tryGetRuleContext(0, Line_conditionContext);
	}
	public hashtag(): HashtagContext[];
	public hashtag(i: number): HashtagContext;
	public hashtag(i?: number): HashtagContext | HashtagContext[] {
		if (i === undefined) {
			return this.getRuleContexts(HashtagContext);
		} else {
			return this.getRuleContext(i, HashtagContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_line_statement; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterLine_statement) {
			listener.enterLine_statement(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitLine_statement) {
			listener.exitLine_statement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitLine_statement) {
			return visitor.visitLine_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Line_formatted_textContext extends ParserRuleContext {
	public EXPRESSION_START(): TerminalNode[];
	public EXPRESSION_START(i: number): TerminalNode;
	public EXPRESSION_START(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(YarnSpinnerParser.EXPRESSION_START);
		} else {
			return this.getToken(YarnSpinnerParser.EXPRESSION_START, i);
		}
	}
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public EXPRESSION_END(): TerminalNode[];
	public EXPRESSION_END(i: number): TerminalNode;
	public EXPRESSION_END(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(YarnSpinnerParser.EXPRESSION_END);
		} else {
			return this.getToken(YarnSpinnerParser.EXPRESSION_END, i);
		}
	}
	public TEXT(): TerminalNode[];
	public TEXT(i: number): TerminalNode;
	public TEXT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(YarnSpinnerParser.TEXT);
		} else {
			return this.getToken(YarnSpinnerParser.TEXT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_line_formatted_text; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterLine_formatted_text) {
			listener.enterLine_formatted_text(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitLine_formatted_text) {
			listener.exitLine_formatted_text(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitLine_formatted_text) {
			return visitor.visitLine_formatted_text(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class HashtagContext extends ParserRuleContext {
	public _text!: Token;
	public HASHTAG(): TerminalNode { return this.getToken(YarnSpinnerParser.HASHTAG, 0); }
	public HASHTAG_TEXT(): TerminalNode { return this.getToken(YarnSpinnerParser.HASHTAG_TEXT, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_hashtag; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterHashtag) {
			listener.enterHashtag(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitHashtag) {
			listener.exitHashtag(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitHashtag) {
			return visitor.visitHashtag(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Line_conditionContext extends ParserRuleContext {
	public COMMAND_START(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_START, 0); }
	public COMMAND_IF(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_IF, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public COMMAND_END(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_END, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_line_condition; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterLine_condition) {
			listener.enterLine_condition(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitLine_condition) {
			listener.exitLine_condition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitLine_condition) {
			return visitor.visitLine_condition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_expression; }
	public copyFrom(ctx: ExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class ExpParensContext extends ExpressionContext {
	public LPAREN(): TerminalNode { return this.getToken(YarnSpinnerParser.LPAREN, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(YarnSpinnerParser.RPAREN, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterExpParens) {
			listener.enterExpParens(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitExpParens) {
			listener.exitExpParens(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitExpParens) {
			return visitor.visitExpParens(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExpNegativeContext extends ExpressionContext {
	public _op!: Token;
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public OPERATOR_MATHS_SUBTRACTION(): TerminalNode { return this.getToken(YarnSpinnerParser.OPERATOR_MATHS_SUBTRACTION, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterExpNegative) {
			listener.enterExpNegative(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitExpNegative) {
			listener.exitExpNegative(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitExpNegative) {
			return visitor.visitExpNegative(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExpNotContext extends ExpressionContext {
	public _op!: Token;
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public OPERATOR_LOGICAL_NOT(): TerminalNode { return this.getToken(YarnSpinnerParser.OPERATOR_LOGICAL_NOT, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterExpNot) {
			listener.enterExpNot(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitExpNot) {
			listener.exitExpNot(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitExpNot) {
			return visitor.visitExpNot(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExpMultDivModContext extends ExpressionContext {
	public _op!: Token;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public OPERATOR_MATHS_MULTIPLICATION(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_MATHS_MULTIPLICATION, 0); }
	public OPERATOR_MATHS_DIVISION(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_MATHS_DIVISION, 0); }
	public OPERATOR_MATHS_MODULUS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_MATHS_MODULUS, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterExpMultDivMod) {
			listener.enterExpMultDivMod(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitExpMultDivMod) {
			listener.exitExpMultDivMod(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitExpMultDivMod) {
			return visitor.visitExpMultDivMod(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExpAddSubContext extends ExpressionContext {
	public _op!: Token;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public OPERATOR_MATHS_ADDITION(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_MATHS_ADDITION, 0); }
	public OPERATOR_MATHS_SUBTRACTION(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_MATHS_SUBTRACTION, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterExpAddSub) {
			listener.enterExpAddSub(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitExpAddSub) {
			listener.exitExpAddSub(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitExpAddSub) {
			return visitor.visitExpAddSub(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExpComparisonContext extends ExpressionContext {
	public _op!: Token;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public OPERATOR_LOGICAL_LESS_THAN_EQUALS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_LOGICAL_LESS_THAN_EQUALS, 0); }
	public OPERATOR_LOGICAL_GREATER_THAN_EQUALS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_LOGICAL_GREATER_THAN_EQUALS, 0); }
	public OPERATOR_LOGICAL_LESS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_LOGICAL_LESS, 0); }
	public OPERATOR_LOGICAL_GREATER(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_LOGICAL_GREATER, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterExpComparison) {
			listener.enterExpComparison(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitExpComparison) {
			listener.exitExpComparison(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitExpComparison) {
			return visitor.visitExpComparison(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExpEqualityContext extends ExpressionContext {
	public _op!: Token;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public OPERATOR_LOGICAL_EQUALS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_LOGICAL_EQUALS, 0); }
	public OPERATOR_LOGICAL_NOT_EQUALS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_LOGICAL_NOT_EQUALS, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterExpEquality) {
			listener.enterExpEquality(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitExpEquality) {
			listener.exitExpEquality(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitExpEquality) {
			return visitor.visitExpEquality(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExpAndOrXorContext extends ExpressionContext {
	public _op!: Token;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public OPERATOR_LOGICAL_AND(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_LOGICAL_AND, 0); }
	public OPERATOR_LOGICAL_OR(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_LOGICAL_OR, 0); }
	public OPERATOR_LOGICAL_XOR(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_LOGICAL_XOR, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterExpAndOrXor) {
			listener.enterExpAndOrXor(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitExpAndOrXor) {
			listener.exitExpAndOrXor(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitExpAndOrXor) {
			return visitor.visitExpAndOrXor(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExpValueContext extends ExpressionContext {
	public value(): ValueContext {
		return this.getRuleContext(0, ValueContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterExpValue) {
			listener.enterExpValue(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitExpValue) {
			listener.exitExpValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitExpValue) {
			return visitor.visitExpValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ValueContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_value; }
	public copyFrom(ctx: ValueContext): void {
		super.copyFrom(ctx);
	}
}
export class ValueNumberContext extends ValueContext {
	public NUMBER(): TerminalNode { return this.getToken(YarnSpinnerParser.NUMBER, 0); }
	constructor(ctx: ValueContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterValueNumber) {
			listener.enterValueNumber(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitValueNumber) {
			listener.exitValueNumber(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitValueNumber) {
			return visitor.visitValueNumber(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ValueTrueContext extends ValueContext {
	public KEYWORD_TRUE(): TerminalNode { return this.getToken(YarnSpinnerParser.KEYWORD_TRUE, 0); }
	constructor(ctx: ValueContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterValueTrue) {
			listener.enterValueTrue(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitValueTrue) {
			listener.exitValueTrue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitValueTrue) {
			return visitor.visitValueTrue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ValueFalseContext extends ValueContext {
	public KEYWORD_FALSE(): TerminalNode { return this.getToken(YarnSpinnerParser.KEYWORD_FALSE, 0); }
	constructor(ctx: ValueContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterValueFalse) {
			listener.enterValueFalse(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitValueFalse) {
			listener.exitValueFalse(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitValueFalse) {
			return visitor.visitValueFalse(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ValueVarContext extends ValueContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	constructor(ctx: ValueContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterValueVar) {
			listener.enterValueVar(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitValueVar) {
			listener.exitValueVar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitValueVar) {
			return visitor.visitValueVar(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ValueStringContext extends ValueContext {
	public STRING(): TerminalNode { return this.getToken(YarnSpinnerParser.STRING, 0); }
	constructor(ctx: ValueContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterValueString) {
			listener.enterValueString(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitValueString) {
			listener.exitValueString(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitValueString) {
			return visitor.visitValueString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ValueNullContext extends ValueContext {
	public KEYWORD_NULL(): TerminalNode { return this.getToken(YarnSpinnerParser.KEYWORD_NULL, 0); }
	constructor(ctx: ValueContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterValueNull) {
			listener.enterValueNull(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitValueNull) {
			listener.exitValueNull(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitValueNull) {
			return visitor.visitValueNull(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ValueFuncContext extends ValueContext {
	public function_call(): Function_callContext {
		return this.getRuleContext(0, Function_callContext);
	}
	constructor(ctx: ValueContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterValueFunc) {
			listener.enterValueFunc(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitValueFunc) {
			listener.exitValueFunc(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitValueFunc) {
			return visitor.visitValueFunc(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VariableContext extends ParserRuleContext {
	public VAR_ID(): TerminalNode { return this.getToken(YarnSpinnerParser.VAR_ID, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_variable; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterVariable) {
			listener.enterVariable(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitVariable) {
			listener.exitVariable(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitVariable) {
			return visitor.visitVariable(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Function_callContext extends ParserRuleContext {
	public FUNC_ID(): TerminalNode { return this.getToken(YarnSpinnerParser.FUNC_ID, 0); }
	public LPAREN(): TerminalNode { return this.getToken(YarnSpinnerParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(YarnSpinnerParser.RPAREN, 0); }
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(YarnSpinnerParser.COMMA);
		} else {
			return this.getToken(YarnSpinnerParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_function_call; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterFunction_call) {
			listener.enterFunction_call(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitFunction_call) {
			listener.exitFunction_call(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitFunction_call) {
			return visitor.visitFunction_call(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class If_statementContext extends ParserRuleContext {
	public if_clause(): If_clauseContext {
		return this.getRuleContext(0, If_clauseContext);
	}
	public COMMAND_START(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_START, 0); }
	public COMMAND_ENDIF(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_ENDIF, 0); }
	public COMMAND_END(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_END, 0); }
	public else_if_clause(): Else_if_clauseContext[];
	public else_if_clause(i: number): Else_if_clauseContext;
	public else_if_clause(i?: number): Else_if_clauseContext | Else_if_clauseContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Else_if_clauseContext);
		} else {
			return this.getRuleContext(i, Else_if_clauseContext);
		}
	}
	public else_clause(): Else_clauseContext | undefined {
		return this.tryGetRuleContext(0, Else_clauseContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_if_statement; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterIf_statement) {
			listener.enterIf_statement(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitIf_statement) {
			listener.exitIf_statement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitIf_statement) {
			return visitor.visitIf_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class If_clauseContext extends ParserRuleContext {
	public COMMAND_START(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_START, 0); }
	public COMMAND_IF(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_IF, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public COMMAND_END(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_END, 0); }
	public statement(): StatementContext[];
	public statement(i: number): StatementContext;
	public statement(i?: number): StatementContext | StatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementContext);
		} else {
			return this.getRuleContext(i, StatementContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_if_clause; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterIf_clause) {
			listener.enterIf_clause(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitIf_clause) {
			listener.exitIf_clause(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitIf_clause) {
			return visitor.visitIf_clause(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Else_if_clauseContext extends ParserRuleContext {
	public COMMAND_START(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_START, 0); }
	public COMMAND_ELSEIF(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_ELSEIF, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public COMMAND_END(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_END, 0); }
	public statement(): StatementContext[];
	public statement(i: number): StatementContext;
	public statement(i?: number): StatementContext | StatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementContext);
		} else {
			return this.getRuleContext(i, StatementContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_else_if_clause; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterElse_if_clause) {
			listener.enterElse_if_clause(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitElse_if_clause) {
			listener.exitElse_if_clause(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitElse_if_clause) {
			return visitor.visitElse_if_clause(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Else_clauseContext extends ParserRuleContext {
	public COMMAND_START(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_START, 0); }
	public COMMAND_ELSE(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_ELSE, 0); }
	public COMMAND_END(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_END, 0); }
	public statement(): StatementContext[];
	public statement(i: number): StatementContext;
	public statement(i?: number): StatementContext | StatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementContext);
		} else {
			return this.getRuleContext(i, StatementContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_else_clause; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterElse_clause) {
			listener.enterElse_clause(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitElse_clause) {
			listener.exitElse_clause(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitElse_clause) {
			return visitor.visitElse_clause(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Set_statementContext extends ParserRuleContext {
	public _op!: Token;
	public COMMAND_START(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_START, 0); }
	public COMMAND_SET(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_SET, 0); }
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public COMMAND_END(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_END, 0); }
	public OPERATOR_ASSIGNMENT(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_ASSIGNMENT, 0); }
	public OPERATOR_MATHS_MULTIPLICATION_EQUALS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_MATHS_MULTIPLICATION_EQUALS, 0); }
	public OPERATOR_MATHS_DIVISION_EQUALS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_MATHS_DIVISION_EQUALS, 0); }
	public OPERATOR_MATHS_MODULUS_EQUALS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_MATHS_MODULUS_EQUALS, 0); }
	public OPERATOR_MATHS_ADDITION_EQUALS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_MATHS_ADDITION_EQUALS, 0); }
	public OPERATOR_MATHS_SUBTRACTION_EQUALS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.OPERATOR_MATHS_SUBTRACTION_EQUALS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_set_statement; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterSet_statement) {
			listener.enterSet_statement(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitSet_statement) {
			listener.exitSet_statement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitSet_statement) {
			return visitor.visitSet_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Call_statementContext extends ParserRuleContext {
	public COMMAND_START(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_START, 0); }
	public COMMAND_CALL(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_CALL, 0); }
	public function_call(): Function_callContext {
		return this.getRuleContext(0, Function_callContext);
	}
	public COMMAND_END(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_END, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_call_statement; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterCall_statement) {
			listener.enterCall_statement(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitCall_statement) {
			listener.exitCall_statement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitCall_statement) {
			return visitor.visitCall_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Command_statementContext extends ParserRuleContext {
	public COMMAND_START(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_START, 0); }
	public command_formatted_text(): Command_formatted_textContext {
		return this.getRuleContext(0, Command_formatted_textContext);
	}
	public COMMAND_TEXT_END(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_TEXT_END, 0); }
	public hashtag(): HashtagContext[];
	public hashtag(i: number): HashtagContext;
	public hashtag(i?: number): HashtagContext | HashtagContext[] {
		if (i === undefined) {
			return this.getRuleContexts(HashtagContext);
		} else {
			return this.getRuleContext(i, HashtagContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_command_statement; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterCommand_statement) {
			listener.enterCommand_statement(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitCommand_statement) {
			listener.exitCommand_statement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitCommand_statement) {
			return visitor.visitCommand_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Command_formatted_textContext extends ParserRuleContext {
	public COMMAND_TEXT(): TerminalNode[];
	public COMMAND_TEXT(i: number): TerminalNode;
	public COMMAND_TEXT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(YarnSpinnerParser.COMMAND_TEXT);
		} else {
			return this.getToken(YarnSpinnerParser.COMMAND_TEXT, i);
		}
	}
	public COMMAND_EXPRESSION_START(): TerminalNode[];
	public COMMAND_EXPRESSION_START(i: number): TerminalNode;
	public COMMAND_EXPRESSION_START(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(YarnSpinnerParser.COMMAND_EXPRESSION_START);
		} else {
			return this.getToken(YarnSpinnerParser.COMMAND_EXPRESSION_START, i);
		}
	}
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public EXPRESSION_END(): TerminalNode[];
	public EXPRESSION_END(i: number): TerminalNode;
	public EXPRESSION_END(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(YarnSpinnerParser.EXPRESSION_END);
		} else {
			return this.getToken(YarnSpinnerParser.EXPRESSION_END, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_command_formatted_text; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterCommand_formatted_text) {
			listener.enterCommand_formatted_text(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitCommand_formatted_text) {
			listener.exitCommand_formatted_text(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitCommand_formatted_text) {
			return visitor.visitCommand_formatted_text(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Shortcut_option_statementContext extends ParserRuleContext {
	public shortcut_option(): Shortcut_optionContext[];
	public shortcut_option(i: number): Shortcut_optionContext;
	public shortcut_option(i?: number): Shortcut_optionContext | Shortcut_optionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(Shortcut_optionContext);
		} else {
			return this.getRuleContext(i, Shortcut_optionContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_shortcut_option_statement; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterShortcut_option_statement) {
			listener.enterShortcut_option_statement(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitShortcut_option_statement) {
			listener.exitShortcut_option_statement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitShortcut_option_statement) {
			return visitor.visitShortcut_option_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Shortcut_optionContext extends ParserRuleContext {
	public SHORTCUT_ARROW(): TerminalNode { return this.getToken(YarnSpinnerParser.SHORTCUT_ARROW, 0); }
	public line_statement(): Line_statementContext {
		return this.getRuleContext(0, Line_statementContext);
	}
	public INDENT(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.INDENT, 0); }
	public DEDENT(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.DEDENT, 0); }
	public statement(): StatementContext[];
	public statement(i: number): StatementContext;
	public statement(i?: number): StatementContext | StatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementContext);
		} else {
			return this.getRuleContext(i, StatementContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_shortcut_option; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterShortcut_option) {
			listener.enterShortcut_option(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitShortcut_option) {
			listener.exitShortcut_option(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitShortcut_option) {
			return visitor.visitShortcut_option(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Declare_statementContext extends ParserRuleContext {
	public _type!: Token;
	public COMMAND_START(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_START, 0); }
	public COMMAND_DECLARE(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_DECLARE, 0); }
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public OPERATOR_ASSIGNMENT(): TerminalNode { return this.getToken(YarnSpinnerParser.OPERATOR_ASSIGNMENT, 0); }
	public value(): ValueContext {
		return this.getRuleContext(0, ValueContext);
	}
	public COMMAND_END(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_END, 0); }
	public EXPRESSION_AS(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.EXPRESSION_AS, 0); }
	public FUNC_ID(): TerminalNode | undefined { return this.tryGetToken(YarnSpinnerParser.FUNC_ID, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_declare_statement; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterDeclare_statement) {
			listener.enterDeclare_statement(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitDeclare_statement) {
			listener.exitDeclare_statement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitDeclare_statement) {
			return visitor.visitDeclare_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Jump_statementContext extends ParserRuleContext {
	public _destination!: Token;
	public COMMAND_START(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_START, 0); }
	public COMMAND_JUMP(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_JUMP, 0); }
	public COMMAND_END(): TerminalNode { return this.getToken(YarnSpinnerParser.COMMAND_END, 0); }
	public ID(): TerminalNode { return this.getToken(YarnSpinnerParser.ID, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return YarnSpinnerParser.RULE_jump_statement; }
	// @Override
	public enterRule(listener: YarnSpinnerParserListener): void {
		if (listener.enterJump_statement) {
			listener.enterJump_statement(this);
		}
	}
	// @Override
	public exitRule(listener: YarnSpinnerParserListener): void {
		if (listener.exitJump_statement) {
			listener.exitJump_statement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: YarnSpinnerParserVisitor<Result>): Result {
		if (visitor.visitJump_statement) {
			return visitor.visitJump_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


