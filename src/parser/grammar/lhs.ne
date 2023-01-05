
# LEFT HAND OF ASSIGNMENT
# Possibly useful
##############################

lhsExceptDotted -> (ref | percentRef | slotRef)                  {% ([item]) => n(item[0], 'lhsExceptDotted') %}
lhs             -> (ref | percentRef | slotRef | dottedProperty) {% ([item]) => n(item[0], 'lhs') %}
