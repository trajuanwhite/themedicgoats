const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const postsSource=fs.readFileSync('blog-posts.js','utf8');
const blogSource=fs.readFileSync('blog.js','utf8');
const sandbox={window:{}};
vm.runInNewContext(postsSource,sandbox,{timeout:3000});
const posts=sandbox.window.MEDIC_BLOG_POSTS;
assert(Array.isArray(posts)&&posts.length,'Blog articles must load');
const match=blogSource.match(/const quizBanks=(\{[\s\S]*?\});\s*\n/);
assert(match,'Quiz bank definition must exist');
const banks=JSON.parse(match[1]);
const seen=new Set();
for(const post of posts){
 assert(typeof post.slug==='string'&&post.slug,'Every article needs a slug');
 assert(!seen.has(post.slug),'Duplicate blog slug: '+post.slug);seen.add(post.slug);
 assert(typeof post.html==='string'&&post.html.length>0,'Missing article body: '+post.slug);
 const quiz=banks[post.slug];
 assert(Array.isArray(quiz)&&quiz.length===5,'Every article needs exactly five quiz questions: '+post.slug);
 for(const [i,q] of quiz.entries()){
  assert(Array.isArray(q)&&q.length===4,'Invalid quiz tuple: '+post.slug+' #'+(i+1));
  const [question,choices,answer,explanation]=q;
  assert(typeof question==='string'&&question.trim(),'Missing question: '+post.slug+' #'+(i+1));
  assert(Array.isArray(choices)&&choices.length===4&&choices.every(x=>typeof x==='string'&&x.trim()),'Invalid answer choices: '+post.slug+' #'+(i+1));
  assert(new Set(choices).size===4,'Duplicate choices: '+post.slug+' #'+(i+1));
  assert(Number.isInteger(answer)&&answer>=0&&answer<choices.length,'Invalid correct answer: '+post.slug+' #'+(i+1));
  assert(typeof explanation==='string'&&explanation.trim(),'Missing explanation: '+post.slug+' #'+(i+1));
 }
}
for(const slug of Object.keys(banks))assert(seen.has(slug),'Quiz has no matching article: '+slug);
assert(blogSource.includes('renderKnowledgeCheck(p);'),'Article page must render its quiz');
assert(blogSource.includes('id="medicKnowledgeCheck"'),'Article page must provide quiz container');
console.log('PASS: '+posts.length+' articles have five complete, correctly linked quiz questions each.');
