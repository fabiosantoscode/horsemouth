
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
@include "./lists/checks.ne"
@include "./types.ne"
@include "./math.ne"
@include "./booleanExpr.ne"

# ROOT RULE - the start of the grammar
######################################
root          -> statement                      {% id %}



# GETTING CONTEXT

ref           -> "the":? "this" "value"         {% () => ({
                                                  ast: 'reference',
                                                  children: ['this']
                                                }) %}

ref           -> "this" type ("value" | "object"){% () => ({
                                                  ast: 'reference',
                                                  children: ['this']
                                                }) %}

# INNER BLOCKS
######################################

innerBlockHack -> %innerBlockHack               {% ([b]) => ({
                                                  ast: 'innerBlockHack',
                                                  children: [b.value]
                                                }) %}
