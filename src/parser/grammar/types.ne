
# TYPE CHECKS
######################################

expr          -> typeCheck                                  {% id %}
typeCheck     -> "the" type ("that" "is") expr              {% ([the_, type, thatIs_, expr]) => ({
                                                              ast: 'typeCheck',
                                                              children: [type, expr]
                                                            }) %}

# Sometimes the spec refers to types. We don't typecheck yet but need to consume them while parsing.

# Simplest type is a reference to a type.
type         -> ref                                         {% id %}

type         -> record                                      {% id %}
record       -> ref "{" recordFields "}"                    {% ([ref, open, fields, close]) => n({
                                                              ast: 'string',
                                                              children: ["some record?"]
                                                            }) %}

recordFields -> lhs                                         {% ([field]) => [field] %}
recordFields -> recordFields "," lhs                        {% ([fields, comma, lhs]) => [...fields.map(n), n(lhs)] %}
