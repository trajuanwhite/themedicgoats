/* Medic Goats ECG Lab: ECG lead localization teaching guide.
   Anatomical lead groups are descriptive, not coronary artery diagnosis. */
(function(){
"use strict";
const select=document.getElementById("territory-select"),desc=document.getElementById("territory-explain");
if(!select||!desc)return;
const groups={
 all:{leads:[],title:"All twelve leads",text:"All leads are visible. Choose a region to highlight the leads commonly used when describing ECG anatomical territories."},
 inferior:{leads:["II","III","aVF"],title:"Inferior",text:"II, III and aVF generally view the inferior surface. ECG localization does not by itself identify the responsible coronary artery."},
 septal:{leads:["V1","V2"],title:"Septal",text:"V1–V2 are commonly labeled septal leads in introductory ECG teaching. These surface leads do not isolate the interventricular septum, so interpret this label cautiously."},
 anterior:{leads:["V3","V4"],title:"Anterior",text:"V3–V4 are commonly grouped as anterior leads. Interpret them in the context of neighboring precordial leads and the full ECG."},
 lateral:{leads:["I","aVL","V5","V6"],title:"Lateral",text:"I, aVL, V5 and V6 are lateral-facing leads. High lateral: I and aVL; lower lateral: V5 and V6."},
 contiguous:{leads:["V1","V2","V3","V4","V5","V6"],title:"Precordial V1–V6",text:"The six chest leads show progressive views across the horizontal plane. This grouping is not a single coronary distribution."}
};
Object.entries(groups).forEach(([key,g])=>{const option=document.createElement("option");option.value=key;option.textContent=g.title;select.appendChild(option)});
select.value="all";
function update(){
 const group=groups[select.value]||groups.all;
 desc.textContent=group.text;
 for(const id of ["lead-grid","reference-leads"]){
  const grid=document.getElementById(id);
  if(!grid)continue;
  Array.from(grid.children).forEach(cell=>{
   const head=cell.querySelector("header,strong");
   const name=head?.textContent?.replace(/^Lead\s+/,"").trim();
   const highlighted=group.leads.includes(name);
   cell.classList.toggle("territory-highlight",highlighted);
   cell.classList.toggle("territory-dim",group.leads.length>0&&!highlighted);
  });
 }
 document.getElementById("territory-current").textContent=group.leads.length?group.leads.join(" · "):"I · II · III · aVR · aVL · aVF · V1–V6";
}
select.addEventListener("change",update);update();
})();
