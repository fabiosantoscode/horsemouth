
# STATEMENTS
######################################

statement    -> "let" ref "be" expr             {% ([let_, id, be, expr]) => ({
                                                  ast: 'let',
                                                  children: [id, expr]
                                                }) %}

statement    -> "set" lhs "to" expr             {% ([set, id, is, expr]) => ({
                                                  ast: 'set',
                                                  children: [id, expr]
                                                }) %}

statement    -> call                            {% ([id]) => id %}

# LOOPS
statement    -> "repeat" "," statement          {% ([repeat, comma, block]) => ({
                                                  ast: 'repeat',
                                                  children: [block]
                                                }) %}

statement    -> "repeat" "," "while" expr "," statement
                                                {% ([repeat, comma, while_, expr, comma2, block]) => ({
                                                  ast: 'repeatWhile',
                                                  children: [expr, n(block)]
                                                }) %}

statement    -> "for" "each" type ref "of" expr "," "do"  statement
                                                {% ([for_, each, type_, id, of, expr, comma, do_, block]) => ({
                                                  ast: 'forEach',
                                                  children: [id.children[0], expr, block]
                                                }) %}


# JUMPS
statement    -> throw_                          {% id %}
throw_       -> "throw" "a" ref "exception"     {% ([throw_, _, value]) =>
                                                  ({
                                                    ast: 'throw_',
                                                    children: [value]
                                                  })
                                                %}

statement    -> "return" expr                   {% ([return_, value]) =>
                                                  ({
                                                    ast: 'return_',
                                                    children: [value]
                                                  })
                                                %}

statement    -> innerBlockHack                 {% id %}
