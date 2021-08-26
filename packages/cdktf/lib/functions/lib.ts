import { Tokenization } from "../tokens/token";
import { call } from "../tfExpression";
import { IResolvable } from "../tokens/resolvable";
import { TokenMap } from "../tokens/private/token-map";
import { TokenString } from "../tokens/private/encoding";

// We use branding here to ensure we internally only handle validated values
// this allows us to catch usage errors before terraform does in some cases
type TFValue = any & { __type: "tfvalue" };
type TFValueValidator = (value: any) => TFValue;

type ExecutableTfFunction = (...args: any[]) => IResolvable;

export function anyValue(value: any): any {
  return value;
}

export function mapValue(value: any): any {
  return value;
}

export function stringValue(value: any): any {
  if (typeof value !== "string" && !Tokenization.isResolvable(value)) {
    throw new Error(`${value} is not a valid number nor a token`);
  }
  return value;
}

export function numericValue(value: any): any {
  if (typeof value !== "number" && !Tokenization.isResolvable(value)) {
    throw new Error(`${value} is not a valid number nor a token`);
  }
  return value;
}

export function listOf(type: TFValueValidator): TFValueValidator {
  return (value: any) => {
    if (Tokenization.isResolvable(value)) {
      return value;
    }

    if (!Array.isArray(value)) {
      //   throw new Error(`${value} is not a valid list`);
      return value;
    }

    return value.map((item, i) => {
      if (Tokenization.isResolvable(item)) {
        return item;
      }

      if (TokenString.forListToken(item).test()) {
        return item;
      }

      if (typeof item === "string") {
        const tokenList = Tokenization.reverseString(item);
        const numberOfTokens =
          tokenList.tokens.length + tokenList.intrinsic.length;
        if (numberOfTokens === 1 && tokenList.literals.length === 0) {
          return item;
        }
      }

      try {
        type(item);
        return typeof item === "string" ? `"${item}"` : item;
      } catch (error) {
        throw new Error(
          `Element in list ${value} at position ${i} is not of the right type: ${error}`
        );
      }
    });
  };
}

export function asString(value: IResolvable) {
  return TokenMap.instance().registerString(value);
}

export function asNumber(value: IResolvable) {
  return TokenMap.instance().registerNumber(value);
}

export function asList(value: IResolvable) {
  return TokenMap.instance().registerList(value);
}

export function asBoolean(value: IResolvable) {
  return asAny(value) as boolean;
}

export function asAny(value: IResolvable) {
  return asString(value) as any;
}

export function terraformFunction(
  name: string,
  argValidators: TFValueValidator | TFValueValidator[]
): ExecutableTfFunction {
  return function (...args: any[]) {
    if (Array.isArray(argValidators)) {
      if (args.length !== argValidators.length) {
        throw new Error(
          `${name} takes ${argValidators.length} arguments, but ${args.length} were provided`
        );
      }
      return call(
        name,
        args.map((arg, i) => argValidators[i](arg))
      );
    } else {
      return call(name, argValidators(args));
    }
  };
}
