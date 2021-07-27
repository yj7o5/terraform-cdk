import * as z from "zod";

const marker = z.object({
  Byte: z.number(),
  Column: z.number(),
  Line: z.number(),
});
const srcRange = z.object({
  End: marker,
  Filename: z.string(),
  Start: marker,
});

const nameExpr = z.object({
  Name: z.string(),
  SrcRange: srcRange,
});

// We can not use recursive types, so this is the replacement
const expressionLike = z.any();

const propertyAccessExpr = z.object({
  SrcRange: srcRange,
  Source: expressionLike.optional(),
  Traversal: z.array(expressionLike),
});

const arithmeticExpr = z.object({
  SrcRange: srcRange,
  LHS: expressionLike,
  RHS: expressionLike,
  Op: z.object({
    Impl: z.any(),
    Type: z.string(),
  }),
});

const functionExpr = z.object({
  Args: z.array(expressionLike),
  CloseParenRange: srcRange,
  OpenParenRange: srcRange,
  Name: z.string(),
  ExpandFinal: z.boolean(),
  NameRange: srcRange,
});

const wrappedExpression: any = z.lazy(() =>
  z.object({
    SrcRange: srcRange,
    Wrapped: expression,
  })
);
export const expression = z.union([
  arithmeticExpr,
  functionExpr,
  nameExpr,
  propertyAccessExpr,
  wrappedExpression,
]);

export const expressionSchema = expression;
