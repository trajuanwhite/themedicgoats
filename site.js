function renderDailyBlogFeature(){
 const host=document.getElementById("dailyBlogFeature");
 const posts=(window.MEDIC_BLOG_POSTS||[]).filter(p=>p.title&&p.slug);
 if(!host||!posts.length)return;
 const day=Math.floor(Date.now()/86400000);
 // Seeded shuffle per rotation cycle gives one shared selection per UTC day.
 const ordered=[...posts].sort((a,b)=>a.slug.localeCompare(b.slug));
 const cycle=Math.floor(day/ordered.length);
 let seed=(cycle+1)*2654435761>>>0;
 for(let i=ordered.length-1;i>0;i--){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const j=(seed>>>0)%(i+1);[ordered[i],ordered[j]]=[ordered[j],ordered[i]]}
 const post=ordered[day%ordered.length];
 const category=document.createElement("div");category.className="daily-blog-category";category.textContent=post.category||"Clinical Education";
 const title=document.createElement("h1");title.textContent=post.title;
 const excerpt=document.createElement("p");excerpt.textContent=post.description||"Explore today's featured EMS education article.";
 const link=document.createElement("a");link.className="btn light";link.href="/blog/"+encodeURIComponent(post.slug);link.textContent="Read the Blog →";
 host.replaceChildren(category,title,excerpt,link);
}
// Set the official giveaway closing time here (ISO 8601 with timezone offset).
// Until confirmed, the giveaway remains featured and no end date is implied.
const MEDIC_GIVEAWAY_END_AT = null;
const MEDIC_GIVEAWAY_DEMO_END_AT = "2026-11-08T04:59:17Z";
let medicGiveawayCountdownInterval = null;
function renderGiveawayCountdown(){
 const end=Date.parse(MEDIC_GIVEAWAY_END_AT||MEDIC_GIVEAWAY_DEMO_END_AT);
 const remaining=Math.max(0,end-Date.now());
 const parts=[Math.floor(remaining/86400000),Math.floor(remaining/3600000)%24,Math.floor(remaining/60000)%60,Math.floor(remaining/1000)%60];
 document.querySelectorAll("[data-giveaway-countdown]").forEach(host=>{
  const labels=["DAYS","HOURS","MINUTES","SECONDS"];
  host.innerHTML=parts.map((n,i)=>'<div class="giveaway-clock-unit"><strong>'+String(n).padStart(2,"0")+'</strong><span>'+labels[i]+'</span></div>').join("");
 });
 if(!remaining){clearInterval(medicGiveawayCountdownInterval);medicGiveawayCountdownInterval=null;updateHomeFeature();}
}
function startGiveawayCountdown(){
 if(medicGiveawayCountdownInterval)clearInterval(medicGiveawayCountdownInterval);
 renderGiveawayCountdown();
 medicGiveawayCountdownInterval=setInterval(renderGiveawayCountdown,1000);
}

let homeFeatureRotationInterval=null,homeFeatureIndex=0,homeFeatureFadeTimeout=null,homeFeatureActiveId=null;
function updateHomeFeature(){
 const slides=[["dailyBlogFeature","THE MEDIC GOATS • BLOG OF THE DAY","Blogs"],["gamesFeature","THE MEDIC GOATS • TRAIN YOUR MIND","Games"]];
 const hero=document.getElementById("homeFeatureHero");if(!hero)return;
 renderDailyBlogFeature();
 homeFeatureIndex=((homeFeatureIndex%slides.length)+slides.length)%slides.length;
 const active=slides[homeFeatureIndex];
 const applySlide=()=>{
  ["dailyBlogFeature","gamesFeature"].forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=id!==active[0];});
  document.getElementById("homeFeatureKicker").textContent=active[1];
  hero.setAttribute("aria-label",active[2]);
  homeFeatureActiveId=active[0];
  requestAnimationFrame(()=>hero.classList.remove("home-feature-fading"));
 };
 clearTimeout(homeFeatureFadeTimeout);
 if(homeFeatureActiveId&&homeFeatureActiveId!==active[0]&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  hero.classList.add("home-feature-fading");
  homeFeatureFadeTimeout=setTimeout(applySlide,260);
 }else{hero.classList.remove("home-feature-fading");applySlide();}
 const dots=document.getElementById("homeFeatureDots");
 if(dots)dots.replaceChildren(...slides.map((slide,i)=>{const btn=document.createElement("button");btn.type="button";btn.className="home-feature-dot"+(i===homeFeatureIndex?" active":"");btn.setAttribute("aria-label","Show "+slide[2]);btn.setAttribute("aria-pressed",String(i===homeFeatureIndex));btn.onclick=()=>{homeFeatureIndex=i;updateHomeFeature();startHomeFeatureRotation();};return btn;}));
}
function startHomeFeatureRotation(){
 clearInterval(homeFeatureRotationInterval);
 homeFeatureRotationInterval=setInterval(()=>{if(!document.getElementById("homeFeatureHero")){clearInterval(homeFeatureRotationInterval);return;}homeFeatureIndex++;updateHomeFeature();},8000);
}
function siteHome(){
 clearInterval(timer);
 app.innerHTML=`
 <section class="brand-hero blog-day-hero" id="homeFeatureHero" aria-label="Featured Medic Goats content">
  <div class="kicker" id="homeFeatureKicker">THE MEDIC GOATS • BLOG OF THE DAY</div>
  <div id="dailyBlogFeature" hidden></div>
  <div id="gamesFeature" hidden><h1>Think fast. Train smarter.</h1><p>Challenge your clinical decision-making with Rapid MegaCode, Rapid Rhythms, and more interactive EMS training games.</p><a class="btn light" href="/training">Explore Games →</a></div>
  <div class="home-feature-controls"><button type="button" id="homeFeaturePrev" aria-label="Previous featured item">‹</button><div id="homeFeatureDots" aria-label="Featured item selection"></div><button type="button" id="homeFeatureNext" aria-label="Next featured item">›</button></div>
 </section>
 
 <section class="home-game-grid" aria-label="Quick training games">
   <article class="home-game-card"><div class="kicker">RESUSCITATION • PLAY NOW</div><h3>Rapid MegaCode</h3><p>Think you can make the right call under pressure? Here's a glimpse of what awaits.</p>
   <div class="home-game-preview" aria-label="Preview of a Rapid MegaCode question"><div class="home-preview-top"><span>RAPID MEGACODE</span><span>🐐 🐐 🐐</span></div><div class="home-preview-scene">You find an adult unresponsive and not breathing normally. Scene safety is confirmed.</div><div class="home-preview-question">What should you do first?</div><div class="home-preview-answers"><div><b>A</b> Assess responsiveness, breathing, and pulse promptly</div><div><b>B</b> Apply defibrillator pads before assessment</div><div><b>C</b> Administer epinephrine immediately</div><div><b>D</b> Prepare an advanced airway</div></div><div class="home-preview-bottom">7 SECONDS TO DECIDE <span>7.0s</span></div></div>
   <div class="home-game-footer"><span>7s + 7s • 3 GOATS</span><a class="btn primary" href="/rapid-megacode">Take the challenge →</a></div></article>
   <article class="home-game-card"><div class="kicker">CARDIOLOGY • PLAY NOW</div><h3>Rapid Rhythms</h3><p>No rhythm strip. Just clues. Can you identify the rhythm before time runs out?</p>
   <div class="home-game-preview" aria-label="Preview of a Rapid Rhythms question"><div class="home-preview-top"><span>RAPID RHYTHMS</span><span>🐐 🐐 🐐</span></div><div class="home-preview-scene">Rate 110, regular. Upright P before each narrow QRS. PR 0.16 s.</div><div class="home-preview-question">What rhythm am I?</div><div class="home-preview-answers"><div><b>A</b> Sinus tachycardia</div><div><b>B</b> Sinus bradycardia</div><div><b>C</b> Atrial fibrillation</div><div><b>D</b> First-degree AV block</div></div><div class="home-preview-bottom">CHOOSE THE RHYTHM <span>7.0s</span></div></div>
   <div class="home-game-footer"><span>7s + 7s • 3 GOATS</span><a class="btn primary" href="/rapid-rhythms">Test your rhythm skills →</a></div></article>
 </section>
 <section class="closing"><div class="kicker">THE MEDIC GOATS</div><h2>Better thinking.<br>Better decisions.<br>Better patient care.</h2><button class="btn primary" id="closingTrain">Start Training →</button></section>`;
 homeFeatureIndex=0;
 updateHomeFeature();
 startHomeFeatureRotation();
 document.getElementById("homeFeaturePrev").onclick=()=>{homeFeatureIndex--;updateHomeFeature();startHomeFeatureRotation();};
 document.getElementById("homeFeatureNext").onclick=()=>{homeFeatureIndex++;updateHomeFeature();startHomeFeatureRotation();};
 closingTrain.onclick=()=>document.querySelector(".home-game-grid")?.scrollIntoView({behavior:"smooth",block:"start"});
}
function training(){
 clearInterval(timer);
 app.innerHTML=`
 <section class="page-heading"><div class="kicker">THE MEDIC GOATS • GAMES</div><h1>Make learning fun.<br>Bring out your competitive side.</h1><p>Challenge yourself, compete with friends, and sharpen your EMS knowledge through fast-paced games that make every question count.</p></section>
 <style>
 .training-game-gallery{display:grid;overflow:hidden}
 .training-game-gallery [data-game-preview]{grid-column:1;grid-row:1;opacity:0;visibility:hidden;transform:translateX(28px);transition:opacity .65s ease,transform .65s cubic-bezier(.2,.7,.2,1),visibility .65s;pointer-events:none}
 .training-game-gallery [data-game-preview].is-active{opacity:1;visibility:visible;transform:translateX(0);pointer-events:auto;z-index:1}
 .training-game-gallery [data-preview-position]{grid-column:1;grid-row:2}
 .feature-copy [data-game-description].description-enter{animation:trainingDescriptionIn .65s ease both}
 @keyframes trainingDescriptionIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
 @media(prefers-reduced-motion:reduce){.training-game-gallery [data-game-preview]{transition:none;transform:none}.feature-copy [data-game-description].description-enter{animation:none}}
 </style>
 <style>
 @media(max-width:700px){.training-leaderboards{width:100%!important}}\n
 .training-leaderboards .leaderboard-grid{grid-template-columns:repeat(3,minmax(0,1fr));text-align:left}
 .training-leaderboards .leaderboard-list li{min-width:0}
 .training-leaderboards .leaderboard-list li span{overflow-wrap:break-word;word-break:normal}
 @media(max-width:850px){.training-leaderboards .leaderboard-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
 @media(max-width:600px){.training-leaderboards .leaderboard-grid{grid-template-columns:1fr}}
 #trainingLeadersStrip{display:grid!important;overflow:hidden;min-height:30px}
 #trainingLeadersStrip > span{grid-area:1/1;opacity:0;visibility:hidden;transform:translateX(22px);transition:opacity .6s ease,transform .6s ease,visibility .6s;pointer-events:none}
 #trainingLeadersStrip > span.is-active{opacity:1;visibility:visible;transform:translateX(0);pointer-events:auto}
 @media(prefers-reduced-motion:reduce){#trainingLeadersStrip > span{transition:none;transform:none}}
 </style>
 <section class="training-leaderboards" aria-label="Game leaders" style="padding:16px 18px;margin-bottom:22px;width:100%;max-width:100%;box-sizing:border-box;text-align:center">
 <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
 <div style="flex:1;min-width:0;text-align:center"><div class="kicker">LEADERBOARD • CURRENT GOATS 🐐</div><div id="trainingLeadersStrip" style="margin-top:10px">
 <span class="is-active"><strong>Rapid MegaCode</strong> <span id="leaderMega">Loading…</span></span>
 <span><strong>Rapid Rhythms</strong> <span id="leaderRhythm">Loading…</span></span>
 <span><strong>Rapid Cardiology</strong> <span id="leaderCardiology">Loading…</span></span>
 <span><strong>Rapid Meds</strong> <span id="leaderMeds">Loading…</span></span>
 </div></div>
 <button type="button" id="trainingOpenBoards" aria-expanded="false" aria-controls="trainingFullBoards" style="padding:10px 16px;border-radius:10px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer;font-weight:700">View Full Leaderboards</button>
 </div>
 <div id="trainingFullBoards" hidden style="margin-top:18px">
 <div class="leaderboard-grid">
 <div class="leaderboard-game"><div class="kicker">RESUSCITATION</div><h3>Rapid MegaCode</h3><p>The GOAT and top challengers</p><ol id="trainingMegaBoard" class="leaderboard-list"><li>Loading scores…</li></ol><a href="/rapid-megacode" class="leaderboard-link">Play MegaCode →</a></div>
 <div class="leaderboard-game"><div class="kicker">ECG INTERPRETATION</div><h3>Rapid Rhythms</h3><p>The GOAT and top challengers</p><ol id="trainingRhythmBoard" class="leaderboard-list"><li>Loading scores…</li></ol><a href="/rapid-rhythms" class="leaderboard-link">Play Rhythms →</a></div>
 <div class="leaderboard-game"><div class="kicker">CARDIAC ANATOMY</div><h3>Rapid Cardiology</h3><p>The GOAT and top challengers</p><ol id="trainingCardiologyBoard" class="leaderboard-list"><li>Loading scores…</li></ol><a href="/rapid-cardiology" class="leaderboard-link">Play Cardiology →</a></div>
 <div class="leaderboard-game"><div class="kicker">MEDICATION KNOWLEDGE</div><h3>Rapid Meds</h3><p>The GOAT and top challengers</p><ol id="trainingMedsBoard" class="leaderboard-list"><li>Loading scores…</li></ol><a href="/rapid-meds-live" class="leaderboard-link">Play Meds →</a></div>
 </div></div></section>
 <section class="feature-card">
   <div class="feature-copy"><span class="eyebrow">LIVE NOW • RESUSCITATION CHALLENGE</span><h2>Rapid MegaCode</h2><p data-game-description aria-live="off">Make critical decisions under pressure. Seven seconds to read each patient update, seven seconds to choose your action. Protect your three goats, earn points, and climb the leaderboard.</p><div class="row mobile"><a class="btn light" href="/rapid-megacode" style="text-decoration:none;color:#201c18;display:inline-flex;align-items:center;justify-content:center">Play Rapid MegaCode →</a></div></div>
   <div class="training-game-gallery" aria-label="RAPID MEGACODE gameplay previews" style="min-width:0;position:relative">
<div class="home-game-preview training-preview-frame" data-game-preview><div class="home-preview-top"><span>RAPID MEGACODE</span><span>🐐 🐐 🐐</span></div><div class="home-preview-scene">Adult found unresponsive and pulseless.</div><div class="home-preview-question">What is your immediate priority?</div><div class="home-preview-answers"><div><b>A</b> Start high-quality CPR</div><div><b>B</b> Give epinephrine before CPR</div><div><b>C</b> Obtain a 12-lead ECG</div><div><b>D</b> Check blood glucose</div></div><div class="home-preview-bottom">CHOOSE YOUR ANSWER <span>7.0s</span></div></div>
<div class="home-game-preview training-preview-frame" data-game-preview hidden style="display:none"><div class="home-preview-top"><span>RAPID MEGACODE LIVE</span><span>🎮</span></div><div class="home-preview-scene">MULTIPLAYER LOBBY</div><div class="home-preview-question">JOIN ROOM 522730</div><div class="home-preview-answers"><div><b>1</b> SOLO BATTLE • Every player for themselves</div><div><b>2</b> TEAMS • Combine points to win</div><div><b>3</b> Team A: 4 players</div><div><b>4</b> Team B: 4 players</div></div><div class="home-preview-bottom">HOST STARTS THE GAME <span>READY</span></div></div>
<div class="home-game-preview training-preview-frame" data-game-preview hidden style="display:none"><div class="home-preview-top"><span>RAPID MEGACODE</span><span>🏆</span></div><div class="home-preview-scene">GAME COMPLETE</div><div class="home-preview-question">FINAL RESULTS</div><div class="home-preview-answers"><div><b>1</b> 🥇 GOAT PLAYER <strong style="margin-left:auto">2,140 pts</strong></div><div><b>2</b> 🥈 PLAYER TWO <strong style="margin-left:auto">1,980 pts</strong></div><div><b>3</b> 🥉 PLAYER THREE <strong style="margin-left:auto">1,720 pts</strong></div><div><b>✓</b> PLAY AGAIN OR VIEW LEADERBOARD</div></div><div class="home-preview-bottom">FINAL SCORE <span>2,140</span></div></div>
<div class="kicker" style="text-align:center;margin-top:10px" data-preview-position>GAMEPLAY • 1 / 3</div></div></div>
 </section>
 <section class="feature-card" style="margin-top:24px">
  <div class="feature-copy"><span class="eyebrow">NEW • EMS PHARMACOLOGY CHALLENGE</span><h2>Rapid Meds</h2><p>Know the drug. Make the call. Challenge your knowledge of drug classes, mechanisms, indications, contraindications, adverse effects and clinical decisions. No dosing questions. Compete in SOLO BATTLE or TEAM BATTLE with live scores.</p><div class="row mobile"><a class="btn light" href="/rapid-meds-live" style="text-decoration:none;color:#201c18;display:inline-flex;align-items:center;justify-content:center">Play Rapid Meds →</a></div></div>
  <div class="home-game-preview" style="min-width:0"><div class="home-preview-top"><span>RAPID MEDS</span><span>🐐 💊</span></div><div class="home-preview-scene">DRUG CLASSIFICATION</div><div class="home-preview-question">Which medication is an antiplatelet agent?</div><div class="home-preview-answers"><div><b>A</b> Heparin</div><div><b>B</b> Aspirin</div><div><b>C</b> Alteplase</div><div><b>D</b> Amiodarone</div></div><div class="home-preview-bottom">CHOOSE YOUR ANSWER <span>7.0s</span></div></div>
 </section>
 <section class="feature-card" style="margin-top:24px">
   <div class="feature-copy"><span class="eyebrow">LIVE NOW • CARDIOLOGY CHALLENGE</span><h2>Rapid Rhythms</h2><p data-game-description aria-live="off">No rhythm strips. Read the clues, identify the rhythm, and beat the seven-second clock. Protect your three goats, earn points, and climb the leaderboard.</p><div class="row mobile"><a class="btn light" href="/rapid-rhythms" style="text-decoration:none;color:#201c18;display:inline-flex;align-items:center;justify-content:center">Play Rapid Rhythms →</a></div></div>
   <div class="training-game-gallery" aria-label="RAPID RHYTHMS gameplay previews" style="min-width:0;position:relative">
<div class="home-game-preview training-preview-frame" data-game-preview><div class="home-preview-top"><span>RAPID RHYTHMS</span><span>🐐 🐐 🐐</span></div><div class="home-preview-scene">Regular narrow-complex tachycardia at 180 bpm; P waves not visible.</div><div class="home-preview-question">Which rhythm is most likely?</div><div class="home-preview-answers"><div><b>A</b> SVT</div><div><b>B</b> Sinus bradycardia</div><div><b>C</b> Ventricular fibrillation</div><div><b>D</b> Third-degree AV block</div></div><div class="home-preview-bottom">CHOOSE YOUR ANSWER <span>7.0s</span></div></div>
<div class="home-game-preview training-preview-frame" data-game-preview hidden style="display:none"><div class="home-preview-top"><span>RAPID RHYTHMS LIVE</span><span>🎮</span></div><div class="home-preview-scene">MULTIPLAYER LOBBY</div><div class="home-preview-question">JOIN ROOM 384216</div><div class="home-preview-answers"><div><b>1</b> SOLO BATTLE • Every player for themselves</div><div><b>2</b> TEAMS • Combine points to win</div><div><b>3</b> Team A: 4 players</div><div><b>4</b> Team B: 4 players</div></div><div class="home-preview-bottom">HOST STARTS THE GAME <span>READY</span></div></div>
<div class="home-game-preview training-preview-frame" data-game-preview hidden style="display:none"><div class="home-preview-top"><span>RAPID RHYTHMS</span><span>🏆</span></div><div class="home-preview-scene">GAME COMPLETE</div><div class="home-preview-question">FINAL RESULTS</div><div class="home-preview-answers"><div><b>1</b> 🥇 GOAT PLAYER <strong style="margin-left:auto">2,140 pts</strong></div><div><b>2</b> 🥈 PLAYER TWO <strong style="margin-left:auto">1,980 pts</strong></div><div><b>3</b> 🥉 PLAYER THREE <strong style="margin-left:auto">1,720 pts</strong></div><div><b>✓</b> PLAY AGAIN OR VIEW LEADERBOARD</div></div><div class="home-preview-bottom">FINAL SCORE <span>2,140</span></div></div>
<div class="kicker" style="text-align:center;margin-top:10px" data-preview-position>GAMEPLAY • 1 / 3</div></div></div>
 </section>
 <section class="feature-card" style="margin-top:24px">
   <div class="feature-copy"><span class="eyebrow">LIVE NOW • CARDIAC ANATOMY CHALLENGE</span><h2>Rapid Cardiology</h2><p data-game-description aria-live="off">Test coronary arteries, blood flow through the heart, valves, perfusion, and cardiac anatomy. Seven seconds to read, seven seconds to answer. Three goats, speed points, and a separate leaderboard.</p><div class="row mobile"><a class="btn light" href="/rapid-cardiology" style="text-decoration:none;color:#201c18;display:inline-flex;align-items:center;justify-content:center">Play Rapid Cardiology →</a></div></div>
   <div class="training-game-gallery" aria-label="RAPID CARDIOLOGY gameplay previews" style="min-width:0;position:relative">
<div class="home-game-preview training-preview-frame" data-game-preview><div class="home-preview-top"><span>RAPID CARDIOLOGY</span><span>🐐 🐐 🐐</span></div><div class="home-preview-scene">Blood returns from the lungs through the pulmonary veins.</div><div class="home-preview-question">Which chamber receives that blood?</div><div class="home-preview-answers"><div><b>A</b> Left atrium</div><div><b>B</b> Right atrium</div><div><b>C</b> Right ventricle</div><div><b>D</b> Left ventricle</div></div><div class="home-preview-bottom">CHOOSE YOUR ANSWER <span>7.0s</span></div></div>
<div class="home-game-preview training-preview-frame" data-game-preview hidden style="display:none"><div class="home-preview-top"><span>RAPID CARDIOLOGY LIVE</span><span>🎮</span></div><div class="home-preview-scene">MULTIPLAYER LOBBY</div><div class="home-preview-question">JOIN ROOM 627481</div><div class="home-preview-answers"><div><b>1</b> SOLO BATTLE • Every player for themselves</div><div><b>2</b> TEAMS • Combine points to win</div><div><b>3</b> Team A: 4 players</div><div><b>4</b> Team B: 4 players</div></div><div class="home-preview-bottom">HOST STARTS THE GAME <span>READY</span></div></div>
<div class="home-game-preview training-preview-frame" data-game-preview hidden style="display:none"><div class="home-preview-top"><span>RAPID CARDIOLOGY</span><span>🏆</span></div><div class="home-preview-scene">GAME COMPLETE</div><div class="home-preview-question">FINAL RESULTS</div><div class="home-preview-answers"><div><b>1</b> 🥇 GOAT PLAYER <strong style="margin-left:auto">2,140 pts</strong></div><div><b>2</b> 🥈 PLAYER TWO <strong style="margin-left:auto">1,980 pts</strong></div><div><b>3</b> 🥉 PLAYER THREE <strong style="margin-left:auto">1,720 pts</strong></div><div><b>✓</b> PLAY AGAIN OR VIEW LEADERBOARD</div></div><div class="home-preview-bottom">FINAL SCORE <span>2,140</span></div></div>
<div class="kicker" style="text-align:center;margin-top:10px" data-preview-position>GAMEPLAY • 1 / 3</div></div></div>
 </section>
 `;
 loadTrainingLeaderboard();
 const leaderSlides=[...document.querySelectorAll("#trainingLeadersStrip > span")];
 let leaderSlide=0;
 const leaderTimer=setInterval(()=>{
  if(!document.getElementById("trainingLeadersStrip")?.isConnected){clearInterval(leaderTimer);return}
  leaderSlides[leaderSlide].classList.remove("is-active");
  leaderSlide=(leaderSlide+1)%leaderSlides.length;
  leaderSlides[leaderSlide].classList.add("is-active");
 },7000);
 const gameDescriptions=[["Make critical decisions under pressure. Seven seconds to read each patient update, seven seconds to choose your action. Protect your three goats, earn points, and climb the leaderboard.","Challenge friends in multiplayer! Host a room and compete in SOLO BATTLE or split into teams to see who makes the best calls under pressure.","Every decision counts. Earn points for correct, fast answers, see your final score, and find out who takes the top spot."],["No rhythm strips. Read the clues, identify the rhythm, and beat the seven-second clock. Protect your three goats, earn points, and climb the leaderboard.","Bring your crew into a multiplayer room. Go head-to-head in SOLO BATTLE or join teams and combine your scores to win.","Beat the clock, build your score, and see where you finish. Can you climb the rankings and claim the top spot?"],["Test coronary arteries, blood flow through the heart, valves, perfusion, and cardiac anatomy. Seven seconds to read, seven seconds to answer. Three goats, speed points, and a separate leaderboard.","Put your cardiac knowledge to the test with friends. Play SOLO BATTLE or team up in multiplayer and compete for the highest combined score.","Fast answers and accuracy pay off. See your final points, compare results, and challenge yourself to beat your best score."]];
 document.querySelectorAll(".training-game-gallery").forEach((gallery,gameIndex)=>{
  const frames=[...gallery.querySelectorAll("[data-game-preview]")];
  const label=gallery.querySelector("[data-preview-position]");
  const description=gallery.closest(".feature-card")?.querySelector("[data-game-description]");
  let active=0;
  frames.forEach((frame,i)=>{frame.hidden=false;frame.style.display="";frame.classList.toggle("is-active",i===0)});
  const names=["GAMEPLAY","MULTIPLAYER","RESULTS"];
  const rotate=()=>{if(!gallery.isConnected)return;active=(active+1)%frames.length;frames.forEach((frame,i)=>frame.classList.toggle("is-active",i===active));label.textContent=names[active]+" • "+(active+1)+" / 3";if(description){description.textContent=gameDescriptions[gameIndex][active];description.classList.remove("description-enter");void description.offsetWidth;description.classList.add("description-enter")}};
  const handle=setInterval(()=>{if(!gallery.isConnected){clearInterval(handle);return}rotate()},12000);
 });
 const toggle=document.getElementById("trainingOpenBoards");
 const full=document.getElementById("trainingFullBoards");
 toggle.onclick=()=>{const opening=full.hidden;full.hidden=!opening;toggle.setAttribute("aria-expanded",String(opening));toggle.textContent=opening?"Hide Leaderboards":"View Full Leaderboards"};

}
function instagramProfileLink(name){const raw=String(name||"").trim();if(!raw.startsWith("@"))return null;const handle=raw.slice(1);return /^[A-Za-z0-9._]{1,30}$/.test(handle)?"https://www.instagram.com/"+handle+"/":null}
async function loadTrainingLeaderboard(){
 const client=window.supabase?.createClient("https://jjzjqjvdnaeuftptvmyw.supabase.co","sb_publishable_QPQY6u-wJBKULuaEgsG4lA_KiWCwhN4");
 const boards=[["trainingMegaBoard","rapid_megacode_scores"],["trainingRhythmBoard","rapid_rhythms_scores"],["trainingCardiologyBoard","rapid_cardiology_scores"],["trainingMedsBoard","rapid_meds_scores"]];
 await Promise.all(boards.map(async([id,table])=>{
  const list=document.getElementById(id);if(!list)return;
  try{
   if(!client)throw Error("Leaderboard unavailable");
   // Rank each player only once, using their highest score. Fetch additional pages
   // when repeat entries would otherwise occupy more than one podium position.
   const data=[],seen=new Set();let offset=0;
   while(data.length<3){
    const {data:batch,error}=await client.from(table).select("player_name,score,player_id").order("score",{ascending:false}).range(offset,offset+99);
    if(error)throw error;
    if(!batch?.length)break;
    for(const p of batch){
     const label=String(p.player_name||"Anonymous").trim().replace(/\s+/g," ").toLocaleLowerCase();const key=label.startsWith("@")?"ig:"+label:"name:"+label;
     if(seen.has(key))continue;
     seen.add(key);data.push(p);
     if(data.length===3)break;
    }
    if(batch.length<100)break;
    offset+=100;
   }
   if(!list.isConnected)return;
   const leaderId=id==="trainingMegaBoard"?"leaderMega":id==="trainingRhythmBoard"?"leaderRhythm":id==="trainingMedsBoard"?"leaderMeds":"leaderCardiology";
   const leader=document.getElementById(leaderId);
   if(leader){leader.replaceChildren();if(data.length){const name=data[0].player_name||"Anonymous",url=instagramProfileLink(name),el=document.createElement(url?"a":"span");el.textContent=name+" • "+Number(data[0].score||0).toLocaleString()+" pts";if(url){el.href=url;el.target="_blank";el.rel="noopener noreferrer";el.style.color="inherit";el.style.textDecoration="underline"}leader.append(el)}else leader.textContent="No GOAT crowned yet"}
   list.replaceChildren();
   if(!data?.length){const li=document.createElement("li");li.textContent="No scores yet. Be the first!";li.style.color="var(--muted)";list.append(li);return}
   data.forEach((p,i)=>{const li=document.createElement("li");li.style.cssText="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)";const name=document.createElement("span");name.style.cssText="min-width:0;overflow-wrap:anywhere";const profile=p.player_name||"Anonymous",url=instagramProfileLink(profile);name.textContent=(i+1)+". ";const label=document.createElement(url?"a":"span");label.textContent=profile;if(url){label.href=url;label.target="_blank";label.rel="noopener noreferrer";label.style.cssText="color:inherit;text-decoration:underline;text-underline-offset:3px"}name.append(label);const points=document.createElement("strong");points.style.cssText="white-space:nowrap;color:var(--ink)";points.textContent=Number(p.score||0).toLocaleString()+" pts";li.append(name,points);list.append(li)});
  }catch(e){if(list.isConnected)list.textContent="Scores are temporarily unavailable.";const leader=document.getElementById(id==="trainingMegaBoard"?"leaderMega":id==="trainingRhythmBoard"?"leaderRhythm":"leaderCardiology");if(leader)leader.textContent="Unavailable"}
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
 app.innerHTML=`<section class="page-heading"><div class="kicker">THE MEDIC GOATS • EDUCATION</div><h1>Learn the medicine.<br>Understand the why.</h1><p>Explore interactive presentations and practical education built for EMS clinicians.</p></section><section class="medic-presentations" aria-labelledby="medicPresentationTitle"><div class="kicker">INTERACTIVE PRESENTATIONS</div><h2 id="medicPresentationTitle">Airway Rodeo</h2><p>Explore this airway education presentation, including videos embedded within the slides. Use the presentation controls to navigate and play the videos.</p><div class="medic-canva-frame"><iframe loading="lazy" title="Airway Rodeo — interactive airway education presentation" src="https://www.canva.com/design/DAHQAufcGEQ/D3l7niOFpGSjeF5hgh3SIw/view?embed" allow="fullscreen; autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><a class="medic-canva-open" href="https://www.canva.com/design/DAHQAufcGEQ/D3l7niOFpGSjeF5hgh3SIw/view" target="_blank" rel="noopener noreferrer">Open presentation in Canva ↗</a><p class="medic-canva-credit">Airway Rodeo (White) • TraJuan T. White</p></section><section class="article-grid"><article class="article-card"><span>CARDIOLOGY & EKG</span><h3>Cardiology & EKG</h3><p>Rhythm recognition, 12-lead interpretation, physiology, and treatment decisions.</p></article><article class="article-card"><span>AIRWAY & RESPIRATORY</span><h3>Airway & Respiratory</h3><p>Ventilation, oxygenation, capnography, airway management, and respiratory emergencies.</p></article><article class="article-card"><span>MEDICAL & TRAUMA</span><h3>Field Medicine</h3><p>Clinical reasoning for the medical and trauma calls that challenge prehospital clinicians.</p></article></section><button class="btn primary" id="backHome" style="margin-top:24px">← Back Home</button>`;
 backHome.onclick=()=>navigate("home");
}
function giveawayLanding(){
 clearInterval(timer);
 app.innerHTML=`<section class="brand-hero blog-day-hero" aria-label="Intublade giveaway"><div class="kicker">THE MEDIC GOATS × INTUBLADE</div><h1>10K FOLLOWER GIVEAWAY</h1><div class="giveaway-clock" data-giveaway-countdown aria-label="Giveaway preview countdown"></div><p class="giveaway-demo-note">10-day countdown preview • Entries not open yet</p><p>10,000 followers and counting. Thank you for being part of The Medic Goats community.</p></section><section class="medic-blog-article"><h2>Something special is coming.</h2><p>We've partnered with Intublade to celebrate 10,000 followers. <strong>One winner will receive a video laryngoscope plus a gift box.</strong> This giveaway is intended for healthcare professionals and students.</p><h2>How to enter</h2><ol><li>Follow <a href="https://www.instagram.com/themedicgoats/" target="_blank" rel="noopener noreferrer">@themedicgoats</a> and <a href="https://www.instagram.com/intublade/" target="_blank" rel="noopener noreferrer">@intublade</a> on Instagram.</li><li>Like the official giveaway announcement post.</li><li>Tag two people in a comment on that post.</li><li>Return here and submit your Instagram username once registration opens.</li></ol><p>One entry per eligible person. Completing Instagram actions does not automatically register an entry on this website. The selected winner will be contacted with prize-claim instructions. No purchase necessary. This promotion is not sponsored, endorsed, administered by, or associated with Instagram.</p><p><strong>Entries are not open yet.</strong> Once the giveaway is ready, this page will have an Instagram-handle entry form and a live countdown to the closing deadline.</p><p>Follow <a href="https://www.instagram.com/themedicgoats/" target="_blank" rel="noopener noreferrer">@themedicgoats</a> for the announcement.</p><a class="btn primary" href="/">← Back to Home</a></section>`;
 startGiveawayCountdown();
}
const routes={home:"/",game:"/training",leaderboard:"/training"};
function navigate(view){const path=routes[view]||"/";if(location.pathname!==path)history.pushState({view},"",path);({home:siteHome,game:training,education:education,leaderboard:training}[view]||siteHome)();}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>navigate(b.dataset.view));
window.addEventListener("popstate",()=>renderRoute());
function renderRoute(){const path=location.pathname;if(path==="/giveaway"||path==="/giveaway/"){history.replaceState({view:"home"},"","/");return siteHome();}if(path==="/education"){history.replaceState({view:"game"},"","/training");return training()}if(path==="/blog/be-the-fto-you-needed-making-field-training-better")return ftoArticle();if(path==="/rapid-differentials")return rapidDifferentialsLanding();if(path==="/leaderboard"){history.replaceState({view:"game"},"","/training");return training()}const view=Object.keys(routes).find(k=>routes[k]===path)||"home";({home:siteHome,game:training,education:education,leaderboard:leaderboard}[view])();}
renderRoute();