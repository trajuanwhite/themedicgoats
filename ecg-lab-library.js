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
 const saveRating=()=>window.MedicECGFeedback?.save()??true;
 const get=id=>document.getElementById(id);
 const viewer=get("reference-ecg"), quiz=get("ecg-quiz");
 let quizMode=false, answered=false, round=null, correct=0, attempts=0;
 let remaining=[], lastQuizId="", browseRecord=null, displayedRaw=null;
 const answerGroups=[
  ["Sinus rhythm",/^ptbxl-(00001|00003|00004)$/],
  ["Sinus bradycardia",/^ptbxl-00002$/],
  ["Atrial fibrillation",/^ptbxl-02032$/],
  ["Atrial fibrillation with RVR",/^ptbxl-02125$|^sph-A(24295|06017|09492)$/],
  ["Atrial flutter",/^ptbxl-02430$|^sph-A(18377|23247|15066)$/],
  ["Complete AV block",/^sph-A(23013|24356|17439)$/],
  ["Mobitz II AV block",/^sph-A(09204|10158)$/],
  ["First-degree AV block",/^ptbxl-18458$/],
  ["Right bundle branch block",/^ptbxl-18035$/],
  ["Left bundle branch block",/^ptbxl-18278$/],
  ["Ventricular preexcitation",/^sph-A(09221|19062|24957)$/],
  ["Sinus rhythm with a PVC",/^ptbxl-01993$/],
  ["Ventricular bigeminy",/^ptbxl-05786$/],
  ["Ventricular trigeminy",/^ptbxl-13102$/],
  ["ST depression",/^ptbxl-(02633|02181)$|^sph-A(02868|08465|00598)$/],
  ["Early repolarization",/^sph-A(10453|13641|21880)$/],
  ["LVH with strain",/^sph-A(13780|20682|01350)$/],
  ["Anteroseptal ST elevation",/^sph-A07802$/],
  ["Ventricular tachycardia",/^vfdb-(420-1440|422-1350|425-935)$/],
  ["Ventricular fibrillation",/^vfdb-(424-1265|426-655|430-490)$/],
  ["Asystole",/^vfdb-(424-1545|427-1540|430-526)$/],
  ["VF progressing to asystole",/^vfdb-430-517$/]
 ];
 function shuffle(items){
  const result=[...items];
  for(let i=result.length-1;i>0;i--){
   const j=Math.floor(Math.random()*(i+1));
   [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
 }
 function installQuiz(records){
  if(!quiz)return;
  const cases=records.flatMap(record=>{
   const group=answerGroups.find(([,pattern])=>pattern.test(record.id));
   return group?[{record,answer:group[0],monitor:record.leadCount===2}]:[];
  });
  if(new Set(cases.map(item=>item.answer)).size<4)return;
  const browse=get("ecg-browse-mode"), toggle=get("ecg-quiz-mode");
  const next=get("ecg-quiz-next"), options=get("ecg-quiz-options"), feedback=get("ecg-quiz-feedback");
  const score=get("ecg-quiz-score");
  const updateScore=()=>{score.textContent="Score: "+correct+" / "+attempts;};
  async function nextRound(){
   if(loading||!quizMode)return;
   answered=false;
   viewer.classList.add("ecg-quiz-unanswered");
   if(!remaining.length){
    remaining=shuffle(cases);
    if(remaining[0].record.id===lastQuizId)remaining.push(remaining.shift());
   }
   round=remaining.shift();
   next.hidden=true;
   options.replaceChildren();
   feedback.textContent="Loading tracing…";
   viewer.classList.add("ecg-quiz-no-tracing");
   const loaded=await loadSelected(round.record);
   if(!loaded){
    feedback.textContent="This tracing could not load. Try the next one.";
    next.hidden=false;
    next.focus();
    return;
   }
   viewer.classList.remove("ecg-quiz-no-tracing");
   lastQuizId=round.record.id;
   const alternatives=[...new Set(cases.filter(item=>item.monitor===round.monitor&&item.answer!==round.answer).map(item=>item.answer))];
   for(const label of shuffle([round.answer,...shuffle(alternatives).slice(0,3)])){
    const button=document.createElement("button");
    button.type="button";
    button.textContent=label;
    button.onclick=()=>{
     if(answered)return;
     answered=true;
     attempts++;
     if(label===round.answer)correct++;
     updateScore();
     feedback.textContent=(label===round.answer?"Correct. ":"Incorrect. ")+"Answer: "+round.answer+". Recording: "+round.record.title+".";
     for(const option of options.children){
      option.disabled=true;
      if(option.textContent===round.answer)option.dataset.result="correct";
      else if(option===button)option.dataset.result="incorrect";
     }
     const explanation=get("ecg-explanation");
     if(explanation)feedback.after(explanation);
     viewer.classList.remove("ecg-quiz-unanswered");
     if(round.monitor)renderMonitor(displayedRaw);
     next.hidden=false;
     next.focus();
    };
    options.append(button);
   }
   feedback.textContent="";
   options.firstElementChild?.focus({preventScroll:true});
  }
  next.onclick=async()=>{
   if(loading||!await saveRating())return;
   get("ecg-quiz-mode").scrollIntoView({block:"nearest"});
   void nextRound();
  };
  toggle.disabled=false;
  toggle.onclick=async()=>{
   if(loading||quizMode||!await saveRating())return;
   quizMode=true;
   answered=false;
   correct=attempts=0;
   remaining=[];
   updateScore();
   picker.open=false;
   get("ecg-browse-controls").hidden=true;
   quiz.hidden=false;
   browse.setAttribute("aria-pressed","false");
   toggle.setAttribute("aria-pressed","true");
   void nextRound();
  };
  browse.onclick=async()=>{
   if(loading||!quizMode||!await saveRating())return;
   quizMode=false;
   quiz.hidden=true;
   const explanation=get("ecg-explanation");
   if(explanation)get("clinical-record-source").after(explanation);
   viewer.classList.remove("ecg-quiz-unanswered","ecg-quiz-no-tracing");
   get("ecg-browse-controls").hidden=false;
   browse.setAttribute("aria-pressed","true");
   toggle.setAttribute("aria-pressed","false");
   void loadSelected(browseRecord||records[0]);
  };
 }
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
  const response=await fetch("/ecg-library/manifest.json?v=2",{cache:"no-store"});
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
   button.addEventListener("click",async()=>{
    if(loading||record.id===loadedId||!await saveRating())return;
    picker.open=false;
    choice.focus();
    return loadSelected(record);
   });
   buttons.set(record.id,button);
   list.appendChild(button);
  });
  await loadSelected(firstRecord);
  installQuiz(records);
 }catch(e){status.textContent="The ECG library could not be loaded.";}
 function renderMonitor(raw){
  const {samplingHz:hz,durationSeconds:seconds,leads,amplitudeUnit}=raw.recording;
  const count=hz*seconds;
  if(hz!==250||!Number.isInteger(count)||seconds<1||seconds>30||amplitudeUnit!=="mV"||
     !Array.isArray(leads)||leads.join(",")!=="Channel 1,Channel 2")throw Error("Invalid monitor clip");
  const halfHeight=78;
  const traces=leads.map(lead=>{
   const samples=raw.waveforms[lead];
   if(!Array.isArray(samples)||samples.length!==count||
      !samples.every(v=>Number.isFinite(v)&&Math.abs(v)<=30))throw Error("Invalid monitor samples");
   const ordered=[...samples].sort((a,b)=>a-b);
   const middle=Math.floor(count/2);
   const baseline=(ordered[middle]+ordered[Math.floor((count-1)/2)])/2;
   const peak=samples.reduce((max,v)=>Math.max(max,Math.abs(v-baseline)),0);
   return {lead,samples,baseline,peak};
  });
  // Preserve the same voltage scale on both channels and keep the grid square.
  const peak=Math.max(...traces.map(trace=>trace.peak));
  const maxGain=(halfHeight-10)/(Math.max(peak,0.01)*6);
  const gain=[10,5,2.5,1,.5,.25].find(candidate=>candidate<=maxGain)??.125;
  const pixelsPerMv=gain*6;
  const hasTransition=raw.source.annotation==="VF to asystole";
  const transition=hasTransition&&(!quizMode||answered)?7.6:null;
  const split=Math.floor(count/2);
  const spans=hasTransition?[[0,split],[split,count]]:[[0,count]];
  const makeSvg=tag=>document.createElementNS("http://www.w3.org/2000/svg",tag);
  const channels=spans.flatMap(([start,end])=>traces.map(({lead,samples,baseline})=>{
   const spanSeconds=(end-start)/hz;
   const width=spanSeconds*150;
   const markerTime=transition===null?null:transition-start/hz;
   const strip=document.createElement("div"),heading=document.createElement("strong");
   strip.className="rhythm-strip";
   strip.style.width=width+"px";
   if(hasTransition){
    strip.style.maxWidth="100%";
    strip.style.minWidth="0";
   }
   const label=hasTransition?lead+" · "+start/hz+"–"+end/hz+" s":lead;
   heading.textContent=label;
   const svg=makeSvg("svg");
   svg.setAttribute("viewBox","0 0 "+width+" "+(halfHeight*2));
   svg.setAttribute("role","img");
   svg.setAttribute("aria-label",label+" recorded waveform");
   window.MedicECGPaperGrid(svg,width,spanSeconds);
   const path=makeSvg("path");
   path.setAttribute("d",samples.slice(start,end).map((sample,i)=>(i?"L":"M")+
    (i*150/hz).toFixed(2)+" "+(halfHeight-(sample-baseline)*pixelsPerMv).toFixed(2)).join(" "));
   svg.append(path);
   if(markerTime!==null&&markerTime>=0&&markerTime<spanSeconds){
    const marker=makeSvg("line");
    for(const [key,value] of Object.entries({x1:markerTime*150,x2:markerTime*150,y1:0,y2:halfHeight*2,"stroke-dasharray":"5 4"})){
     marker.setAttribute(key,value);
    }
    svg.append(marker);
   }
   strip.append(heading,svg);
   return strip;
  }));
  const scroll=document.createElement("div"),caption=document.createElement("p");
  scroll.className="rhythm-scroll";
  scroll.tabIndex=0;
  scroll.setAttribute("aria-label",hasTransition?"Recorded rhythm strips in time order":"Recorded rhythm strips, scroll horizontally");
  scroll.append(...channels);
  caption.textContent=seconds+"-second clip · Two recorded channels · 25 mm/s grid · "+gain+" mm/mV";
  if(hasTransition)caption.textContent+=" · Read both time segments in order";
  if(transition!==null)caption.textContent+=" · Asystole annotation at "+transition+" s";
  document.getElementById("clinical-monitor").replaceChildren(caption,scroll);
 }
 async function loadSelected(record){
  if(loading)return false;
  if(record.id===loadedId&&!quizMode&&record===browseRecord)return true;
  loading=true;
  status.textContent=quizMode?"Loading tracing…":"Loading "+record.title+"…";
  list.setAttribute("aria-busy","true");
  try{
   const res=await fetch(record.file,{cache:"no-store"});
   if(!res.ok)throw Error("Recording unavailable");
   const raw=await res.json();
   if(raw.source?.recordId!==record.sourceRecordId||raw.source?.dataset!==record.dataset)throw Error("Recording does not match the library");
   displayedRaw=raw;
   const monitor=raw.kind==="clinical-monitor-strip";
   if(monitor)renderMonitor(raw);
   else window.MedicECGReference.loadObject(raw);
   document.getElementById("clinical-twelve-lead").hidden=monitor;
   document.getElementById("clinical-monitor").hidden=!monitor;
   const explanation=get("ecg-explanation");
   if(explanation){
    const note=typeof record.explanation==="string"?record.explanation:"";
    get("ecg-explanation-text").textContent=note;
    explanation.hidden=!note;
   }
   const source=document.getElementById("clinical-record-source");
   source.textContent=record.reviewStatus==="source-labeled"?
    raw.source.citation+" · "+raw.source.license+" · Source label":"";

   buttons.get(loadedId)?.setAttribute("aria-pressed","false");
   loadedId=record.id;
   buttons.get(loadedId).setAttribute("aria-pressed","true");
   void showMeasurements(record,raw);
   if(!quizMode){
    browseRecord=record;
    choice.textContent=record.title;
   }
   status.textContent="";
   viewer.dispatchEvent(new CustomEvent("ecg-recording-selected",{detail:{id:record.id,monitor}}));
   return true;
  }catch(e){
   status.textContent=quizMode?"Could not load the tracing.":"Could not open "+record.title+".";
   return false;
  }finally{
   loading=false;
   list.removeAttribute("aria-busy");
  }
 }
})();
