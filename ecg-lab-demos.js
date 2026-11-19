/* Built-in SYNTHETIC examples using the existing illustrative dipole engine.
 * NOT imported patient ECGs; no medical diagnosis represented. */
(function(){
"use strict";
const select=document.getElementById("demo-record"),button=document.getElementById("demo-open"),status=document.getElementById("demo-status");
if(!select||!button||!window.MedicECG)return;
const samplesPerSecond=200,durationSeconds=10;
const choices=[
 {id:"illustrative-60",bpm:60,title:"Example A · 60 bpm"},
 {id:"illustrative-75",bpm:75,title:"Example B · 75 bpm"},
 {id:"illustrative-110",bpm:110,title:"Example C · 110 bpm"}
];
choices.forEach(item=>{const o=document.createElement("option");o.value=item.id;o.textContent=item.title;select.appendChild(o)});
function create(item){
 const waveforms=Object.fromEntries(window.MedicECG.labels.map(l=>[l,[]]));
 const total=samplesPerSecond*durationSeconds;
 for(let i=0;i<total;i++){
  const t=i/samplesPerSecond*item.bpm/60;
  const leads=window.MedicECG.sample(t).leads;
  for(const lead of window.MedicECG.labels)waveforms[lead].push(Number(leads[lead].toFixed(5)));
 }
 return {
  schemaVersion:"1.0",kind:"synthetic-demo",
  source:{dataset:"Medic Goats illustrative dipole model",recordId:item.id,
  citation:"Original synthetic vector-dipole teaching model; no patient or clinical source",
  license:"Medic Goats original educational example",validatedForTeaching:false},
  recording:{samplingHz:samplesPerSecond,durationSeconds,amplitudeUnit:"mV",leads:window.MedicECG.labels.slice()},
  waveforms
 };
}
button.addEventListener("click",()=>{
 const item=choices.find(x=>x.id===select.value);
 if(!item||!window.MedicECGReference?.loadObject)return;
 try{
  window.MedicECGReference.loadObject(create(item),"SYNTHETIC DEMONSTRATION · NOT A PATIENT ECG");
  status.textContent=item.title+" loaded. Illustration only: simulated rates and morphology do not represent a clinical rhythm diagnosis.";
  document.getElementById("reference-ecg")?.scrollIntoView({behavior:"smooth",block:"start"});
 }catch(e){status.textContent="Couldn't load illustration: "+(e?.message||"Unknown error");}
});
})();
