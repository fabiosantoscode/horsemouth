
@{%
const reservedWords = new Set(`
  if then else let be is the of
  and or not TypeError exception
  otherwise either while
`.split(/\n/g).join(' ').split(/\s+/g))
%}

# expr -> atom is in math.ne

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

literal       -> ("the" | "an") "empty" "string" {% ([]) => ({
                                                  ast: 'string',
                                                  children: ['']
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
                                                    n(lhs, 'dotted property lhs'),
                                                    ...props.map(p => n(p[1], 'dotted property rhs'))
                                                  ]
                                                }) %}

atom          -> %wellKnownSymbol               {% ([id]) => ({
                                                  ast: 'wellKnownSymbol',
                                                  children: [id.text]
                                                }) %}

# CALLS
######################################
atom          -> call                                       {% id %}
call          -> callStart lhs "(" call_args ")"            {% ([_drop, id, paren, callArgs]) => ({
                                                              ast: 'call',
                                                              children: [id, ...callArgs]
                                                            }) %}
# drop stopwords
callStart     -> "perform":? ("!" | "?"):?                  {% id %}

call_args     -> (",":? expr):*                             {% ([args]) => args.map(a => a[1]) %}
