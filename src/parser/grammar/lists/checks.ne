
# Checks for iterables

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

expr         -> atom ("does" "not" "contain") atom{% ([a, containsNot_, b]) => boolNot({
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

expr         -> atom ("is" "an" "element" "of" | "is" "in") atom {% ([a, isIn_, b]) => n({
                                                    ast: 'call',
                                                    children: [
                                                      n({
                                                        ast: 'reference',
                                                        children: ['CONTAINS']
                                                      }),
                                                      n(b),
                                                      n(a),
                                                    ]
                                                  }) %}

expr         -> atom ("is" "not" "an" "element" "of" | "is" "not" "in") atom {% ([a, isIn_, b]) => boolNot({
                                                    ast: 'call',
                                                    children: [
                                                      n({
                                                        ast: 'reference',
                                                        children: ['CONTAINS']
                                                      }),
                                                      n(b),
                                                      n(a),
                                                    ]
                                                  }) %}
