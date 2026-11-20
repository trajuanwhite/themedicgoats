/* Curated ECG library index. This does not fabricate waveform data. */
(async function(){
 "use strict";
 const select=document.getElementById("library-record"),status=document.getElementById("library-status");
 if(!select||!status)return;
 const safePath=p=>typeof p==="string"&&/^\/ecg-library\/records\/[a-zA-Z0-9_-]+\.json$/.test(p);
 let records=[];
 let loadedId="";
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
   status.textContent=record.title;
  }catch(e){
   select.value=loadedId;
   status.textContent="Could not open "+record.title+".";
  }finally{
   select.disabled=false;
  }
 }
})();
