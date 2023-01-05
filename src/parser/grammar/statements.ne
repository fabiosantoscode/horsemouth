
# STATEMENTS
######################################
statement    -> "if" expr "," statement         {% ([, expr1, , expr2]) => ({
                                                  ast: 'condition',
                                                  children: [expr1, expr2]
                                                }) %}

statement    -> "if" expr "," "then" statement  {% ([, expr1, , , expr2]) => ({
                                                  ast: 'condition',
                                                  children: [expr1, expr2]
                                                }) %}

statement    -> "let" ref "be" expr "."         {% ([let_, id, be, expr]) => ({
                                                  ast: 'let',
                                                  children: [id, expr]
                                                }) %}

statement    -> "set" lhs "to" expr "."         {% ([set, id, is, expr]) => ({
                                                  ast: 'set',
                                                  children: [id, expr]
                                                }) %}

statement    -> call "."                        {% ([id]) => id %}
statement    -> return_ "."                     {% ([id]) => id %}
statement    -> throw_ "."                      {% ([id]) => id %}

# LOOPS
statement    -> "repeat" "," statement          {% ([repeat, comma, block]) => ({
                                                  ast: 'repeat',
                                                  children: [block]
                                                }) %}

statement    -> "for" "each" "element" ref "of" expr "," "do"  statement
                                                {% ([for_, each, element, id, of, expr, comma, do_, block]) => ({
                                                  ast: 'forEach',
                                                  children: [id.children[0], expr, block]
                                                }) %}


# CONTROL FLOW
statement    -> throw_                          {% id %}
throw_       -> "throw" "a" ref "exception"     {% ([throw_, _, value]) =>
                                                  ({
                                                    ast: 'throw_',
                                                    children: [value]
                                                  })
                                                %}

statement    -> return_                        {% id %}
return_      -> "return" expr                  {% ([return_, value]) =>
                                                  ({
                                                    ast: 'return_',
                                                    children: [value]
                                                  })
                                                %}

statement    -> innerBlockHack                 {% id %}
