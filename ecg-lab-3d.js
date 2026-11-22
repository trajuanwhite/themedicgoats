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
frame.innerHTML="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 520 490\" role=\"img\" aria-label=\"Textbook-style diagram of the cardiac conduction system with moving impulse from SA node to AV node, His bundle, bundle branches and Purkinje fibers\">\n<g transform=\"rotate(-6 258 242)\">\n<!-- Simplified chambers with intentional handwritten-textbook appearance -->\n<path d=\"M169 99 C135 78 108 104 101 151 C88 218 103 280 141 335 C181 391 224 436 260 449 C309 430 378 377 399 309 C417 250 398 169 356 119 C325 88 288 103 269 117 C239 92 199 84 169 99Z\" fill=\"#f3dcd0\" stroke=\"#7b5149\" stroke-width=\"5\" stroke-linejoin=\"round\"/>\n<path d=\"M125 157 C124 111 154 106 186 121 C219 140 225 189 211 214 C193 241 157 235 140 217 C125 202 123 181 125 157Z\" fill=\"#f8eee4\" stroke=\"#a4796b\" stroke-width=\"3\"/>\n<path d=\"M276 132 C291 104 334 107 357 138 C380 169 380 201 361 224 C342 247 296 236 280 211 C264 184 262 158 276 132Z\" fill=\"#f8eee4\" stroke=\"#a4796b\" stroke-width=\"3\"/>\n<path d=\"M138 241 C162 225 194 240 216 261 C232 282 246 350 259 422 C211 401 174 371 151 335 C128 300 115 264 138 241Z\" fill=\"#faeee7\" stroke=\"#a4796b\" stroke-width=\"4\"/>\n<path d=\"M277 258 C300 238 349 244 368 273 C390 314 344 389 267 426 C264 360 262 287 277 258Z\" fill=\"#f5dfd6\" stroke=\"#a4796b\" stroke-width=\"4\"/>\n<path d=\"M239 227 Q259 278 259 422\" stroke=\"#b17e75\" stroke-width=\"9\" fill=\"none\" stroke-linecap=\"round\"/>\n<!-- Light great vessel silhouettes: no gradients, gloss, or complicated shading -->\n<path d=\"M293 133 C292 87 280 64 297 44 Q313 28 333 47 Q352 67 329 101\" fill=\"none\" stroke=\"#b67b71\" stroke-width=\"20\" stroke-linecap=\"round\"/>\n<path d=\"M214 126 Q217 80 175 55 Q151 41 137 60\" fill=\"none\" stroke=\"#91abb0\" stroke-width=\"17\" stroke-linecap=\"round\"/>\n<path d=\"M142 158 L141 62 M140 293 L137 371\" stroke=\"#91abb0\" stroke-width=\"15\" fill=\"none\" stroke-linecap=\"round\"/>\n<!-- A simple surface annotation of approximate chamber boundaries -->\n<g fill=\"#785a50\" font-family=\"system-ui, sans-serif\" font-size=\"12\" font-weight=\"600\" opacity=\".8\">\n <text x=\"135\" y=\"186\">RA</text><text x=\"328\" y=\"180\">LA</text>\n <text x=\"162\" y=\"319\">RV</text><text x=\"319\" y=\"326\">LV</text>\n</g>\n<!-- Tissue depolarization layer. Schematic 2D projection:\n atrial spread from SA, early septal left-to-right, followed by\n apex-to-base ventricular free-wall spread. Conduction fibers overlay it. -->\n<defs>\n <clipPath id=\"dep-atria-clip\">\n  <path d=\"M125 157 C124 111 154 106 186 121 C219 140 225 189 211 214 C193 241 157 235 140 217 C125 202 123 181 125 157Z\"/>\n  <path d=\"M276 132 C291 104 334 107 357 138 C380 169 380 201 361 224 C342 247 296 236 280 211 C264 184 262 158 276 132Z\"/>\n </clipPath>\n <clipPath id=\"dep-rv-clip\">\n  <path d=\"M138 241 C162 225 194 240 216 261 C232 282 246 350 259 422 C211 401 174 371 151 335 C128 300 115 264 138 241Z\"/>\n </clipPath>\n <clipPath id=\"dep-lv-clip\">\n  <path d=\"M277 258 C300 238 349 244 368 273 C390 314 344 389 267 426 C264 360 262 287 277 258Z\"/>\n </clipPath>\n</defs>\n<g id=\"ec-tissue-depolarization\" pointer-events=\"none\">\n <g clip-path=\"url(#dep-atria-clip)\">\n  <rect class=\"myocardium-resting\" x=\"90\" y=\"85\" width=\"300\" height=\"165\" fill=\"#c3dceb\"/>\n  <circle id=\"dep-atrial-wave\" cx=\"164\" cy=\"149\" r=\"0\" fill=\"#e8ad3c\" opacity=\".28\"/>\n  <circle id=\"rep-atrial-wave\" cx=\"164\" cy=\"149\" r=\"0\" fill=\"#c3dceb\" visibility=\"hidden\"/>\n  <circle id=\"dep-atrial-edge\" cx=\"164\" cy=\"149\" r=\"0\" stroke=\"#d99117\" stroke-width=\"4\" fill=\"none\" opacity=\".78\"/>\n </g>\n <g clip-path=\"url(#dep-rv-clip)\">\n  <rect class=\"myocardium-resting\" x=\"90\" y=\"225\" width=\"330\" height=\"215\" fill=\"#c3dceb\"/>\n  <rect id=\"dep-rv-fill\" x=\"90\" y=\"440\" width=\"330\" height=\"0\" fill=\"#e8a12c\" opacity=\".25\"/>\n  <path id=\"dep-rv-front\" d=\"M127 409 Q182 378 259 405\" fill=\"none\" stroke=\"#d98c15\" stroke-width=\"4\" opacity=\".76\"/>\n </g>\n <g clip-path=\"url(#dep-lv-clip)\">\n  <rect class=\"myocardium-resting\" x=\"90\" y=\"225\" width=\"330\" height=\"215\" fill=\"#c3dceb\"/>\n  <rect id=\"dep-lv-fill\" x=\"90\" y=\"440\" width=\"330\" height=\"0\" fill=\"#e8a12c\" opacity=\".30\"/>\n  <path id=\"dep-lv-front\" d=\"M267 410 Q325 382 382 405\" fill=\"none\" stroke=\"#d98c15\" stroke-width=\"4\" opacity=\".78\"/>\n </g>\n <!-- Septal myocardial activation: first spreads from the LV side\n      toward the RV side (viewer right toward viewer left). -->\n <path id=\"dep-septal-front\" d=\"M265 302 Q259 304 250 305\" stroke=\"#f0b443\" stroke-width=\"9\" stroke-linecap=\"round\" opacity=\".65\" fill=\"none\"/>\n <!-- VT ectopic and WPW accessory wavefronts use their own local origins -->\n <g clip-path=\"url(#dep-rv-clip)\"><circle id=\"dep-vt-rv\" cx=\"314\" cy=\"329\" r=\"0\" fill=\"#e2a044\" opacity=\".26\"/></g>\n <g clip-path=\"url(#dep-lv-clip)\">\n  <circle id=\"dep-vt-lv\" cx=\"314\" cy=\"329\" r=\"0\" fill=\"#e2a044\" opacity=\".30\"/>\n  <circle id=\"dep-wpw-wave\" cx=\"349\" cy=\"303\" r=\"0\" fill=\"#d99b34\" opacity=\".28\"/>\n </g>\n</g>\n<defs><clipPath id=\"ec-inner-heart-clip\" clipPathUnits=\"userSpaceOnUse\"><path d=\"M169 99 C135 78 108 104 101 151 C88 218 103 280 141 335 C181 391 224 436 260 449 C309 430 378 377 399 309 C417 250 398 169 356 119 C325 88 288 103 269 117 C239 92 199 84 169 99Z\" transform=\"translate(12 12) scale(.95 .95)\"/></clipPath></defs>\n<!-- Fine background conduction pathways -->\n<g clip-path=\"url(#ec-inner-heart-clip)\" id=\"conduction-tracks\" stroke=\"#977d57\" stroke-width=\"4.1\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<path id=\"ec-path-atrial-right\" d=\"M164 149 C177 165 196 173 218 198 C227 210 234 217 247 225\"/>\n<path id=\"ec-path-atrial-left\" d=\"M164 149 C204 126 248 125 288 144 C308 156 317 173 330 187\"/>\n<path id=\"ec-path-av-his\" d=\"M247 225 C251 238 256 253 258 266\"/>\n<path id=\"ec-path-right-bundle\" d=\"M258 266 C254 299 252 342 251 375 C250 387 247 391 244 399\"/>\n<path id=\"ec-path-left-bundle\" d=\"M258 266 C264 300 266 342 267 377 C267 387 270 393 272 399\"/>\n<path id=\"ec-path-purk-r1\" d=\"M244 399 C215 381 193 359 176 339\" stroke-width=\"2.3\"/>\n<path id=\"ec-path-purk-r2\" d=\"M244 399 Q217 397 201 379\" stroke-width=\"2.3\"/>\n<path id=\"ec-path-purk-r3\" d=\"M244 399 Q238 409 226 408\" stroke-width=\"2.3\"/>\n<path id=\"ec-path-purk-l1\" d=\"M264 305 C296 299 333 306 362 318\" aria-label=\"Left anterior fascicle\" stroke-width=\"2.3\"/>\n<path id=\"ec-path-purk-l2\" d=\"M266 343 C294 363 325 380 352 366\" aria-label=\"Left posterior fascicle\" stroke-width=\"2.3\"/>\n<path id=\"ec-path-purk-l3\" d=\"M265 325 Q277 364 291 413\" aria-label=\"Left septal fascicle\" stroke-width=\"2.3\"/>\n</g>\n<g clip-path=\"url(#ec-inner-heart-clip)\" id=\"fine-purkinje-tracks\" fill=\"none\" stroke=\"#346761\" stroke-width=\"2.2\" stroke-dasharray=\"3 4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path id=\"ec-path-fine-r1\" d=\"M176 339 Q160 324 151 304\"/><path id=\"ec-path-fine-r2\" d=\"M201 379 Q178 365 165 344\"/><path id=\"ec-path-fine-r3\" d=\"M226 408 Q210 404 195 393\"/><path id=\"ec-path-fine-l1\" d=\"M362 318 Q368 304 367 285\"/><path id=\"ec-path-fine-l2\" d=\"M352 366 Q366 353 374 334\"/><path id=\"ec-path-fine-l3\" d=\"M291 413 Q312 400 328 384\"/></g>\n<!-- Bright traveling overlay is clipped by progress rather than jumping -->\n<g clip-path=\"url(#ec-inner-heart-clip)\" id=\"conduction-progress\" stroke=\"#e6a126\" stroke-width=\"4.8\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" pointer-events=\"none\">\n<path data-progress=\"ec-path-atrial-right\"/><path data-progress=\"ec-path-atrial-left\"/>\n<path data-progress=\"ec-path-av-his\"/><path data-progress=\"ec-path-right-bundle\"/><path data-progress=\"ec-path-left-bundle\"/>\n<path data-progress=\"ec-path-purk-r1\" stroke-width=\"2.9\"/><path data-progress=\"ec-path-purk-r2\" stroke-width=\"2.9\"/><path data-progress=\"ec-path-purk-r3\" stroke-width=\"2.9\"/>\n<path data-progress=\"ec-path-purk-l1\" stroke-width=\"2.9\"/><path data-progress=\"ec-path-purk-l2\" stroke-width=\"2.9\"/><path data-progress=\"ec-path-purk-l3\" stroke-width=\"2.9\"/>\n</g><g clip-path=\"url(#ec-inner-heart-clip)\" id=\"fine-purkinje-progress\" stroke=\"#09685f\" stroke-width=\"3.2\" fill=\"none\" stroke-linecap=\"round\" pointer-events=\"none\"><path data-progress=\"ec-path-fine-r1\"/><path data-progress=\"ec-path-fine-r2\"/><path data-progress=\"ec-path-fine-r3\"/><path data-progress=\"ec-path-fine-l1\"/><path data-progress=\"ec-path-fine-l2\"/><path data-progress=\"ec-path-fine-l3\"/></g>\n<g id=\"conduction-nodes\" fill=\"#df9a35\" stroke=\"#855828\" stroke-width=\"2.3\">\n <circle id=\"ec-sa\" cx=\"164\" cy=\"149\" r=\"10\"/><circle id=\"ec-av\" cx=\"247\" cy=\"225\" r=\"9\"/>\n</g>\n<g clip-path=\"url(#ec-inner-heart-clip)\" id=\"ec-impulse-a\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"11\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.5\"/><circle r=\"3.8\" fill=\"#e29e1c\"/></g>\n<g clip-path=\"url(#ec-inner-heart-clip)\" id=\"ec-impulse-b\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"11\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.5\"/><circle r=\"3.8\" fill=\"#e29e1c\"/></g>\n<g clip-path=\"url(#ec-inner-heart-clip)\" id=\"ec-impulse-c\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"9\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.2\"/></g>\n<g clip-path=\"url(#ec-inner-heart-clip)\" id=\"ec-impulse-d\" pointer-events=\"none\" visibility=\"hidden\"><circle r=\"9\" fill=\"#fff0aa\" stroke=\"#d28a18\" stroke-width=\"2.2\"/></g>\n<g clip-path=\"url(#ec-inner-heart-clip)\" id=\"ec-conduction-numbers\" aria-label=\"Numbered landmarks on cardiac conduction anatomy\" pointer-events=\"none\"><g transform=\"translate(143 126)\"><circle r=\"9.5\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.5\"/><text x=\"0\" y=\"3.4\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"10\" fill=\"#664629\">1</text></g><g transform=\"translate(240 113)\"><circle r=\"9.5\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.5\"/><text x=\"0\" y=\"3.4\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"10\" fill=\"#664629\">2</text></g><g transform=\"translate(269 215)\"><circle r=\"9.5\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.5\"/><text x=\"0\" y=\"3.4\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"10\" fill=\"#664629\">3</text></g><g transform=\"translate(284 268)\"><circle r=\"9.5\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.5\"/><text x=\"0\" y=\"3.4\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"10\" fill=\"#664629\">4</text></g><g transform=\"translate(225 351)\"><circle r=\"9.5\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.5\"/><text x=\"0\" y=\"3.4\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"10\" fill=\"#664629\">5</text></g><g transform=\"translate(286 300)\"><circle r=\"9.5\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.5\"/><text x=\"0\" y=\"3.4\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"10\" fill=\"#664629\">5</text></g><g transform=\"translate(292 365)\"><circle r=\"9.5\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.5\"/><text x=\"0\" y=\"3.4\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"10\" fill=\"#664629\">6S</text></g><g transform=\"translate(315 387)\"><circle r=\"9.5\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.5\"/><text x=\"0\" y=\"3.4\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"10\" fill=\"#664629\">6P</text></g><g transform=\"translate(316 288)\"><circle r=\"9.5\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.5\"/><text x=\"0\" y=\"3.4\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"10\" fill=\"#664629\">6A</text></g><g transform=\"translate(183 325)\"><circle r=\"9.5\" fill=\"#fffaf1\" stroke=\"#946f4a\" stroke-width=\"1.5\"/><text x=\"0\" y=\"3.4\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"750\" font-size=\"10\" fill=\"#664629\">7</text></g></g>\n<g id=\"ec-chaotic-atria\" visibility=\"hidden\" aria-label=\"Disorganized atrial activation\">\n <circle cx=\"145\" cy=\"166\" r=\"5\" fill=\"#e7a22f\"/><circle cx=\"184\" cy=\"196\" r=\"5\" fill=\"#e7a22f\"/>\n <circle cx=\"165\" cy=\"206\" r=\"5\" fill=\"#e7a22f\"/><circle cx=\"286\" cy=\"158\" r=\"5\" fill=\"#e7a22f\"/>\n <circle cx=\"328\" cy=\"185\" r=\"5\" fill=\"#e7a22f\"/><circle cx=\"301\" cy=\"207\" r=\"5\" fill=\"#e7a22f\"/>\n </g>\n <path id=\"ec-flutter-loop\" d=\"M143 147 C119 151 126 209 164 218 C213 232 222 167 187 145 C169 135 152 139 143 147Z\" fill=\"none\" stroke=\"#e4a431\" stroke-width=\"4\" stroke-dasharray=\"6 5\" visibility=\"hidden\"/>\n <circle id=\"ec-flutter-marker\" cx=\"143\" cy=\"147\" r=\"9\" fill=\"#ffeca8\" stroke=\"#c9871c\" stroke-width=\"2\" visibility=\"hidden\"/>\n<g id=\"ec-vfib-wavelets\" visibility=\"hidden\" pointer-events=\"none\">\n <circle cx=\"175\" cy=\"276\" r=\"9\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"201\" cy=\"334\" r=\"8\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"238\" cy=\"388\" r=\"10\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"294\" cy=\"274\" r=\"7\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"327\" cy=\"336\" r=\"9\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"315\" cy=\"385\" r=\"8\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"272\" cy=\"352\" r=\"6\" fill=\"#dfa43f\" opacity=\".4\"/>\n <circle cx=\"150\" cy=\"308\" r=\"7\" fill=\"#dfa43f\" opacity=\".4\"/>\n </g>\n<g id=\"ec-mechanism-overlays\" pointer-events=\"none\">\n <path id=\"ec-accessory-path\" d=\"M300 168 Q366 194 354 265 Q349 295 330 319\" fill=\"none\" stroke=\"#b57d50\" stroke-width=\"4\" stroke-dasharray=\"6 6\" visibility=\"hidden\"/>\n <circle id=\"ec-accessory-dot\" r=\"10\" fill=\"#fff0a1\" stroke=\"#a86a1e\" stroke-width=\"2\" visibility=\"hidden\"/>\n <g id=\"ec-block-marker\" visibility=\"hidden\">\n  <path d=\"M237 221 L258 237 M258 221 L237 237\" stroke=\"#b33442\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n  <circle cx=\"247\" cy=\"229\" r=\"16\" fill=\"none\" stroke=\"#b33442\" stroke-width=\"2\"/>\n </g>\n <g id=\"ec-below-block-marker\" visibility=\"hidden\">\n  <path d=\"M249 256 L270 272 M270 256 L249 272\" stroke=\"#b33442\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n  <circle cx=\"259\" cy=\"264\" r=\"16\" fill=\"none\" stroke=\"#b33442\" stroke-width=\"2\"/>\n </g>\n <g id=\"ec-ventricular-origin\" visibility=\"hidden\">\n  <circle id=\"ec-ventricular-core\" cx=\"316\" cy=\"329\" r=\"10\" fill=\"#ffdf75\" stroke=\"#aa661f\" stroke-width=\"3\"/>\n  <circle id=\"ec-ventricular-halo\" cx=\"316\" cy=\"329\" r=\"24\" fill=\"none\" stroke=\"#e6a126\" stroke-width=\"3\" stroke-opacity=\".55\"/>\n </g>\n <path id=\"ec-ventricular-wave\" d=\"M316 329 Q291 303 269 307 M316 329 Q331 356 309 383 M316 329 Q272 364 235 383\" stroke=\"#e6a126\" fill=\"none\" stroke-width=\"5\" stroke-linecap=\"round\" visibility=\"hidden\"/>\n</g>\n</g></svg>";
const heartLayout=document.createElement("div");
heartLayout.className="heart-conduction-layout";
heartLayout.appendChild(frame);
host.appendChild(heartLayout);
if(fallback)fallback.hidden=true;
const svg=frame.querySelector("svg");
svg.style.cssText="width:100%;height:100%;max-width:520px;display:block";
if(status){status.textContent="";status.hidden=true;}
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
const labelSelect=document.getElementById("heart-labels");
const anatomyNumbers=svg.querySelector("#ec-conduction-numbers");
const legend=document.createElement("ol");
legend.className="conduction-legend";
legend.setAttribute("aria-label","Cardiac conduction pathways");
legend.innerHTML=`
 <li>SA node</li>
 <li>Bachmann’s bundle <small>To the left atrium</small></li>
 <li>AV node</li>
 <li>Bundle of His</li>
 <li>Right and left bundle branches</li>
 <li>Left bundle fascicles <small>6A Anterior · 6P Posterior · 6S Septal</small></li>
 <li>Purkinje fibers <small>Teal branches along the ventricular walls</small></li>`;
heartLayout.appendChild(legend);
const tissueKey=document.createElement("div");
tissueKey.className="myocardium-key";
tissueKey.innerHTML='<span>Resting / repolarized</span><span>Depolarized</span><small>Tissue recovery is shown schematically. In fibrillation, local regions cycle independently.</small>';
host.appendChild(tissueKey);
const tissue=svg.querySelector("#ec-tissue-depolarization");
tissue.classList.add("show-myocardium-state");
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
 atrialRecovery:svg.querySelector("#rep-atrial-wave"),
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
function tissueWave(current,mode,stage,progress,isSinus,ms){
 const recovering=stage==="recovery";
 tissue.classList.toggle("recovering",recovering);
 const show=true;
 const t=clamp(progress),atrial=mode==="sinus"?stage==="atria":Boolean(current?.atrialActive);
 const a=isSinus?t:clamp(current?.atrialProgress||0);
 const atrialElapsed=current?.atrialElapsed??Infinity;
 const organized=["sinus","av1","mobitz1","mobitz2","av3","wpw","rbbb","lbbb"].includes(mode);
 // The schematic Ta wave overlaps the QRS; both use the shared beat clock.
 const atrialRecovery=isSinus?clamp((ms-292)/98):clamp((atrialElapsed-.18)/.14);
 const atrialShow=isSinus?["atria","av","his","bundles","ventricles"].includes(stage)&&atrialRecovery<1:organized&&atrialElapsed>=0&&atrialRecovery<1;
 const radius=atrial?246*a:246;
 visible(muscle.atrium,atrialShow);
 visible(muscle.atrialRecovery,atrialShow&&atrialRecovery>0);
 visible(muscle.atrialEdge,atrialShow&&(atrial||atrialRecovery>0));
 muscle.atrium.setAttribute("r",String(radius));
 muscle.atrialRecovery.setAttribute("r",String(246*atrialRecovery));
 muscle.atrialEdge.setAttribute("r",String(atrialRecovery>0?246*atrialRecovery:radius));
 tissue.classList.toggle("atrial-recovering",atrialShow&&atrialRecovery>0);
 // Depolarization is not a repeat of the bundle-branch animation:
 // initial septal muscle activation crosses from LV side toward RV side.
 const normal=show&&!["vt","pvt","vf","av3"].includes(mode)&&stage==="ventricles";
 const blocked=current?.blockedBranch;
 const septal=normal&&t<.26;
 visible(muscle.septum,septal);
 if(septal){
  const direction=blocked==="left"?1:-1;
  const x=263+direction*20*clamp(t/.26);
  muscle.septum.setAttribute("d","M265 299 Q"+x.toFixed(1)+" 305 "+(x+direction*5).toFixed(1)+" 310");
 }
 // The blocked ventricle activates later through ventricular muscle.
 for(const [side,fill,front,edgeX,endX] of [
  ["right",muscle.rvFill,muscle.rvFront,130,260],["left",muscle.lvFill,muscle.lvFront,264,383]
 ]){
  const onset=blocked===side?.49:blocked?.06:.19;
  const activation=normal?clamp((t-onset)/(1-onset)):0;
  const wall=recovering?1-t:isSinus&&stage==="plateau"?1:activation;
  const bottom=435;
  const top=bottom-207*wall;
  fill.setAttribute("y",String(top));
  fill.setAttribute("height",String(bottom-top));
  visible(fill,wall>0);
  visible(front,(normal||recovering)&&wall>.04&&wall<.97);
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
 const blocked=current?.blockedBranch;
 const rightBlocked=blocked==="right",leftBlocked=blocked==="left";
 paths[3].classList.toggle("blocked-bundle",rightBlocked);
 paths[4].classList.toggle("blocked-bundle",leftBlocked);
 const sinusAtrial=["sinus","av1","mobitz1","mobitz2","av3","wpw","rbbb","lbbb"].includes(mode);
 const isVentricular=["vt","pvt","vf","av3"].includes(mode);
 const unorganizedVF=mode==="vf";
 tissueWave(current,mode,stage,t,isSinus,timing?.ms??0);
 const labelsVisible=labelSelect?.value!=="hide";
 legend.hidden=!labelsVisible;
 anatomyNumbers.setAttribute("visibility",labelsVisible?"visible":"hidden");
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
   if(stage==="bundles"){progressValues[2]=1;progressValues[3]=rightBlocked?0:t;progressValues[4]=leftBlocked?0:t;}
   if(stage==="ventricles"){
    progressValues[2]=1;
    progressValues[3]=rightBlocked?0:1;progressValues[4]=leftBlocked?0:1;
    for(let i=5;i<mediumEnd;i++)progressValues[i]=(i<8?rightBlocked:leftBlocked)?0:Math.min(1,t*1.6);
    for(let i=fineStart;i<ids.length;i++)progressValues[i]=(i<14?rightBlocked:leftBlocked)?0:clamp((t-.22)/.78);
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
 else if(!isVentricular&&stage==="bundles"){if(!rightBlocked)marker(3,0,t);if(!leftBlocked)marker(4,1,t);}
 else if(!isVentricular&&stage==="ventricles"){
  if(!rightBlocked){marker(5,0,t);marker(7,1,t);}
  if(!leftBlocked){marker(8,2,t);marker(10,3,t);}
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