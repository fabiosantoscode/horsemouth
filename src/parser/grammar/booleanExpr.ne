# SIMPLE EXPRESSIONS
######################################

expr        -> booleanExpr                        {% id %}
booleanExpr -> expr "is" expr                     {% ([expr1, is, expr2]) =>
                                                    ({
                                                      ast: 'booleanExpr',
                                                      children: ['equals', expr1, expr2]
                                                    })
                                                  %}

booleanExpr -> expr "is" "not" expr               {% ([expr1, is, not, expr2]) =>
                                                    ({
                                                      ast: 'unaryBooleanExpr',
                                                      children: [
                                                        'not',
                                                        ({
                                                          ast: 'booleanExpr',
                                                          children: ['equals', expr1, expr2]
                                                        })
                                                      ]
                                                    })
                                                  %}

booleanExpr -> expr "is" "either" expr "or" expr
                                                {% ([expr1, is, either, expr2, or, expr3]) =>
                                                  ({
                                                    ast: 'booleanExpr',
                                                    children: [
                                                      'or',
                                                      {
                                                        ast: 'booleanExpr',
                                                        children: ['equals', expr1, expr2]
                                                      },
                                                      {
                                                        ast: 'booleanExpr',
                                                        children: ['equals', expr1, expr3]
                                                      }
                                                    ]
                                                  })
                                                %}

booleanExpr -> booleanExpr "and" booleanExpr    {% ([expr1, and, expr2]) =>
                                                  ({
                                                    ast: 'booleanExpr',
                                                    children: ['and', expr1, expr2]
                                                  })
                                                %}
