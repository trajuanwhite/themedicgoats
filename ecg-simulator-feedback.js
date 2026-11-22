(function(){
 "use strict";
 const viewer=document.getElementById("reference-ecg");
 const panel=document.getElementById("ecg-feedback");
 const form=document.getElementById("ecg-feedback-form");
 const details=document.getElementById("ecg-feedback-details");
 const status=document.getElementById("ecg-feedback-status");
 const submit=form.querySelector("button[type=submit]");
 const {verdict,reason,note}=form.elements;
 const endpoint="https://jjzjqjvdnaeuftptvmyw.supabase.co/rest/v1/rpc/medic_goats_rate_ecg";
 const publicKey="sb_publishable_QPQY6u-wJBKULuaEgsG4lA_KiWCwhN4";
 let recordingId=null;
 let browserId;
 let pending=false;
 function syncFields(){
  const isFlag=verdict.value==="flag";
  details.hidden=!isFlag;
  reason.required=isFlag;
  reason.disabled=!isFlag;
  note.disabled=!isFlag;
 }
 viewer.addEventListener("ecg-recording-selected",({detail})=>{
  recordingId=detail.monitor?null:detail.id;
  panel.hidden=!recordingId;
  form.reset();
  status.textContent="";
  syncFields();
 });
 form.addEventListener("change",syncFields);
 form.addEventListener("submit",async event=>{
  event.preventDefault();
  if(!recordingId||pending)return;
  const selected=recordingId;
  const isFlag=verdict.value==="flag";
  pending=true;
  submit.disabled=true;
  status.textContent="Sending feedback…";
  try{
   if(!browserId){
    const key="medic-goats-ecg-feedback-id";
    try{
     browserId=localStorage.getItem(key)||crypto.randomUUID();
     localStorage.setItem(key,browserId);
    }catch{
     browserId=crypto.randomUUID();
    }
   }
   const response=await fetch(endpoint,{
    method:"POST",headers:{apikey:publicKey,"Content-Type":"application/json"},
    body:JSON.stringify({p_recording_id:selected,p_browser_id:browserId,
     p_verdict:verdict.value,p_reason:isFlag?reason.value:null,p_note:isFlag?note.value:null})
   });
   if(!response.ok)throw Error("Feedback request failed");
   if(recordingId===selected)status.textContent=isFlag?"Flag saved. Thanks for letting us know.":"Rating saved. Thank you.";
  }catch{
   if(recordingId===selected)status.textContent="Feedback could not be saved. Please try again.";
  }finally{
   pending=false;
   submit.disabled=false;
  }
 });
})();
