/* Medic Goats ECG Lab rhythm teaching simulations.
 * Stylized electrical activation and vector-derived leads; NOT validated ECG.
 * AF: atria fibrillate without organized SA-origin P waves; AV filtering causes
 * irregular QRS timing. Flutter: schematic atrial macroreentry with 2:1 AV conduction. */
(function(root){
"use strict";
const base=root.MedicECG;
if(!base)return;
const ids=["sinus","afib","flutter"];
const modes={
 sinus:{label:"Sinus rhythm",detail:"SA node initiates organized atrial activation, followed by AV delay and His–Purkinje conduction."},
 afib:{label:"Atrial fibrillation (AFib)",detail:"Disorganized atrial activity replaces distinct P waves. Variable AV nodal conduction produces an irregularly irregular ventricular rhythm. This is an illustration, not a clinical ECG."},
 flutter:{label:"Atrial flutter (2:1)",detail:"A simplified atrial reentry circuit drives repetitive flutter waves. Every second atrial activation reaches the ventricles in this example."}
};
const gauss=(x,c,w)=>Math.exp(-.5*((x-c)/w)**2);
const afIntervals=[.72,.48,.97,.57,.84,.45,1.12,.62,.76,.51,.94,.69,.43,.88,.56,1.07,.64,.53,.92,.47];
function eventTimes(mode,bpm){
 const factor=mode==="afib"?75/Math.max(45,bpm):mode==="flutter"?150/Math.max(45,bpm):1;
 if(mode==="afib"){
  const a=[-2.4],all=[];
  for(let i=0;i<150;i++)a.push(a.at(-1)+afIntervals[i%afIntervals.length]*factor);
  return a.slice(1);
 }
 if(mode==="flutter"){const interval=60/Math.max(45,bpm);return Array.from({length:110},(_,i)=>-2+i*interval);}
 const period=60/Math.max(45,bpm);
 return Array.from({length:150},(_,i)=>-2+i*period);
}
const leads=base.labels;
const pCoeff=Object.fromEntries(leads.map(l=>[l,base.sample(.17).leads[l]-base.sample(.275).leads[l]]));
function sample(seconds,bpm,mode="sinus"){
 if(mode==="sinus")return base.sample(seconds*bpm/60).leads;
 const out=Object.fromEntries(leads.map(l=>[l,0]));
 const events=eventTimes(mode,bpm);
 const beatDuration=.80;
 for(const beat of events){
  const delta=seconds-beat;
  if(delta<-.22||delta>.45)continue;
  const phase=.382+delta/beatDuration;
  const v=base.sample(phase).leads;
  const removeP=gauss(phase,.17,.040);
  for(const l of leads)out[l]+=v[l]-pCoeff[l]*removeP;
 }
 const flutterRate=Math.max(180,Math.min(360,bpm*2));
 const f=mode==="afib"
  ? .035*Math.sin(2*Math.PI*6.1*seconds+.4*Math.sin(seconds*7))
   +.021*Math.sin(2*Math.PI*8.7*seconds+.6*Math.sin(seconds*2.7))
  : .070*(2*((seconds*flutterRate/60)%1)-1);
 const amp={I:.55,II:1,III:.5,aVR:-.65,aVL:-.14,aVF:.9,V1:.9,V2:.7,V3:.55,V4:.38,V5:.32,V6:.30};
 for(const l of leads)out[l]+=f*amp[l];
 // Preserve Einthoven / augmented-limb identities as in the base engine.
 out.III=out.II-out.I;
 out.aVR=-(out.I+out.II)/2;
 out.aVL=out.I-out.II/2;
 out.aVF=out.II-out.I/2;
 return out;
}
function state(seconds,bpm,mode="sinus"){
 if(mode==="sinus"){
  const phase=((seconds*bpm/60)%1+1)%1;
  const a=root.MedicActivation?.at(phase);
  return {mode,phase,stage:a?.stage.id||"sa",progress:a?.progress||0,atrium:"sinus",seconds};
 }
 const events=eventTimes(mode,bpm);
 let nearest=-Infinity;
 for(const t of events){if(t<=seconds+.25)nearest=t;else break;}
 const elapsed=seconds-nearest;
 let stage="rest",progress=0;
 if(elapsed>=-.22&&elapsed<-.13){stage="av";progress=(elapsed+.22)/.09;}
 else if(elapsed>=-.13&&elapsed<-.07){stage="his";progress=(elapsed+.13)/.06;}
 else if(elapsed>=-.07&&elapsed<0){stage="bundles";progress=(elapsed+.07)/.07;}
 else if(elapsed>=0&&elapsed<.15){stage="ventricles";progress=elapsed/.15;}
 else if(elapsed>=.15&&elapsed<.38){stage="recovery";progress=(elapsed-.15)/.23;}
 return {mode,phase:((seconds*bpm/60)%1+1)%1,stage,progress,atrium:mode,seconds,elapsed};
}
root.MedicRhythm={ids,modes,sample,state,eventTimes};
})(window);