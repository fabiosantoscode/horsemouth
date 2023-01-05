// Modified from @types/moo

// Type definitions for moo 0.5
// Project: https://github.com/tjvr/moo#readme
// Definitions by: Nikita Litvin <https://github.com/deltaidea>
//                 Jörg Vehlow <https://github.com/MofX>
//                 Martien Oranje <https://github.com/moranje>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

import type { TokenType } from "./tokenizer";
import type moo from "moo";

export interface HorsemouthLexer extends moo.Lexer {
    formatError(token: Token, message?: string): string;
    next(): Token | undefined;
    setState(state: string): void;

    [Symbol.iterator](): Iterator<Token>;
}

export interface Token extends moo.Token {
    type?: TokenType | undefined;
}
