/* ECG paper timing at 25 mm/s, in each waveform's SVG coordinates. */
(function(){
 "use strict";
 const ns="http://www.w3.org/2000/svg";
 const grids=new WeakMap();
 let nextId=0;
 function element(name,attributes){
  const node=document.createElementNS(ns,name);
  for(const [key,value] of Object.entries(attributes))node.setAttribute(key,value);
  return node;
 }
 window.MedicECGPaperGrid=function(svg,width,seconds){
  const small=width/(25*seconds);
  const large=5*small;
  let grid=grids.get(svg);
  if(!grid){
   const id="ecg-paper-grid-"+(++nextId);
   const pattern=element("pattern",{id,patternUnits:"userSpaceOnUse"});
   const defs=element("defs",{});
   const lines=Array.from({length:10},()=>element("rect",{fill:"#f1d9dc"}));
   lines[0].setAttribute("fill","#dbaeb5");
   lines[1].setAttribute("fill","#dbaeb5");
   pattern.append(...lines);
   defs.append(pattern);
   svg.prepend(defs,element("rect",{width:"100%",height:"100%",fill:"url(#"+id+")","pointer-events":"none","aria-hidden":"true"}));
   grid={pattern,lines};
   grids.set(svg,grid);
  }
  grid.pattern.setAttribute("width",large);
  grid.pattern.setAttribute("height",large);
  grid.lines.forEach((line,index)=>{
   const horizontal=index%2===1;
   const offset=Math.floor(index/2)*small;
   const thickness=small*(index<2?.16:.08);
   line.setAttribute("x",horizontal?0:offset);
   line.setAttribute("y",horizontal?offset:0);
   line.setAttribute("width",horizontal?large:thickness);
   line.setAttribute("height",horizontal?thickness:large);
  });
 };
})();
