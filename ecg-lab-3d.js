/* Medic Goats ECG Lab — deliberately simple, original 2D electrical conduction drawing.
 * No mechanical movement, gradients or clinical simulation claims.
 * Phase is read from existing ECG Lab playback for synchronized teachable motion. */
(function(){
"use strict";
const host=document.getElementById("heart-view");
if(!host)return;
const fallback=document.getElementById("heart-fallback");
const status=document.getElementById("heart-status");
const frame=document.createElement("div");
frame.className="electrical-heart-drawing";
frame.style.cssText="width:100%;height:100%;display:flex;align-items:center;justify-content:center";
frame.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 490\" role=\"img\" aria-label=\"Textbook-style diagram of the cardiac conduction system with moving impulse from SA node to AV node, His bundle, bundle branches and Purkinje fibers\">\n<g transform=\"rotate(-6 258 242)\">\n<!-- Simplified chambers with intentional handwritten-textbook appearance -->\n<path d=\"M169 99 C135 78 108 104 101 151 C88 218 103 280 141 335 C181 391 224 436 260 449 C309 430 378 377 399 309 C417 250 398 169 356 119 C325 88 288 103 269 117 C239 92 199 84 169 99Z\" fill=\"#f3dcd0\" stroke=\"#7b5149\" stroke-width=\"5\" stroke-linejoin=\"round\"/>\n<path d=\"M125 157 C124 111 154 106 186 121 C219 140 225 189 211 214 C193 241 157 235 140 217 C125 202 123 181 125 157Z\" fill=\"#f8eee4\" stroke=\"#a4796b\" stroke-width=\"3\"/>\n<path d=\"M276 132 C291 104 334 107 357 138 C380 169 380 201 361 224 C342 247 296 236 280 211 C264 184 262 158 276 132Z\" fill=\"#f8eee4\" stroke=\"#a4796b\" stroke-width=\"3\"/>\n<path d=\"M138 241 C162 225 194 240 216 261 C232 282 246 350 259 422 C211 401 174 371 151 335 C128 300 115 264 138 241Z\" fill=\"#faeee7\" stroke=\"#a4796b\" stroke-width=\"4\"/>\n<path d=\"M277 258 C300 238 349 244 368 273 C390 314 344 389 267 426 C264 360 262 287 277 258Z\" fill=\"#f5dfd6\" stroke=\"#a4796b\" stroke-width=\"4\"/>\n<path d=\"M239 227 Q259 278 259 422\" stroke=\"#b17e75\" stroke-width=\"9\" fill=\"none\" stroke-linecap=\"round\"/>\n<!-- Light great vessel silhouettes: no gradients, gloss, or complicated shading -->\n<path d=\"M293 133 C292 87 280 64 297 44 Q313 28 333 47 Q352 67 329 101\" fill=\"none\" stroke=\"#b67b71\" stroke-width=\"20\" stroke-linecap=\"round\"/>\n<path d=\"M214 126 Q217 80 175 55 Q151 41 137 60\" fill=\"none\" stroke=\"#91abb0\" stroke-width=\"17\" stroke-linecap=\"round\"/>\n<path d=\"M142 158 L141 62 M140 293 L137 371\" stroke=\"#91abb0\" stroke-width=\"15\" fill=\"none\" stroke-linecap=\"round\"/>\n<!-- A simple surface annotation of approximate chamber boundaries -->\n<g fill=\"#785a50\" font-family=\"system-ui, sans-serif\" font-size=\"12\" font-weight=\"600\" opacity=\".8\">\n <text x=\"135\" y=\"186\">RA</text><text x=\"328\" y=\"180\">LA</text>\n <text x=\"162\" y=\"319\">RV</text><text x=\"319\" y=\"326\">LV</text>\n</g>\n<!-- Fine background conduction pathways -->\n<g id=\"conduction-tracks\" stroke=\"#977d57\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<path id=\"ec-path-atrial-right\" d=\"M164 149 C177 165 196 173 218 198 C227 210 234 217 247 225\"/>\n<path id=\"ec-path-atrial-left\" d=\"M164 149 C204 126 248 125 288 144 C308 156 317 173 330 187\"/>\n<path id=\"ec-path-av-his\" d=\"M247 225 C252 239 251 248 258 266\"/>\n<path id=\"ec-path-right-bundle\" d=\"M258 266 C244 281 225 316 221 362\"/>\n<path id=\"ec-path-left-bundle\" d=\"M258 266 C274 287 294 322 305 354\"/>\n<path id=\"ec-path-purk-r1\" d=\"M221 362 Q192 351 169 319\"/>\n<path id=\"ec-path-purk-r2\" d=\"M221 362 Q195 379 176 365\"/>\n<path id=\"ec-path-purk-r3\" d=\"M221 362 Q232 393 249 402\"/>\n<path id=\"ec-path-purk-l1\" d=\"M305 354 Q329 345 346 311\"/>\n<path id=\"ec-path-purk-l2\" d=\"M305 354 Q331 375 351 355\"/>\n<path id=\"ec-path-purk-l3\" d=\"M305 354 Q286 396 267 409\"/>\n</g>\n<!-- Bright traveling overlay is clipped by progress rather than jumping -->\n<g id=\"conduction-progress\" stroke=\"#e6a126\" stroke-width=\"6\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" pointer-events=\"none\">\n<path data-progress=\"ec-path-atrial-right\"/><path data-progress=\"ec-path-atrial-left\"/>\n<path data-progress=\"ec-path-av-his\"/><path data-progress=\"ec-path-right-bundle\"/><path data-progress=\"ec-path-left-bundle\"/>\n<path data-progress=\"ec-path-purk-r1\"/><path data-progress=\"ec-path-purk-r2\"/><path data-progress=\"ec-path-purk-r3\"/>\n<path data-progress=\"ec-path-purk-l1\"/><path data-progress=\"ec-path-purk-l2\"/><path data-progress=\"ec-path-purk-l3\"/>\n</g>\n<g id=\"conduction-nodes\" fill=\"#df9a35\" stroke=\"#855828\" stroke-width=\"2.3\">\n <circle id=\"ec-sa\" cx=\"164\" cy=\"149\" r=\"10\"/><circle id=\"ec-av\" cx=\"247\" cy=\"225\" r=\"9\"/>\n</g>\n<g id=\"ec-impulse-a\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"11\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.5\"/><circle r=\"3.8\" fill=\"#e29e1c\"/></g>\n<g id=\"ec-impulse-b\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"11\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.5\"/><circle r=\"3.8\" fill=\"#e29e1c\"/></g>\n<g id=\"ec-impulse-c\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"9\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.2\"/></g>\n<g id=\"ec-impulse-d\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"9\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.2\"/></g>\n<g class=\"conduction-labels\" aria-label=\"Numbered conduction landmarks\">\n<g transform=\"translate(143 126)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">1</text></g>\n<g transform=\"translate(266 215)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">2</text></g>\n<g transform=\"translate(284 268)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">3</text></g>\n<g transform=\"translate(196 352)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">4</text></g>\n<g transform=\"translate(323 351)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">5</text></g>\n<g transform=\"translate(281 410)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">6</text></g>\n</g>\n<g id=\"ec-chaotic-atria\" visibility=\"hidden\" aria-label=\"Disorganized atrial activation\">\n <circle cx=\"145\" cy=\"166\" r=\"5\" fill=\"#e7a22f\"/><circle cx=\"184\" cy=\"196\" r=\"5\" fill=\"#e7a22f\"/>\n <circle cx=\"165\" cy=\"206\" r=\"5\" fill=\"#e7a22f\"/><circle cx=\"286\" cy=\"158\" r=\"5\" fill=\"#e7a22f\"/>\n <circle cx=\"328\" cy=\"185\" r=\"5\" fill=\"#e7a22f\"/><circle cx=\"301\" cy=\"207\" r=\"5\" fill=\"#e7a22f\"/>\n </g>\n <path id=\"ec-flutter-loop\" d=\"M143 147 C119 151 126 209 164 218 C213 232 222 167 187 145 C169 135 152 139 143 147Z\" fill=\"none\" stroke=\"#e4a431\" stroke-width=\"4\" stroke-dasharray=\"6 5\" visibility=\"hidden\"/>\n <circle id=\"ec-flutter-marker\" cx=\"143\" cy=\"147\" r=\"9\" fill=\"#ffeca8\" stroke=\"#c9871c\" stroke-width=\"2\" visibility=\"hidden\"/>\n</g></svg>";
host.appendChild(frame);
if(fallback)fallback.hidden=true;
const svg=frame.querySelector("svg");
svg.style.cssText="width:100%;height:100%;max-width:520px;display:block";
if(status)status.textContent="2D textbook conduction drawing • follow the orange electrical impulse";
const ids=["ec-path-atrial-right","ec-path-atrial-left","ec-path-av-his","ec-path-right-bundle","ec-path-left-bundle",
"ec-path-purk-r1","ec-path-purk-r2","ec-path-purk-r3","ec-path-purk-l1","ec-path-purk-l2","ec-path-purk-l3"];
const paths=ids.map(id=>svg.querySelector("#"+id));
const overlays=ids.map((id,i)=>{
 const source=paths[i],clone=svg.querySelector('[data-progress="'+id+'"]');
 clone.setAttribute("d",source.getAttribute("d"));return clone;
});
const lengths=paths.map(p=>p.getTotalLength());
const markers=["ec-impulse-a","ec-impulse-b","ec-impulse-c","ec-impulse-d"].map(id=>svg.querySelector("#"+id));
const sa=svg.querySelector("#ec-sa"),av=svg.querySelector("#ec-av");
const names=svg.querySelector(".conduction-labels");
const labelSelect=document.getElementById("heart-labels");
const labelLegend=document.createElement("div");
labelLegend.className="conduction-key";
labelLegend.setAttribute("aria-label","Cardiac conduction structures");
const keyLabels=["SA node","AV node","Bundle of His","Right bundle branch","Left bundle branch","Purkinje fibers"];
keyLabels.forEach((label,i)=>{
 const item=document.createElement("div");item.className="conduction-key-item";
 const number=document.createElement("span");number.className="conduction-key-number";number.textContent=String(i+1);
 const name=document.createElement("span");name.textContent=label;
 item.append(number,name);labelLegend.append(item);
});
host.insertAdjacentElement("afterend",labelLegend);

function progress(i,ratio){
 const t=Math.max(0,Math.min(1,ratio));
 overlays[i].setAttribute("stroke-dasharray",lengths[i]+" "+lengths[i]);
 overlays[i].setAttribute("stroke-dashoffset",String(lengths[i]*(1-t)));
}
function marker(i,which,ratio){
 const path=paths[i],point=path.getPointAtLength(lengths[i]*Math.max(0,Math.min(1,ratio)));
 const obj=markers[which];
 obj.setAttribute("transform","translate("+point.x.toFixed(1)+" "+point.y.toFixed(1)+")");
 obj.setAttribute("visibility","visible");
}
const disorganized=svg.querySelector("#ec-chaotic-atria"),flutterLoop=svg.querySelector("#ec-flutter-loop"),flutterMarker=svg.querySelector("#ec-flutter-marker");
const foci=Array.from(disorganized.children);
function paint(phase){
 const current=window.MedicLabState?.rhythm;
 const mode=current?.mode||"sinus";
 const timing=mode==="sinus"?window.MedicActivation?.at(phase):current;
 const stage=timing?.stage.id||timing?.stage||"sa",t=timing?.progress||0;
 const labelsVisible=labelSelect?.value!=="hide";
 if(names)names.style.display=labelsVisible?"":"none";
 labelLegend.hidden=!labelsVisible;
 const isSinus=mode==="sinus";
 disorganized.setAttribute("visibility",mode==="afib"?"visible":"hidden");
 flutterLoop.setAttribute("visibility",mode==="flutter"?"visible":"hidden");
 flutterMarker.setAttribute("visibility",mode==="flutter"?"visible":"hidden");
 if(mode==="afib"){
  // Multiple independent flickering sources; no dominant SA-node wavefront.
  const sec=current?.seconds||0;
  foci.forEach((dot,i)=>{
    const a=.5+.5*Math.sin(2*Math.PI*(4.3+i*.77)*sec+i*1.9);
    dot.setAttribute("opacity",String(.16+.84*a));
    dot.setAttribute("r",String(3.2+3.0*a));
  });
 }
 if(mode==="flutter"){
  const p=((current?.seconds||0)*(Math.max(180,Math.min(360,((window.MedicLabAPI?.getBpm()||75)*2)))/60)%1+1)%1;
  const at=flutterLoop.getPointAtLength(flutterLoop.getTotalLength()*p);
  flutterMarker.setAttribute("cx",at.x.toFixed(1));flutterMarker.setAttribute("cy",at.y.toFixed(1));
 }
 const percent=stage==="sa"?0:stage==="atria"?1:stage==="av"?2:stage==="his"?3:stage==="bundles"?4:stage==="ventricles"?5:isSinus?6:0;
 const values=new Array(11).fill(0);
 if(isSinus){
  if(percent>=2){values[0]=1;values[1]=1;}
  else if(percent===1){values[0]=t;values[1]=t;}
 }
 if(percent>=4)values[2]=1;else if(percent===3)values[2]=t;
 if(percent>=5){values[3]=1;values[4]=1;}
 else if(percent===4){values[3]=t;values[4]=t;}
 if(percent>=6){for(let i=5;i<11;i++)values[i]=1;}
 else if(percent===5){for(let i=5;i<11;i++)values[i]=t;}
 values.forEach((v,i)=>progress(i,v));
 markers.forEach(obj=>obj.setAttribute("visibility","hidden"));
 sa.setAttribute("fill",isSinus&&(stage==="sa"||stage==="atria")?"#ffd15f":"#df9a35");
 av.setAttribute("fill",stage==="av"?"#ffd15f":"#df9a35");
 if(isSinus){
  if(stage==="sa")marker(0,0,0);
  else if(stage==="atria"){marker(0,0,t);marker(1,1,t);}
  else if(stage==="av")marker(0,0,1);
 }
 else if(stage==="av")marker(0,0,1); // AV junction receives filtered atrial activity, not an SA impulse.
 if(stage==="his")marker(2,0,t);
 else if(stage==="bundles"){marker(3,0,t);marker(4,1,t);}
 else if(stage==="ventricles"){marker(5,0,t);marker(7,1,t);marker(8,2,t);marker(10,3,t);}
}
let handle;
function tick(){
 if(!host.isConnected){cancelAnimationFrame(handle);return;}
 paint(window.MedicLabState?.phase||0);
 handle=requestAnimationFrame(tick);
}
tick();
})();