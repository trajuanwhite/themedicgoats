/* Curated ECG library index. This does not fabricate waveform data. */
(async function(){
 "use strict";
 const select=document.getElementById("library-record"),status=document.getElementById("library-status");
 if(!select||!status)return;
 const safePath=p=>typeof p==="string"&&/^\/ecg-library\/records\/[a-zA-Z0-9_-]+\.json$/.test(p);
 let records=[];
 let loadedId="";
 const stLine=document.getElementById("ecg-st-jpoint");
 let stByLead=null;
 function showSt(){
  if(!stLine)return;
  const lead=window.MedicECGReference.getRhythmLead();
  const mv=stByLead?.[lead];
  stLine.hidden=!Number.isFinite(mv);
  if(stLine.hidden)return;
  const sign=mv>0?"+":"";
  stLine.textContent="Lead "+lead+" · ST at J-point: "+sign+(mv*10).toFixed(2)+" mm ("+sign+mv.toFixed(3)+" mV, automated)";
 }
 document.getElementById("reference-ecg").addEventListener("ecg-rhythm-lead-change",showSt);
 const panel=document.getElementById("ecg-measurements");
 const measurements=fetch("/ecg-library/ptb-xl-plus-12sl.json?v=3").then(response=>{
  if(!response.ok)throw Error("Measurements unavailable");
  return response.json();
 }).catch(()=>null);
 async function showMeasurements(record){
  if(!panel)return;
  panel.hidden=true;
  stByLead=null;
  showSt();
  if(record.dataset!=="PTB-XL v1.0.3")return;
  const data=await measurements;
  if(loadedId!==record.id)return;
  const values=data?.[record.sourceRecordId];
  if(!values)return;
  for(const [id,key,unit] of [
   ["ecg-qrs-axis","qrsAxis","°"],
   ["ecg-qt","qt"," ms"],
   ["ecg-qtc-bazett","qtcBazett"," ms"],
   ["ecg-pr","pr"," ms"]
  ]){
   const value=values[key];
   const sign=key==="qrsAxis"&&value>0?"+":"";
   document.getElementById(id).textContent=Number.isFinite(value)?sign+value+unit:"Unavailable";
  }
  stByLead=values.stJPointMv;
  showSt();
  panel.hidden=false;
 }
 try{
  const response=await fetch("/ecg-library/manifest.json?v=1",{cache:"no-store"});
  if(!response.ok)throw Error("Library index unavailable");
  const manifest=await response.json();
  if(manifest.schemaVersion!=="1.0"||!Array.isArray(manifest.records))throw Error("Unsupported library manifest");
  records=manifest.records.filter(r=>r&&safePath(r.file)&&typeof r.id==="string"&&typeof r.title==="string"&&r.reviewStatus==="reviewed");
  records.forEach(r=>{const option=document.createElement("option");option.value=r.id;option.textContent=r.title;select.appendChild(option)});
  if(!records.length){
   status.textContent="No recordings are available.";
   return;
  }
  select.options[0].remove();
  select.addEventListener("change",loadSelected);
  select.value=records[0].id;
  await loadSelected();
 }catch(e){status.textContent="The ECG library could not be loaded.";}
 async function loadSelected(){
  const record=records.find(r=>r.id===select.value);
  if(!record)return;
  status.textContent="Loading "+record.title+"…";
  select.disabled=true;
  try{
   const res=await fetch(record.file,{cache:"no-store"});
   if(!res.ok)throw Error("Recording unavailable");
   const raw=await res.json();
   if(raw.source?.recordId!==record.sourceRecordId||raw.source?.dataset!==record.dataset)throw Error("Recording does not match the library");
   window.MedicECGReference.loadObject(raw);
   loadedId=record.id;
   void showMeasurements(record);
   status.textContent=record.title;
  }catch(e){
   select.value=loadedId;
   status.textContent="Could not open "+record.title+".";
  }finally{
   select.disabled=false;
  }
 }
})();
