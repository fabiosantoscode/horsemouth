import { parseHTML } from "linkedom";
import "../experiments";
import { parseAlgorithmBlock } from "./parseBlock";

const { document } = parseHTML(getSetConstructorSpecHtml());

const alg = document.children[0];

it("parse whole algo using grammar", () => {
  // if `newtarget` is undefined, throw a TypeError exception
  expect(parseAlgorithmBlock(alg)).toMatchInlineSnapshot(`
    block: [
      (if (<newtarget> equals <undefined>)
        then: (throw_ <typeerror>)
      )
      let set = (call <ordinarycreatefromconstructor> <newtarget> (percentReference set.prototype) (List [[setdata]]))
      (set <set>.[[setdata]] (List ))
      (if ((<iterable> equals <undefined>) or (<iterable> equals <null>))
        then: (return_ <set>)
      )
      let adder = (call <get> <set> (string add))
      (if ((call <iscallable> <adder>) equals <false>)
        then: (throw_ <typeerror>)
      )
      let iteratorrecord = (call <getiterator> <iterable>)
      repeat: [
        block: [
          let next = (call <iteratorstep> <iteratorrecord>)
          (if (<next> equals <false>)
            then: (return_ <set>)
          )
          let nextvalue = (call <iteratorvalue> <next>)
          let status = (call <completion> (call <call> <adder> <set> (List <nextvalue>)))
          (call <ifabruptcloseiterator> <status> <iteratorrecord>)
        ]
      ]
    ]
  `);
});

it("can parse if/else which can go in 2 lines", () => {
  expect(
    parseAlgorithmBlock([
      'If x is 1, then return "then".',
      'Else, return "else".',
    ])
  ).toMatchInlineSnapshot(`
    block: [
      (if (<x> equals (number 1))
        then: (return_ (string then))
        else: (return_ (string else))
      )
    ]
  `);

  expect(
    parseAlgorithmBlock([
      'If x is 1, then return "then".',
      'Else if x is 2, return "else 1".',
      'Else, return "else 2".',
    ])
  ).toMatchInlineSnapshot(`
    block: [
      (if (<x> equals (number 1))
        then: (return_ (string then))
        else: (if (<x> equals (number 2))
          then: (return_ (string else 1))
          else: (return_ (string else 2))
        )
      )
    ]
  `);
});

it("Weakset has", () => {
  const { document } = parseHTML(getWeakSetHasSpecHtml());
  const alg = document.children[0];
  expect(parseAlgorithmBlock(alg)).toMatchInlineSnapshot(`
    block: [
      let s = <this>
      (call <requireinternalslot> <s> [[weaksetdata]])
      let entries = (typeCheck <list> <s>.[[weaksetdata]])
      (if (not ((call <type> <value>) equals <object>))
        then: (return_ <false>)
      )
      (forEach e <entries> block: [
        (if ((not (<e> equals <empty>)) and ((call <samevalue> <e> <value>) equals <true>))
          then: (return_ <true>)
        )
      ])
      (return_ <false>)
    ]
  `);
});

it("regexpbuiltinexec", () => {
  const { document } = parseHTML(getRegExpBuiltinExecSpecHtml());
  document.querySelectorAll("span").forEach((span) => span.remove());
  const alg = document.children[0];
  expect(parseAlgorithmBlock(alg, { allowUnknown: true }))
    .toMatchInlineSnapshot(`
    block: [
      (assert (unknown r is an initialized regexp instance))
      (assert ((call <type> <s>) equals <string>))
      (unknown Let length be the number of code units in S .)
      let lastindex = (call <ℝ> (call <tolength> (call <get> <r> (string lastindex))))
      let flags = <r>.[[originalflags]]
      (if (call <CONTAINS> <flags> (string g))
        then: let global = <true>
        else: let global = <false>
      )
      (if (call <CONTAINS> <flags> (string y))
        then: let sticky = <true>
        else: let sticky = <false>
      )
      (if ((<global> equals <false>) and (<sticky> equals <false>))
        then: (set <lastindex> (number 0))
      )
      let matcher = <r>.[[regexpmatcher]]
      (if (call <CONTAINS> <flags> (string u))
        then: let fullunicode = <true>
        else: let fullunicode = <false>
      )
      let matchsucceeded = <false>
      (repeatWhile (<matchsucceeded> equals <false>) block: [
        (if (<lastindex> > <length>)
          then: block: [
            (if ((<global> equals <true>) or (<sticky> equals <true>))
              then: block: [
                (call <set> <r> (string lastindex) (+ (float 0)) <true>)
              ]
            )
            (return_ <null>)
          ]
        )
        let r = (call <matcher> <s> <lastindex>)
        (if (<r> equals <failure>)
          then: block: [
            (if (<sticky> equals <true>)
              then: block: [
                (call <set> <r> (string lastindex) (+ (float 0)) <true>)
                (return_ <null>)
              ]
            )
            (set <lastindex> (call <advancestringindex> <s> <lastindex> <fullunicode>))
          ]
          else: block: [
            (assert (unknown r is a state))
            (set <matchsucceeded> <true>)
          ]
        )
      ])
      (unknown Let e be r 's endIndex value.)
      (if (<fullunicode> equals <true>)
        then: block: [
          (unknown e is an index into the Input character list , derived from S , matched by matcher . Let eUTF be the smallest index into S that corresponds to the character at element e of Input . If e is greater than or equal to the number of elements in Input , then eUTF is the number of code units in S .)
          (set <e> <eutf>)
        ]
      )
      (if ((<global> equals <true>) or (<sticky> equals <true>))
        then: block: [
          (call <set> <r> (string lastindex) (call <𝔽> <e>) <true>)
        ]
      )
      (unknown Let n be the number of elements in r 's captures List . (This is the same value as 22.2.2.1 's NcapturingParens .))
      (assert (<n> < (((number 2) ** (number 32)) - (number 1))))
      let a = (call <arraycreate> (<n> + (number 1)))
      (assert (unknown the mathematical value of a 's "length" property is n + 1))
      (call <createdatapropertyorthrow> <a> (string index) (call <𝔽> <lastindex>))
      (call <createdatapropertyorthrow> <a> (string input) <s>)
      let matchedsubstr = (call <SUBSTRING> <s> <lastindex> <e>)
      (call <createdatapropertyorthrow> <a> (string 0) <matchedsubstr>)
      (unknown If R contains any GroupName , then block: [
        let groups = (call <ordinaryobjectcreate> <null>)
      ] (unknown else (else block: [
        let groups = <undefined>
      ])))
      (call <createdatapropertyorthrow> <a> (string groups) <groups>)
      (unknown For each integer i such that i ≥ 1 and i ≤ n , do block: [
        (unknown Let captureI be i th element of r 's captures List .)
        (if (<capturei> equals <undefined>)
          then: let capturedvalue = <undefined>
          else: (if (<fullunicode> equals <true>)
            then: block: [
              (assert (unknown capturei is a list of code points))
              let capturedvalue = (call <codepointstostring> <capturei>)
            ]
            else: block: [
              (assert (<fullunicode> equals <false>))
              (assert (unknown capturei is a list of code units))
              (unknown Let capturedValue be the String value consisting of the code units of captureI .)
            ]
          )
        )
        (call <createdatapropertyorthrow> <a> (call <tostring> (call <𝔽> <i>)) <capturedvalue>)
        (unknown If the i th capture of R was defined with a GroupName , then block: [
          (unknown Let s be the CapturingGroupName of the corresponding RegExpIdentifierName .)
          (call <createdatapropertyorthrow> <groups> <s> <capturedvalue>)
        ])
      ])
      (return_ <a>)
    ]
  `);
});

function getWeakSetHasSpecHtml() {
  return `
    <emu-alg>
      <ol>
        <li>Let <var>S</var> be the <emu-val>this</emu-val> value. </li>
        <li>Perform ?&nbsp; <emu-xref aoid="RequireInternalSlot" id="_ref_12035">
            <a href="#sec-requireinternalslot">RequireInternalSlot</a>
          </emu-xref>( <var>S</var>, [[WeakSetData]]). </li>
        <li>Let <var>entries</var> be the <emu-xref href="#sec-list-and-record-specification-type" id="_ref_12036">
            <a href="#sec-list-and-record-specification-type">List</a>
          </emu-xref> that is <var>S</var>.[[WeakSetData]]. </li>
        <li>If <emu-xref aoid="Type" id="_ref_12037">
            <a href="#sec-ecmascript-data-types-and-values">Type</a>
          </emu-xref>( <var>value</var>) is not Object, return <emu-val>false</emu-val>. </li>
        <li>For each element <var>e</var> of <var>entries</var>, do
          <ol>
            <li>If <var>e</var> is not <emu-const>empty</emu-const> and <emu-xref aoid="SameValue" id="_ref_12038">
                <a href="#sec-samevalue">SameValue</a>
              </emu-xref>( <var>e</var>, <var>value</var>) is <emu-val>true</emu-val>, return <emu-val>true</emu-val>.
            </li>
          </ol>
        </li>
        <li>Return <emu-val>false</emu-val>. </li>
      </ol>
    </emu-alg>
  `;
}

function getRegExpBuiltinExecSpecHtml() {
  return `

   <emu-alg>
      <ol>
         <li>
            <emu-xref href="#assert" id="_ref_8520"><a href="#assert">Assert</a></emu-xref>
            : <var>R</var> is an initialized RegExp instance.
         </li>
         <li>
            <emu-xref href="#assert" id="_ref_8521"><a href="#assert">Assert</a></emu-xref>
            :
            <emu-xref aoid="Type" id="_ref_8522"><a href="#sec-ecmascript-data-types-and-values">Type</a></emu-xref>
            (<var>S</var>) is String.
         </li>
         <li>Let <var>length</var> be the number of code units in <var>S</var>.</li>
         <li>
            Let <var>lastIndex</var> be
            <emu-xref href="#ℝ" id="_ref_8523"><a href="#ℝ">ℝ</a></emu-xref>
            (?
            <emu-xref aoid="ToLength" id="_ref_8524"><a href="#sec-tolength">ToLength</a></emu-xref>
            (?
            <emu-xref aoid="Get" id="_ref_8525"><a href="#sec-get-o-p">Get</a></emu-xref>
            (<var>R</var>,
            <emu-val>"lastIndex"</emu-val>
            ))).
         </li>
         <li>Let <var>flags</var> be <var>R</var>.[[OriginalFlags]].</li>
         <li>
            If <var>flags</var> contains
            <emu-val>"g"</emu-val>
            , let <var>global</var> be
            <emu-val>true</emu-val>
            ; else let <var>global</var> be
            <emu-val>false</emu-val>
            .
         </li>
         <li>
            If <var>flags</var> contains
            <emu-val>"y"</emu-val>
            , let <var>sticky</var> be
            <emu-val>true</emu-val>
            ; else let <var>sticky</var> be
            <emu-val>false</emu-val>
            .
         </li>
         <li>
            If <var>global</var> is
            <emu-val>false</emu-val>
            and <var>sticky</var> is
            <emu-val>false</emu-val>
            , set <var>lastIndex</var> to 0.
         </li>
         <li>Let <var>matcher</var> be <var>R</var>.[[RegExpMatcher]].</li>
         <li>
            If <var>flags</var> contains
            <emu-val>"u"</emu-val>
            , let <var>fullUnicode</var> be
            <emu-val>true</emu-val>
            ; else let <var>fullUnicode</var> be
            <emu-val>false</emu-val>
            .
         </li>
         <li>
            Let <var>matchSucceeded</var> be
            <emu-val>false</emu-val>
            .
         </li>
         <li>
            Repeat, while <var>matchSucceeded</var> is
            <emu-val>false</emu-val>
            ,
            <ol>
               <li>
                  If <var>lastIndex</var> &gt; <var>length</var>, then
                  <ol>
                     <li>
                        If <var>global</var> is
                        <emu-val>true</emu-val>
                        or <var>sticky</var> is
                        <emu-val>true</emu-val>
                        , then
                        <ol>
                           <li>
                              Perform ?&nbsp;
                              <emu-xref aoid="Set" id="_ref_8526"><a href="#sec-set-o-p-v-throw">Set</a></emu-xref>
                              (<var>R</var>,
                              <emu-val>"lastIndex"</emu-val>
                              ,
                              <emu-val>+0</emu-val>
                              <sub>𝔽</sub>,
                              <emu-val>true</emu-val>
                              ).
                           </li>
                        </ol>
                     </li>
                     <li>
                        Return
                        <emu-val>null</emu-val>
                        .
                     </li>
                  </ol>
               </li>
               <li>Let <var>r</var> be <var>matcher</var>(<var>S</var>, <var>lastIndex</var>).</li>
               <li>
                  If <var>r</var> is
                  <emu-const>failure</emu-const>
                  , then
                  <ol>
                     <li>
                        <span>i. </span><span>i. </span>If <var>sticky</var> is
                        <emu-val>true</emu-val>
                        , then
                        <ol>
                           <li>
                              Perform ?&nbsp;
                              <emu-xref aoid="Set" id="_ref_8527"><a href="#sec-set-o-p-v-throw">Set</a></emu-xref>
                              (<var>R</var>,
                              <emu-val>"lastIndex"</emu-val>
                              ,
                              <emu-val>+0</emu-val>
                              <sub>𝔽</sub>,
                              <emu-val>true</emu-val>
                              ).
                           </li>
                           <li>
                              Return
                              <emu-val>null</emu-val>
                              .
                           </li>
                        </ol>
                     </li>
                     <li>
                        Set <var>lastIndex</var> to
                        <emu-xref aoid="AdvanceStringIndex" id="_ref_8528"><a href="#sec-advancestringindex">AdvanceStringIndex</a></emu-xref>
                        (<var>S</var>, <var>lastIndex</var>, <var>fullUnicode</var>).
                     </li>
                  </ol>
               </li>
               <li>
                  <span>d. </span><span>d. </span>Else,
                  <ol>
                     <li>
                        <span>i. </span><span>i. </span>
                        <emu-xref href="#assert" id="_ref_8529"><a href="#assert">Assert</a></emu-xref>
                        : <var>r</var> is a State.
                     </li>
                     <li>
                        Set <var>matchSucceeded</var> to
                        <emu-val>true</emu-val>
                        .
                     </li>
                  </ol>
               </li>
            </ol>
         </li>
         <li><span>13. </span><span>13. </span>Let <var>e</var> be <var>r</var>'s <var>endIndex</var> value.</li>
         <li>
            <span>14. </span><span>14. </span>If <var>fullUnicode</var> is
            <emu-val>true</emu-val>
            , then
            <ol>
               <li><span>a. </span><span>a. </span><var>e</var> is an index into the <var>Input</var> character list, derived from <var>S</var>, matched by <var>matcher</var>. Let <var>eUTF</var> be the smallest index into <var>S</var> that corresponds to the character at element <var>e</var> of <var>Input</var>. If <var>e</var> is greater than or equal to the number of elements in <var>Input</var>, then <var>eUTF</var> is the number of code units in <var>S</var>.</li>
               <li>Set <var>e</var> to <var>eUTF</var>.</li>
            </ol>
         </li>
         <li>
            <span>15. </span><span>15. </span>If <var>global</var> is
            <emu-val>true</emu-val>
            or <var>sticky</var> is
            <emu-val>true</emu-val>
            , then
            <ol>
               <li>
                  <span>a. </span><span>a. </span>Perform ?&nbsp;
                  <emu-xref aoid="Set" id="_ref_8530"><a href="#sec-set-o-p-v-throw">Set</a></emu-xref>
                  (<var>R</var>,
                  <emu-val>"lastIndex"</emu-val>
                  ,
                  <emu-xref href="#𝔽" id="_ref_8531"><a href="#𝔽">𝔽</a></emu-xref>
                  (<var>e</var>),
                  <emu-val>true</emu-val>
                  ).
               </li>
            </ol>
         </li>
         <li>
            <span>16. </span><span>16. </span>Let <var>n</var> be the number of elements in <var>r</var>'s <var>captures</var>
            <emu-xref href="#sec-list-and-record-specification-type" id="_ref_8532"><a href="#sec-list-and-record-specification-type">List</a></emu-xref>
            . (This is the same value as
            <emu-xref href="#sec-notation" id="_ref_708"><a href="#sec-notation">22.2.2.1</a></emu-xref>
            's <var>NcapturingParens</var>.)
         </li>
         <li>
            <span>17. </span><span>17. </span>
            <emu-xref href="#assert" id="_ref_8533"><a href="#assert">Assert</a></emu-xref>
            : <var>n</var> &lt; 2<sup>32</sup> - 1.
         </li>
         <li>
            <span>18. </span><span>18. </span>Let <var>A</var> be !&nbsp;
            <emu-xref aoid="ArrayCreate" id="_ref_8534"><a href="#sec-arraycreate">ArrayCreate</a></emu-xref>
            (<var>n</var> + 1).
         </li>
         <li>
            <span>19. </span><span>19. </span>
            <emu-xref href="#assert" id="_ref_8535"><a href="#assert">Assert</a></emu-xref>
            : The
            <emu-xref href="#mathematical-value" id="_ref_8536"><a href="#mathematical-value">mathematical value</a></emu-xref>
            of <var>A</var>'s
            <emu-val>"length"</emu-val>
            property is <var>n</var> + 1.
         </li>
         <li>
            <span>20. </span><span>20. </span>Perform !&nbsp;
            <emu-xref aoid="CreateDataPropertyOrThrow" id="_ref_8537"><a href="#sec-createdatapropertyorthrow">CreateDataPropertyOrThrow</a></emu-xref>
            (<var>A</var>,
            <emu-val>"index"</emu-val>
            ,
            <emu-xref href="#𝔽" id="_ref_8538"><a href="#𝔽">𝔽</a></emu-xref>
            (<var>lastIndex</var>)).
         </li>
         <li>
            <span>21. </span><span>21. </span>Perform !&nbsp;
            <emu-xref aoid="CreateDataPropertyOrThrow" id="_ref_8539"><a href="#sec-createdatapropertyorthrow">CreateDataPropertyOrThrow</a></emu-xref>
            (<var>A</var>,
            <emu-val>"input"</emu-val>
            , <var>S</var>).
         </li>
         <li>
            <span>22. </span><span>22. </span>Let <var>matchedSubstr</var> be the
            <emu-xref href="#substring" id="_ref_8540"><a href="#substring">substring</a></emu-xref>
            of <var>S</var> from <var>lastIndex</var> to <var>e</var>.
         </li>
         <li>
            <span>23. </span><span>23. </span>Perform !&nbsp;
            <emu-xref aoid="CreateDataPropertyOrThrow" id="_ref_8541"><a href="#sec-createdatapropertyorthrow">CreateDataPropertyOrThrow</a></emu-xref>
            (<var>A</var>,
            <emu-val>"0"</emu-val>
            , <var>matchedSubstr</var>).
         </li>
         <li>
            <span>24. </span><span>24. </span>If <var>R</var> contains any
            <emu-nt id="_ref_18217"><a href="#prod-GroupName">GroupName</a></emu-nt>
            , then
            <ol>
               <li>
                  <span>a. </span><span>a. </span>Let <var>groups</var> be !&nbsp;
                  <emu-xref aoid="OrdinaryObjectCreate" id="_ref_8542"><a href="#sec-ordinaryobjectcreate">OrdinaryObjectCreate</a></emu-xref>
                  (
                  <emu-val>null</emu-val>
                  ).
               </li>
            </ol>
         </li>
         <li>
            <span>25. </span><span>25. </span>Else,
            <ol>
               <li>
                  <span>a. </span><span>a. </span>Let <var>groups</var> be
                  <emu-val>undefined</emu-val>
                  .
               </li>
            </ol>
         </li>
         <li>
            <span>26. </span><span>26. </span>Perform !&nbsp;
            <emu-xref aoid="CreateDataPropertyOrThrow" id="_ref_8543"><a href="#sec-createdatapropertyorthrow">CreateDataPropertyOrThrow</a></emu-xref>
            (<var>A</var>,
            <emu-val>"groups"</emu-val>
            , <var>groups</var>).
         </li>
         <li>
            <span>27. </span><span>27. </span>For each
            <emu-xref href="#integer" id="_ref_8544"><a href="#integer">integer</a></emu-xref>
            <var>i</var> such that <var>i</var> ≥ 1 and <var>i</var> ≤ <var>n</var>, do
            <ol>
               <li>
                  <span>a. </span><span>a. </span>Let <var>captureI</var> be <var>i</var><sup>th</sup> element of <var>r</var>'s <var>captures</var>
                  <emu-xref href="#sec-list-and-record-specification-type" id="_ref_8545"><a href="#sec-list-and-record-specification-type">List</a></emu-xref>
                  .
               </li>
               <li>
                  If <var>captureI</var> is
                  <emu-val>undefined</emu-val>
                  , let <var>capturedValue</var> be
                  <emu-val>undefined</emu-val>
                  .
               </li>
               <li>
                  Else if <var>fullUnicode</var> is
                  <emu-val>true</emu-val>
                  , then
                  <ol>
                     <li>
                        <span>i. </span><span>i. </span>
                        <emu-xref href="#assert" id="_ref_8546"><a href="#assert">Assert</a></emu-xref>
                        : <var>captureI</var> is a
                        <emu-xref href="#sec-list-and-record-specification-type" id="_ref_8547"><a href="#sec-list-and-record-specification-type">List</a></emu-xref>
                        of code points.
                     </li>
                     <li>
                        Let <var>capturedValue</var> be !&nbsp;
                        <emu-xref aoid="CodePointsToString" id="_ref_8548"><a href="#sec-codepointstostring">CodePointsToString</a></emu-xref>
                        (<var>captureI</var>).
                     </li>
                  </ol>
               </li>
               <li>
                  <span>d. </span><span>d. </span>Else,
                  <ol>
                     <li>
                        <span>i. </span><span>i. </span>
                        <emu-xref href="#assert" id="_ref_8549"><a href="#assert">Assert</a></emu-xref>
                        : <var>fullUnicode</var> is
                        <emu-val>false</emu-val>
                        .
                     </li>
                     <li>

                        <emu-xref href="#assert" id="_ref_8550"><a href="#assert">Assert</a></emu-xref>
                        : <var>captureI</var> is a
                        <emu-xref href="#sec-list-and-record-specification-type" id="_ref_8551"><a href="#sec-list-and-record-specification-type">List</a></emu-xref>
                        of code units.
                     </li>
                     <li><span>iii. </span><span>iii. </span>Let <var>capturedValue</var> be the String value consisting of the code units of <var>captureI</var>.</li>
                  </ol>
               </li>
               <li>
                  <span>e. </span><span>e. </span>Perform !&nbsp;
                  <emu-xref aoid="CreateDataPropertyOrThrow" id="_ref_8552"><a href="#sec-createdatapropertyorthrow">CreateDataPropertyOrThrow</a></emu-xref>
                  (<var>A</var>, !&nbsp;
                  <emu-xref aoid="ToString" id="_ref_8553"><a href="#sec-tostring">ToString</a></emu-xref>
                  (
                  <emu-xref href="#𝔽" id="_ref_8554"><a href="#𝔽">𝔽</a></emu-xref>
                  (<var>i</var>)), <var>capturedValue</var>).
               </li>
               <li>
                  <span>f. </span><span>f. </span>If the <var>i</var><sup>th</sup> capture of <var>R</var> was defined with a
                  <emu-nt id="_ref_18218"><a href="#prod-GroupName">GroupName</a></emu-nt>
                  , then
                  <ol>
                     <li>
                        <span>i. </span><span>i. </span>Let <var>s</var> be the
                        <emu-xref aoid="CapturingGroupName" id="_ref_8555"><a href="#sec-static-semantics-capturinggroupname">CapturingGroupName</a></emu-xref>
                        of the corresponding
                        <emu-nt id="_ref_18219"><a href="#prod-RegExpIdentifierName">RegExpIdentifierName</a></emu-nt>
                        .
                     </li>
                     <li>
                        Perform !&nbsp;
                        <emu-xref aoid="CreateDataPropertyOrThrow" id="_ref_8556"><a href="#sec-createdatapropertyorthrow">CreateDataPropertyOrThrow</a></emu-xref>
                        (<var>groups</var>, <var>s</var>, <var>capturedValue</var>).
                     </li>
                  </ol>
               </li>
            </ol>
         </li>
         <li><span>28. </span><span>28. </span>Return <var>A</var>.</li>
      </ol>
   </emu-alg>
`;
}

function getSetConstructorSpecHtml() {
  return `
    <emu-alg>
      <ol>
        <li>If NewTarget is <emu-val>undefined</emu-val>, throw a <emu-val>TypeError</emu-val> exception. </li>
        <li>Let <var>set</var> be ?&nbsp; <emu-xref aoid="OrdinaryCreateFromConstructor" id="_ref_11894">
            <a href="#sec-ordinarycreatefromconstructor" class="e-user-code">OrdinaryCreateFromConstructor</a>
          </emu-xref>(NewTarget, <emu-val>"%Set.prototype%"</emu-val>, « [[SetData]] »). </li>
        <li>Set <var>set</var>.[[SetData]] to a new empty <emu-xref href="#sec-list-and-record-specification-type" id="_ref_11895">
            <a href="#sec-list-and-record-specification-type">List</a>
          </emu-xref>. </li>
        <li>If <var>iterable</var> is either <emu-val>undefined</emu-val> or <emu-val>null</emu-val>, return <var>set</var>. </li>
        <li>Let <var>adder</var> be ?&nbsp; <emu-xref aoid="Get" id="_ref_11896">
            <a href="#sec-get-o-p" class="e-user-code">Get</a>
          </emu-xref>( <var>set</var>, <emu-val>"add"</emu-val>). </li>
        <li>If <emu-xref aoid="IsCallable" id="_ref_11897">
            <a href="#sec-iscallable">IsCallable</a>
          </emu-xref>( <var>adder</var>) is <emu-val>false</emu-val>, throw a <emu-val>TypeError</emu-val> exception. </li>
        <li>Let <var>iteratorRecord</var> be ?&nbsp; <emu-xref aoid="GetIterator" id="_ref_11898">
            <a href="#sec-getiterator" class="e-user-code">GetIterator</a>
          </emu-xref>( <var>iterable</var>). </li>
        <li>Repeat,
          <ol>
            <li>Let <var>next</var> be ?&nbsp; <emu-xref aoid="IteratorStep" id="_ref_11899">
                <a href="#sec-iteratorstep" class="e-user-code">IteratorStep</a>
              </emu-xref>( <var>iteratorRecord</var>). </li>
            <li>If <var>next</var> is <emu-val>false</emu-val>, return <var>set</var>. </li>
            <li>Let <var>nextValue</var> be ?&nbsp; <emu-xref aoid="IteratorValue" id="_ref_11900">
                <a href="#sec-iteratorvalue" class="e-user-code">IteratorValue</a>
              </emu-xref>( <var>next</var>). </li>
            <li>Let <var>status</var> be <emu-xref aoid="Completion" id="_ref_11901">
                <a href="#sec-completion-ao">Completion</a>
              </emu-xref>( <emu-xref aoid="Call" id="_ref_11902">
                <a href="#sec-call" class="e-user-code">Call</a>
              </emu-xref>( <var>adder</var>, <var>set</var>, « <var>nextValue</var> »)). </li>
            <li>
              <emu-xref aoid="IfAbruptCloseIterator" id="_ref_11903">
                <a href="#sec-ifabruptcloseiterator" class="e-user-code">IfAbruptCloseIterator</a>
              </emu-xref>( <var>status</var>, <var>iteratorRecord</var>).
            </li>
          </ol>
        </li>
      </ol>
    </emu-alg>
  `;
}
