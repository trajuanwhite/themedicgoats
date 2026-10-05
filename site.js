function siteHome(){
 clearInterval(timer);
 app.innerHTML=`
 <section class="brand-hero">
   <div class="kicker">THE MEDIC GOATS • EMS EDUCATION</div>
   <h1>Train like the<br>call is real.</h1>
   <p>Clinical reasoning, EMS education, and training built for the clinicians who show up when it matters.</p>
   <div class="row mobile hero-actions"><button class="btn light" id="heroTrain">Start Training →</button><button class="text-link" id="heroLearn">Explore Education</button></div>
 </section>
 <section class="section-intro"><div><div class="kicker">TRAINING</div><h2>Practice the decisions<br>that matter.</h2></div><p>Interactive training designed around the way EMS clinicians actually think, assess, prioritize, and act in the field.</p></section>
 <section class="feature-card">
   <div class="feature-copy"><span class="eyebrow">LIVE NOW • CLINICAL REASONING</span><h2>Can you find the diagnosis?</h2><p>Build a differential from dispatch. Request the assessments you need. Re-rank as the patient picture develops. Protect your score and climb the leaderboard.</p><div class="row mobile"><button class="btn light" id="playFeature">Play Differentials →</button><button class="btn ghost-light" id="featureBoard">View Leaderboard</button></div></div>
   <div class="score-preview"><span>RAPID DIFFERENTIAL</span><strong>2,000</strong><small>STARTING POINTS</small><div class="preview-line"></div><p>TIME + EFFICIENCY + CLINICAL REASONING</p></div>
 </section>
 <section class="training-grid">
   <article class="editorial-card"><div class="kicker">COMING NEXT</div><h3>MegaCode</h3><p>Run high-stakes resuscitations where timing, sequencing, rhythm recognition, and team leadership matter.</p><span>ACLS • RESUSCITATION</span></article>
   <article class="editorial-card"><div class="kicker">COMING NEXT</div><h3>EKG Challenge</h3><p>Build speed and confidence recognizing rhythms and interpreting real-world prehospital ECGs.</p><span>CARDIOLOGY • ECG</span></article>
 </section>
 <section class="manifesto"><div class="kicker">WHY THE MEDIC GOATS</div><h2>Knowing the answer isn't enough.<br><em>You have to recognize it in the field.</em></h2><p>We build education around clinical reasoning—not memorizing a slide deck. Learn the medicine, understand the why, then practice making the call.</p></section>
 <section class="education-block">
   <div class="section-intro compact"><div><div class="kicker">EDUCATION</div><h2>Learn the medicine.<br>Understand the why.</h2></div><button class="btn" id="allEducation">Explore Education →</button></div>
   <div class="article-grid">
    <article class="article-card"><span>CARDIOLOGY & EKG</span><h3>Read the patient, not just the monitor.</h3><p>Practical cardiology built around recognition, physiology, and field decisions.</p></article>
    <article class="article-card"><span>AIRWAY & RESPIRATORY</span><h3>Know what your numbers are telling you.</h3><p>Airway, ventilation, oxygenation, and capnography without losing the clinical picture.</p></article>
    <article class="article-card"><span>EMS EDUCATION</span><h3>Better clinicians are built deliberately.</h3><p>Teaching, precepting, and clinical reasoning for the next generation of paramedics.</p></article>
   </div>
 </section>
 <section class="field-banner"><div><div class="kicker">FOR FTOs & EMS PROGRAMS</div><h2>Training shouldn't stop when the scenario ends.</h2><p>FIELD connects training, precepting, progression, and clinical readiness into one continuous picture.</p></div><a class="btn light" href="https://field.themedicgoats.com">Explore FIELD →</a></section>
 <section class="closing"><div class="kicker">THE MEDIC GOATS</div><h2>Better thinking.<br>Better decisions.<br>Better patient care.</h2><button class="btn primary" id="closingTrain">Start Training →</button></section>`;
 heroTrain.onclick=playFeature.onclick=closingTrain.onclick=setup;
 featureBoard.onclick=leaderboard;
 heroLearn.onclick=allEducation.onclick=education;
}
function education(){
 clearInterval(timer);
 app.innerHTML=`<section class="page-heading"><div class="kicker">THE MEDIC GOATS • EDUCATION</div><h1>Learn the medicine.<br>Understand the why.</h1><p>Our existing articles are being brought into a cleaner education library. The full archive is coming next.</p></section><section class="article-grid"><article class="article-card"><span>CARDIOLOGY & EKG</span><h3>Cardiology & EKG</h3><p>Rhythm recognition, 12-lead interpretation, physiology, and treatment decisions.</p></article><article class="article-card"><span>AIRWAY & RESPIRATORY</span><h3>Airway & Respiratory</h3><p>Ventilation, oxygenation, capnography, airway management, and respiratory emergencies.</p></article><article class="article-card"><span>MEDICAL & TRAUMA</span><h3>Field Medicine</h3><p>Clinical reasoning for the medical and trauma calls that challenge prehospital clinicians.</p></article><article class="article-card"><span>EMS EDUCATION</span><h3>EMS Education</h3><p>Precepting, FTO development, training, and building independent clinicians.</p></article></section><button class="btn primary" id="backHome" style="margin-top:24px">← Back Home</button>`;
 backHome.onclick=siteHome;
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>({home:siteHome,game:setup,education,leaderboard}[b.dataset.view]||siteHome)());
siteHome();