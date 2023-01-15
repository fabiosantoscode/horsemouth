
# String concatenation
atom        -> ("the" "string" "-" "concatenation" "of") stringConcat
                                                  {% ([_, cat]) => cat %}

stringConcat -> expr "and" expr                   {% ([a, and_, b], _, reject) => {
                                                    return chainedBinaryOp("+", a, b)
                                                  } %}

stringConcat -> (expr ","):+ ("and") expr         {% ([chain, and_, end], _, reject) => {
                                                    const allExprs = [...chain, [end]]
                                                      .map(e => n(e[0], 'chained string concat'))
                                                    return chainedBinaryOp("+", ...allExprs)
                                                  } %}

expr         -> atom "contains" atom              {% ([a, contains_, b]) => n({
                                                    ast: 'call',
                                                    children: [
                                                      n({
                                                        ast: 'reference',
                                                        children: ['CONTAINS']
                                                      }),
                                                      n(a),
                                                      n(b),
                                                    ]
                                                  }) %}

# Code units
atom         -> ("the" "code" "unit") %hexNumber codeUnitDesc {% ([_, unit]) => n({
                                                    ast: 'string',
                                                    children: [String.fromCodePoint(Number(unit.text))]
                                                  }) %}

# drop "DIGIT ZERO", "SMALL LATIN LETTER X", etc
codeUnitDesc -> "(" %word:+ ")"                   {% id %}
