/* Medic Goats ECG Lab — deterministic illustrative rhythm scenarios.
 * Clinical mechanism is represented schematically, not with validated 12-lead
 * recordings or anatomy-derived body-surface potential simulations.
 * The selected rate in AV block examples is the atrial rate, except complete
 * heart block, where it is the independent ventricular escape rate. */
(function(root){
"use strict";
const base=root.MedicECG;if(!base)return;
const modes={
 sinus:{label:"Sinus rhythm",rate:75,detail:"SA node → organized atrial depolarization → AV node → His–Purkinje activation."},
 afib:{label:"Atrial fibrillation (AFib)",rate:105,detail:"Disorganized atrial activation without distinct P waves; varying AV-node conduction creates irregularly irregular QRS intervals."},
 flutter:{label:"Atrial flutter (2:1)",rate:150,detail:"An organized atrial reentry circuit at twice the ventricular rate; every other impulse conducts in this simplified example."},
 av1:{label:"First-degree AV block",rate:70,detail:"Every sinus P wave conducts to the ventricles, but the PR interval is prolonged (illustrated at 280 ms)."},
 mobitz1:{label:"Second-degree AV block — Mobitz I",rate:85,detail:"Progressively longer PR intervals followed by a nonconducted P wave (Wenckebach), then the cycle repeats."},
 mobitz2:{label:"Second-degree AV block — Mobitz II",rate:80,detail:"Intermittent nonconducted P waves with a constant PR interval for conducted beats. Block is depicted below the AV node."},
 rbbb:{label:"Right bundle branch block (RBBB)",rate:75,detail:"The left bundle conducts first. Activation spreads through ventricular muscle to the right ventricle, widening the QRS. Compare the terminal R′ in V1 with the broad S in I and V6."},
 lbbb:{label:"Left bundle branch block (LBBB)",rate:75,detail:"The right bundle conducts first. Activation spreads through ventricular muscle to the left ventricle, widening the QRS. Compare the deep S in V1 with the broad, notched R in I and V6."},
 av3:{label:"Third-degree AV block (complete)",rate:38,detail:"Sinus P waves continue independently of a slower ventricular escape rhythm: no atrial impulses conduct to the ventricles."},
 vt:{label:"Monomorphic ventricular tachycardia (VT)",rate:165,detail:"Rapid wide-complex ventricular activation originates in ventricular myocardium, not the SA node. Simplified monomorphic VT, not a diagnostic tracing."},
 pvt:{label:"Polymorphic ventricular tachycardia (VT)",rate:190,detail:"Rapid ventricular beats change in QRS shape and axis from beat to beat. This is illustrative polymorphic VT, not specifically torsades de pointes."},
 vf:{label:"Ventricular fibrillation (VFib)",rate:180,detail:"Chaotic electrical activity in the ventricular myocardium with no organized QRS complexes or meaningful ventricular rate. This is an illustrative waveform, not a diagnostic tracing."},
 wpw:{label:"WPW pre-excitation pattern",rate:85,detail:"A sinus impulse reaches the ventricles early through an accessory AV pathway (short PR and delta-wave illustration), while normal AV/His conduction also occurs. This is a WPW pattern, not an episode of AVRT."}
};
const ids=Object.keys(modes),leads=base.labels,GAUSS=(x,c,w)=>Math.exp(-.5*Math.pow((x-c)/w,2));
const afIntervals=[.72,.48,.97,.57,.84,.45,1.12,.62,.76,.51,.94,.69,.43,.88,.56,1.07,.64,.53,.92,.47];
const coeff=Object.fromEntries(leads.map(l=>[l,{p:base.sample(.17).leads[l]-base.sample(.275).leads[l],r:base.sample(.382).leads[l],t:base.sample(.66).leads[l]}]));
const cache=new Map();
const branchBlocks={
 rbbb:{side:"right",early:[.65,.72,.26,.22,.42,.64,.81,.76],late:[-.48,-.20,.94,.70,.36,.06,-.29,-.48]},
 lbbb:{side:"left",early:[.70,.38,-.80,-.70,-.58,.42,.67,.78],late:[.80,.43,-.82,-.74,-.60,.52,.77,.88]}
};
const independentLeads=["I","II","V1","V2","V3","V4","V5","V6"];
const bbbPR=.17,bbbQrs=.15;
function schedule(mode,bpm){
 const key=mode+"|"+bpm;if(cache.has(key))return cache.get(key);
 const atria=[],vents=[],interval=60/Math.max(30,bpm);
 function addAtrium(t,conducted=true,pr=.17,site="av"){
  const beat={t,conducted,pr,site,index:atria.length};
  atria.push(beat);
  if(conducted)vents.push({t:t+pr+(mode==="wpw"?.05:0),source:mode==="wpw"?"accessory":"conducted",atrial:beat,wide:mode==="wpw"});
 }
 if(branchBlocks[mode]||["sinus","av1","mobitz1","mobitz2","wpw"].includes(mode)){
  const pr1=mode==="av1"?.28:mode==="wpw"?.11:.17;
  for(let i=0;i<100;i++){
   const t=branchBlocks[mode]?(i-2)*interval:-2+i*interval;if(t>52)break;
   if(mode==="mobitz1"){const order=i%4;addAtrium(t,order!==3,[.19,.25,.31,.31][order],"av");}
   else if(mode==="mobitz2"){addAtrium(t,i%4!==2,.18,"infranodal");}
   else addAtrium(t,true,pr1);
  }
 }else if(mode==="av3"){
  const atrialInterval=60/75; // fixed 75-bpm sinus P waves, independent of escape.
  for(let i=0;i<80;i++){const t=-2.12+i*atrialInterval;if(t>52)break;addAtrium(t,false,0,"complete");}
  for(let i=0;i<80;i++){const t=-1.65+i*interval;if(t>52)break;vents.push({t,source:"escape",wide:true});}
 }else if(mode==="vt"||mode==="pvt"){
  let t=-1.8;
  for(let i=0;i<190;i++){
   t+=mode==="pvt"?interval*(1+.10*Math.sin(i*1.73)) : interval;
   if(t>52)break;
   vents.push({t,source:mode==="pvt"?"polymorphic":"ventricular",wide:true,index:i});
  }
 }else if(mode==="afib"){
  const factor=75/Math.max(45,bpm);let t=-2.4;
  for(let i=0;i<180;i++){t+=afIntervals[i%afIntervals.length]*factor;if(t>52)break;vents.push({t,source:"conducted",wide:false});}
 }else if(mode==="flutter"){
  const atrialInterval=interval/2;
  for(let i=0;i<240;i++){
   const t=-2+i*atrialInterval;if(t>52)break;
   atria.push({t,conducted:i%2===0,pr:.16,index:i});
   if(i%2===0)vents.push({t:t+.16,source:"conducted",wide:false});
  }
 }
 const result={atria,vents};cache.set(key,result);return result;
}
function eventTimes(mode,bpm){return schedule(mode,bpm).vents.map(x=>x.t);}
function limb(out){
 out.III=out.II-out.I;
 out.aVR=-(out.I+out.II)/2;
 out.aVL=out.I-out.II/2;
 out.aVF=out.II-out.I/2;
 return out;
}
function sample(seconds,bpm,mode="sinus"){
 if(mode==="sinus")return base.sample(seconds*bpm/60).leads;
 const block=branchBlocks[mode];
 if(block){
  const interval=60/bpm;
  const t=((seconds%interval)+interval)%interval;
  const q=t-bbbPR;
  const out={};
  independentLeads.forEach((lead,i)=>{
   const p=coeff[lead].p*GAUSS(t,.055,.022);
   const early=block.early[i]*GAUSS(q,.038,.019);
   const late=block.late[i]*GAUSS(q,.107,.023);
   const septal=mode==="rbbb"&&i>=2&&i<=4?-.34*GAUSS(q,.063,.014):0;
   const recovery=-block.late[i]*.34*GAUSS(q,.26,.049);
   out[lead]=p+early+late+septal+recovery;
  });
  return limb(out);
 }
 const out=Object.fromEntries(leads.map(l=>[l,0]));
 if(mode==="vf"){
  // Continuous, irregular, nonperiodic-looking fibrillatory activity.
  // Frequency and amplitude modulation prevents QRS-like repeating beats.
  const phase=2*Math.PI;
  const drift=.4*Math.sin(phase*.37*seconds);
  const x=Math.sin(phase*6.4*seconds+1.35*Math.sin(phase*.71*seconds)+drift);
  const y=Math.sin(phase*8.25*seconds+.83*Math.sin(phase*.53*seconds)+.6);
  const z=Math.sin(phase*4.95*seconds+1.7*Math.sin(phase*.39*seconds)+1.3);
  const envelope=.48+.21*Math.sin(phase*.31*seconds)+.15*Math.sin(phase*.17*seconds+1.1);
  for(const l of leads){
   const c=coeff[l],mag=Math.max(.16,Math.abs(c.r));
   out[l]=mag*envelope*(.78*x+.64*y+.48*z)*Math.sign(c.r||1)
     +.22*(Math.abs(c.t)+.18)*Math.sin(phase*7.18*seconds+1.3*Math.sin(seconds*2.4)+(l.length*.45));
  }
  return limb(out);
 }
 const result=schedule(mode,bpm);
 // Independent, regular sinus-origin P waves in AV block / WPW.
 if(["av1","mobitz1","mobitz2","av3","wpw"].includes(mode)){
  for(const a of result.atria){
   const d=seconds-(a.t+.055);if(Math.abs(d)>.14)continue;
   for(const l of leads)out[l]+=coeff[l].p*GAUSS(d,0,.032);
  }
 }
 // Atrial flutter has a periodic sawtooth; AFib has multi-frequency f waves.
 if(mode==="afib"||mode==="flutter"){
  const f=mode==="afib"
   ? .035*Math.sin(2*Math.PI*6.1*seconds+.4*Math.sin(seconds*7))+.021*Math.sin(2*Math.PI*8.7*seconds+.6*Math.sin(seconds*2.7))
   : .07*(2*(((seconds*Math.max(180,Math.min(360,bpm*2))/60)%1+1)%1)-1); // periodic stylized flutter wave
  const amp={I:.55,II:1,aVR:-.65,aVL:-.14,aVF:.9,V1:.9,V2:.7,V3:.55,V4:.38,V5:.32,V6:.3};
  for(const l of leads)out[l]+=f*(amp[l]??.5);
 }
 for(const q of result.vents){
  const d=seconds-q.t;if(d<-.23||d>.49)continue;
  const wide=q.wide;
  for(const l of leads){
   const c=coeff[l];
   if(q.source==="polymorphic"){
    // A changing wide QRS vector across successive ventricular beats.
    // Twisting amplitude here is schematic and does not imply torsades.
    const n=q.index||0,axis=Math.cos(n*.83+.15),rot=Math.sin(n*.83+.15);
    const v1=c.r*(.30+1.03*axis)+c.t*.62*rot;
    const v2=c.r*(-.22+.48*rot)-c.t*.30*axis;
    out[l]+=v1*(1.17*GAUSS(d,-.015,.072)-.33*GAUSS(d,-.11,.049))
      +v2*.88*GAUSS(d,.095,.071)
      -v1*.23*GAUSS(d,.27,.115);
   }else if(q.source==="ventricular"||q.source==="escape"){
    out[l]+=c.r*(1.28*GAUSS(d,0,q.source==="ventricular"?.076:.068)-.38*GAUSS(d,-.085,.035)-.42*GAUSS(d,.105,.045))
       +c.t*.65*GAUSS(d,.30,.094);
   }else{
    // Reuse the same underlying simplified ventricular dipole, shifted to each
    // conducted QRS onset; remove the original sinus P peak before adding it separately.
    const phase=.382+d/(wide?1.17:.8);
    const v=base.sample(phase).leads[l];
    out[l]+=v-c.p*GAUSS(phase,.17,.04);
    if(mode==="wpw")out[l]+=c.r*.25*GAUSS(d,-.058,.028);
   }
  }
 }
 return limb(out);
}
function state(seconds,bpm,mode="sinus"){
 const phase=((seconds*bpm/60)%1+1)%1;
 if(mode==="vf")return {mode,phase,stage:"fibrillation",progress:((seconds*6.7)%1+1)%1,seconds,origin:"ventricular-chaos",atrialActive:false};
 if(mode==="sinus"){
  const a=root.MedicActivation?.at(phase);
  return {mode,phase,stage:a?.stage.id||"sa",progress:a?.progress||0,atrium:"sinus",seconds,atrialActive:["sa","atria"].includes(a?.stage.id)};
 }
 const block=branchBlocks[mode];
 if(block){
  const t=phase*60/bpm;
  const phases=[["sa",0,.012],["atria",.012,.105],["av",.105,.135],["his",.135,.153],
   ["bundles",.153,bbbPR],["ventricles",bbbPR,bbbPR+bbbQrs],["recovery",bbbPR+bbbQrs,.52]];
  const [stage,start,end]=phases.find(([,from,to])=>t>=from&&t<to)||["rest",0,1];
  return {mode,phase,seconds,stage,progress:stage==="rest"?0:(t-start)/(end-start),origin:"sinus",
   atrialElapsed:t,atrialActive:t<.105,atrialProgress:Math.max(0,(t-.012)/.093),blockedBranch:block.side};
 }
 const seq=schedule(mode,bpm);
 let atrial=null,vent=null;
 for(const a of seq.atria){if(a.t<=seconds)atrial=a;else break;}
 const ventricularTachycardia=mode==="vt"||mode==="pvt";
 let nextVent=null;
 for(const q of seq.vents){
  if(q.t<=seconds+(ventricularTachycardia?0:.17))vent=q;
  else {nextVent=q;break;}
 }
 if(ventricularTachycardia&&!vent&&nextVent?.t<=seconds+.13)vent=nextVent;
 const aElapsed=atrial?seconds-atrial.t:Infinity;
 const vElapsed=vent?seconds-vent.t:Infinity;
 const atrialActive=atrial!==null&&aElapsed>=0&&aElapsed<.16;
 const atrialProgress=atrialActive?Math.min(1,aElapsed/.16):0;
 let stage="rest",progress=0,blockSite=null,origin="sinus";
 if(["afib","flutter"].includes(mode)){origin="atrial";}
 if(mode==="vt"||mode==="pvt")origin="ventricular";
 if(mode==="av3")origin="escape";
 if(mode==="wpw")origin="accessory";
 if(mode==="mobitz1"||mode==="mobitz2"){
  if(atrial&&!atrial.conducted&&aElapsed>=.14&&aElapsed<.42)blockSite=atrial.site;
 }
 if(mode==="av3"&&atrialActive)blockSite="complete";
 // A QRS event always wins over simultaneous atrial action (AV dissociation).
 if(vElapsed>=-.13&&vElapsed<.39){
  if(vent.source==="ventricular"||vent.source==="polymorphic"||vent.source==="escape"){
   if(vElapsed<0){stage="ventricular-origin";progress=(vElapsed+.13)/.13;}
   else if(vElapsed<.16){stage="ventricles";progress=vElapsed/.16;}
   else {
    const recoveryEnd=ventricularTachycardia&&nextVent?Math.min(.39,nextVent.t-vent.t):.39;
    stage="recovery";progress=(vElapsed-.16)/Math.max(.001,recoveryEnd-.16);
   }
  }else if(vent.source==="accessory"&&vElapsed<0){
   stage="accessory";progress=(vElapsed+.13)/.13;
  }else if(vElapsed<-.08){stage="av";progress=(vElapsed+.13)/.05;}
  else if(vElapsed<-.045){stage="his";progress=(vElapsed+.08)/.035;}
  else if(vElapsed<0){stage="bundles";progress=(vElapsed+.045)/.045;}
  else if(vElapsed<.15){stage="ventricles";progress=vElapsed/.15;}
  else {stage="recovery";progress=(vElapsed-.15)/.24;}
 }else if(blockSite){stage="blocked";progress=Math.min(1,Math.max(0,(aElapsed-.14)/.28));}
 else if(atrialActive){stage="atria";progress=atrialProgress;}
 else if(atrial&&atrial.conducted&&aElapsed<atrial.pr){stage="av";progress=Math.min(1,aElapsed/atrial.pr);}
 return {mode,phase,stage,progress,seconds,origin,atrialActive,atrialProgress,blockSite,
  atrialEvent:atrial,ventricularEvent:vent,atrialElapsed:aElapsed,ventricularElapsed:vElapsed};
}
root.MedicRhythm={ids,modes,sample,state,eventTimes,schedule};
})(window);