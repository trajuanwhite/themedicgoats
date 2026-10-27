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
   <div class="feature-copy"><span class="eyebrow">LIVE NOW • RESUSCITATION CHALLENGE</span><h2>Rapid MegaCode</h2><p>Make critical decisions under pressure. Seven seconds to read each patient update, seven seconds to choose your action. Protect your three goats, earn points, and climb the leaderboard.</p><div class="row mobile"><a class="btn light" href="/rapid-megacode" style="text-decoration:none;color:#201c18;display:inline-flex;align-items:center;justify-content:center">Play Rapid MegaCode →</a></div></div>
   <div class="score-preview"><span>RAPID MEGACODE</span><strong>7s + 7s</strong><small>READ • DECIDE</small><div class="preview-line"></div><p>THREE GOATS • RESUSCITATION • LEADERBOARD</p></div>
 </section>
 <section class="training-grid">
   <a class="editorial-card" href="/rapid-rhythms" style="text-decoration:none;color:inherit;display:block"><div class="kicker">PLAY NOW • QUICK PLAY</div><h3>Rapid Rhythms →</h3><p>No rhythm strips. Read the clues, identify the rhythm, and beat the seven-second clock.</p><span>CARDIOLOGY • RHYTHM RECOGNITION</span></a>
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
 heroTrain.onclick=closingTrain.onclick=()=>navigate("game");
 heroLearn.onclick=allEducation.onclick=()=>navigate("education");
}
function training(){
 clearInterval(timer);
 app.innerHTML=`
 <section class="page-heading"><div class="kicker">THE MEDIC GOATS • TRAINING</div><h1>Practice the decisions<br>that matter.</h1><p>Interactive training designed around the way EMS clinicians actually think, assess, prioritize, and act in the field.</p></section>
 <section class="feature-card">
   <div class="feature-copy"><span class="eyebrow">LIVE NOW • RESUSCITATION CHALLENGE</span><h2>Rapid MegaCode</h2><p>Make critical decisions under pressure. Seven seconds to read each patient update, seven seconds to choose your action. Protect your three goats, earn points, and climb the leaderboard.</p><div class="row mobile"><a class="btn light" href="/rapid-megacode" style="text-decoration:none;color:#201c18;display:inline-flex;align-items:center;justify-content:center">Play Rapid MegaCode →</a></div></div>
   <div class="score-preview"><span>RAPID MEGACODE</span><strong>7s + 7s</strong><small>READ • DECIDE</small><div class="preview-line"></div><p>THREE GOATS • RESUSCITATION • LEADERBOARD</p></div>
 </section>
 <section class="training-grid">
   <a class="editorial-card" href="/rapid-rhythms" style="text-decoration:none;color:inherit;display:block"><div class="kicker">PLAY NOW • QUICK PLAY</div><h3>Rapid Rhythms →</h3><p>No rhythm strips. Read the clues, identify the rhythm, and beat the seven-second clock.</p><span>CARDIOLOGY • RHYTHM RECOGNITION</span></a>
 </section>
 <section class="training-leaderboards" aria-label="Game leaderboards">
 <div class="kicker">THE COMPETITION</div><h2>Leaderboards</h2><p class="leaderboard-intro">Two games. Two rankings. Can you reach the top?</p>
 <div class="leaderboard-grid">
 <div class="leaderboard-game"><div class="kicker">RESUSCITATION</div><h3>Rapid MegaCode</h3><p>Top 10 solo scores</p><ol id="trainingMegaBoard" class="leaderboard-list"><li>Loading scores…</li></ol><a href="/rapid-megacode" class="leaderboard-link">Play MegaCode →</a></div>
 <div class="leaderboard-game"><div class="kicker">CARDIOLOGY</div><h3>Rapid Rhythms</h3><p>Top 10 solo scores</p><ol id="trainingRhythmBoard" class="leaderboard-list"><li>Loading scores…</li></ol><a href="/rapid-rhythms" class="leaderboard-link">Play Rhythms →</a></div>
 </div></section>
 <section class="manifesto"><div class="kicker">TRAIN THE WAY YOU WORK</div><h2>Don't just memorize it.<br><em>Make the call.</em></h2><p>Each training experience is built to strengthen recognition, prioritization, and decision-making under pressure.</p></section>`;
 loadTrainingLeaderboard();
}
async function loadTrainingLeaderboard(){
 const client=window.supabase?.createClient("https://jjzjqjvdnaeuftptvmyw.supabase.co","sb_publishable_QPQY6u-wJBKULuaEgsG4lA_KiWCwhN4");
 const boards=[["trainingMegaBoard","rapid_megacode_scores"],["trainingRhythmBoard","rapid_rhythms_scores"]];
 await Promise.all(boards.map(async([id,table])=>{
  const list=document.getElementById(id);if(!list)return;
  try{
   if(!client)throw Error("Leaderboard unavailable");
   const {data,error}=await client.from(table).select("player_name,score").order("score",{ascending:false}).limit(10);
   if(error)throw error;if(!list.isConnected)return;list.replaceChildren();
   if(!data?.length){const li=document.createElement("li");li.textContent="No scores yet. Be the first!";li.style.color="var(--muted)";list.append(li);return}
   data.forEach((p,i)=>{const li=document.createElement("li");li.style.cssText="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)";const name=document.createElement("span");name.style.cssText="min-width:0;overflow-wrap:anywhere";name.textContent=(i+1)+". "+(p.player_name||"Anonymous");const points=document.createElement("strong");points.style.cssText="white-space:nowrap;color:var(--ink)";points.textContent=Number(p.score||0).toLocaleString()+" pts";li.append(name,points);list.append(li)});
  }catch(e){if(list.isConnected)list.textContent="Scores are temporarily unavailable."}
 }));
}
function rapidDifferentialsLanding(){
 clearInterval(timer);gameTop();
 app.innerHTML=`<section class="page-heading"><div class="kicker">THE MEDIC GOATS • RAPID DIFFERENTIAL</div><h1>Can you find the diagnosis?</h1><p>Build your differential from dispatch, reassess as new findings appear, and protect your score.</p></section>
 <section class="feature-card">
   <div class="feature-copy"><span class="eyebrow">CLINICAL REASONING CHALLENGE</span><h2>Can you beat the score?</h2><p>Start with dispatch information only. Choose your differential, request the assessments you need, and re-rank as the patient picture develops.</p><div class="row mobile"><button class="btn light" id="directPlay">Play Differentials →</button><button class="btn ghost-light" id="directBoard">View Leaderboard</button></div></div>
   <div class="score-preview"><span>RAPID DIFFERENTIAL</span><strong>2,000</strong><small>STARTING POINTS</small><div class="preview-line"></div><p>TIME + EFFICIENCY + CLINICAL REASONING</p></div>
 </section>`;
 directPlay.onclick=setup;
 directBoard.onclick=leaderboard;
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
 app.innerHTML=`<section class="page-heading"><div class="kicker">THE MEDIC GOATS • EDUCATION</div><h1>Learn the medicine.<br>Understand the why.</h1><p>Our existing articles are being brought into a cleaner education library. The full archive is coming next.</p></section><section class="article-grid"><article class="article-card"><span>CARDIOLOGY & EKG</span><h3>Cardiology & EKG</h3><p>Rhythm recognition, 12-lead interpretation, physiology, and treatment decisions.</p></article><article class="article-card"><span>AIRWAY & RESPIRATORY</span><h3>Airway & Respiratory</h3><p>Ventilation, oxygenation, capnography, airway management, and respiratory emergencies.</p></article><article class="article-card"><span>MEDICAL & TRAUMA</span><h3>Field Medicine</h3><p>Clinical reasoning for the medical and trauma calls that challenge prehospital clinicians.</p></article></section><button class="btn primary" id="backHome" style="margin-top:24px">← Back Home</button>`;
 backHome.onclick=()=>navigate("home");
}
const routes={home:"/",game:"/training",education:"/education",leaderboard:"/training"};
function navigate(view){const path=routes[view]||"/";if(location.pathname!==path)history.pushState({view},"",path);({home:siteHome,game:training,education:education,leaderboard:training}[view]||siteHome)();}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>navigate(b.dataset.view));
window.addEventListener("popstate",()=>renderRoute());
function renderRoute(){const path=location.pathname;if(path==="/blog/be-the-fto-you-needed-making-field-training-better")return ftoArticle();if(path==="/rapid-differentials")return rapidDifferentialsLanding();if(path==="/leaderboard"){history.replaceState({view:"game"},"","/training");return training()}const view=Object.keys(routes).find(k=>routes[k]===path)||"home";({home:siteHome,game:training,education:education,leaderboard:leaderboard}[view])();}
renderRoute();