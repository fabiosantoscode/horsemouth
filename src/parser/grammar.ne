
@lexer tokenizer

@{%
const n = (type, ...children) => ({ type, children });
%}

# ROOT RULE - the start of the grammar
######################################
root         -> ( statement %endStatement ):+    {% ([stat]) => stat.map(stat => stat[0]) %}

statement    -> if_statement


# IF STATEMENT
if_statement -> "if" expression "," expression "." {% ([, expr1, , expr2]) =>
                                                        ({
                                                          ast: 'condition',
                                                          children: [expr1, expr2]
                                                        })
                                                    %}


expression   -> reference                       {% id %}
expression   -> literal                         {% id %}
expression   -> comparison                      {% id %}
expression   -> throw                           {% id %}

@{%
const reservedWords = new Set(
  `
    if then else
    let be is the of type
    and or not
    true false undefined throw a TypeError exception
    otherwise
    either
  `.split(/\s+/g)
)
%}


# BASIC
######################################
reference     -> (%word | %identifier)            {% ([id]) => ({
                                                    ast: 'identifier',
                                                    children: [id[0].text]
                                                  }) %}

literal       -> %value                           {% ([id]) => ({
                                                    ast: 'literal',
                                                    children: [id]
                                                  }) %}

# SIMPLE EXPRESSIONS
######################################
comparison    -> expression "is" expression       {% ([expr1, is, expr2]) =>
                                                    ({
                                                      ast: 'comparison',
                                                      children: [expr1, expr2]
                                                    })
                                                  %}

