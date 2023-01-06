
# CONDITIONALS
###############

statement    -> "if" expr then_ statement       {% ([_if, expr1, _then, expr2]) => ({
                                                  ast: 'condition',
                                                  children: [n(expr1), n(expr2)]
                                                }) %}

# "else" statements are appended to the "if" statement in post-processing

statement    -> else_ "if" expr then_ statement   {% ([_else, _if, expr, _then, stat]) => ({
                                                    ast: 'else',
                                                    children: [
                                                      {
                                                        ast: 'condition',
                                                        children: [n(expr), n(stat)]
                                                      }
                                                    ]
                                                  }) %}

statement    -> else_ statement                   {% ([_else, stat]) => ({
                                                    ast: 'else',
                                                    children: [n(stat)]
                                                  }) %}

then_        -> "," "then":?                      {% id %}
else_        -> ("otherwise" | "else") ",":?      {% id %}
