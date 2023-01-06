
@lexer tokenizer

@include "./utils.ne"
@include "./statements.ne"
@include "./statements/assert.ne"
@include "./statements/conditions.ne"
@include "./lhs.ne"
@include "./atom.ne"
@include "./types.ne"
@include "./math.ne"
@include "./booleanExpr.ne"

# ROOT RULE - the start of the grammar
######################################
root          -> statement                      {% id %}



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

expr          -> "the":? "this" "value"         {% () => ({
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
