
# expr -> mathExpr is in booleanExpr.ne

mathExpr      -> subtractionExpr                            {% id %}

mathExpr      -> ("the" "numeric" "value" "of") subtractionExpr {% ([theNumericValueOf_, expr]) => n({
                                                              ast: 'call',
                                                              children: [
                                                                n({
                                                                  ast: 'reference',
                                                                  children: ['TO_NUMBER'],
                                                                }),
                                                                expr
                                                              ]
                                                            }) %}


subtractionExpr -> additionExpr                             {% id %}
subtractionExpr -> subtractionExpr ("-" | "–") additionExpr {% ([left, _, right]) => ({
                                                              ast: 'binaryExpr',
                                                              children: ['-', left, right]
                                                            }) %}

additionExpr -> moduloExpr                                  {% id %}
additionExpr -> additionExpr "+" moduloExpr                 {% ([left, _, right]) => ({
                                                              ast: 'binaryExpr',
                                                              children: ['+', left, right]
                                                            }) %}

moduloExpr   -> divisionExpr                                {% id %}
moduloExpr   -> moduloExpr "modulo" divisionExpr            {% ([left, _, right]) => n({
                                                              ast: 'binaryExpr',
                                                              children: ['%', left, right]
                                                            }) %}


divisionExpr -> multiplicationExpr                          {% id %}
divisionExpr -> divisionExpr "/" multiplicationExpr         {% ([left, _, right]) => ({
                                                              ast: 'binaryExpr',
                                                              children: ['/', left, right]
                                                            }) %}

multiplicationExpr -> powerExpr                             {% id %}
multiplicationExpr -> multiplicationExpr ("*"|"×") powerExpr{% ([left, _, right]) => ({
                                                              ast: 'binaryExpr',
                                                              children: ['*', left, right]
                                                            }) %}

powerExpr    -> unaryExpr                                   {% id %}
powerExpr    -> powerExpr ("*" "*") unaryExpr               {% ([left, _, right]) => n({
                                                              ast: 'binaryExpr',
                                                              children: ['**', left, right]
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

expr      -> ("the" "result" "of" "clamping") atom "between" mathExpr "and" mathExpr
                                                            {% ([_, lhs, btwn_, min, and_, max]) => n({
                                                                ast: 'call',
                                                                children: [
                                                                  n({
                                                                    ast: 'reference',
                                                                    children: ['CLAMP'],
                                                                  }),
                                                                  n(lhs),
                                                                  n(min),
                                                                  n(max),
                                                                ]
                                                              })
                                                            %}
