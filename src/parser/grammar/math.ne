
# expr -> mathExpr is in booleanExpr.ne

mathExpr   -> subtractionExpr                               {% id %}

subtractionExpr -> additionExpr                             {% id %}
subtractionExpr -> subtractionExpr "-" additionExpr         {% ([left, _, right]) => ({
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
