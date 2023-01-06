# BOOLEAN COMBINATORS
######################################

expr        -> booleanExpr                        {% id %}

booleanExpr -> comparisonExpr                     {% id %}
booleanExpr -> booleanExpr ("and" | "or") comparisonExpr   {% ([expr1, op, expr2]) =>
                                                    ({
                                                      ast: 'binaryExpr',
                                                      children: [op[0].text, expr1, expr2]
                                                    })
                                                  %}

# COMPARISONS

comparisonExpr -> mathExpr                        {% id %}
comparisonExpr -> comparisonExpr ("is" | "=") mathExpr
                                                  {% ([expr1, is, expr2]) =>
                                                    ({
                                                      ast: 'binaryExpr',
                                                      children: ['equals', expr1, n(expr2)]
                                                    })
                                                  %}

comparisonExpr -> comparisonExpr "is" "not" mathExpr
                                                  {% ([expr1, is, not, expr2]) =>
                                                    boolNot({
                                                      ast: 'binaryExpr',
                                                      children: ['equals', expr1, expr2]
                                                    })
                                                  %}

comparisonExpr -> comparisonExpr "is" "either" mathExpr "or" mathExpr
                                                  {% ([expr1, is, either, expr2, or, expr3]) =>
                                                    ({
                                                      ast: 'binaryExpr',
                                                      children: [
                                                        'or',
                                                        {
                                                          ast: 'binaryExpr',
                                                          children: ['equals', expr1, expr2]
                                                        },
                                                        {
                                                          ast: 'binaryExpr',
                                                          children: ['equals', expr1, expr3]
                                                        }
                                                      ]
                                                    })
                                                  %}

comparisonExpr -> comparisonExpr "is" "neither" mathExpr "nor" mathExpr
                                                  {% ([expr1, is, either, expr2, or, expr3]) =>
                                                    boolNot({
                                                      ast: 'binaryExpr',
                                                      children: [
                                                        'or',
                                                        {
                                                          ast: 'binaryExpr',
                                                          children: ['equals', expr1, expr2]
                                                        },
                                                        {
                                                          ast: 'binaryExpr',
                                                          children: ['equals', expr1, expr3]
                                                        }
                                                      ]
                                                    })
                                                  %}

comparisonExpr -> comparisonExpr "has" ("a" | "an") slotRef
   ("internal":? ("slot" | "field" | "method"))
                                                  {% ([expr1, has, a, slotRef]) =>
                                                    ({
                                                      ast: 'hasSlot',
                                                      children: [expr1, slotRef]
                                                    })
                                                  %}

comparisonExpr -> comparisonExpr ("does" "not" "have" ("a" | "an")) slotRef
   ("internal":? ("slot" | "field" | "method"))
                                                  {% ([expr1, hasnt, slotRef]) =>
                                                    ({
                                                      ast: 'unaryExpr',
                                                      children: ['not', {
                                                        ast: 'hasSlot',
                                                        children: [expr1, slotRef]
                                                      }]
                                                    })
                                                  %}

comparisonExpr -> comparisonExpr ("<" | ">") mathExpr
                                                  {% ([expr1, op, expr2]) =>
                                                    ({
                                                      ast: 'binaryExpr',
                                                      children: [op[0].text.toString(), expr1, expr2]
                                                    })
                                                  %}

comparisonExpr -> comparisonExpr ("≤" | "≥") mathExpr
                                                  {% ([expr1, op, expr2]) =>
                                                    ({
                                                      ast: 'binaryExpr',
                                                      children: [
                                                        op[0].text.toString() === '≤' ? '<=' : '>=',
                                                        expr1,
                                                        expr2
                                                      ]
                                                    })
                                                  %}
