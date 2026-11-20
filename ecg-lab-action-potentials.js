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
const stages={
 ventricular:{
  sa:4,atria:0,av:4,his:0,bundles:0,ventricles:0,plateau:2,recovery:3,diastole:4
 },
 nodal:{sa:0,atria:3,av:4,his:3,bundles:3,ventricles:3,plateau:4,recovery:3,diastole:4}
};
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
const stageLabels={sa:"SA node",atria:"Atrial depolarization",av:"AV nodal delay",his:"His bundle",bundles:"Bundle branches",ventricles:"Ventricular activation",plateau:"ST segment",recovery:"Ventricular recovery",diastole:"Electrical rest"};
let last="";
function draw(){
 const type=select.value;
 const curve=curves[type];
 path.setAttribute("d",curve.points.map((p,i)=>(i?"L":"M")+p[0]+" "+p[1]).join(" "));
 const phase=window.MedicLabAPI?.getPhase?.()||0;
 const stage=window.MedicActivation?.at(phase)?.stage?.id||"diastole";
 const phaseIndex=stages[type][stage]??4;
 const key=type+":"+stage+":"+phaseIndex;
 if(key!==last){
  const data=facts[type][phaseIndex];
  phaseName.textContent=data.name;
  stageName.textContent="Timeline: "+(stageLabels[stage]||stage);
  summary.textContent=data.description;
  ions.replaceChildren(...data.ions.map((message,i)=>{
   const item=document.createElement("div");item.className="ap-ion";
   const head=document.createElement("strong");head.textContent=["Na⁺","Ca²⁺","K⁺"][i];
   const detail=document.createElement("span");detail.textContent=message;
   item.append(head,detail);return item;
  }));
  context.textContent=type==="nodal"?"Pacemaker cells use phases 4, 0 and 3; they do not have a distinct ventricular-style plateau.":"Ventricular cells have phases 0–4. Atrial and Purkinje cell action potentials have their own differences.";
  last=key;
 }
 const pos=curve.positions[phaseIndex];marker.setAttribute("cx",pos[0]);marker.setAttribute("cy",pos[1]);
}
select.addEventListener("change",()=>{last="";draw()});
function loop(){if(!select.isConnected)return;draw();requestAnimationFrame(loop)}
loop();
})();