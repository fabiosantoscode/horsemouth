import { parseHTML } from "linkedom";
import "../experiments";
import { parseAlgorithmStep, parseAlgorithm } from "./parse";

const { document } = parseHTML(getSetConstructorSpecHtml());

const alg = document.children[0];

it("parse step using grammar", () => {
  // if `newtarget` is undefined, throw a TypeError exception
  expect(parseAlgorithmStep(alg.children[0].children[0])).toMatchInlineSnapshot(
    `(condition (<newtarget> equals <undefined>) (throw_ <typeerror>))`
  );
});

it("can parse some math", () => {
  expect(parseAlgorithmStep("set k to k + 1.")).toMatchInlineSnapshot(
    `(set <k> (<k> + (number 1)))`
  );
  expect(
    parseAlgorithmStep('if k is 1, then return "one".')
  ).toMatchInlineSnapshot(
    `(condition (<k> equals (number 1)) (return_ (string one)))`
  );
});

it("parse whole algo using grammar", () => {
  // if `newtarget` is undefined, throw a TypeError exception
  expect(parseAlgorithm(alg)).toMatchInlineSnapshot(`
    [
      (condition (<newtarget> equals <undefined>) (throw_ <typeerror>)),
      let set = (call <ordinarycreatefromconstructor> <newtarget> (percentReference set.prototype) (List [[setdata]])),
      (set <set>.[[setdata]] (List )),
      (condition ((<iterable> equals <undefined>) or (<iterable> equals <null>)) (return_ <set>)),
      let adder = (call <get> <set> (string add)),
      (condition ((call <iscallable> <adder>) equals <false>) (throw_ <typeerror>)),
      let iteratorrecord = (call <getiterator> <iterable>),
      repeat: [
        block: [
            let next = (call <iteratorstep> <iteratorrecord>)
            (condition (<next> equals <false>) (return_ <set>))
            let nextvalue = (call <iteratorvalue> <next>)
            let status = (call <completion> (call <call> <adder> <set> (List <nextvalue>)))
            (call <ifabruptcloseiterator> <status> <iteratorrecord>)
          ]
      ],
    ]
  `);
});

it("Weakset has", () => {
  const { document } = parseHTML(getWeakSetHasSpecHtml());
  const alg = document.children[0];
  console.log(alg.textContent);
  expect(parseAlgorithm(alg)).toMatchInlineSnapshot(`
    [
      let s = <this>,
      (call <requireinternalslot> <s> [[weaksetdata]]),
      let entries = (typeCheck <list> <s>.[[weaksetdata]]),
      (condition (not ((call <type> <value>) equals <object>)) (return_ <false>)),
      (forEach e <entries> block: [
        (condition ((not (<e> equals <empty>)) and ((call <samevalue> <e> <value>) equals <true>)) (return_ <true>))
      ]),
      (return_ <false>),
    ]
  `);
});

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
