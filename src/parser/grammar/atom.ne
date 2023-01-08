
@{%
const reservedWords = new Set(`
  if then else let be is the of
  and or not TypeError exception
  otherwise either while NaN
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

literal       -> numericLiteral                 {% id %}
literal       -> numericLiteral "𝔽"             {% ([num]) => n({
                                                  ast: 'float',
                                                  children: [Number(num.children[0])]
                                                }) %}
literal       -> numericLiteral "ℤ"             {% ([num]) => n({
                                                  ast: 'bigint',
                                                  children: [BigInt(num.children[0])]
                                                }) %}

numericLiteral-> %number                        {% ([id]) => ({
                                                  ast: 'number',
                                                  children: [id.text]
                                                }) %}
numericLiteral-> "∞"                            {% id => ({
                                                  ast: 'number',
                                                  children: ["Infinity"]
                                                }) %}
numericLiteral-> "NaN"                          {% id => ({
                                                  ast: 'number',
                                                  children: ["NaN"]
                                                }) %}
numericLiteral-> ("the" | "an") "empty" "string" {% ([]) => ({
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

atom          -> ("the" "value" "of":?) atom    {% ([redundant, id]) => id %}

# CALLS
######################################
atom          -> call                           {% id %}
call          -> callStart callTarget call_args {% ([_drop, id, callArgs]) => ({
                                                  ast: 'call',
                                                  children: [id, ...callArgs]
                                                }) %}

# drop stopwords
callStart     -> "perform":? ("!" | "?"):?      {% id %}

callTarget    -> lhs                            {% id %}
callTarget    -> %word ":" ":" %word            {% ([target, _colon, _colon2, target2]) => n({
                                                  ast: 'reference',
                                                  children: [target.text + '::' + target2.text]
                                                }) %}

call_args     -> "(" expr ("," expr):* ")"      {% ([paren, firstArg, args]) => [
                                                  n(firstArg),
                                                  ...args.map(a => n(a[1]))
                                                ] %}

call_args     -> "(" ")"                        {% () => [] %}
