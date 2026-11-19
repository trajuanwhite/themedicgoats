/* Medic Goats ECG Lab — illustrative vector-dipole teaching model.
   NOT a diagnostic or validated electrophysiology forward model.
   Limb leads are derived consistently from electrode potentials. */
(function (root) {
  "use strict";
  const TAU = Math.PI * 2;
  function gaussian(t, center, width) {
    return Math.exp(-0.5 * Math.pow((t - center) / width, 2));
  }
  function vector(t) {
    const p = gaussian(t, .17, .040);
    const q = gaussian(t, .351, .011);
    const r = gaussian(t, .382, .016);
    const s = gaussian(t, .412, .014);
    const tw = gaussian(t, .66, .079);
    // Simplified dynamic mean dipole, not a measured vectorcardiogram.
    return [
       .19 * p - .12 * q + .61 * r - .22 * s + .20 * tw,
       .18 * p - .08 * q + .80 * r - .30 * s + .20 * tw,
       .06 * p - .09 * q + .16 * r + .29 * s + .12 * tw
    ];
  }
  const electrodes = {
    RA: [-.83, .56, .1], LA: [.83, .56, .1], LL: [.25, -.97, .06],
    V1: [-.20, .25, .98], V2: [.16, .25, .98], V3: [.36, .12, .89],
    V4: [.61, -.02, .79], V5: [.87, -.06, .52], V6: [1.08, -.06, .25]
  };
  function dot(v, p) { return v[0]*p[0]+v[1]*p[1]+v[2]*p[2]; }
  function sample(t) {
    const phase=((t%1)+1)%1;
    const v=vector(phase), e={};
    Object.keys(electrodes).forEach(k=>e[k]=dot(v,electrodes[k]));
    const I=e.LA-e.RA, II=e.LL-e.RA, III=e.LL-e.LA;
    const w=(e.RA+e.LA+e.LL)/3;
    return {
      phase,
      vector:v,
      leads:{
        I,II,III,aVR:e.RA-(e.LA+e.LL)/2,
        aVL:e.LA-(e.RA+e.LL)/2,
        aVF:e.LL-(e.RA+e.LA)/2,
        V1:e.V1-w,V2:e.V2-w,V3:e.V3-w,V4:e.V4-w,V5:e.V5-w,V6:e.V6-w
      }
    };
  }
  const labels=["I","II","III","aVR","aVL","aVF","V1","V2","V3","V4","V5","V6"];
  function checkIdentities(t) {
    const s=sample(t).leads;
    return Math.abs(s.II-(s.I+s.III))<1e-10 &&
      Math.abs(s.aVR+s.aVL+s.aVF)<1e-10;
  }
  root.MedicECG={sample,labels,checkIdentities,model:"illustrative-dipole-v1"};
})(window);
