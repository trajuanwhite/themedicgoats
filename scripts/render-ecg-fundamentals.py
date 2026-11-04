"""Render calibrated, explicitly synthetic single-lead ECG teaching figures.

Analytic smooth component model (not ECGSYN and not a patient recording).
The same underlying beat is used for every highlighted lesson.
Time coordinate: 700 px/s. Voltage coordinate: 280 px/mV.
Grid: 28 px/mm, representing 25 mm/s and 10 mm/mV at native proportions.
"""
from pathlib import Path
import json,re,math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'images'/'ekg-basics'
SCALE=3
PX_MM=28
PX_S=25*PX_MM
PX_MV=10*PX_MM
X0=200
BASE=490
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def font(size):return ImageFont.truetype(FONT,size*SCALE)
def xy(t,v=0):return ((X0+t*PX_S)*SCALE,(BASE-v*PX_MV)*SCALE)
def bump(t,a,b,peak,amplitude):
 if not a<t<b:return 0.0
 # Smooth asymmetric lobe with zero slope at both endpoints and peak.
 u=(t-a)/(peak-a) if t<=peak else (b-t)/(b-peak)
 return amplitude*math.sin(math.pi*u/2)**2
# Explicit boundaries for measurement and highlights.
P=(.22,.32);QRS=(.38,.47);T=(.56,.78);U=(.87,.95)
def waveform(t):
 p=bump(t,*P,.267,.12)
 # Windowed Gaussian sum produces the narrow, smooth ventricular complex.
 if QRS[0]<t<QRS[1]:
  raw=(-.115*math.exp(-.5*((t-.392)/.005)**2)
       +.86*math.exp(-.5*((t-.414)/.007)**2)
       -.235*math.exp(-.5*((t-.439)/.008)**2))
  edge=min((t-QRS[0])/.006,(QRS[1]-t)/.008,1)
  qrs=raw*(.5-.5*math.cos(math.pi*max(0,edge)))
 else:qrs=0
 return p+qrs+bump(t,*T,.688,.28)+bump(t,*U,.904,.035)
regions={'p-wave':P,'q-wave':(.38,.401),'r-wave':(.401,.428),'s-wave':(.428,.47),'t-wave':T,'u-wave':U,'qrs-complex':QRS,'complete-cardiac-cycle':(P[0],T[1]),'pr-interval':(P[0],QRS[0]),'qt-interval':(QRS[0],T[1]),'st-segment':(QRS[1],T[0])}
names={'p-wave':'P WAVE','q-wave':'Q WAVE','r-wave':'R WAVE','s-wave':'S WAVE','t-wave':'T WAVE','u-wave':'U WAVE','qrs-complex':'QRS COMPLEX','complete-cardiac-cycle':'THE FULL ECG CYCLE','pr-interval':'PR INTERVAL','qt-interval':'QT INTERVAL','st-segment':'ST SEGMENT'}
# Verify calibrated geometry and that the model is continuous at explicit boundaries.
assert abs(PX_MM/PX_S-.04)<1e-12 and abs(PX_MM/PX_MV-.1)<1e-12
assert abs((QRS[0]-P[0])-.16)<1e-12
assert abs((QRS[1]-QRS[0])-.09)<1e-12
assert abs((T[1]-QRS[0])-.4)<1e-12
for boundary in P+QRS+T+U:
 assert abs(waveform(boundary-1e-7)-waveform(boundary+1e-7))<1e-4
for key in regions:
 im=Image.new('RGB',(1200*SCALE,800*SCALE),'#f6f1e7');d=ImageDraw.Draw(im)
 def text(x,y,s,size=24,color='#234d44'):d.text((x*SCALE,y*SCALE),s,font=font(size),fill=color)
 def line(coords,fill,width=1):d.line([(x*SCALE,y*SCALE) for x,y in coords],fill=fill,width=width*SCALE)
 text(60,30,'THE MEDIC GOATS  /  ECG FUNDAMENTALS',23)
 text(60,76,names[key],46,'#153c36')
 text(60,137,'Smooth simulated lead II • Highlighted teaching feature',20,'#4d6258')
 # Paper grid is equally spaced in x and y; heavier every five small boxes.
 d.rectangle((80*SCALE,190*SCALE,1120*SCALE,590*SCALE),fill='#fffaf4')
 a,b=regions[key];xa=xy(a)[0];xb=xy(b)[0]
 d.rectangle((xa,190*SCALE,xb,590*SCALE),fill='#dcebe0')
 for x in range(80,1121,PX_MM):
  n=round((x-80)/PX_MM);line([(x,190),(x,590)],'#cba6a0' if n%5==0 else '#ecd7d1')
 for y in range(210,591,PX_MM):
  n=round((y-210)/PX_MM);line([(80,y),(1120,y)],'#cba6a0' if n%5==0 else '#ecd7d1')
 # Standard 1 mV calibration marker, separate from the waveform.
 line([(92,BASE),(108,BASE),(108,BASE-PX_MV),(136,BASE-PX_MV),(136,BASE),(152,BASE)],'#68736b',2)
 text(91,BASE-PX_MV-27,'1 mV',15,'#57675f')
 samples=np.linspace(0,1.28,6401)
 pts=[xy(float(t),waveform(float(t))) for t in samples]
 d.line(pts,fill='#153f37',width=3*SCALE)
 # Overlay the selected electrical feature with a darker warm accent.
 chosen=[xy(float(t),waveform(float(t))) for t in samples if a<=t<=b]
 if len(chosen)>1:d.line(chosen,fill='#9c4927',width=4*SCALE)
 labeldata=[('P',.267,.12,-35),('Q',.392,-.115,16),('R',.414,.86,-39),('S',.439,-.235,14),('T',.688,.28,-36),('U',.904,.035,-35)]
 for label,t,v,offset in labeldata:
  x,y=xy(t,v);text(x/SCALE-8,y/SCALE+offset,label,23,'#153f37')
 # A bracket records the exact feature endpoints without crossing the tracing.
 x1=xa/SCALE;x2=xb/SCALE;y=629
 line([(x1,y),(x2,y)],'#9c4927',3)
 line([(x1,y-7),(x1,y+7)],'#9c4927',2);line([(x2,y-7),(x2,y+7)],'#9c4927',2)
 text(60,674,'PR 160 ms   ·   QRS 90 ms   ·   QT 400 ms',23)
 text(60,713,'Small box: 0.04 s horizontally / 0.1 mV vertically',20,'#4d6258')
 text(60,752,'Simulated teaching ECG • 25 mm/s • 10 mm/mV • Not a patient recording',20,'#4d6258')
 im.resize((1200,800),Image.Resampling.LANCZOS).save(DEST/(key+'.png'),optimize=True)
# Swap only series image references/captions/metadata; preserve article content and quizzes.
p=ROOT/'blog-posts.js';s=p.read_text();posts=json.loads(s[s.index('=')+1:].strip().rstrip(';'))
for post in posts:
 if not post['slug'].startswith('ekg-basics-'):continue
 post['html']=re.sub(r'(/images/ekg-basics/[^"?]+\.png)(?:\?v=[^" ]+)?',r'\1?v=realistic1',post['html'])
 post['html']=post['html'].replace('highlighted on a labeled schematic ECG','highlighted on a calibrated simulated lead II ECG')
 post['html']=post['html'].replace('Shaded area highlights the topic. Illustrative single-lead schematic, not to scale; real morphology varies by lead. Tap to enlarge.','Shading and the accent trace highlight the topic on a simulated lead II ECG. Calibrated grid: 25 mm/s and 10 mm/mV (one small box = 40 ms / 0.1 mV). PR 160 ms, QRS 90 ms, QT 400 ms. This is a teaching simulation, not a patient recording. Tap to enlarge.')
 shell=ROOT/'blog-share'/(post['slug']+'.html');s=shell.read_text()
 s=re.sub(r'(/images/ekg-basics/[^"?]+\.png)(?:\?v=[^" ]+)?',r'\1?v=realistic1',s)
 s=s.replace('content="630"','content="800"').replace('ECG fundamentals schematic','calibrated simulated ECG')
 shell.write_text(s)
p.write_text('window.MEDIC_BLOG_POSTS='+json.dumps(posts,ensure_ascii=False,separators=(',',':'))+';\n')
# Cache-bust article data on every existing page entry point.
for p in [ROOT/'index.html',*(ROOT/'blog-share').glob('*.html')]:
 s=p.read_text();s=re.sub(r'(/blog-posts\.js)(\?v=[^"\s<]+)?',r'\1?v=20261103realisticecg',s);p.write_text(s)
print('Rendered 11 smooth calibrated ECG figures; updated captions, alt text, and share metadata.')
