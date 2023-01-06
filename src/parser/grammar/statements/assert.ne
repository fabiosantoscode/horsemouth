
statement -> "assert" ":" expr                    {% ([assert_, colon, expr]) => ({
                                                    ast: 'assert',
                                                    children: [expr]
                                                  }) %}
