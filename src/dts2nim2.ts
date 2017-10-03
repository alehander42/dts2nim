#!/usr/bin/env node

import * as ts from "typescript"
import * as fs from "fs"


function generate(fileName: string, options: ts.CompilerOptions): string {
    // Build a program using the set of root file names in fileNames
    let program = ts.createProgram([fileName], options)
    
    // Get the checker, we will use it to find more about classes
    let checker = (program as any).getDiagnosticsProducingTypeChecker()
    let emitResolver = (checker as any).getEmitResolver(fileName)

    var output: string[] = []

    // Visit every sourceFile in the program    
    for (const sourceFile of program.getSourceFiles()) {
        // Walk the tree to search for classes
        if ((<ts.SourceFile>sourceFile).fileName == fileName)
            ts.forEachChild(sourceFile, visit)
    }

    /** visit nodes finding exported classes */    
    function visit(node: ts.Node) {
        // Only consider exported nodes
        
        // if (!isNodeExported(node)) {
        //     return
        // }
        // console.log(ts.SyntaxKind[node.kind])
        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            // This is a top level class, get its symbol
            console.log('yeah')
            let symbol = checker.getSymbolAtLocation((<ts.ClassDeclaration>node).name)
            output.push(serializeClass(symbol))
            // No need to walk any further, class expressions/inner declarations
            // cannot be exported
        }
        else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            // This is a namespace, visit its children
            ts.forEachChild(node, visit)
        }
        else if (node.kind === ts.SyntaxKind.ModuleBlock) {
            ts.forEachChild(node, visit)
        }
        else if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
            output.push(serializeFunction(<ts.SignatureDeclaration>node))
        }
        else if (node.kind === ts.SyntaxKind.VariableStatement) {
            for (var t of (<ts.VariableStatement>node).declarationList.declarations) {
              var declaration = (<ts.VariableDeclaration>t)
              var symbol = checker.getSymbolAtLocation(declaration.name)
              output.push(serializeSymbol(symbol))
            }
        } else {
            
        }
    }

    function toNimType(t: ts.Type): string {
        if (t.flags & ts.TypeFlags.Number) {
            return 'int'
        } else if (t.flags & ts.TypeFlags.String) {
            return 'cstring'
        } else if (t.flags & ts.TypeFlags.Void) {
            return 'void'
        } else if (t.flags & ts.TypeFlags.Boolean) {
            return 'bool'
        } else if (t.flags & ts.TypeFlags.Anonymous) {
            var call = t.getCallSignatures()
            if (call.length == 1) {
                return serializeSignature(call[0])
            }
        } else if (t.flags & ts.TypeFlags.StringLiteral) {
            console.log(t)
        } else if (t.flags & ts.TypeFlags.Interface) {
            return ((<ts.InterfaceType>t).symbol.name)
        }
        console.log(t.flags)
        return 'js'
    }

    function isNodeExported(node: ts.Node): boolean {
        return (node.flags & ts.NodeFlags.Export) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
    }

    function serializeSymbol(symbol: ts.Symbol, novar: boolean = false): string {
        var typ = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
        var nimType = toNimType(typ)
        if (typ.flags & ts.TypeFlags.Anonymous) {
            return nimType
        } else {
            return `${novar ? "" : "var "}${symbol.getName()}${novar ? "" : "*"}: ${nimType}`
        }
    }

    function serializeClass(symbol: ts.Symbol) {
        let details = serializeSymbol(symbol)
        console.log(' ', details)
        let constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
        return ''
        // return constructorType.getConstructSignatures().map(serializeSignature).join('\n')
    }

    function serializeSignature(signature: ts.Signature): string {
        return `proc ${signature.declaration.name.getText()}*(${signature.parameters.map((f) => serializeSymbol(f, true)).join(', ')}): ${toNimType(signature.getReturnType())}`
    }

    function serializeFunction(signature: ts.SignatureDeclaration): string {
        var t = checker.getSymbolAtLocation(signature.name)
        return serializeSymbol(t)
    }

    return output.join('\n')
}

console.log(generate(process.argv[2], {target: ts.ScriptTarget.ES2015, module: ts.ModuleKind.CommonJS}))
