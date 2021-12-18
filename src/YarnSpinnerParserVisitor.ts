// Generated from src/YarnSpinnerParser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

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
 * This interface defines a complete generic visitor for a parse tree produced
 * by `YarnSpinnerParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface YarnSpinnerParserVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `valueNumber`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValueNumber?: (ctx: ValueNumberContext) => Result;

	/**
	 * Visit a parse tree produced by the `valueTrue`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValueTrue?: (ctx: ValueTrueContext) => Result;

	/**
	 * Visit a parse tree produced by the `valueFalse`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValueFalse?: (ctx: ValueFalseContext) => Result;

	/**
	 * Visit a parse tree produced by the `valueVar`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValueVar?: (ctx: ValueVarContext) => Result;

	/**
	 * Visit a parse tree produced by the `valueString`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValueString?: (ctx: ValueStringContext) => Result;

	/**
	 * Visit a parse tree produced by the `valueNull`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValueNull?: (ctx: ValueNullContext) => Result;

	/**
	 * Visit a parse tree produced by the `valueFunc`
	 * labeled alternative in `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValueFunc?: (ctx: ValueFuncContext) => Result;

	/**
	 * Visit a parse tree produced by the `expParens`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpParens?: (ctx: ExpParensContext) => Result;

	/**
	 * Visit a parse tree produced by the `expNegative`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpNegative?: (ctx: ExpNegativeContext) => Result;

	/**
	 * Visit a parse tree produced by the `expNot`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpNot?: (ctx: ExpNotContext) => Result;

	/**
	 * Visit a parse tree produced by the `expMultDivMod`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpMultDivMod?: (ctx: ExpMultDivModContext) => Result;

	/**
	 * Visit a parse tree produced by the `expAddSub`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpAddSub?: (ctx: ExpAddSubContext) => Result;

	/**
	 * Visit a parse tree produced by the `expComparison`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpComparison?: (ctx: ExpComparisonContext) => Result;

	/**
	 * Visit a parse tree produced by the `expEquality`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpEquality?: (ctx: ExpEqualityContext) => Result;

	/**
	 * Visit a parse tree produced by the `expAndOrXor`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpAndOrXor?: (ctx: ExpAndOrXorContext) => Result;

	/**
	 * Visit a parse tree produced by the `expValue`
	 * labeled alternative in `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpValue?: (ctx: ExpValueContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.dialogue`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDialogue?: (ctx: DialogueContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.file_hashtag`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFile_hashtag?: (ctx: File_hashtagContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.node`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNode?: (ctx: NodeContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.header`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitHeader?: (ctx: HeaderContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.body`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBody?: (ctx: BodyContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStatement?: (ctx: StatementContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.line_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLine_statement?: (ctx: Line_statementContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.line_formatted_text`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLine_formatted_text?: (ctx: Line_formatted_textContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.hashtag`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitHashtag?: (ctx: HashtagContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.line_condition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLine_condition?: (ctx: Line_conditionContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValue?: (ctx: ValueContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.variable`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVariable?: (ctx: VariableContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.function_call`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunction_call?: (ctx: Function_callContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.if_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIf_statement?: (ctx: If_statementContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.if_clause`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIf_clause?: (ctx: If_clauseContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.else_if_clause`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitElse_if_clause?: (ctx: Else_if_clauseContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.else_clause`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitElse_clause?: (ctx: Else_clauseContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.set_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSet_statement?: (ctx: Set_statementContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.call_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCall_statement?: (ctx: Call_statementContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.command_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCommand_statement?: (ctx: Command_statementContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.command_formatted_text`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCommand_formatted_text?: (ctx: Command_formatted_textContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.shortcut_option_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitShortcut_option_statement?: (ctx: Shortcut_option_statementContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.shortcut_option`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitShortcut_option?: (ctx: Shortcut_optionContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.declare_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclare_statement?: (ctx: Declare_statementContext) => Result;

	/**
	 * Visit a parse tree produced by `YarnSpinnerParser.jump_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitJump_statement?: (ctx: Jump_statementContext) => Result;
}

