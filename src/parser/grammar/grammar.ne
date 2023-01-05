
@lexer tokenizer

@include "./grammar/utils.ne"
@include "./grammar/statements.ne"
@include "./grammar/lhs.ne"
@include "./grammar/atom.ne"
@include "./grammar/math.ne"
@include "./grammar/booleanExpr.ne"

# ROOT RULE - the start of the grammar
######################################
root          -> statement                      {% id %}


# drop stopwords
callStart     -> "perform":? ("!" | "?"):?    {% id %}

call_args     -> (",":? expr):*           {% ([args]) =>
                                                  args.map(a => a[1]) %}

# LISTS
######################################

expr          -> list                           {% id %}
list          -> %lList list_items %rList       {% ([lList, items, rList]) => ({
                                                  ast: 'list',
                                                  children: items
                                                }) %}

list_items    -> (",":? expr):*           {% ([items]) =>
                                                  items.map(a => a[1]) %}

list          -> "a" "new" "empty" "list"       {% ([new_, empty, list]) => ({
                                                  ast: 'list',
                                                  children: []
                                                }) %}

# GETTING CONTEXT

expr          -> "the" "this" "value"           {% ([the, this_, value]) => ({
                                                  ast: 'reference',
                                                  children: ['this']
                                                }) %}

# TYPE CHECKS
######################################

expr          -> typeCheck                      {% id %}
typeCheck     -> "the" expr "that" "is" expr    {% ([the, expr, that, is, type]) => ({
                                                  ast: 'typeCheck',
                                                  children: [expr, type]
                                                }) %}

# INNER BLOCKS
######################################

innerBlockHack -> %innerBlockHack               {% ([b]) => ({
                                                  ast: 'innerBlockHack',
                                                  children: [b.value]
                                                }) %}
