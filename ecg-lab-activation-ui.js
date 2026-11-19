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
 let last=-1;
 window.MedicActivationUI={
  update(phase,bpm){
    const current=data.at(phase);
    scrub.value=String(Math.min(data.cycleMs-1,Math.round(current.ms)));
    $("activation-time").textContent=Math.round(current.ms*75/bpm)+" ms";
    const idx=data.stages.indexOf(current.stage);
    if(idx!==last){
      buttons.forEach((x,i)=>{const active=i===idx;x.btn.classList.toggle("active",active);x.segment.classList.toggle("active",active);x.btn.setAttribute("aria-current",String(active))});
      $("activation-description").textContent=current.stage.label+": "+current.stage.description;
      last=idx;
    }
  }
 };
 function syncMode(){
  const sinus=document.getElementById("rhythm-mode")?.value==="sinus";
  panel.classList.toggle("activation-sinus-only",!sinus);
  scrub.disabled=!sinus;
  buttons.forEach(x=>x.btn.disabled=!sinus);
  if(!sinus){
   $("activation-description").textContent="This nine-stage timeline illustrates sinus-origin conduction only. The heart drawing and ECG above now follow the selected arrhythmia instead.";
   $("activation-time").textContent="Rhythm-controlled";
  }else window.MedicActivationUI.update(api.getPhase(),api.getBpm());
 }
 document.getElementById("rhythm-mode")?.addEventListener("change",syncMode);
 syncMode();
})();
