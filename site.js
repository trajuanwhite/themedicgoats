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
 <section class="closing"><div class="kicker">THE MEDIC GOATS</div><h2>Better thinking.<br>Better decisions.<br>Better patient care.</h2><button class="btn primary" id="closingTrain">Start Training →</button></section>`;
 heroTrain.onclick=playFeature.onclick=closingTrain.onclick=setup;
 featureBoard.onclick=leaderboard;
 heroLearn.onclick=allEducation.onclick=education;
}
function training(){
 clearInterval(timer);
 app.innerHTML=`
 <section class="page-heading"><div class="kicker">THE MEDIC GOATS • TRAINING</div><h1>Practice the decisions<br>that matter.</h1><p>Interactive training designed around the way EMS clinicians actually think, assess, prioritize, and act in the field.</p></section>
 <section class="feature-card">
   <div class="feature-copy"><span class="eyebrow">LIVE NOW • CLINICAL REASONING</span><h2>Can you find the diagnosis?</h2><p>Build a differential from dispatch. Request the assessments you need. Re-rank as the patient picture develops. Protect your score and climb the leaderboard.</p><div class="row mobile"><button class="btn light" id="trainingPlay">Play Differentials →</button><button class="btn ghost-light" id="trainingBoard">View Leaderboard</button></div></div>
   <div class="score-preview"><span>RAPID DIFFERENTIAL</span><strong>2,000</strong><small>STARTING POINTS</small><div class="preview-line"></div><p>TIME + EFFICIENCY + CLINICAL REASONING</p></div>
 </section>
 <section class="training-grid">
   <article class="editorial-card"><div class="kicker">COMING NEXT</div><h3>MegaCode</h3><p>Run high-stakes resuscitations where timing, sequencing, rhythm recognition, and team leadership matter.</p><span>ACLS • RESUSCITATION</span></article>
   <article class="editorial-card"><div class="kicker">COMING NEXT</div><h3>EKG Challenge</h3><p>Build speed and confidence recognizing rhythms and interpreting real-world prehospital ECGs.</p><span>CARDIOLOGY • ECG</span></article>
 </section>
 <section class="manifesto"><div class="kicker">TRAIN THE WAY YOU WORK</div><h2>Don't just memorize it.<br><em>Make the call.</em></h2><p>Each training experience is built to strengthen recognition, prioritization, and decision-making under pressure.</p></section>`;
 trainingPlay.onclick=setup;
 trainingBoard.onclick=leaderboard;
}
function ftoArticle(){
 clearInterval(timer);
 history.pushState({},'', '/blog/be-the-fto-you-needed-making-field-training-better');
 app.innerHTML=`
 <article class="blog-article">
  <header class="article-hero"><div class="kicker">EMS EDUCATION • FIELD TRAINING</div><h1>Be the FTO You Needed:<br>Making Field Training Better</h1><div class="article-meta">AUG 7 • THE MEDIC GOATS</div><p class="article-lede"><strong>Every paramedic remembers their first day in the field.</strong></p></header>
  <div class="article-body">
   <p>You probably remember the nerves.</p><p>The questions.</p><p>The fear of making a mistake.</p><p>And, most importantly, you probably remember how your FTO made you feel.</p>
   <p>A good FTO can help build a confident, competent provider. A poor FTO can make a new provider question whether they belong in EMS at all.</p><p>Field training isn't just about teaching protocols.</p><p><strong>It's about developing clinicians.</strong></p>
   <h2>Start With Communication</h2><p>Don't wait until problems develop to talk about expectations.</p><p>On day one, have a conversation about:</p><ul><li>Learning style</li><li>Expectations</li><li>Communication</li><li>Feedback</li><li>Safety</li><li>Clinical decision-making</li><li>Documentation</li><li>Professionalism</li></ul><p>Tell your trainee what you expect—and ask what they expect from you.</p><p>A trainee shouldn't have to spend their entire field training period trying to figure out what their FTO wants.</p><p><strong>Clear expectations create a better learning environment.</strong></p>
   <h2>Let Them Learn</h2><p>One of the hardest things for an FTO to do is <strong>step back.</strong></p><p>You've been on thousands of calls.</p><p>You know the protocol.</p><p>You know what the patient needs.</p><p>You can probably anticipate the treatment plan before the trainee finishes their assessment.</p><p>But if you constantly take over, your trainee never gets the opportunity to develop their own clinical judgment.</p><p>Give them room to:</p><p class="cadence"><strong>Assess.<br>Think.<br>Make decisions.<br>Communicate.<br>Treat.</strong></p><p>Of course, patient safety comes first.</p><p>If the trainee is about to make an unsafe decision or the patient's condition requires immediate intervention, step in.</p><p>But don't confuse <strong>"they didn't do it my way"</strong> with <strong>"they did it wrong."</strong></p><p>There is often more than one safe and effective way to accomplish the same goal.</p>
   <h2>Don't Micromanage</h2><p>Not every mistake needs to become a major teaching moment.</p><p>Sometimes the trainee simply needs to experience the call.</p><p>Constantly correcting small things can create anxiety and cause the trainee to focus more on <strong>pleasing the FTO</strong> than taking care of the patient.</p><p>Instead, identify the things that truly matter:</p><p class="cadence"><strong>Patient safety.<br>Clinical judgment.<br>Communication.<br>Assessment.<br>Treatment.<br>Professionalism.</strong></p><p>Save the small stuff for the appropriate teaching moment.</p>
   <h2>Remember: You're Teaching More Than Medicine</h2><p>Your trainee is watching you—even when you don't realize it.</p><p>They're watching:</p><ul><li>How you speak to patients</li><li>How you treat family members</li><li>How you interact with nurses and physicians</li><li>How you communicate with dispatch</li><li>How you handle difficult calls</li><li>How you respond when you're wrong</li><li>How you handle stress</li><li>How seriously you take patient care</li></ul><p>You're not just teaching them how to practice EMS.</p><p><strong>You're showing them what kind of provider to become.</strong></p><p>If you're disrespectful, careless, arrogant, or dismissive, they may learn that behavior too.</p><p>Be the example you want them to follow.</p>
   <h2>You Don't Have to Know Everything</h2><p>Your trainee will eventually ask you a question you don't know the answer to.</p><p>When that happens, don't make something up.</p><blockquote><strong>"I don't know. Let's find out."</strong></blockquote><p>There's nothing wrong with admitting you don't know something.</p><p>In fact, it demonstrates something incredibly important:</p><p><strong>Good clinicians never stop learning.</strong></p><p>Your trainee doesn't need an FTO who knows everything.</p><p>They need an FTO who knows how to think, how to find answers, and how to keep learning.</p>
   <h2>Give Feedback That Actually Helps</h2><blockquote>"That was a terrible call."</blockquote><p><strong>That's not feedback.</strong></p><p>It's criticism.</p><p>Good feedback tells the trainee:</p><p class="cadence"><strong>What happened.<br>Why it mattered.<br>What could be done differently.<br>How to improve next time.</strong></p><p>Instead of:</p><blockquote>"You missed the STEMI."</blockquote><p>Try:</p><blockquote>"Let's go back through that call. What findings did you notice? What made you think it wasn't cardiac? Here's what I was seeing that made me concerned about a STEMI."</blockquote><p>Now you're teaching clinical reasoning instead of simply pointing out failure.</p>
   <h3>One Rule: No Surprises</h3><p>If a trainee is struggling, they shouldn't find out on their final evaluation.</p><p>Have difficult conversations early.</p><p>Be honest.</p><p>Be respectful.</p><p>And give them a path forward.</p><p><strong>The goal of feedback isn't to make the trainee feel bad. It's to make the trainee better.</strong></p>
   <h2>Document the Process</h2><p>Field training documentation isn't just paperwork.</p><p>It creates a record of:</p><ul><li>Performance</li><li>Feedback</li><li>Areas needing improvement</li><li>Progress</li><li>Goals</li><li>Follow-up conversations</li></ul><p>If a trainee is struggling, document the problem <strong>and the plan to improve it.</strong></p><p>If they're doing exceptionally well, document that too.</p><p>Good documentation helps the trainee, the FTO, and the agency.</p>
   <h2>Check In Regularly</h2><p>Don't wait until the end of field training to ask:</p><blockquote><strong>"How do you think you're doing?"</strong></blockquote><p>Have regular conversations.</p><p>Ask:</p><p class="cadence"><strong>What do you feel confident about?<br>What are you struggling with?<br>What can I do differently to help you learn?<br>Is the feedback I'm giving you useful?<br>What do you want more practice with?</strong></p><p>This creates a two-way learning environment instead of making field training feel like an interrogation.</p><p>And don't forget that trainees need time away from EMS too.</p><p><strong>Rest is part of learning.</strong></p>
   <h2>The Bottom Line</h2><p>Being an FTO isn't just about evaluating whether someone can perform the job.</p><p>It's about helping them <strong>become the provider they're capable of becoming.</strong></p><p>You have an opportunity to shape someone's career.</p><p>So when you're frustrated with your trainee, remember:</p><p><strong>You were new once too.</strong></p><p>You had questions.</p><p>You made mistakes.</p><p>You probably had moments where you weren't sure you belonged.</p><p>Someone gave you an opportunity to learn.</p><p>Now it's your turn.</p><blockquote class="pullquote"><strong>Be the FTO you needed when you were new.</strong></blockquote><p class="cadence"><strong>Teach.<br>Coach.<br>Correct.<br>Encourage.</strong></p><p>And when patient safety allows it—</p><p><strong>Step back and let them become a medic.</strong></p>
  </div>
  <div class="article-end"><button class="btn primary" id="backEducation">← Back to Education</button></div>
 </article>`;
 backEducation.onclick=()=>{history.pushState({},'', '/');education()};
}
function education(){
 clearInterval(timer);
 app.innerHTML=`<section class="page-heading"><div class="kicker">THE MEDIC GOATS • EDUCATION</div><h1>Learn the medicine.<br>Understand the why.</h1><p>Our existing articles are being brought into a cleaner education library. The full archive is coming next.</p></section><section class="article-grid"><article class="article-card"><span>CARDIOLOGY & EKG</span><h3>Cardiology & EKG</h3><p>Rhythm recognition, 12-lead interpretation, physiology, and treatment decisions.</p></article><article class="article-card"><span>AIRWAY & RESPIRATORY</span><h3>Airway & Respiratory</h3><p>Ventilation, oxygenation, capnography, airway management, and respiratory emergencies.</p></article><article class="article-card"><span>MEDICAL & TRAUMA</span><h3>Field Medicine</h3><p>Clinical reasoning for the medical and trauma calls that challenge prehospital clinicians.</p></article><article class="article-card article-link" id="ftoArticleCard"><span>EMS EDUCATION • AUG 7</span><h3>Be the FTO You Needed</h3><p>Making field training better by developing clinicians—not just teaching protocols.</p><strong class="read-more">Read article →</strong></article></section><button class="btn primary" id="backHome" style="margin-top:24px">← Back Home</button>`;
 backHome.onclick=siteHome;
 ftoArticleCard.onclick=ftoArticle;
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>({home:siteHome,game:training,education:education,leaderboard:leaderboard}[b.dataset.view]||siteHome)());
if(location.pathname==='/blog/be-the-fto-you-needed-making-field-training-better') ftoArticle(); else if(location.pathname==='/rapid-differentials') setup(); else siteHome();