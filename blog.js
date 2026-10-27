(function(){
const posts=window.MEDIC_BLOG_POSTS||[];
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function openBlog(slug){
 clearInterval(timer);
 const p=posts.find(x=>x.slug===slug);
 if(!p){app.innerHTML='<section class="page-heading"><h1>Article not found</h1><a href="/blog">Back to Blog</a></section>';return;}
 document.title=p.title+' | The Medic Goats';
 app.innerHTML='<section class="page-heading"><div class="kicker">THE MEDIC GOATS • TEACHING WHILE LEARNING</div><p><a href="/blog" class="blog-back">← All articles</a></p><h1>'+esc(p.title)+'</h1><p>'+esc(p.category)+' • '+esc(p.date?.slice(0,10))+'</p></section><article class="medic-blog-article">'+p.html+'</article><section class="blog-bottom"><a href="/blog" class="btn primary">← Back to Blog</a></section>';
}
function listBlog(){
 clearInterval(timer);document.title='Blog | The Medic Goats';
 app.innerHTML='<section class="page-heading"><div class="kicker">THE MEDIC GOATS • TEACHING WHILE LEARNING</div><h1>Clinical Education & Insights</h1><p>Understanding the why behind the medicine, from the field to the classroom.</p></section><section class="medic-blog-grid">'+posts.map(p=>'<a class="medic-blog-card" href="/blog/'+encodeURIComponent(p.slug)+'"><span>'+esc(p.category)+'</span><h2>'+esc(p.title)+'</h2><p>Read article →</p></a>').join('')+'</section>';
}
function route(){let path=decodeURIComponent(location.pathname);if(path==='/blog'||path==='/blog/')listBlog();else if(path.startsWith('/blog/'))openBlog(path.slice(6).replace(/\/$/,''));}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view!=='blog')history.replaceState({},'', '/');}));
const nav=document.querySelector('[data-view="blog"]');if(nav)nav.onclick=()=>{history.pushState({},'','/blog');listBlog();};
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="/blog"]');if(!a)return;e.preventDefault();history.pushState({},'',a.getAttribute('href'));route();window.scrollTo(0,0);});
window.addEventListener('popstate',()=>{if(location.pathname.startsWith('/blog'))route();else location.reload();});
if(location.pathname.startsWith('/blog'))route();
})();