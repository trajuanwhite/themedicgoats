/* Presentation controls for illustrative activation dataset. */
(function(){
 "use strict";
 const data=window.MedicActivation, api=window.MedicLabAPI;
 const panel=document.getElementById("activation-study");
 if(!data||!api||!panel)return;
 const $=id=>document.getElementById(id);
 const track=$("activation-track"),list=$("activation-list"),scrub=$("activation-scrub");
 if(!data.validate()){panel.insertAdjacentText("beforeend","Timeline data invalid.");return;}
 const colors=["#d4a676","#e3b57b","#cba275","#b88b6c","#c08266","#b15a54","#a77b71","#c78a91","#e1cfc0"];
 const buttons=[];
 data.stages.forEach((stage,i)=>{
   const segment=document.createElement("span");segment.className="activation-stage";
   segment.style.flex=String(stage.end-stage.start);segment.style.background=colors[i];track.appendChild(segment);
   const btn=document.createElement("button");btn.type="button";btn.className="activation-item";
   const title=document.createElement("strong");title.textContent=stage.label;
   const timing=document.createElement("span");timing.textContent=stage.start+"–"+stage.end+" ms (example)";
   btn.append(title,timing);
   btn.addEventListener("click",()=>api.seek((stage.start+2)/data.cycleMs));
   list.appendChild(btn);buttons.push({btn,segment});
 });
 scrub.addEventListener("input",()=>api.seek(Number(scrub.value)/data.cycleMs));
 let last="";
 const rhythmMode=$("rhythm-mode");
 const rhythmDescriptions={
  blocked:"Atrial impulse fails to conduct.",
  accessory:"The accessory pathway activates ventricular tissue early.",
  "ventricular-origin":"Activation starts in ventricular tissue.",
  fibrillation:"Chaotic ventricular activity with no organized beat."
 };
 window.MedicActivationUI={
  update(phase,bpm,rhythm){
    const sinus=!rhythm||rhythm.mode==="sinus";
    const current=data.at(phase);
    const stageId=sinus?current.stage.id:rhythm.stage==="rest"?"diastole":rhythm.stage;
    const idx=data.stages.findIndex(stage=>stage.id===stageId);
    const fibrillation=stageId==="fibrillation";
    const elapsed=sinus?current.ms*75/bpm:phase*60000/bpm;
    scrub.value=String(fibrillation?0:Math.min(data.cycleMs-1,Math.round(current.ms)));
    $("activation-time").textContent=fibrillation?"No organized cycle":Math.round(elapsed)+" ms";
    const key=(rhythm?.mode||"sinus")+":"+stageId;
    if(key===last)return;
    buttons.forEach((x,i)=>{
      const active=i===idx;
      x.btn.classList.toggle("active",active);
      x.segment.classList.toggle("active",active);
      x.btn.setAttribute("aria-current",String(active));
    });
    const stage=data.stages[idx];
    const branch=rhythm?.blockedBranch;
    const branchDetail=branch&&(stageId==="bundles"||stageId==="ventricles")
      ? (branch==="right"?"Left":"Right")+" bundle conducts first. The "+branch+" ventricle activates later."
      : null;
    $("activation-description").textContent=stage
      ? stage.label+": "+(branchDetail||stage.description)
      : (rhythmDescriptions[stageId]||"");
    last=key;
  }
 };
 function syncMode(){
  const sinus=rhythmMode.value==="sinus";
  scrub.disabled=!sinus;
  buttons.forEach(x=>x.btn.disabled=!sinus);
  window.MedicActivationUI.update(api.getPhase(),api.getBpm(),window.MedicLabState?.rhythm);
 }
 rhythmMode.addEventListener("change",syncMode);
 syncMode();
})();
