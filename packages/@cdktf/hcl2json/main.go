//+ build js,wasm
package main

import (
	"encoding/json"
	"fmt"
	"syscall/js"

	hcl "github.com/hashicorp/hcl/v2"
	"github.com/hashicorp/hcl/v2/hclsyntax"
	"github.com/tmccombs/hcl2json/convert"
)

var jsRoot js.Value

const (
	bridgeJavaScriptName = "__parse_terraform_config_wasm__"
)

func registrationWrapper(fn func(this js.Value, args []js.Value) (interface{}, error)) func(this js.Value, args []js.Value) interface{} {
	return func(this js.Value, args []js.Value) interface{} {
		cb := args[len(args)-1]

		ret, err := fn(this, args[:len(args)-1])

		if err != nil {
			cb.Invoke(err.Error(), js.Null())
		} else {
			cb.Invoke(js.Null(), ret)
		}

		return ret
	}
}

func registerFn(name string, callback func(this js.Value, args []js.Value) (interface{}, error)) {
	jsRoot.Set(name, js.FuncOf(registrationWrapper(callback)))
}

func registerValue(name string, value interface{}) {
	jsRoot.Set(name, value)
}

type ParsableExpression struct {
	Expr string `json:"expr"`
}

func main() {

	global := js.Global()
	jsRoot = global.Get(bridgeJavaScriptName)
	c := make(chan struct{}, 0)
	registerFn("parse", func(this js.Value, args []js.Value) (interface{}, error) {
		var options = convert.Options{false}

		if len(args) == 0 {
			return nil, fmt.Errorf("No arguments provided")
		}

		converted, err := convert.Bytes([]byte(args[1].String()), args[0].String(), options)
		return string(converted), err
	})

	registerFn("parseExpression", func(this js.Value, args []js.Value) (interface{}, error) {
		if len(args) == 0 {
			return nil, fmt.Errorf("No arguments provided")
		}

		expressionInput := fmt.Sprintf("\"%v\"", args[1].String())
		// return expressionInput, nil
		// expression := ParsableExpression{ Expr: expressionInput }
		// b, err := json.Marshal(expression)

		// if err != nil {
		// 	return nil, fmt.Errorf("Can not marshal expression into JSON object %v: %v", expressionInput, err)
		// }

		// expr, diags := hclsyntax.ParseExpression([]byte(expressionInput), "", hcl.Pos{Line: 1, Column: 1})
		
		expr, diags := hclsyntax.ParseExpression([]byte(expressionInput), "test", hcl.Pos{Line: 1, Column: 1})
		if diags.HasErrors() {
			return nil, fmt.Errorf("Can not parse expression: %v", diags.Error())
		}
		
		convertedJson, marshalError := json.Marshal(expr)
		if marshalError != nil {
			return nil, fmt.Errorf("Can not convert result to JSON: %v", marshalError)
		}

		return string(convertedJson), nil
	})
	<-c
}
