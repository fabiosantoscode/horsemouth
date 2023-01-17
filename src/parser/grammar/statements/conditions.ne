
# CONDITIONALS
###############

statement    -> "if" expr then_ statement maybe_else_after
                                              {% ([_if, expr1, _then, expr2, else_]) => ({
                                                ast: 'condition',
                                                children: [
                                                  n(expr1),
                                                  n(expr2),
                                                  ...else_
                                                ]
                                              }) %}

maybe_else_after -> ((";" | ".") else_ statement):?
                                              {% ([else_]) => else_ ? [n({
                                                ast: 'else',
                                                children: [n(else_[2])]
                                              })] : [] %}

# "else" statements are appended to the "if" statement in post-processing

statement    -> else_ statement               {% ([_else, stat]) => ({
                                                ast: 'else',
                                                children: [n(stat)]
                                              }) %}

then_        -> "," "then":?                  {% id %}
else_        -> ("otherwise" | "else") ",":?  {% id %}
