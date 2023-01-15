
# LISTS
######################################

expr          -> list                           {% id %}
list          -> %lList list_items %rList       {% ([lList, items, rList]) => ({
                                                  ast: 'list',
                                                  children: items
                                                }) %}

list_items    -> (",":? expr):*                 {% ([items]) =>
                                                  items.map(a => a[1]) %}

list          -> "a" "new" "empty" "list"       {% ([new_, empty, list]) => ({
                                                  ast: 'list',
                                                  children: []
                                                }) %}



statement   -> push
            {% id %}

push        -> append_
              lhs
              appendTo_
              lhs

            {% ([_append, obj, _to, list]) => {
              return {
                ast: 'call',
                children: [
                  { ast: 'reference', children: ['PUSH'] },
                  list,
                  obj,
                ]
              }
            } %}

append_     -> "append" | "add"                 {% id %}
appendTo_   -> ("as" "the" "last" "element" "of") | ("to" "the" "end" "of") | "to" {% id %}


atom        -> (
                 ("the" "number" "of" "elements" "in") |
                 ("the" "number" "of" "elements" "of") |
                 ("the" "length" "of") |
                 ("the" "size" "of")
               ) expr                           {% ([numofelements_, expr]) => n({
                                                  ast: 'call',
                                                  children: [
                                                    { ast: 'reference', children: ['LENGTH'] },
                                                    expr
                                                  ]
                                                }) %}
