/* Cardiac cellular action potentials — synchronized teaching detail.
 * Illustrative curves; timing is not a tissue-activation or patient-voltage recording. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const select=$("ap-cell-type"),path=$("ap-trace-path"),marker=$("ap-trace-marker");
if(!select||!path||!marker)return;
const phaseName=$("ap-phase-name"),stageName=$("ap-stage-name"),summary=$("ap-summary"),ions=$("ap-ions"),context=$("ap-context");
const curves={
 ventricular:{points:[[46,205],[102,205],[135,29],[165,58],[184,65],[294,79],[345,102],[382,205],[490,205]],positions:{0:[135,29],1:[165,58],2:[265,76],3:[363,164],4:[87,205]}},
 nodal:{points:[[46,194],[85,181],[125,166],[177,139],[221,111],[252,43],[285,73],[346,167],[390,194],[490,177]],positions:{0:[252,43],3:[345,165],4:[151,155]}}
};
const phaseOrder={ventricular:[0,1,2,3,4],nodal:[4,0,3]};
const phaseControls=$("ap-phase-controls");
let selectedPhase=0;
const facts={
 ventricular:{
  0:{name:"Phase 0 — Rapid depolarization",description:"Fast voltage-gated sodium channels open. A rapid inward Na⁺ current produces the steep upstroke of the ventricular muscle-cell action potential.",ions:["Na⁺ → in (rapid)","Ca²⁺ — minor","K⁺ — background"]},
  1:{name:"Phase 1 — Initial repolarization",description:"Sodium channels inactivate; a brief transient outward potassium current causes the early notch.",ions:["Na⁺ channels inactivate","Ca²⁺ channels begin opening","K⁺ → out (transient)"]},
  2:{name:"Phase 2 — Plateau",description:"Calcium enters through L-type Ca²⁺ channels while potassium exits. Their competing currents sustain the plateau; calcium entry also initiates calcium release for contraction.",ions:["Na⁺ — little fast current","Ca²⁺ → in (L-type)","K⁺ → out"]},
  3:{name:"Phase 3 — Repolarization",description:"Calcium current falls and outward potassium currents dominate, bringing the membrane back toward its resting voltage.",ions:["Na⁺ channels recovering","Ca²⁺ influx decreases","K⁺ → out (dominant)"]},
  4:{name:"Phase 4 — Resting potential",description:"A ventricular myocyte remains near a stable negative resting voltage, maintained largely by potassium conductance. The Na⁺/K⁺ ATPase helps maintain ionic gradients over time.",ions:["Na⁺ gradient maintained","Ca²⁺ kept low inside","K⁺ sets resting voltage"]}
 },
 nodal:{
  0:{name:"Phase 0 — Nodal depolarization",description:"In SA and AV nodal cells, L-type calcium influx is responsible for most of the action-potential upstroke, unlike the fast sodium upstroke of ventricular muscle.",ions:["Na⁺ — not primary upstroke","Ca²⁺ → in (L-type)","K⁺ outflow decreases"]},
  3:{name:"Phase 3 — Nodal repolarization",description:"Calcium channels inactivate and potassium exits, returning the nodal membrane voltage toward its most negative level.",ions:["Na⁺ — no fast upstroke","Ca²⁺ current declines","K⁺ → out (dominant)"]},
  4:{name:"Phase 4 — Pacemaker potential",description:"SA/AV nodal cells spontaneously drift toward threshold. The funny current (If), falling outward potassium current, and calcium currents contribute to slow diastolic depolarization.",ions:["Na⁺ contributes via If","Ca²⁺ contributes near threshold","K⁺ outward current falls"]}
 }
};
function buildControls(){
 const type=select.value;
 const order=phaseOrder[type];
 if(!order.includes(selectedPhase))selectedPhase=order[0];
 phaseControls.replaceChildren();
 order.forEach(index=>{
  const button=document.createElement("button");
  button.type="button";
  button.textContent="Phase "+index;
  button.classList.toggle("active",selectedPhase===index);
  button.setAttribute("aria-pressed",String(selectedPhase===index));
  button.addEventListener("click",()=>{selectedPhase=index;buildControls();draw()});
  phaseControls.appendChild(button);
 });
 draw();
}
function draw(){
 const type=select.value;
 const curve=curves[type],data=facts[type][selectedPhase];
 path.setAttribute("d",curve.points.map((p,i)=>(i?"L":"M")+p[0]+" "+p[1]).join(" "));
 phaseName.textContent=data.name;
 stageName.textContent=type==="ventricular"?"Ventricular muscle cell":"SA / AV nodal cell";
 summary.textContent=data.description;
 ions.replaceChildren(...data.ions.map((message,i)=>{
  const item=document.createElement("div");item.className="ap-ion";
  const head=document.createElement("strong");head.textContent=["Na⁺","Ca²⁺","K⁺"][i];
  const detail=document.createElement("span");detail.textContent=message;
  item.append(head,detail);return item;
 }));
 context.textContent=type==="nodal"?
  "Nodal pacemaker cells follow phase 4 → 0 → 3 → 4; phases 1 and 2 are not distinct. This cellular sequence is separate from the conduction stages above.":
  "Ventricular muscle cells follow phase 0 → 1 → 2 → 3 → 4, then repeat with the next beat. This cellular sequence is separate from the conduction stages above.";
 const pos=curve.positions[selectedPhase];
 marker.setAttribute("cx",pos[0]);marker.setAttribute("cy",pos[1]);
}
select.addEventListener("change",()=>{
 selectedPhase=phaseOrder[select.value][0];
 buildControls();
});
buildControls();
})();