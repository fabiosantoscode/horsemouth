
atom       -> ("a" "new") newRecord               {% ([a_, r]) => r %}
atom       -> ("the") newRecord                   {% ([_, r]) => r %}

newRecord  -> ref:? "record" "{" rFieldList "}"   {% ([rType, record_, brace_, rFieldList ]) => n({
                                                    ast: 'record',
                                                    children: [...rFieldList]
                                                  })%}

rFieldList -> rFieldList "," rField               {% ([fList, comma_, field]) =>
                                                    [...fList, field] %}
rFieldList -> rField                              {% ([field]) => [field] %}

rField     -> (%lSlotBrackets) %word (%rSlotBrackets ":") atom
                                                  {% ([_, key, colon_, val]) => n({
                                                    ast: 'recordField',
                                                    children: [key.text, val]
                                                  }) %}
