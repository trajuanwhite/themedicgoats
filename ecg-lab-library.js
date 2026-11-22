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
 async function showMeasurements(record,raw){
  if(!panel)return;
  panel.hidden=true;
  stByLead=null;
  showSt();
  if(raw.kind==="clinical-monitor-strip")return;
  const isPtb=record.dataset==="PTB-XL v1.0.3";
  const values=isPtb?(await measurements)?.[record.sourceRecordId]:raw.measurements;
  if(loadedId!==record.id)return;
  if(!values)return;
  document.getElementById("ecg-measurement-12sl").hidden=!isPtb;
  document.getElementById("ecg-measurement-estimated").hidden=isPtb;
  document.getElementById("ecg-rate-cell").hidden=isPtb;
  document.getElementById("ecg-qrs-cell").hidden=isPtb;
  for(const [id,key,unit] of [
   ["ecg-rate","rate"," bpm"],
   ["ecg-qrs","qrs"," ms"],
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
  const records=manifest.records.filter(r=>r&&safePath(r.file)&&typeof r.id==="string"&&typeof r.title==="string"&&["reviewed","source-labeled"].includes(r.reviewStatus));
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
 function renderMonitor(raw){
  const {samplingHz:hz,durationSeconds:seconds,leads,amplitudeUnit}=raw.recording;
  const count=hz*seconds;
  if(hz!==250||!Number.isInteger(count)||seconds<1||seconds>30||amplitudeUnit!=="mV"||
     !Array.isArray(leads)||leads.join(",")!=="Channel 1,Channel 2")throw Error("Invalid monitor clip");
  const width=seconds*150;
  const transition=raw.source.annotation==="VF to asystole"?7.6:null;
  const makeSvg=tag=>document.createElementNS("http://www.w3.org/2000/svg",tag);
  const channels=leads.map(lead=>{
   const samples=raw.waveforms[lead];
   if(!Array.isArray(samples)||samples.length!==count||
      !samples.every(v=>Number.isFinite(v)&&Math.abs(v)<=30))throw Error("Invalid monitor samples");
   const strip=document.createElement("div"),heading=document.createElement("strong");
   strip.className="rhythm-strip";
   strip.style.width=width+"px";
   heading.textContent=lead;
   const svg=makeSvg("svg");
   const halfHeight=Math.max(69,Math.ceil(samples.reduce((peak,v)=>Math.max(peak,Math.abs(v)),0)*60)+12);
   svg.setAttribute("viewBox","0 0 "+width+" "+(halfHeight*2));
   svg.setAttribute("role","img");
   svg.setAttribute("aria-label",lead+" recorded waveform");
   window.MedicECGPaperGrid(svg,width,seconds);
   const path=makeSvg("path");
   path.setAttribute("d",samples.map((sample,i)=>(i?"L":"M")+
    (i*150/hz).toFixed(2)+" "+(halfHeight-sample*60).toFixed(2)).join(" "));
   svg.append(path);
   if(transition!==null){
    const marker=makeSvg("line");
    for(const [key,value] of Object.entries({x1:transition*150,x2:transition*150,y1:0,y2:halfHeight*2,"stroke-dasharray":"5 4"})){
     marker.setAttribute(key,value);
    }
    svg.append(marker);
   }
   strip.append(heading,svg);
   return strip;
  });
  const scroll=document.createElement("div"),caption=document.createElement("p");
  scroll.className="rhythm-scroll";
  scroll.tabIndex=0;
  scroll.setAttribute("aria-label","Recorded rhythm strips, scroll horizontally");
  scroll.append(...channels);
  caption.textContent=seconds+"-second clip · Two recorded channels · 25 mm/s grid";
  if(transition!==null)caption.textContent+=" · Asystole annotation at "+transition+" s";
  document.getElementById("clinical-monitor").replaceChildren(caption,scroll);
 }
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
   const monitor=raw.kind==="clinical-monitor-strip";
   if(monitor)renderMonitor(raw);
   else window.MedicECGReference.loadObject(raw);
   document.getElementById("clinical-twelve-lead").hidden=monitor;
   document.getElementById("clinical-monitor").hidden=!monitor;
   const source=document.getElementById("clinical-record-source");
   source.textContent=record.reviewStatus==="source-labeled"?
    raw.source.citation+" · "+raw.source.license+" · Source label":"";

   buttons.get(loadedId)?.setAttribute("aria-pressed","false");
   loadedId=record.id;
   buttons.get(loadedId).setAttribute("aria-pressed","true");
   void showMeasurements(record,raw);
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
