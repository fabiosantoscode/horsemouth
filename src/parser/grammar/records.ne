
atom       -> ("a" "new" | "the"):? newRecord     {% ([a_, r]) => r %}

newRecord  -> rHead "{" rFieldList "}"            {% ([rHead_, brace_, rFieldList ]) => n({
                                                    ast: 'record',
                                                    children: [...rFieldList]
                                                  })%}

rHead      -> (ref:? "record")
          | ("property" "descriptor")
          | "propertydescriptor"
          | "completion"                          {%id%}

rFieldList -> rFieldList "," rField               {% ([fList, comma_, field]) =>
                                                    [...fList, field] %}
rFieldList -> rField                              {% ([field]) => [field] %}

rField     -> (%lSlotBrackets) %word (%rSlotBrackets ":") atom
                                                  {% ([_, key, colon_, val]) => n({
                                                    ast: 'recordField',
                                                    children: [key.text, val]
                                                  }) %}
