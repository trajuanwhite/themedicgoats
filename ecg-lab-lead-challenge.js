/* Medic Goats ECG Lab — selectable ECG interpretation practice. */
(function(){
"use strict";
const host=document.getElementById("lead-challenge");
if(!host)return;
const $=id=>document.getElementById(id);
const grid=$("challenge-grid"),prompt=$("challenge-prompt"),feedback=$("challenge-feedback");
const progress=$("challenge-progress"),check=$("challenge-check"),next=$("challenge-next");
const restart=$("challenge-restart"),quiz=$("challenge-quiz");
const intro=$("challenge-intro"),caveat=$("challenge-caveat");
const leads=["I","aVR","V1","V4","II","aVL","V2","V5","III","aVF","V3","V6"];
const arteries=[
 {id:"RCA",label:"Right coronary artery (RCA)"},
 {id:"LAD",label:"Left anterior descending (LAD)"},
 {id:"LCx",label:"Left circumflex artery (LCx)"},
 {id:"LM",label:"Left main coronary artery"}
];
const modes={
 territories:{
  intro:"Identify the anatomical lead groups on the standard 3 × 4 layout. Select every matching lead.",
  caveat:"Lead groups describe ECG viewing territories; they do not by themselves identify the culprit artery.",
  choices:leads,
  questions:[
   {prompt:"Select every lead in the Inferior group.",answers:["II","III","aVF"],info:"The inferior leads are II, III and aVF."},
   {prompt:"Select both leads traditionally called Septal.",answers:["V1","V2"],info:"V1 and V2 are traditionally called septal leads; their recordings are not exclusive to the septum."},
   {prompt:"Select the standard Anterior leads.",answers:["V3","V4"],info:"V3 and V4 are conventionally classified as anterior."},
   {prompt:"Select the High lateral leads.",answers:["I","aVL"],info:"I and aVL form the high lateral group."},
   {prompt:"Select every Lateral lead (including high lateral).",answers:["I","aVL","V5","V6"],info:"The lateral group includes I, aVL, V5 and V6."},
   {prompt:"Select all Precordial (chest) leads.",answers:["V1","V2","V3","V4","V5","V6"],info:"The six precordial leads are V1 through V6."}
  ]
 },
 reciprocal:{
  intro:"For each ST-elevation pattern, identify leads that commonly show reciprocal ST depression. These are pattern-recognition questions, not guarantees for every patient.",
  caveat:"Reciprocal ST changes are variable. Their presence or absence alone does not confirm or exclude coronary occlusion.",
  choices:leads,
  questions:[
   {prompt:"Inferior ST elevation (II, III, aVF): select the single most characteristic reciprocal lead.",answers:["aVL"],info:"Reciprocal ST depression in aVL is a characteristic finding with inferior ST elevation; lead I can also show depression."},
   {prompt:"High lateral ST elevation (I, aVL): select the inferior leads that may show reciprocal ST depression.",answers:["II","III","aVF"],info:"High lateral injury may be accompanied by reciprocal ST depression in the inferior leads II, III and aVF. Not every lead must show it in an actual ECG."},
   {prompt:"Posterior wall injury: select the anterior chest leads that commonly show reciprocal ST depression.",answers:["V1","V2","V3"],info:"Posterior infarction may present as horizontal ST depression in V1–V3, sometimes extending to V4; posterior leads V7–V9 can help confirm."}
  ]
 },
 arteries:{
  intro:"Choose the coronary artery most commonly associated with the described injury territory. Only one answer per question.",
  caveat:"Coronary dominance, anatomy, and occlusion site vary. ECG territory does not prove the culprit vessel.",
  choices:arteries,
  questions:[
   {prompt:"ST elevation in V3–V4 suggests an anterior infarction. Which artery is most commonly associated?",answers:["LAD"],info:"Anterior injury is typically associated with the left anterior descending (LAD) artery."},
   {prompt:"ST elevation in II, III and aVF suggests inferior infarction. In a right-dominant circulation, which artery is most commonly associated?",answers:["RCA"],info:"The RCA most often supplies the inferior wall in right-dominant anatomy. LCx may be responsible, particularly with left dominance."},
   {prompt:"A lateral wall infarction involving V5–V6 is often associated with which artery?",answers:["LCx"],info:"The LCx supplies much of the lateral wall in many patients; LAD diagonal branches may also supply lateral myocardium."},
   {prompt:"In a left-dominant coronary circulation, which artery supplies the posterior descending artery and can cause an inferior infarction?",answers:["LCx"],info:"In a left-dominant circulation, the posterior descending artery typically arises from the LCx rather than the RCA."}
  ]
 }
};
let mode="territories",round=0,score=0,locked=false;
const chosen=new Set(),buttons=new Map();
function makeButton(id,label){
 const button=document.createElement("button");
 button.type="button";button.className="challenge-lead";button.textContent=label;
 button.setAttribute("aria-pressed","false");
 button.setAttribute("aria-label","Select "+label);
 button.addEventListener("click",()=>{
  if(locked)return;
  if(mode==="arteries")chosen.clear();
  if(chosen.has(id))chosen.delete(id);else chosen.add(id);
  buttons.forEach((b,key)=>{
   b.classList.toggle("chosen",chosen.has(key));
   b.setAttribute("aria-pressed",String(chosen.has(key)));
  });
 });
 buttons.set(id,button);grid.appendChild(button);
}
function buildChoices(){
 buttons.clear();grid.replaceChildren();
 grid.classList.toggle("artery-choices",mode==="arteries");
 modes[mode].choices.forEach(item=>{
  if(typeof item==="string")makeButton(item,item);
  else makeButton(item.id,item.label);
 });
}
function resetRound(){
 locked=false;chosen.clear();
 buttons.forEach(button=>{button.className="challenge-lead";button.disabled=false;button.setAttribute("aria-pressed","false")});
 const data=modes[mode],item=data.questions[round];
 prompt.textContent=item.prompt;
 progress.textContent="Question "+(round+1)+" of "+data.questions.length+" • Score "+score+"/"+data.questions.length;
 feedback.textContent=mode==="arteries"?"Select one artery, then check your answer.":"Tap all applicable leads, then check your answer.";
 check.hidden=false;next.hidden=true;restart.hidden=true;
}
function changeQuiz(){
 mode=quiz.value in modes?quiz.value:"territories";
 round=0;score=0;locked=false;
 intro.textContent=modes[mode].intro;
 caveat.textContent=modes[mode].caveat;
 buildChoices();resetRound();
}
check.addEventListener("click",()=>{
 if(locked||chosen.size===0){if(!locked)feedback.textContent="Choose an answer first.";return;}
 const data=modes[mode],item=data.questions[round],correct=item.answers;
 const isCorrect=correct.length===chosen.size&&correct.every(value=>chosen.has(value));
 if(isCorrect)score++;
 locked=true;
 buttons.forEach((button,id)=>{
  button.disabled=true;
  if(correct.includes(id))button.classList.add("correct");
  else if(chosen.has(id))button.classList.add("incorrect");
 });
 feedback.textContent=(isCorrect?"Correct. ":"Not quite. ")+item.info+" Green shows the expected answer; red marks extra selections.";
 progress.textContent="Question "+(round+1)+" of "+data.questions.length+" • Score "+score+"/"+data.questions.length;
 check.hidden=true;
 if(round===data.questions.length-1){
  restart.hidden=false;feedback.textContent+=" Final score: "+score+"/"+data.questions.length+".";
 }else next.hidden=false;
});
next.addEventListener("click",()=>{round++;resetRound()});
restart.addEventListener("click",()=>{round=0;score=0;resetRound()});
quiz.addEventListener("change",changeQuiz);
changeQuiz();
})();