/* Curated ECG library index. This does not fabricate waveform data. */
(async function(){
 "use strict";
 const list=document.getElementById("library-record"),status=document.getElementById("library-status");
 const picker=document.getElementById("library-picker"),choice=document.getElementById("library-choice");
 if(!list||!status||!picker||!choice)return;
 document.addEventListener("click",event=>{
  if(picker.open&&!picker.contains(event.target))picker.open=false;
 });
 picker.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&picker.open){
   event.preventDefault();
   picker.open=false;
   choice.focus();
  }
 });
 const safePath=p=>typeof p==="string"&&/^\/ecg-library\/records\/[a-zA-Z0-9_-]+\.json$/.test(p);
 const buttons=new Map();
 let loading=false;
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
 const measurements=fetch("/ecg-library/ptb-xl-plus-12sl.json?v=4").then(response=>{
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
  const records=manifest.records.filter(r=>r&&safePath(r.file)&&typeof r.id==="string"&&typeof r.title==="string"&&r.reviewStatus==="reviewed");
  if(!records.length){
   status.textContent="No recordings are available.";
   return;
  }
  const firstRecord=records[0];
  const alphabetical=new Intl.Collator("en",{sensitivity:"base",numeric:true});
  records.sort((a,b)=>alphabetical.compare(a.title,b.title)).forEach(record=>{
   const button=document.createElement("button");
   button.type="button";
   button.textContent=record.title;
   button.setAttribute("aria-pressed","false");
   button.addEventListener("click",()=>{
    picker.open=false;
    choice.focus();
    return loadSelected(record);
   });
   buttons.set(record.id,button);
   list.appendChild(button);
  });
  await loadSelected(firstRecord);
 }catch(e){status.textContent="The ECG library could not be loaded.";}
 async function loadSelected(record){
  if(loading||record.id===loadedId)return;
  loading=true;
  status.textContent="Loading "+record.title+"…";
  list.setAttribute("aria-busy","true");
  try{
   const res=await fetch(record.file,{cache:"no-store"});
   if(!res.ok)throw Error("Recording unavailable");
   const raw=await res.json();
   if(raw.source?.recordId!==record.sourceRecordId||raw.source?.dataset!==record.dataset)throw Error("Recording does not match the library");
   window.MedicECGReference.loadObject(raw);
   buttons.get(loadedId)?.setAttribute("aria-pressed","false");
   loadedId=record.id;
   buttons.get(loadedId).setAttribute("aria-pressed","true");
   void showMeasurements(record);
   choice.textContent=record.title;
   status.textContent="";
  }catch(e){
   status.textContent="Could not open "+record.title+".";
  }finally{
   loading=false;
   list.removeAttribute("aria-busy");
  }
 }
})();
