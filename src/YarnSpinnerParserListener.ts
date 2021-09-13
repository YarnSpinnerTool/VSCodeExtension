// Generated from src/YarnSpinnerParser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { ValueNumberContext } from "./YarnSpinnerParser";
import { ValueTrueContext } from "./YarnSpinnerParser";
import { ValueFalseContext } from "./YarnSpinnerParser";
import { ValueVarContext } from "./YarnSpinnerParser";
import { ValueStringContext } from "./YarnSpinnerParser";
import { ValueNullContext } from "./YarnSpinnerParser";
import { ValueFuncContext } from "./YarnSpinnerParser";
import { ExpParensContext } from "./YarnSpinnerParser";
import { ExpNegativeContext } from "./YarnSpinnerParser";
import { ExpNotContext } from "./YarnSpinnerParser";
import { ExpMultDivModContext } from "./YarnSpinnerParser";
import { ExpAddSubContext } from "./YarnSpinnerParser";
import { ExpComparisonContext } from "./YarnSpinnerParser";
import { ExpEqualityContext } from "./YarnSpinnerParser";
import { ExpAndOrXorContext } from "./YarnSpinnerParser";
import { ExpValueContext } from "./YarnSpinnerParser";
import { DialogueContext } from "./YarnSpinnerParser";
import { File_hashtagContext } from "./YarnSpinnerParser";
import { NodeContext } from "./YarnSpinnerParser";
import { HeaderContext } from "./YarnSpinnerParser";
import { BodyContext } from "./YarnSpinnerParser";
import { StatementContext } from "./YarnSpinnerParser";
import { Line_statementContext } from "./YarnSpinnerParser";
import { Line_formatted_textContext } from "./YarnSpinnerParser";
import { HashtagContext } from "./YarnSpinnerParser";
import { Line_conditionContext } from "./YarnSpinnerParser";
import { ExpressionContext } from "./YarnSpinnerParser";
import { ValueContext } from "./YarnSpinnerParser";
import { VariableContext } from "./YarnSpinnerParser";
import { Function_callContext } from "./YarnSpinnerParser";
import { If_statementContext } from "./YarnSpinnerParser";
import { If_clauseContext } from "./YarnSpinnerParser";
import { Else_if_clauseContext } from "./YarnSpinnerParser";
import { Else_clauseContext } from "./YarnSpinnerParser";
import { Set_statementContext } from "./YarnSpinnerParser";
import { Call_statementContext } from "./YarnSpinnerParser";
import { Command_statementContext } from "./YarnSpinnerParser";
import { Command_formatted_textContext } from "./YarnSpinnerParser";
import { Shortcut_option_statementContext } from "./YarnSpinnerParser";
import { Shortcut_optionContext } from "./YarnSpinnerParser";
import { Declare_statementContext } from "./YarnSpinnerParser";
import { Jump_statementContext } from "./YarnSpinnerParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `YarnSpinnerParser`.
 */
export interface YarnSpinnerParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `valueNumber`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	enterValueNumber?: (ctx: ValueNumberContext) => void;
	/**
	 * Exit a parse tree produced by the `valueNumber`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	exitValueNumber?: (ctx: ValueNumberContext) => void;

	/**
	 * Enter a parse tree produced by the `valueTrue`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	enterValueTrue?: (ctx: ValueTrueContext) => void;
	/**
	 * Exit a parse tree produced by the `valueTrue`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	exitValueTrue?: (ctx: ValueTrueContext) => void;

	/**
	 * Enter a parse tree produced by the `valueFalse`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	enterValueFalse?: (ctx: ValueFalseContext) => void;
	/**
	 * Exit a parse tree produced by the `valueFalse`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	exitValueFalse?: (ctx: ValueFalseContext) => void;

	/**
	 * Enter a parse tree produced by the `valueVar`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	enterValueVar?: (ctx: ValueVarContext) => void;
	/**
	 * Exit a parse tree produced by the `valueVar`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	exitValueVar?: (ctx: ValueVarContext) => void;

	/**
	 * Enter a parse tree produced by the `valueString`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	enterValueString?: (ctx: ValueStringContext) => void;
	/**
	 * Exit a parse tree produced by the `valueString`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	exitValueString?: (ctx: ValueStringContext) => void;

	/**
	 * Enter a parse tree produced by the `valueNull`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	enterValueNull?: (ctx: ValueNullContext) => void;
	/**
	 * Exit a parse tree produced by the `valueNull`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	exitValueNull?: (ctx: ValueNullContext) => void;

	/**
	 * Enter a parse tree produced by the `valueFunc`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	enterValueFunc?: (ctx: ValueFuncContext) => void;
	/**
	 * Exit a parse tree produced by the `valueFunc`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	exitValueFunc?: (ctx: ValueFuncContext) => void;

	/**
	 * Enter a parse tree produced by the `expParens`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpParens?: (ctx: ExpParensContext) => void;
	/**
	 * Exit a parse tree produced by the `expParens`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpParens?: (ctx: ExpParensContext) => void;

	/**
	 * Enter a parse tree produced by the `expNegative`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpNegative?: (ctx: ExpNegativeContext) => void;
	/**
	 * Exit a parse tree produced by the `expNegative`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpNegative?: (ctx: ExpNegativeContext) => void;

	/**
	 * Enter a parse tree produced by the `expNot`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpNot?: (ctx: ExpNotContext) => void;
	/**
	 * Exit a parse tree produced by the `expNot`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpNot?: (ctx: ExpNotContext) => void;

	/**
	 * Enter a parse tree produced by the `expMultDivMod`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpMultDivMod?: (ctx: ExpMultDivModContext) => void;
	/**
	 * Exit a parse tree produced by the `expMultDivMod`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpMultDivMod?: (ctx: ExpMultDivModContext) => void;

	/**
	 * Enter a parse tree produced by the `expAddSub`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpAddSub?: (ctx: ExpAddSubContext) => void;
	/**
	 * Exit a parse tree produced by the `expAddSub`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpAddSub?: (ctx: ExpAddSubContext) => void;

	/**
	 * Enter a parse tree produced by the `expComparison`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpComparison?: (ctx: ExpComparisonContext) => void;
	/**
	 * Exit a parse tree produced by the `expComparison`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpComparison?: (ctx: ExpComparisonContext) => void;

	/**
	 * Enter a parse tree produced by the `expEquality`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpEquality?: (ctx: ExpEqualityContext) => void;
	/**
	 * Exit a parse tree produced by the `expEquality`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpEquality?: (ctx: ExpEqualityContext) => void;

	/**
	 * Enter a parse tree produced by the `expAndOrXor`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpAndOrXor?: (ctx: ExpAndOrXorContext) => void;
	/**
	 * Exit a parse tree produced by the `expAndOrXor`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpAndOrXor?: (ctx: ExpAndOrXorContext) => void;

	/**
	 * Enter a parse tree produced by the `expValue`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpValue?: (ctx: ExpValueContext) => void;
	/**
	 * Exit a parse tree produced by the `expValue`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpValue?: (ctx: ExpValueContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.dialogue`.
	 * @param ctx the parse tree
	 */
	enterDialogue?: (ctx: DialogueContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.dialogue`.
	 * @param ctx the parse tree
	 */
	exitDialogue?: (ctx: DialogueContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.file_hashtag`.
	 * @param ctx the parse tree
	 */
	enterFile_hashtag?: (ctx: File_hashtagContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.file_hashtag`.
	 * @param ctx the parse tree
	 */
	exitFile_hashtag?: (ctx: File_hashtagContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.node`.
	 * @param ctx the parse tree
	 */
	enterNode?: (ctx: NodeContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.node`.
	 * @param ctx the parse tree
	 */
	exitNode?: (ctx: NodeContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.header`.
	 * @param ctx the parse tree
	 */
	enterHeader?: (ctx: HeaderContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.header`.
	 * @param ctx the parse tree
	 */
	exitHeader?: (ctx: HeaderContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.body`.
	 * @param ctx the parse tree
	 */
	enterBody?: (ctx: BodyContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.body`.
	 * @param ctx the parse tree
	 */
	exitBody?: (ctx: BodyContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.statement`.
	 * @param ctx the parse tree
	 */
	enterStatement?: (ctx: StatementContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.statement`.
	 * @param ctx the parse tree
	 */
	exitStatement?: (ctx: StatementContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.line_statement`.
	 * @param ctx the parse tree
	 */
	enterLine_statement?: (ctx: Line_statementContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.line_statement`.
	 * @param ctx the parse tree
	 */
	exitLine_statement?: (ctx: Line_statementContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.line_formatted_text`.
	 * @param ctx the parse tree
	 */
	enterLine_formatted_text?: (ctx: Line_formatted_textContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.line_formatted_text`.
	 * @param ctx the parse tree
	 */
	exitLine_formatted_text?: (ctx: Line_formatted_textContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.hashtag`.
	 * @param ctx the parse tree
	 */
	enterHashtag?: (ctx: HashtagContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.hashtag`.
	 * @param ctx the parse tree
	 */
	exitHashtag?: (ctx: HashtagContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.line_condition`.
	 * @param ctx the parse tree
	 */
	enterLine_condition?: (ctx: Line_conditionContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.line_condition`.
	 * @param ctx the parse tree
	 */
	exitLine_condition?: (ctx: Line_conditionContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpression?: (ctx: ExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	enterValue?: (ctx: ValueContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 */
	exitValue?: (ctx: ValueContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.variable`.
	 * @param ctx the parse tree
	 */
	enterVariable?: (ctx: VariableContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.variable`.
	 * @param ctx the parse tree
	 */
	exitVariable?: (ctx: VariableContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.function_call`.
	 * @param ctx the parse tree
	 */
	enterFunction_call?: (ctx: Function_callContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.function_call`.
	 * @param ctx the parse tree
	 */
	exitFunction_call?: (ctx: Function_callContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.if_statement`.
	 * @param ctx the parse tree
	 */
	enterIf_statement?: (ctx: If_statementContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.if_statement`.
	 * @param ctx the parse tree
	 */
	exitIf_statement?: (ctx: If_statementContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.if_clause`.
	 * @param ctx the parse tree
	 */
	enterIf_clause?: (ctx: If_clauseContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.if_clause`.
	 * @param ctx the parse tree
	 */
	exitIf_clause?: (ctx: If_clauseContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.else_if_clause`.
	 * @param ctx the parse tree
	 */
	enterElse_if_clause?: (ctx: Else_if_clauseContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.else_if_clause`.
	 * @param ctx the parse tree
	 */
	exitElse_if_clause?: (ctx: Else_if_clauseContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.else_clause`.
	 * @param ctx the parse tree
	 */
	enterElse_clause?: (ctx: Else_clauseContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.else_clause`.
	 * @param ctx the parse tree
	 */
	exitElse_clause?: (ctx: Else_clauseContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.set_statement`.
	 * @param ctx the parse tree
	 */
	enterSet_statement?: (ctx: Set_statementContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.set_statement`.
	 * @param ctx the parse tree
	 */
	exitSet_statement?: (ctx: Set_statementContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.call_statement`.
	 * @param ctx the parse tree
	 */
	enterCall_statement?: (ctx: Call_statementContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.call_statement`.
	 * @param ctx the parse tree
	 */
	exitCall_statement?: (ctx: Call_statementContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.command_statement`.
	 * @param ctx the parse tree
	 */
	enterCommand_statement?: (ctx: Command_statementContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.command_statement`.
	 * @param ctx the parse tree
	 */
	exitCommand_statement?: (ctx: Command_statementContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.command_formatted_text`.
	 * @param ctx the parse tree
	 */
	enterCommand_formatted_text?: (ctx: Command_formatted_textContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.command_formatted_text`.
	 * @param ctx the parse tree
	 */
	exitCommand_formatted_text?: (ctx: Command_formatted_textContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.shortcut_option_statement`.
	 * @param ctx the parse tree
	 */
	enterShortcut_option_statement?: (ctx: Shortcut_option_statementContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.shortcut_option_statement`.
	 * @param ctx the parse tree
	 */
	exitShortcut_option_statement?: (ctx: Shortcut_option_statementContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.shortcut_option`.
	 * @param ctx the parse tree
	 */
	enterShortcut_option?: (ctx: Shortcut_optionContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.shortcut_option`.
	 * @param ctx the parse tree
	 */
	exitShortcut_option?: (ctx: Shortcut_optionContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.declare_statement`.
	 * @param ctx the parse tree
	 */
	enterDeclare_statement?: (ctx: Declare_statementContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.declare_statement`.
	 * @param ctx the parse tree
	 */
	exitDeclare_statement?: (ctx: Declare_statementContext) => void;

	/**
	 * Enter a parse tree produced by `YarnSpinnerParser.jump_statement`.
	 * @param ctx the parse tree
	 */
	enterJump_statement?: (ctx: Jump_statementContext) => void;
	/**
	 * Exit a parse tree produced by `YarnSpinnerParser.jump_statement`.
	 * @param ctx the parse tree
	 */
	exitJump_statement?: (ctx: Jump_statementContext) => void;
}

