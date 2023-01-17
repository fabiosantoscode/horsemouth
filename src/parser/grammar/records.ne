
atom       -> ("a" "new" | "the"):? newRecord     {% ([a_, r]) => r %}

newRecord  -> recordType "{" rFieldList "}"       {% ([rHead_, brace_, rFieldList ]) => n({
                                                    ast: 'record',
                                                    children: [...rFieldList]
                                                  })%}

recordType-> (ref:? "record")
          | ("property" "descriptor")
          | "propertydescriptor"
          | ("cyclic" | "source" "text")
          | "completion"                          {%id%}

recordTypeNotRef -> recordType                    {% ([rType], _, reject) => {
                                                    if (rType.text === 'ref') {
                                                      reject()
                                                    }
                                                  } %}

rFieldList -> rFieldList "," rField               {% ([fList, comma_, field]) =>
                                                    [...fList, field] %}
rFieldList -> rField                              {% ([field]) => [field] %}

rField     -> (%lSlotBrackets) %word (%rSlotBrackets ":") atom
                                                  {% ([_, key, colon_, val]) => n({
                                                    ast: 'recordField',
                                                    children: [key.text, val]
                                                  }) %}
