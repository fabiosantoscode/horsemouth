
# TYPE CHECKS
######################################

expr          -> typeCheck                                  {% id %}
typeCheck     -> "the" type ("that" "is") expr              {% ([the_, type, thatIs_, expr]) => n({
                                                              ast: 'typeCheck',
                                                              children: [type, expr]
                                                            }) %}

typeCheck     -> "the" type ("value" "of":?) expr           {% ([the_, type, valueOf_, expr], _, reject) => n({
                                                              ast: 'typeCheck',
                                                              children: [type, expr]
                                                            }) %}

# Sometimes the spec refers to types. We don't typecheck yet but need to consume them while parsing.

# Simplest type is a reference to a type.
type         -> ref                                         {% ([ref], _, reject) => {
                                                              const name = ref.children[0];
                                                              if (['this', 'numeric'].includes(name)) {
                                                                return reject
                                                              } else {
                                                                return n({
                                                                  ast: 'string',
                                                                  children: ["some record?"]
                                                                })
                                                              }
                                                            } %}

type         -> ("Shared" "Data" "Block")                   {% () => n({
                                                              ast: 'string',
                                                              children: ["some record?"]
                                                            }) %}

type         -> recordTypeNotRef                            {% () => n({
                                                              ast: 'string',
                                                              children: ["some record?"]
                                                            }) %}

type         -> record                                      {% () => n({
                                                              ast: 'string',
                                                              children: ["some record?"]
                                                            }) %}
record       -> ref "{" recordFields "}"                    {% () => n({
                                                              ast: 'string',
                                                              children: ["some record?"]
                                                            }) %}

recordFields -> lhs                                         {% ([field]) => [field] %}
recordFields -> recordFields "," lhs                        {% ([fields, comma, lhs]) => [...fields.map(n), n(lhs)] %}

typeComparisonExpr -> comparisonExpr "is" "a" type          {% ([expr, is, a, type]) => n({
                                                              ast: 'call',
                                                              children: [
                                                                n({
                                                                  ast: 'reference',
                                                                  children: ['HAS_TYPE']
                                                                }),
                                                                expr,
                                                                n(type),
                                                              ]
                                                            }) %}

typeComparisonExpr -> comparisonExpr "and" comparisonExpr ("are" "both":? "the" "same") type ("value" | "values"):?
                                                            {% ([expr, and_, expr2, areSame_, type]) => {
                                                              return chainedBinaryOp(
                                                                'and',
                                                                n({
                                                                  ast: 'call',
                                                                  children: [
                                                                    n({ ast: 'reference', children: ['HAS_TYPE'] }),
                                                                    expr,
                                                                    n(type),
                                                                  ]
                                                                }),
                                                                n({
                                                                  ast: 'call',
                                                                  children: [
                                                                    n({ ast: 'reference', children: ['HAS_TYPE'] }),
                                                                    expr2,
                                                                    n(type),
                                                                  ]
                                                                }),
                                                                n({
                                                                  ast: 'binaryExpr',
                                                                  children: [
                                                                    'equals',
                                                                    expr,
                                                                    expr2
                                                                  ]
                                                                })
                                                              )
                                                            } %}

