const fs=require('fs');const path=require('path');const vm=require('vm');
function getPost(slug){if(!/^[a-z0-9-]{1,180}$/.test(slug||''))return null;const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(process.cwd(),'blog-posts.js'),'utf8'),sandbox,{timeout:1000});return (sandbox.window.MEDIC_BLOG_POSTS||[]).find(p=>p.slug===slug)||null;}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
module.exports={getPost,escapeHtml};
