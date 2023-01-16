
# expr -> mathExpr is in booleanExpr.ne

mathExpr      -> subtractionExpr                            {% id %}

subtractionExpr -> additionExpr                             {% id %}
subtractionExpr -> subtractionExpr ("-" | "–") additionExpr {% ([left, _, right]) => ({
                                                              ast: 'binaryExpr',
                                                              children: ['-', left, right]
                                                            }) %}

additionExpr -> divisionExpr                                {% id %}
additionExpr -> additionExpr "+" divisionExpr               {% ([left, _, right]) => ({
                                                              ast: 'binaryExpr',
                                                              children: ['+', left, right]
                                                            }) %}

divisionExpr -> multiplicationExpr                          {% id %}
divisionExpr -> divisionExpr "/" multiplicationExpr         {% ([left, _, right]) => ({
                                                              ast: 'binaryExpr',
                                                              children: ['/', left, right]
                                                            }) %}

multiplicationExpr -> unaryExpr                             {% id %}
multiplicationExpr -> multiplicationExpr "*" unaryExpr      {% ([left, _, right]) => ({
                                                              ast: 'binaryExpr',
                                                              children: ['*', left, right]
                                                            }) %}

unaryExpr -> atom                                           {% id %}
unaryExpr -> "-" atom                                       {% ([min, arg]) => ({
                                                              ast: 'unaryExpr',
                                                              children: ['-', arg]
                                                            }) %}
unaryExpr -> "+" atom                                       {% ([min, arg]) => ({
                                                              ast: 'unaryExpr',
                                                              children: ['+', arg]
                                                            }) %}

statement ->
("increase" | "increment") lhs "by" atom                    {% ([_, lhs, __, rhs]) =>
                                                              n({
                                                                ast: 'set',
                                                                children: [lhs, n({
                                                                  ast: 'binaryExpr',
                                                                  children: ['+', lhs, rhs]
                                                                })]
                                                              })
                                                            %}

statement ->
("decrease" | "decrement") lhs "by" atom                    {% ([_, lhs, __, rhs]) =>
                                                              n({
                                                                ast: 'set',
                                                                children: [lhs, n({
                                                                  ast: 'binaryExpr',
                                                                  children: ['-', lhs, rhs]
                                                                })]
                                                              })
                                                            %}
