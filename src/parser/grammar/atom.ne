
@{%
const reservedWords = new Set(`
  if then else let be is the of
  and or not a TypeError exception
  otherwise either
`.split(/\n/g).join(' ').split(/\s+/g))
%}

expr          -> atom                           {% id %}

# LITERALS
######################################

atom          -> literal                        {% id %}
literal       -> %string                        {% ([id]) => ({
                                                  ast: 'string',
                                                  children: [id.text.replaceAll(/["]/g, '')]
                                                }) %}
literal       -> %number                        {% ([id]) => ({
                                                  ast: 'number',
                                                  children: [Number(id.text)]
                                                }) %}


# REFERENCES TO THINGS
######################################

atom          -> ref                            {% id %}
ref           -> %word                          {% ([id], _, reject) => {
                                                  if (reservedWords.has(id.text)) {
                                                    return reject
                                                  } else {
                                                    return {
                                                      ast: 'reference',
                                                      children: [id.text]
                                                    }
                                                  }
                                                } %}

atom          -> percentRef                     {% id %}
percentRef    ->  %percentReference             {% ([ref]) => ({
                                                  ast: 'percentReference',
                                                  children: [ref.text.replaceAll(/["%]/g, '')]
                                                }) %}

atom          -> slotRef                        {% id %}
slotRef       -> %lSlotBrackets %word %rSlotBrackets {% ([brack, ref, rbrack]) => ({
                                                  ast: 'slotReference',
                                                  children: [ref.text.replaceAll(/[\[\]]/g, '')]
                                                }) %}

atom          -> dottedProperty                 {% id %}
dottedProperty-> lhsExceptDotted ("." lhsExceptDotted):+
                                                {% ([lhs, props]) => ({
                                                  ast: 'dottedProperty',
                                                  children: [
                                                    lhs[0],
                                                    ...props.map(p => p[1])
                                                  ]
                                                }) %}

