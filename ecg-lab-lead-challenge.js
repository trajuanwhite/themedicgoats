/* Medic Goats ECG Lab — anatomical lead recognition practice.
   Uses teaching conventions, not diagnosis or coronary artery localization. */
(function(){
"use strict";
const host=document.getElementById("lead-challenge");
if(!host)return;
const grid=document.getElementById("challenge-grid");
const prompt=document.getElementById("challenge-prompt");
const feedback=document.getElementById("challenge-feedback");
const progress=document.getElementById("challenge-progress");
const check=document.getElementById("challenge-check");
const next=document.getElementById("challenge-next");
const restart=document.getElementById("challenge-restart");
const labels=["I","aVR","V1","V4","II","aVL","V2","V5","III","aVF","V3","V6"];
const questions=[
 {name:"Inferior",leads:["II","III","aVF"],info:"The conventional inferior group is II, III and aVF."},
 {name:"Septal (traditional label)",leads:["V1","V2"],info:"V1 and V2 are traditionally taught as septal, although their signals do not exclusively measure the septum."},
 {name:"Anterior",leads:["V3","V4"],info:"V3 and V4 are commonly described as anterior leads."},
 {name:"High lateral",leads:["I","aVL"],info:"I and aVL are usually described as high lateral leads."},
 {name:"Lateral (including high lateral)",leads:["I","aVL","V5","V6"],info:"The conventional lateral group contains I, aVL, V5, V6."},
 {name:"Precordial (chest)",leads:["V1","V2","V3","V4","V5","V6"],info:"Precordial leads V1–V6 record transverse-plane perspectives."}
];
let round=0,score=0,locked=false;
const chosen=new Set(),buttons=new Map();
labels.forEach(lead=>{
 const button=document.createElement("button");
 button.type="button";button.className="challenge-lead";button.textContent=lead;
 button.setAttribute("aria-pressed","false");
 button.setAttribute("aria-label","Select lead "+lead);
 button.addEventListener("click",()=>{
  if(locked)return;
  if(chosen.has(lead))chosen.delete(lead);else chosen.add(lead);
  button.classList.toggle("chosen",chosen.has(lead));
  button.setAttribute("aria-pressed",String(chosen.has(lead)));
 });
 buttons.set(lead,button);grid.appendChild(button);
});
function resetRound(){
 locked=false;chosen.clear();
 buttons.forEach(button=>{button.className="challenge-lead";button.disabled=false;button.setAttribute("aria-pressed","false")});
 prompt.textContent="Select every lead in the "+questions[round].name+" group.";
 progress.textContent="Question "+(round+1)+" of "+questions.length+" • Score "+score+"/"+questions.length;
 feedback.textContent="Tap all applicable leads, then check your answer.";
 check.hidden=false;next.hidden=true;restart.hidden=true;
}
check.addEventListener("click",()=>{
 if(locked)return;
 const correct=questions[round].leads;
 const isCorrect=correct.length===chosen.size&&correct.every(lead=>chosen.has(lead));
 if(isCorrect)score++;
 locked=true;
 buttons.forEach((button,lead)=>{
  button.disabled=true;
  if(correct.includes(lead))button.classList.add("correct");
  else if(chosen.has(lead))button.classList.add("incorrect");
 });
 feedback.textContent=(isCorrect?"Correct. ":"Not quite. ")+questions[round].info+" Green shows the expected group; red marks extra selections.";
 progress.textContent="Question "+(round+1)+" of "+questions.length+" • Score "+score+"/"+questions.length;
 check.hidden=true;
 if(round===questions.length-1){restart.hidden=false;feedback.textContent+=" Final score: "+score+"/"+questions.length+"."}
 else next.hidden=false;
});
next.addEventListener("click",()=>{round++;resetRound()});
restart.addEventListener("click",()=>{round=0;score=0;resetRound()});
resetRound();
})();
