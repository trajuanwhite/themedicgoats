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
frame.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 490\" role=\"img\" aria-label=\"Textbook-style diagram of the cardiac conduction system with moving impulse from SA node to AV node, His bundle, bundle branches and Purkinje fibers\">\n<g transform=\"rotate(-6 258 242)\">\n<!-- Simplified chambers with intentional handwritten-textbook appearance -->\n<path d=\"M169 99 C135 78 108 104 101 151 C88 218 103 280 141 335 C181 391 224 436 260 449 C309 430 378 377 399 309 C417 250 398 169 356 119 C325 88 288 103 269 117 C239 92 199 84 169 99Z\" fill=\"#f3dcd0\" stroke=\"#7b5149\" stroke-width=\"5\" stroke-linejoin=\"round\"/>\n<path d=\"M125 157 C124 111 154 106 186 121 C219 140 225 189 211 214 C193 241 157 235 140 217 C125 202 123 181 125 157Z\" fill=\"#f8eee4\" stroke=\"#a4796b\" stroke-width=\"3\"/>\n<path d=\"M276 132 C291 104 334 107 357 138 C380 169 380 201 361 224 C342 247 296 236 280 211 C264 184 262 158 276 132Z\" fill=\"#f8eee4\" stroke=\"#a4796b\" stroke-width=\"3\"/>\n<path d=\"M138 241 C162 225 194 240 216 261 C232 282 246 350 259 422 C211 401 174 371 151 335 C128 300 115 264 138 241Z\" fill=\"#faeee7\" stroke=\"#a4796b\" stroke-width=\"4\"/>\n<path d=\"M277 258 C300 238 349 244 368 273 C390 314 344 389 267 426 C264 360 262 287 277 258Z\" fill=\"#f5dfd6\" stroke=\"#a4796b\" stroke-width=\"4\"/>\n<path d=\"M239 227 Q259 278 259 422\" stroke=\"#b17e75\" stroke-width=\"9\" fill=\"none\" stroke-linecap=\"round\"/>\n<!-- Light great vessel silhouettes: no gradients, gloss, or complicated shading -->\n<path d=\"M293 133 C292 87 280 64 297 44 Q313 28 333 47 Q352 67 329 101\" fill=\"none\" stroke=\"#b67b71\" stroke-width=\"20\" stroke-linecap=\"round\"/>\n<path d=\"M214 126 Q217 80 175 55 Q151 41 137 60\" fill=\"none\" stroke=\"#91abb0\" stroke-width=\"17\" stroke-linecap=\"round\"/>\n<path d=\"M142 158 L141 62 M140 293 L137 371\" stroke=\"#91abb0\" stroke-width=\"15\" fill=\"none\" stroke-linecap=\"round\"/>\n<!-- A simple surface annotation of approximate chamber boundaries -->\n<g fill=\"#785a50\" font-family=\"system-ui, sans-serif\" font-size=\"12\" font-weight=\"600\" opacity=\".8\">\n <text x=\"135\" y=\"186\">RA</text><text x=\"328\" y=\"180\">LA</text>\n <text x=\"162\" y=\"319\">RV</text><text x=\"319\" y=\"326\">LV</text>\n</g>\n<!-- Tissue depolarization layer. Schematic 2D projection:\n atrial spread from SA, early septal left-to-right, followed by\n apex-to-base ventricular free-wall spread. Conduction fibers overlay it. -->\n<defs>\n <clipPath id=\"dep-atria-clip\">\n  <path d=\"M125 157 C124 111 154 106 186 121 C219 140 225 189 211 214 C193 241 157 235 140 217 C125 202 123 181 125 157Z\"/>\n  <path d=\"M276 132 C291 104 334 107 357 138 C380 169 380 201 361 224 C342 247 296 236 280 211 C264 184 262 158 276 132Z\"/>\n </clipPath>\n <clipPath id=\"dep-rv-clip\">\n  <path d=\"M138 241 C162 225 194 240 216 261 C232 282 246 350 259 422 C211 401 174 371 151 335 C128 300 115 264 138 241Z\"/>\n </clipPath>\n <clipPath id=\"dep-lv-clip\">\n  <path d=\"M277 258 C300 238 349 244 368 273 C390 314 344 389 267 426 C264 360 262 287 277 258Z\"/>\n </clipPath>\n</defs>\n<g id=\"ec-tissue-depolarization\" pointer-events=\"none\">\n <g clip-path=\"url(#dep-atria-clip)\">\n  <circle id=\"dep-atrial-wave\" cx=\"164\" cy=\"149\" r=\"0\" fill=\"#e8ad3c\" opacity=\".28\"/>\n  <circle id=\"dep-atrial-edge\" cx=\"164\" cy=\"149\" r=\"0\" stroke=\"#d99117\" stroke-width=\"4\" fill=\"none\" opacity=\".78\"/>\n </g>\n <g clip-path=\"url(#dep-rv-clip)\">\n  <rect id=\"dep-rv-fill\" x=\"105\" y=\"425\" width=\"160\" height=\"0\" fill=\"#e8a12c\" opacity=\".25\"/>\n  <path id=\"dep-rv-front\" d=\"M127 409 Q182 378 259 405\" fill=\"none\" stroke=\"#d98c15\" stroke-width=\"4\" opacity=\".76\"/>\n </g>\n <g clip-path=\"url(#dep-lv-clip)\">\n  <rect id=\"dep-lv-fill\" x=\"260\" y=\"425\" width=\"133\" height=\"0\" fill=\"#e8a12c\" opacity=\".30\"/>\n  <path id=\"dep-lv-front\" d=\"M267 410 Q325 382 382 405\" fill=\"none\" stroke=\"#d98c15\" stroke-width=\"4\" opacity=\".78\"/>\n </g>\n <!-- Septal myocardial activation: first spreads from the LV side\n      toward the RV side (viewer right toward viewer left). -->\n <path id=\"dep-septal-front\" d=\"M265 302 Q259 304 250 305\" stroke=\"#f0b443\" stroke-width=\"9\" stroke-linecap=\"round\" opacity=\".65\" fill=\"none\"/>\n <!-- VT ectopic and WPW accessory wavefronts use their own local origins -->\n <g clip-path=\"url(#dep-rv-clip)\"><circle id=\"dep-vt-rv\" cx=\"314\" cy=\"329\" r=\"0\" fill=\"#e2a044\" opacity=\".26\"/></g>\n <g clip-path=\"url(#dep-lv-clip)\">\n  <circle id=\"dep-vt-lv\" cx=\"314\" cy=\"329\" r=\"0\" fill=\"#e2a044\" opacity=\".30\"/>\n  <circle id=\"dep-wpw-wave\" cx=\"349\" cy=\"303\" r=\"0\" fill=\"#d99b34\" opacity=\".28\"/>\n </g>\n</g>\n<!-- Fine background conduction pathways -->\n<g id=\"conduction-tracks\" stroke=\"#977d57\" stroke-width=\"4.1\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<path id=\"ec-path-atrial-right\" d=\"M164 149 C177 165 196 173 218 198 C227 210 234 217 247 225\"/>\n<path id=\"ec-path-atrial-left\" d=\"M164 149 C204 126 248 125 288 144 C308 156 317 173 330 187\"/>\n<path id=\"ec-path-av-his\" d=\"M247 225 C251 238 256 253 258 266\"/>\n<path id=\"ec-path-right-bundle\" d=\"M258 266 C252 293 251 334 251 365 C249 384 239 393 226 399\"/>\n<path id=\"ec-path-left-bundle\" d=\"M258 266 C265 295 264 334 265 366 C267 383 272 392 283 399\"/>\n<path id=\"ec-path-purk-r1\" d=\"M226 399 C202 388 168 356 145 322\"/>\n<path id=\"ec-path-purk-r2\" d=\"M226 399 C203 407 179 393 160 370\"/>\n<path id=\"ec-path-purk-r3\" d=\"M226 399 Q237 412 249 419\"/>\n<path id=\"ec-path-purk-l1\" d=\"M283 399 C314 391 345 358 369 318\"/>\n<path id=\"ec-path-purk-l2\" d=\"M283 399 C317 411 346 393 370 369\"/>\n<path id=\"ec-path-purk-l3\" d=\"M283 399 Q273 415 263 419\"/>\n</g>\n<g id=\"fine-purkinje-tracks\" fill=\"none\" stroke=\"#ae996a\" stroke-width=\"1.8\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path id=\"ec-path-fine-r1\" d=\"M174 359 Q160 346 143 345\"/><path id=\"ec-path-fine-r2\" d=\"M197 387 Q182 373 172 350\"/><path id=\"ec-path-fine-r3\" d=\"M183 393 Q160 395 147 379\"/><path id=\"ec-path-fine-l1\" d=\"M339 355 Q358 348 376 337\"/><path id=\"ec-path-fine-l2\" d=\"M317 390 Q330 376 334 359\"/><path id=\"ec-path-fine-l3\" d=\"M347 392 Q365 396 377 381\"/></g>\n<!-- Bright traveling overlay is clipped by progress rather than jumping -->\n<g id=\"conduction-progress\" stroke=\"#e6a126\" stroke-width=\"4.8\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" pointer-events=\"none\">\n<path data-progress=\"ec-path-atrial-right\"/><path data-progress=\"ec-path-atrial-left\"/>\n<path data-progress=\"ec-path-av-his\"/><path data-progress=\"ec-path-right-bundle\"/><path data-progress=\"ec-path-left-bundle\"/>\n<path data-progress=\"ec-path-purk-r1\"/><path data-progress=\"ec-path-purk-r2\"/><path data-progress=\"ec-path-purk-r3\"/>\n<path data-progress=\"ec-path-purk-l1\"/><path data-progress=\"ec-path-purk-l2\"/><path data-progress=\"ec-path-purk-l3\"/>\n</g><g id=\"fine-purkinje-progress\" stroke=\"#e5ad48\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\" pointer-events=\"none\"><path data-progress=\"ec-path-fine-r1\"/><path data-progress=\"ec-path-fine-r2\"/><path data-progress=\"ec-path-fine-r3\"/><path data-progress=\"ec-path-fine-l1\"/><path data-progress=\"ec-path-fine-l2\"/><path data-progress=\"ec-path-fine-l3\"/></g>\n<g id=\"conduction-nodes\" fill=\"#df9a35\" stroke=\"#855828\" stroke-width=\"2.3\">\n <circle id=\"ec-sa\" cx=\"164\" cy=\"149\" r=\"10\"/><circle id=\"ec-av\" cx=\"247\" cy=\"225\" r=\"9\"/>\n</g>\n<g id=\"ec-impulse-a\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"11\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.5\"/><circle r=\"3.8\" fill=\"#e29e1c\"/></g>\n<g id=\"ec-impulse-b\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"11\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.5\"/><circle r=\"3.8\" fill=\"#e29e1c\"/></g>\n<g id=\"ec-impulse-c\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"9\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.2\"/></g>\n<g id=\"ec-impulse-d\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"9\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.2\"/></g>\n<g class=\"conduction-labels\" aria-label=\"Numbered conduction landmarks\">\n<g transform=\"translate(143 126)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">1</text></g>\n<g transform=\"translate(266 215)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">2</text></g>\n<g transform=\"translate(284 268)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">3</text></g>\n<g transform=\"translate(190 373)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">4</text></g>\n<g transform=\"translate(323 375)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">5</text></g>\n<g transform=\"translate(281 410)\"><circle r=\"11\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.6\"/><text x=\"0\" y=\"4.3\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"12\" fill=\"#664629\">6</text></g>\n</g>\n<g id=\"ec-chaotic-atria\" visibility=\"hidden\" aria-label=\"Disorganized atrial activation\">\n <circle cx=\"145\" cy=\"166\" r=\"5\" fill=\"#e7a22f\"/><circle cx=\"184\" cy=\"196\" r=\"5\" fill=\"#e7a22f\"/>\n <circle cx=\"165\" cy=\"206\" r=\"5\" fill=\"#e7a22f\"/><circle cx=\"286\" cy=\"158\" r=\"5\" fill=\"#e7a22f\"/>\n <circle cx=\"328\" cy=\"185\" r=\"5\" fill=\"#e7a22f\"/><circle cx=\"301\" cy=\"207\" r=\"5\" fill=\"#e7a22f\"/>\n </g>\n <path id=\"ec-flutter-loop\" d=\"M143 147 C119 151 126 209 164 218 C213 232 222 167 187 145 C169 135 152 139 143 147Z\" fill=\"none\" stroke=\"#e4a431\" stroke-width=\"4\" stroke-dasharray=\"6 5\" visibility=\"hidden\"/>\n <circle id=\"ec-flutter-marker\" cx=\"143\" cy=\"147\" r=\"9\" fill=\"#ffeca8\" stroke=\"#c9871c\" stroke-width=\"2\" visibility=\"hidden\"/>\n<g id=\"ec-vfib-wavelets\" visibility=\"hidden\" pointer-events=\"none\">\n <circle cx=\"175\" cy=\"276\" r=\"9\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"201\" cy=\"334\" r=\"8\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"238\" cy=\"388\" r=\"10\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"294\" cy=\"274\" r=\"7\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"327\" cy=\"336\" r=\"9\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"315\" cy=\"385\" r=\"8\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"272\" cy=\"352\" r=\"6\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"150\" cy=\"308\" r=\"7\" fill=\"#dfa43f\" opacity=\".4\"/>\n </g>\n<g id=\"ec-mechanism-overlays\" pointer-events=\"none\">\n <path id=\"ec-accessory-path\" d=\"M300 168 Q366 194 354 265 Q349 295 330 319\" fill=\"none\" stroke=\"#b57d50\" stroke-width=\"4\" stroke-dasharray=\"6 6\" visibility=\"hidden\"/>\n <circle id=\"ec-accessory-dot\" r=\"10\" fill=\"#fff0a1\" stroke=\"#a86a1e\" stroke-width=\"2\" visibility=\"hidden\"/>\n <g id=\"ec-block-marker\" visibility=\"hidden\">\n  <path d=\"M237 221 L258 237 M258 221 L237 237\" stroke=\"#b33442\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n  <circle cx=\"247\" cy=\"229\" r=\"16\" fill=\"none\" stroke=\"#b33442\" stroke-width=\"2\"/>\n </g>\n <g id=\"ec-below-block-marker\" visibility=\"hidden\">\n  <path d=\"M249 256 L270 272 M270 256 L249 272\" stroke=\"#b33442\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n  <circle cx=\"259\" cy=\"264\" r=\"16\" fill=\"none\" stroke=\"#b33442\" stroke-width=\"2\"/>\n </g>\n <g id=\"ec-ventricular-origin\" visibility=\"hidden\">\n  <circle id=\"ec-ventricular-core\" cx=\"316\" cy=\"329\" r=\"10\" fill=\"#ffdf75\" stroke=\"#aa661f\" stroke-width=\"3\"/>\n  <circle id=\"ec-ventricular-halo\" cx=\"316\" cy=\"329\" r=\"24\" fill=\"none\" stroke=\"#e6a126\" stroke-width=\"3\" stroke-opacity=\".55\"/>\n </g>\n <path id=\"ec-ventricular-wave\" d=\"M316 329 Q291 303 269 307 M316 329 Q331 356 309 383 M316 329 Q272 364 235 383\" stroke=\"#e6a126\" fill=\"none\" stroke-width=\"5\" stroke-linecap=\"round\" visibility=\"hidden\"/>\n</g>\n</g></svg>";
host.appendChild(frame);
if(fallback)fallback.hidden=true;
const svg=frame.querySelector("svg");
svg.style.cssText="width:100%;height:100%;max-width:520px;display:block";
if(status)status.textContent="2D textbook conduction drawing • follow the orange electrical impulse";
const ids=["ec-path-atrial-right","ec-path-atrial-left","ec-path-av-his","ec-path-right-bundle","ec-path-left-bundle",
"ec-path-purk-r1","ec-path-purk-r2","ec-path-purk-r3","ec-path-purk-l1","ec-path-purk-l2","ec-path-purk-l3"];

const fineIds=["ec-path-fine-r1","ec-path-fine-r2","ec-path-fine-r3","ec-path-fine-l1","ec-path-fine-l2","ec-path-fine-l3"];
ids.push(...fineIds);
const mediumEnd=11, fineStart=11;
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
const disorganized=svg.querySelector("#ec-chaotic-atria"),
 flutterLoop=svg.querySelector("#ec-flutter-loop"),flutterMarker=svg.querySelector("#ec-flutter-marker");
const foci=Array.from(disorganized.children);
const accessoryPath=svg.querySelector("#ec-accessory-path"),
 accessoryDot=svg.querySelector("#ec-accessory-dot"),
 blockAV=svg.querySelector("#ec-block-marker"),
 blockBelow=svg.querySelector("#ec-below-block-marker"),
 ventOrigin=svg.querySelector("#ec-ventricular-origin"),
 ventHalo=svg.querySelector("#ec-ventricular-halo"),
 ventWave=svg.querySelector("#ec-ventricular-wave");
const ventricularWaveLength=ventWave.getTotalLength();
const vfibGroup=svg.querySelector("#ec-vfib-wavelets");
const vfibDots=Array.from(vfibGroup.children);

const muscle={
 atrium:svg.querySelector("#dep-atrial-wave"),
 atrialEdge:svg.querySelector("#dep-atrial-edge"),
 rvFill:svg.querySelector("#dep-rv-fill"),
 lvFill:svg.querySelector("#dep-lv-fill"),
 rvFront:svg.querySelector("#dep-rv-front"),
 lvFront:svg.querySelector("#dep-lv-front"),
 septum:svg.querySelector("#dep-septal-front"),
 vtRV:svg.querySelector("#dep-vt-rv"),
 vtLV:svg.querySelector("#dep-vt-lv"),
 wpw:svg.querySelector("#dep-wpw-wave")
};
// Depolarization wave remains enabled; the user-facing toggle was removed.
const clamp=x=>Math.max(0,Math.min(1,x));
function tissueWave(current,mode,stage,progress,isSinus){
 const show=true;
 const t=clamp(progress),atrial=mode==="sinus"?stage==="atria":Boolean(current?.atrialActive);
 const a=mode==="sinus"?t:clamp(current?.atrialProgress||0);
 const organized=["sinus","av1","mobitz1","mobitz2","av3","wpw"].includes(mode);
 const atrialShow=show&&organized&&atrial;
 const radius=16+230*a;
 visible(muscle.atrium,atrialShow);
 visible(muscle.atrialEdge,atrialShow);
 muscle.atrium.setAttribute("r",String(radius));
 muscle.atrialEdge.setAttribute("r",String(radius));
 // Depolarization is not a repeat of the bundle-branch animation:
 // initial septal muscle activation crosses from LV side toward RV side.
 const normal=show&&!["vt","pvt","vf","av3"].includes(mode)&&stage==="ventricles";
 const septal=normal&&t<.26;
 visible(muscle.septum,septal);
 if(septal){
  const x=263-20*clamp(t/.26);
  muscle.septum.setAttribute("d","M265 299 Q"+x.toFixed(1)+" 305 "+(x-5).toFixed(1)+" 310");
 }
 // Approximate apex-first free-wall activation, moving upward from endocardium.
 const wall=normal?clamp((t-.19)/.81):0;
 const top=421-179*wall;
 for(const el of [muscle.rvFill,muscle.lvFill]){
  el.setAttribute("y",String(top));
  el.setAttribute("height",String(421-top));
  visible(el,wall>0);
 }
 for(const [front,edgeX,endX] of [[muscle.rvFront,130,260],[muscle.lvFront,264,383]]){
  visible(front,wall>.04&&wall<.97);
  const y=top+3;
  front.setAttribute("d","M"+edgeX+" "+y.toFixed(1)+" Q"+((edgeX+endX)/2)+" "+(y-20).toFixed(1)+" "+endX+" "+(y+4).toFixed(1));
 }
 // VT and complete-block escape start in ventricular tissue rather than
 // falsely showing activation entering via the bundle branches.
 const ectopic=show&&["vt","pvt","av3"].includes(mode)&&(stage==="ventricular-origin"||stage==="ventricles");
 const reach=stage==="ventricular-origin"?.20+.25*t:.45+.55*t;
 visible(muscle.vtRV,ectopic);
 visible(muscle.vtLV,ectopic);
 for(const el of [muscle.vtRV,muscle.vtLV])el.setAttribute("r",String(240*reach));
 const pre=show&&mode==="wpw"&&(stage==="accessory"||stage==="ventricles");
 visible(muscle.wpw,pre);
 muscle.wpw.setAttribute("r",String(stage==="accessory"?16+90*t:108+75*t));
}

function visible(node,show){node.setAttribute("visibility",show?"visible":"hidden");}
function paint(phase){
 const current=window.MedicLabState?.rhythm;
 const mode=current?.mode||"sinus";
 const timing=mode==="sinus"?window.MedicActivation?.at(phase):current;
 const stage=typeof timing?.stage==="object"?timing.stage.id:(timing?.stage||"sa");
 const t=timing?.progress||0,seconds=current?.seconds||0;
 const isSinus=mode==="sinus";
 const sinusAtrial=["sinus","av1","mobitz1","mobitz2","av3","wpw"].includes(mode);
 const isVentricular=["vt","pvt","vf","av3"].includes(mode);
 const unorganizedVF=mode==="vf";
 tissueWave(current,mode,stage,t,isSinus);
 const labelsVisible=labelSelect?.value!=="hide";
 if(names)names.style.display=labelsVisible?"":"none";
 labelLegend.hidden=!labelsVisible;
 visible(disorganized,mode==="afib");
 visible(flutterLoop,mode==="flutter");
 visible(flutterMarker,mode==="flutter");
 visible(accessoryPath,mode==="wpw");
 visible(blockAV,(mode==="mobitz1"||mode==="av3")&&Boolean(current?.blockSite));
 visible(blockBelow,mode==="mobitz2"&&Boolean(current?.blockSite));
 visible(ventOrigin,isVentricular&&!unorganizedVF&&(stage==="ventricular-origin"||stage==="ventricles"||stage==="recovery"));
 visible(vfibGroup,unorganizedVF);
 if(unorganizedVF){
  vfibDots.forEach((dot,i)=>{
   const freq=3.4+i*.61,phase=seconds*freq*2*Math.PI+i*1.47;
   const pulse=.5+.5*Math.sin(phase+Math.sin(seconds*(2+i*.17)));
   dot.setAttribute("r",String(3+9*pulse));
   dot.setAttribute("opacity",String(.16+.54*pulse));
   dot.setAttribute("fill",i%2===0?"#e3a038":"#d5b45b");
  });
 }
 visible(ventWave,isVentricular&&!unorganizedVF&&(stage==="ventricular-origin"||stage==="ventricles"));
 visible(accessoryDot,mode==="wpw"&&stage==="accessory");
 if(mode==="afib"){
  foci.forEach((dot,i)=>{
   const a=.5+.5*Math.sin(2*Math.PI*(4.3+i*.77)*seconds+i*1.9);
   dot.setAttribute("opacity",String(.16+.84*a));
   dot.setAttribute("r",String(3.2+3*a));
  });
 }
 if(mode==="flutter"){
  const bpm=window.MedicLabAPI?.getBpm()||150;
  const p=((seconds*Math.max(180,Math.min(360,bpm*2))/60)%1+1)%1;
  const at=flutterLoop.getPointAtLength(flutterLoop.getTotalLength()*p);
  flutterMarker.setAttribute("cx",at.x.toFixed(1));
  flutterMarker.setAttribute("cy",at.y.toFixed(1));
 }
 if(mode==="wpw"&&stage==="accessory"){
  const at=accessoryPath.getPointAtLength(accessoryPath.getTotalLength()*Math.max(0,Math.min(1,t)));
  accessoryDot.setAttribute("transform","translate("+at.x.toFixed(1)+" "+at.y.toFixed(1)+")");
 }
 if(isVentricular&&!unorganizedVF){
  if(mode==="pvt"){
   // Changes in focus emphasize shifting ventricular wavefronts without
   // pretending the organized His–Purkinje network initiated the beat.
   const idx=current?.ventricularEvent?.index||0;
   const focuses=[[315,330],[286,375],[350,322],[227,335],[290,410]];
   const focus=focuses[idx%focuses.length];
   ventOrigin.setAttribute("transform","translate("+(focus[0]-316)+" "+(focus[1]-329)+")");
   for(const el of [muscle.vtRV,muscle.vtLV]){
    el.setAttribute("cx",focus[0]);el.setAttribute("cy",focus[1]);
   }
  }else{
   ventOrigin.removeAttribute("transform");
   for(const el of [muscle.vtRV,muscle.vtLV]){el.setAttribute("cx","314");el.setAttribute("cy","329");}
  }
  const size=stage==="ventricular-origin"?1+.55*t:stage==="ventricles"?1.5+.8*t:1;
  ventHalo.setAttribute("r",String(24*size));
  ventHalo.setAttribute("opacity",String(Math.max(.2,1-.28*t)));
  const fraction=stage==="ventricular-origin"?Math.max(0,t*.45):stage==="ventricles"?.45+.55*t:1;
  ventWave.setAttribute("stroke-dasharray",String(ventricularWaveLength));
  ventWave.setAttribute("stroke-dashoffset",String(ventricularWaveLength*(1-fraction)));
 }
 const progressValues=new Array(ids.length).fill(0);
 if(isSinus){
  const n=stage==="sa"?0:stage==="atria"?1:stage==="av"?2:stage==="his"?3:stage==="bundles"?4:stage==="ventricles"?5:6;
  progressValues[0]=progressValues[1]=n>=2?1:n===1?t:0;
  progressValues[2]=n>=4?1:n===3?t:0;
  progressValues[3]=progressValues[4]=n>=5?1:n===4?t:0;
  for(let i=5;i<mediumEnd;i++)progressValues[i]=n>=6?1:n===5?Math.min(1,t*1.6):0;
  for(let i=fineStart;i<ids.length;i++)progressValues[i]=n>=6?1:n===5?Math.max(0,Math.min(1,(t-.22)/.78)):0;
 }else{
  // Regular P waves can coexist with an independent ventricular escape.
  if(sinusAtrial&&current?.atrialActive){
   progressValues[0]=progressValues[1]=Math.max(0,Math.min(1,current.atrialProgress||0));
  }
  if(mode==="wpw"&&stage==="accessory"){
   // Normal AV/His conduction remains present alongside pre-excitation.
   progressValues[0]=progressValues[1]=1;
   progressValues[2]=Math.min(.8,t*.8);
  }
  if(stage==="blocked"){
   if(current?.blockSite==="av")progressValues[0]=progressValues[1]=1;
   if(current?.blockSite==="infranodal"){progressValues[0]=progressValues[1]=1;progressValues[2]=.85;}
  }else if(!isVentricular){
   if(stage==="av")progressValues[0]=progressValues[1]=sinusAtrial?1:0;
   if(stage==="his")progressValues[2]=t;
   if(stage==="bundles"){progressValues[2]=1;progressValues[3]=progressValues[4]=t;}
   if(stage==="ventricles"){
    progressValues[2]=1;
    progressValues[3]=progressValues[4]=1;
    for(let i=5;i<mediumEnd;i++)progressValues[i]=Math.min(1,t*1.6);
    for(let i=fineStart;i<ids.length;i++)progressValues[i]=Math.max(0,Math.min(1,(t-.22)/.78));
   }
  }
 }
 progressValues.forEach((v,i)=>progress(i,v));
 markers.forEach(obj=>obj.setAttribute("visibility","hidden"));
 sa.setAttribute("fill",sinusAtrial&&(isSinus?["sa","atria"].includes(stage):current?.atrialActive)?"#ffd15f":"#df9a35");
 av.setAttribute("fill",stage==="av"||stage==="accessory"||stage==="blocked"&&current?.blockSite==="av"?"#ffd15f":"#df9a35");
 if(isSinus){
  if(stage==="sa")marker(0,0,0);
  else if(stage==="atria"){marker(0,0,t);marker(1,1,t);}
  else if(stage==="av")marker(0,0,1);
 }else if(sinusAtrial&&current?.atrialActive){
  marker(0,0,current.atrialProgress);marker(1,1,current.atrialProgress);
 }
 if(!isVentricular&&stage==="av"&&!(mode==="afib"||mode==="flutter"))marker(0,0,1);
 if(!isVentricular&&stage==="his")marker(2,0,t);
 else if(!isVentricular&&stage==="bundles"){marker(3,0,t);marker(4,1,t);}
 else if(!isVentricular&&stage==="ventricles"){
  marker(5,0,t);marker(7,1,t);marker(8,2,t);marker(10,3,t);
 }
}
let handle;
function tick(){
 if(!host.isConnected){cancelAnimationFrame(handle);return;}
 paint(window.MedicLabState?.phase||0);
 handle=requestAnimationFrame(tick);
}
tick();
})();