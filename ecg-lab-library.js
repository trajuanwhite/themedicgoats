/* Curated ECG library index. This does not fabricate waveform data. */
(async function(){
 "use strict";
 const select=document.getElementById("library-record"),status=document.getElementById("library-status"),btn=document.getElementById("library-open");
 if(!select||!status||!btn)return;
 const safePath=p=>typeof p==="string"&&/^\/ecg-library\/records\/[a-zA-Z0-9_-]+\.json$/.test(p);
 let records=[];
 try{
  const response=await fetch("/ecg-library/manifest.json?v=1",{cache:"no-store"});
  if(!response.ok)throw Error("Library index unavailable");
  const manifest=await response.json();
  if(manifest.schemaVersion!=="1.0"||!Array.isArray(manifest.records))throw Error("Unsupported library manifest");
  records=manifest.records.filter(r=>r&&safePath(r.file)&&typeof r.id==="string"&&typeof r.title==="string"&&r.reviewStatus==="reviewed");
  records.forEach(r=>{const option=document.createElement("option");option.value=r.id;option.textContent=r.title;select.appendChild(option)});
  const present=records.length>0;
  btn.disabled=!present;select.disabled=!present;
  status.textContent=present?records.length+" verified-index example(s) listed. Metadata and clinical quality still require educator review.":"The ECG library is prepared, but no clinical examples are published yet. Existing local file importing still works.";
 }catch(e){status.textContent="Clinical library index could not be loaded. Local file importing is still available.";btn.disabled=true;select.disabled=true;}
 btn.addEventListener("click",async()=>{
  const record=records.find(r=>r.id===select.value);
  if(!record||!safePath(record.file))return;
  status.textContent="Loading "+record.title+"…";btn.disabled=true;
  try{
   const res=await fetch(record.file,{cache:"no-store"});
   if(!res.ok)throw Error("Recording unavailable");
   const raw=await res.json();
   if(raw.source?.recordId!==record.sourceRecordId||raw.source?.dataset!==record.dataset)throw Error("Recording does not match the published index");
   if(!window.MedicECGReference?.loadObject)throw Error("Clinical viewer unavailable");
   window.MedicECGReference.loadObject(raw,"Curated library example");
   status.textContent="Opened "+record.title+". Compare it with the illustrative model above.";
  }catch(e){status.textContent="Cannot load example: "+(e.message||"Unknown error")}
  finally{btn.disabled=false;}
 });
})();
