/* Medic Goats Cardiac Lab — educational activation timeline.
   Timings are intentionally illustrative and normalized to the existing
   example ECG. They are NOT measured tissue activation maps or clinical data.
   Keep data separate so validated timings can replace this example later.
*/
(function(root){
 "use strict";
 const stages=[
  {id:"sa",label:"SA node",start:0,end:80,description:"A pacemaker impulse begins in the sinoatrial node."},
  {id:"atria",label:"Atrial depolarization",start:80,end:218,description:"Electrical activation spreads across the atria, associated with the P wave."},
  {id:"av",label:"AV nodal delay",start:218,end:270,description:"The impulse is delayed at the AV junction before entering the His–Purkinje system."},
  {id:"his",label:"His bundle",start:270,end:292,description:"Conduction proceeds into the His bundle and toward both bundle branches."},
  {id:"bundles",label:"Bundle branches",start:292,end:308,description:"Rapid conduction distributes the signal toward ventricular myocardium."},
  {id:"ventricles",label:"Ventricular activation",start:308,end:390,description:"Ventricular depolarization develops through the QRS complex."},
  {id:"plateau",label:"ST segment",start:390,end:478,description:"Most ventricular myocardium remains depolarized; the surface ECG is near the isoelectric baseline."},
  {id:"recovery",label:"Ventricular recovery",start:478,end:720,description:"Ventricular repolarization produces the T wave."},
  {id:"diastole",label:"Electrical rest",start:720,end:800,description:"The illustrative cardiac cycle returns toward its baseline."}
 ];
 const LIMIT=800;
 function at(phase){
  const ms=((phase%1)+1)%1*LIMIT;
  const stage=stages.find(s=>ms>=s.start&&ms<s.end)||stages[stages.length-1];
  return {ms,stage,progress:Math.min(1,Math.max(0,(ms-stage.start)/(stage.end-stage.start))),normalizedPhase:ms/LIMIT};
 }
 function validate(){
  if(stages[0].start!==0||stages.at(-1).end!==LIMIT)return false;
  return stages.every((s,i)=>s.end>s.start&&(i===0||stages[i-1].end===s.start));
 }
 root.MedicActivation={stages,at,validate,cycleMs:LIMIT,source:"illustrative-timeline-v1",validated:false};
})(window);
