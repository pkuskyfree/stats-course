const $=id=>document.getElementById(id);
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const lf=[0];for(let i=1;i<=200;i++)lf[i]=lf[i-1]+Math.log(i);
const erf=x=>{const s=Math.sign(x);x=Math.abs(x);const t=1/(1+.3275911*x);return s*(1-((((1.061405429*t-1.453152027)*t+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x))};
const Phi=z=>.5*(1+erf(z/Math.SQRT2));
const gauss=()=>Math.sqrt(-2*Math.log(1-Math.random()))*Math.cos(2*Math.PI*Math.random());
const D={
normal:{n:'正态分布',p:[{k:'mu',l:'均值 μ',min:-3,max:3,step:.1,v:0},{k:'s',l:'标准差 σ',min:.3,max:3,step:.1,v:1}],
 f:(x,q)=>Math.exp(-(((x-q.mu)/q.s)**2)/2)/(q.s*Math.sqrt(2*Math.PI)),F:(x,q)=>Phi((x-q.mu)/q.s),
 s:q=>q.mu+q.s*gauss(),mean:q=>q.mu,sd:q=>q.s,rng:q=>[q.mu-4*q.s,q.mu+4*q.s]},
uniform:{n:'均匀分布',p:[{k:'a',l:'下界 a',min:-3,max:3,step:.1,v:0},{k:'w',l:'区间长度',min:.5,max:6,step:.1,v:2}],
 f:(x,q)=>x>=q.a&&x<=q.a+q.w?1/q.w:0,F:(x,q)=>Math.min(1,Math.max(0,(x-q.a)/q.w)),
 s:q=>q.a+q.w*Math.random(),mean:q=>q.a+q.w/2,sd:q=>q.w/Math.sqrt(12),rng:q=>[q.a-.5,q.a+q.w+.5]},
exp:{n:'指数分布',p:[{k:'l',l:'速率 λ',min:.2,max:3,step:.1,v:1}],
 f:(x,q)=>x<0?0:q.l*Math.exp(-q.l*x),F:(x,q)=>x<0?0:1-Math.exp(-q.l*x),
 s:q=>-Math.log(1-Math.random())/q.l,mean:q=>1/q.l,sd:q=>1/q.l,rng:q=>[-.3/q.l,6/q.l]},
binom:{n:'二项分布（离散）',disc:1,p:[{k:'n',l:'试验次数 n',min:1,max:50,step:1,v:10},{k:'p',l:'成功概率 p',min:.05,max:.95,step:.05,v:.4}],
 f:(k,q)=>k<0||k>q.n?0:Math.exp(lf[q.n]-lf[k]-lf[q.n-k]+k*Math.log(q.p)+(q.n-k)*Math.log(1-q.p)),
 F:(x,q)=>{let s=0;for(let k=0;k<=Math.min(q.n,Math.floor(x+1e-9));k++)s+=D.binom.f(k,q);return s},
 s:q=>{let c=0;for(let i=0;i<q.n;i++)if(Math.random()<q.p)c++;return c},mean:q=>q.n*q.p,sd:q=>Math.sqrt(q.n*q.p*(1-q.p)),rng:q=>[-1,q.n+1]}
};
function ctl(root,onc,ond){
 root.innerHTML='<label>分布<br><select>'+Object.entries(D).map(([k,d])=>`<option value="${k}">${d.n}</option>`).join('')+'</select></label><div class="ps"></div>';
 const sel=root.querySelector('select'),ps=root.querySelector('.ps'),o={d:D.normal,q:{}};
 o.build=()=>{o.d=D[sel.value];ps.innerHTML='';o.q={};
  o.d.p.forEach(p=>{o.q[p.k]=p.v;const l=document.createElement('label');
   l.innerHTML=`${p.l} = <b>${p.v}</b><input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.v}">`;
   l.querySelector('input').oninput=e=>{o.q[p.k]=+e.target.value;l.querySelector('b').textContent=e.target.value;onc()};ps.append(l)});
  ond&&ond(o);onc()};
 sel.onchange=o.build;return o}
function bindB(id,cb){const e=$(id);e.oninput=()=>{e.parentNode.querySelector('b').textContent=e.value;cb()}}
function ticks(a,b,n){const s=(b-a)/n,p=10**Math.floor(Math.log10(s)),m=s/p,st=(m<1.5?1:m<3.5?2:m<7.5?5:10)*p,t=[];for(let v=Math.ceil(a/st-1e-9)*st;v<=b+1e-9;v+=st)t.push(+v.toFixed(10));return t}
function ax(c,xr,ym,y0=0){
 const r=devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;c.width=w*r;c.height=h*r;
 const g=c.getContext('2d');g.setTransform(r,0,0,r,0,0);
 const L=42,R=12,T=10,B=26,X=x=>L+(x-xr[0])/(xr[1]-xr[0])*(w-L-R),Y=y=>h-B-(y-y0)/(ym-y0)*(h-B-T);
 g.font='12px system-ui';g.lineWidth=1;g.strokeStyle=css('--grid');g.fillStyle=css('--mut');
 g.textAlign='center';ticks(xr[0],xr[1],6).forEach(v=>{g.beginPath();g.moveTo(X(v),T);g.lineTo(X(v),h-B);g.stroke();g.fillText(String(+v.toFixed(2)),X(v),h-8)});
 g.textAlign='right';ticks(y0,ym,4).forEach(v=>{g.beginPath();g.moveTo(L,Y(v));g.lineTo(w-R,Y(v));g.stroke();g.fillText(String(+v.toFixed(2)),L-5,Y(v)+4)});
 return {g,X,Y,w,h,L,R,T,B}}
function curve(A,f,xr,col,lw){const g=A.g;g.beginPath();for(let i=0;i<=400;i++){const x=xr[0]+(xr[1]-xr[0])*i/400;i?g.lineTo(A.X(x),A.Y(f(x))):g.moveTo(A.X(x),A.Y(f(x)))}g.strokeStyle=col;g.lineWidth=lw||2;g.stroke()}
function dash(A,x,y0,y1,col){const g=A.g;g.save();g.setLineDash([5,4]);g.strokeStyle=col;g.lineWidth=1.5;g.beginPath();g.moveTo(A.X(x),A.Y(y0));g.lineTo(A.X(x),A.Y(y1));g.stroke();g.restore()}
function ymaxOf(d,q,r){let m=0;if(d.disc){for(let k=0;k<=q.n;k++)m=Math.max(m,d.f(k,q))}else for(let i=0;i<=400;i++)m=Math.max(m,d.f(r[0]+(r[1]-r[0])*i/400,q));return m}
const fmt=v=>(+v.toFixed(3)).toString();


function ols(X,Y){const n=X.length,mx=X.reduce((a,b)=>a+b)/n,my=Y.reduce((a,b)=>a+b)/n;let sxy=0,sxx=0;for(let i=0;i<n;i++){sxy+=(X[i]-mx)*(Y[i]-my);sxx+=(X[i]-mx)**2}const b1=sxy/sxx;return [my-b1*mx,b1,sxx]}
function scat(A,X,Y,col,r){const g=A.g;g.fillStyle=col;X.forEach((x,i)=>{g.beginPath();g.arc(A.X(x),A.Y(Y[i]),r||3,0,7);g.fill()})}
function seg(A,x0,y0,x1,y1,col,lw){const g=A.g;g.beginPath();g.moveTo(A.X(x0),A.Y(y0));g.lineTo(A.X(x1),A.Y(y1));g.strokeStyle=col;g.lineWidth=lw||2;g.stroke()}
function hn(cv,v,mu,sg){const r=[mu-4*sg,mu+4*sg],k=40,w=(r[1]-r[0])/k,c=Array(k).fill(0),N=v.length;v.forEach(t=>{const i=Math.floor((t-r[0])/w);if(i>=0&&i<k)c[i]++});
 const nf=x=>Math.exp(-(((x-mu)/sg)**2)/2)/(sg*Math.sqrt(2*Math.PI)),A=ax(cv,r,Math.max(Math.max(...c)/(N*w),nf(mu))*1.15),g=A.g;
 g.fillStyle=css('--accs');g.strokeStyle=css('--acc');c.forEach((n,i)=>{const hh=n/(N*w),x0=A.X(r[0]+i*w),x1=A.X(r[0]+(i+1)*w);g.fillRect(x0,A.Y(hh),x1-x0,A.Y(0)-A.Y(hh));g.strokeRect(x0,A.Y(hh),x1-x0,A.Y(0)-A.Y(hh))});curve(A,nf,r,css('--warm'),2.5)}
