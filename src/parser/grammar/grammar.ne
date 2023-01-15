
@lexer tokenizer

@include "./utils.ne"
@include "./statements.ne"
@include "./statements/assert.ne"
@include "./statements/conditions.ne"
@include "./lhs.ne"
@include "./atom.ne"
@include "./records.ne"
@include "./strings/strings.ne"
@include "./lists/lists.ne"
@include "./types.ne"
@include "./math.ne"
@include "./booleanExpr.ne"

# ROOT RULE - the start of the grammar
######################################
root          -> statement                      {% id %}



# GETTING CONTEXT

expr          -> "the":? "this" "value"         {% () => ({
                                                  ast: 'reference',
                                                  children: ['this']
                                                }) %}

# TYPE CHECKS
######################################

expr          -> typeCheck                      {% id %}
typeCheck     -> "the" expr ("that" "is") expr  {% ([the_, type, thatIs_, expr]) => ({
                                                  ast: 'typeCheck',
                                                  children: [type, expr]
                                                }) %}

typeCheck     -> "the" typee ref                {% ([the_, type, expr]) => ({
                                                  ast: 'typeCheck',
                                                  children: [type, expr]
                                                }) %}

typee          -> "list"                         {% () => ({
                                                  ast: 'reference',
                                                  children: ['list']
                                                }) %}

# INNER BLOCKS
######################################

innerBlockHack -> %innerBlockHack               {% ([b]) => ({
                                                  ast: 'innerBlockHack',
                                                  children: [b.value]
                                                }) %}
