
# LEFT HAND OF ASSIGNMENT
# Possibly useful
##############################

lhsExceptDotted -> (ref | percentRef | slotRef)                  {% ([item]) => n(item[0], 'lhsExceptDotted') %}
lhs             -> (ref | percentRef | slotRef | dottedProperty) {% ([item]) => n(item[0], 'lhs') %}

# Long references to internal properties and methods
dottedProperty  -> ("the" ("value" "of" "the"):?) slotRef internalWord atom {% ([_, slot, __, lhs]) => n({
  ast: 'dottedProperty',
  children: [lhs, slot]
}) %}

internalWord    -> ("internal" ("method" | "property" | "slot") "of")

# array[idx]
dottedProperty  -> lhs "[" expr "]"                               {% ([lhs, _, expr]) => n({
                                                                    ast: 'dottedProperty',
                                                                    children: [lhs, expr]
                                                                  }) %}
