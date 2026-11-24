(function(){
  var root=document.documentElement;
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}

  // ---- language ----
  var sw=document.querySelector('.lang');
  function store(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function read(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function setLang(l,save){
    if(root.getAttribute('data-one'))return;
    if(l!=='uk'&&l!=='pl')l='en';
    root.setAttribute('data-lang',l);root.setAttribute('lang',l);
    var t=root.getAttribute('data-title-'+l);if(t)document.title=t;
    if(sw)$$('button',sw).forEach(function(b){b.setAttribute('aria-pressed',b.dataset.l===l?'true':'false')});
    if(save)store('pp-lang',l);
  }
  var q=(location.search.match(/[?&]lang=(\w+)/)||[])[1];if(q==='ua')q='uk';if(q&&q!=='uk'&&q!=='pl'&&q!=='en')q=null;
  setLang(q||read('pp-lang')||'en',!!q);
  if(sw)sw.addEventListener('click',function(e){var b=e.target.closest('button');if(b)setLang(b.dataset.l,true)});
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[data-keep]');if(!a)return;
    var L=root.getAttribute('data-lang');var h=a.getAttribute('href'),p=h.split('#'),base=p[0].split('?')[0];if(L==='uk'||L==='pl'){a.href=base+'?lang='+(L==='uk'?'ua':'pl')+(p[1]?'#'+p[1]:'')}else{a.href=base+(p[1]?'#'+p[1]:'')}
  });

  function yt(id){return '<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Pepsi Patrol" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>'}
  function media(b){if(b.dataset.yt)return yt(b.dataset.yt);return '<video controls autoplay playsinline src="'+b.dataset.mp4+'"></video>'}
  function load(v){if(v&&v.dataset.src&&!v.getAttribute('src')){v.src=v.dataset.src}}
  function playV(v){if(!v||RM)return;load(v);var p=v.play();if(p&&p.catch)p.catch(function(){})}

  // ---- hub: stage + reel ----
  var stage=document.querySelector('.stage');
  if(stage){
    var eps=$$('.ep',stage),items=$$('.reel-it');
    function show(i){
      eps.forEach(function(e,k){var on=k===i;e.classList.toggle('on',on);e.setAttribute('aria-hidden',on?'false':'true');
        var v=e.querySelector('video');if(v){if(on)playV(v);else try{v.pause()}catch(x){}}});
      items.forEach(function(b,k){b.setAttribute('aria-pressed',k===i?'true':'false')});
    }
    items.forEach(function(b){b.addEventListener('click',function(){show(+b.dataset.i)})});
    show(0);
  }

  // ---- lightbox ----
  var lastFocus=null;
  function closeLb(lb){
    lb.hidden=true;$$('.lb-screen',lb).forEach(function(s){s.innerHTML=''});
    document.body.style.overflow='';if(lastFocus)lastFocus.focus();
    $$('.stage .ep.on video').forEach(playV);
  }
  function setSrc(lb,b){
    var s=lb.querySelector('.lb-screen');s.innerHTML=media(b);
    var a=lb.querySelector('.lb-yt');if(a&&b.dataset.yt)a.href='https://youtu.be/'+b.dataset.yt;
  }
  $$('.lb').forEach(function(lb){
    lb.addEventListener('click',function(e){
      if(e.target===lb||e.target.closest('.lb-x')){closeLb(lb);return}
      var b=e.target.closest('.lb-tabs button');
      if(b){$$('.lb-tabs button',lb).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});setSrc(lb,b)}
    });
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')$$('.lb').forEach(function(lb){if(!lb.hidden)closeLb(lb)})});
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-open]');if(!b)return;
    var lb=document.getElementById(b.dataset.open);if(!lb)return;
    lastFocus=b;lb.hidden=false;document.body.style.overflow='hidden';
    $$('.stage video').forEach(function(v){try{v.pause()}catch(x){}});
    var t=lb.querySelector('.lb-tabs button[aria-pressed="true"]')||lb.querySelector('.lb-tabs button');setSrc(lb,t);
    var x=lb.querySelector('.lb-x');if(x)x.focus();
  });

  // ---- case: inline player ----
  var pl=document.querySelector('.player');
  if(pl){
    var scr=pl.querySelector('.screen'),tabs=$$('.ptabs button',pl),cur=tabs[0],ya=pl.querySelector('.lb-yt');
    function go(){scr.innerHTML=media(cur)}
    pl.querySelector('[data-inline]').addEventListener('click',go);
    tabs.forEach(function(t){t.addEventListener('click',function(){
      tabs.forEach(function(x){x.setAttribute('aria-pressed',x===t?'true':'false')});
      cur=t;if(ya&&t.dataset.yt)ya.href='https://youtu.be/'+t.dataset.yt;
      if(scr.querySelector('iframe,video[controls]'))go();
    })});
  }

  // ---- case: storyboard comparer ----
  var cmp=document.querySelector('.cmp');
  if(cmp){
    var rng=cmp.querySelector('input'),fin=cmp.querySelector('.cmp-fin'),sbi=cmp.querySelector('.cmp-sb img');
    function setX(v){cmp.style.setProperty('--x',v+'%')}
    rng.addEventListener('input',function(){setX(rng.value)});
    var shots=$$('.st-it'),caps=$$('.cap');
    function pick(i){
      var b=shots[i];if(!b)return;
      fin.src=b.dataset.fin;sbi.src=b.dataset.sb;
      shots.forEach(function(x,k){x.setAttribute('aria-pressed',k===i?'true':'false')});
      caps.forEach(function(c,k){c.classList.toggle('on',k===i)});
      if(!RM){rng.value=50;setX(50)}
    }
    shots.forEach(function(b,i){b.addEventListener('click',function(){pick(i)})});
    // preload
    shots.forEach(function(b){var a=new Image();a.src=b.dataset.sb;var c=new Image();c.src=b.dataset.fin});
    // gentle hint: the divider breathes once when the section comes into view
    if(!RM&&'IntersectionObserver' in window){
      var done=false;new IntersectionObserver(function(en,o){en.forEach(function(e){if(e.isIntersecting&&!done){done=true;o.disconnect();
        var t0=performance.now();(function f(t){var k=Math.min(1,(t-t0)/1600),v=50+Math.sin(k*Math.PI*2)*14;setX(v.toFixed(1));if(k<1)requestAnimationFrame(f);else setX(50)})(t0)}})},{threshold:.6}).observe(cmp);
    }
  }

  // ---- case: chapters (active + progress) ----
  var ch=document.querySelector('.chapters');
  if(ch&&'IntersectionObserver' in window){
    var L=$$('a[data-ch]',ch),P=ch.querySelector('.ch-prog'),S=L.map(function(a){return document.getElementById(a.dataset.ch)}),V={};
    var io=new IntersectionObserver(function(en){
      en.forEach(function(e){V[e.target.id]=e.isIntersecting?e.intersectionRatio:0});
      var best=null,bv=0;S.forEach(function(s){if(s&&V[s.id]>bv){bv=V[s.id];best=s.id}});
      if(!best)return;
      L.forEach(function(a){var on=a.dataset.ch===best;if(on&&!a.classList.contains('on')){var p=a.parentNode;p.scrollTo({left:a.offsetLeft-p.clientWidth/2+a.clientWidth/2,behavior:RM?'auto':'smooth'})}a.classList.toggle('on',on)});
    },{threshold:[0,.1,.25,.5,.75],rootMargin:'-112px 0px -35% 0px'});
    S.forEach(function(s){if(s)io.observe(s)});
    var first=S[0],last=document.querySelector('.others');
    function onScroll(){if(!first||!last)return;var a=first.offsetTop-120,b=last.offsetTop-innerHeight*.5,k=Math.max(0,Math.min(1,(scrollY-a)/(b-a)));P.style.width=(k*100)+'%'}
    addEventListener('scroll',onScroll,{passive:true});onScroll();
  }

  // ---- KPI count-up ----
  var kp=$$('.kpi .num');
  if(kp.length&&!RM&&'IntersectionObserver' in window){
    var ko=new IntersectionObserver(function(en){en.forEach(function(e){if(!e.isIntersecting)return;ko.unobserve(e.target);
      var el=e.target,m=el.textContent.match(/^(\d+)(.*)$/);if(!m)return;var n=+m[1],suf=m[2],t0=performance.now();
      (function f(t){var k=Math.min(1,(t-t0)/1100),v=Math.round(n*(1-Math.pow(1-k,3)));el.textContent=v+suf;if(k<1)requestAnimationFrame(f)})(t0);
    })},{threshold:.6});
    kp.forEach(function(k){ko.observe(k)});
  }

  // ---- screen tests: hover to play, switch test / film, click to enlarge ----
  function vis(el,sel){var x=$$(sel,el).filter(function(n){return n.offsetParent!==null||n.getClientRects().length});return x[0]||el.querySelector(sel)}
  var tv=document.getElementById('tv');
  function tvOpen(f){
    if(!tv)return;
    var film=f.classList.contains('film');
    var vt=f.querySelector('.tt-v'),vf=f.querySelector('.tt-fv');
    tv._f=f;
    function show(m){
      var v=m==='f'?vf:vt, src=v.dataset.src;
      tv.querySelector('.lb-screen').innerHTML='<video controls autoplay loop playsinline src="'+src+'"></video>';silenceAll(null);$$('.tt video').forEach(function(x){try{x.pause()}catch(e){}});
      $$('.tv-sw button',tv).forEach(function(b){b.setAttribute('aria-pressed',b.dataset.m===m?'true':'false')});
    }
    tv._show=show;
    var nm=vis(f,'.tt-name span')||f.querySelector('.tt-name');tv.querySelector('.tv-name').textContent=nm.textContent;
    var nt=vis(f,'figcaption > p');tv.querySelector('.tv-note').textContent=nt?nt.textContent:'';
    show(film?'f':'v');
    lastFocus=document.activeElement;tv.hidden=false;document.body.style.overflow='hidden';
    $$('.tt video').forEach(function(v){try{v.pause()}catch(e){}});
    tv.querySelector('.lb-x').focus();
  }
  if(tv){
    tv.addEventListener('click',function(e){
      var b=e.target.closest('.tv-sw button');if(b){tv._show(b.dataset.m);return}
      if(e.target===tv||e.target.closest('.lb-x')){tv.hidden=true;tv.querySelector('.lb-screen').innerHTML='';document.body.style.overflow='';if(lastFocus)lastFocus.focus()}
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!tv.hidden)tv.querySelector('.lb-x').click()});
  }
  var cards=$$('.tt');
  function silenceAll(except){cards.forEach(function(c){if(c===except)return;$$('video',c).forEach(function(v){v.muted=true});var sb=c.querySelector('.tt-snd');if(sb)sb.setAttribute('aria-pressed','false')})}
  cards.forEach(function(f){
    var vt=f.querySelector('.tt-v'),vf=f.querySelector('.tt-fv'),sb=f.querySelector('.tt-snd');
    function cur(){return f.classList.contains('film')?vf:vt}
    function other(){return f.classList.contains('film')?vt:vf}
    function sound(on){
      if(on)silenceAll(f);
      [vt,vf].forEach(function(v){v.muted=!on});
      sb.setAttribute('aria-pressed',on?'true':'false');
    }
    function start(fromZero){var v=cur();load(v);if(fromZero)try{v.currentTime=0}catch(e){}var p=v.play();if(p&&p.catch)p.catch(function(){v.muted=true;sb.setAttribute('aria-pressed','false');v.play().catch(function(){})})}
    f._vis=false;
    f.querySelector('.tt-m').addEventListener('click',function(e){if(e.target.closest('.tt-snd'))return;try{vt.pause();vf.pause()}catch(x){}tvOpen(f)});
    function toggleSnd(e){e.preventDefault();e.stopPropagation();var on=sb.getAttribute('aria-pressed')!=='true';sound(on);start(false)}
    sb.addEventListener('click',toggleSnd);
    sb.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')toggleSnd(e)});
    $$('.tt-sw button',f).forEach(function(b){b.addEventListener('click',function(){
      var film=b.dataset.m==='f';try{other().pause()}catch(x){}
      f.classList.toggle('film',film);
      $$('.tt-sw button',f).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
      try{other().pause()}catch(x){}
      sound(true);start(true);
    })});
  });
  if('IntersectionObserver' in window&&!RM){
    var tio=new IntersectionObserver(function(en){en.forEach(function(e){var f=e.target,v=f.querySelector(f.classList.contains('film')?'.tt-fv':'.tt-v');
      if(e.isIntersecting){playV(v)}else{$$('video',f).forEach(function(x){try{x.pause()}catch(err){}})}})},{threshold:.35});
    cards.forEach(function(c){tio.observe(c)});
  }

  // ---- reveal on scroll ----
  if(!RM&&'IntersectionObserver' in window){
    var rv=$$('section:not(.intro):not(.case-head) .wrap > *');
    rv.forEach(function(el){el.classList.add('rv')});
    var ro=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(el){ro.observe(el)});
  }

  // ---- hero reel: HD on desktop, 720p on phones ----
  $$('video[data-hd]').forEach(function(v){v.src=(window.innerWidth<760?v.dataset.sd:v.dataset.hd);if(!RM){var p=v.play();if(p&&p.catch)p.catch(function(){})}});

  // ---- background videos ----
  $$('video[autoplay]').forEach(function(v){if(RM){v.removeAttribute('autoplay');try{v.pause()}catch(e){}}});
  if('IntersectionObserver' in window){
    var vo=new IntersectionObserver(function(en){en.forEach(function(e){var v=e.target;if(v.closest('.ep')&&!v.closest('.ep.on'))return;if(e.isIntersecting)playV(v);else try{v.pause()}catch(x){}})},{threshold:.15});
    $$('video').forEach(function(v){if(!v.closest('.lb')&&!v.closest('.tt'))vo.observe(v)});
  }
})();
