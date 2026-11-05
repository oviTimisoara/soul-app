/* Faithful screen composition from the approved Soul reference. */
const SettingsView=vProfile;
const SHORT={stressed:'Stresat',sad:'Melancolic',angry:'Supărat',joy:'Fericit',focus:'Focus',anxious:'Neliniștit',meditation:'Meditație'};
const TITLES={stressed:'Relaxare profundă',sad:'O clipă de alinare',angry:'Regăsește echilibrul',joy:'Bucuria de a fi',focus:'Claritate interioară',anxious:'Un ritm mai blând',meditation:'Liniște interioară'};
const MENU='<svg viewBox="0 0 24 24"><path d="M3 5h18M3 12h18M3 19h18"/></svg>';
const CHEVRON='<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg>';
const LEAF='<svg viewBox="0 0 24 24"><path d="M5 20C3 8 14 10 20 3c1 14-6 19-12 14M5 23c2-8 7-12 12-15"/></svg>';
const SETTINGS='<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18M8 3v6M16 9v6M8 15v6"/></svg>';
P.favM=P.favM||[];P.history=P.history||[];P.visits=P.visits||[];
const today=new Date().toLocaleDateString('sv-SE');if(!P.visits.includes(today)){P.visits.push(today);P.visits=P.visits.slice(-366);savePrefs();}
function openMood(mood){state.refresh=null;state.overlay={type:'exp',mood};P.history.unshift({mood,at:Date.now()});P.history=P.history.slice(0,50);savePrefs();render();playMood(D.EXPERIENCES.find(e=>e.mood===mood));}
function toggleMood(mood,b){P.favM=P.favM.includes(mood)?P.favM.filter(x=>x!==mood):[...P.favM,mood];savePrefs();b.innerHTML=I.heart(P.favM.includes(mood));b.setAttribute('aria-pressed',P.favM.includes(mood));}
function openPlayer(mood){state.refresh=null;state.overlay={type:'player',mood};render();}
function openPanel(type){state.refresh=null;state.overlay={type};render();}
function menuRow(id,icon,title,sub=''){return `<button class="ref-row" id="${id}"><span class="ico">${icon}</span><span class="row-copy">${title}${sub?`<small>${sub}</small>`:''}</span><span class="ico arrow">${CHEVRON}</span></button>`;}
vHome=function(){
 const v=h(`<header class="home-top"><button class="ib" id="settings" aria-label="Profil și setări">${MENU}</button>${brand()}<button class="ib" id="night" aria-label="Liniște pentru somn">${I.moon}</button></header><div class="home-greeting center"><p>Bine ai venit!</p><h1>Cum te simți astăzi?</h1></div><div class="mood-grid">${D.EXPERIENCES.map((e,i)=>`<button class="mood-tile mood-${e.icon}" data-m="${e.mood}" aria-label="${esc(e.title)}"><span class="mood-picture sprite-${i}" aria-hidden="true">${i===6?LOTUS:''}</span><span class="tile-label">${SHORT[e.mood]}</span></button>`).join('')}</div>`);
 $$('[data-m]',v).forEach(b=>b.onclick=()=>openMood(b.dataset.m));$('#settings',v).onclick=()=>go('profile');$('#night',v).onclick=()=>openPanel('sleep');
 if(!P.welcomed)showWelcome(v);return v;
};
showWelcome=function(v){
 const intro=document.createElement('section');intro.className='welcome-panel';intro.innerHTML=`${brand()}<p class="welcome-sub">Muzică · Citate · Echilibru</p><div class="welcome-copy"><h1>Regăsește<br>liniștea interioară</h1><p>O experiență audio-vizuală<br>pentru echilibrul tău emoțional.</p><div class="intro-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div><button class="btn" id="begin">Începe acum <span aria-hidden="true">→</span></button><p class="local-note">Un moment doar pentru tine.</p></div>`;
 v.appendChild(intro);$('#app').classList.add('onboarding');$('#begin',intro).onclick=()=>{P.welcomed=true;savePrefs();intro.remove();$('#app').classList.remove('onboarding');};
};
vExp=function(mood){
 const e=D.EXPERIENCES.find(x=>x.mood===mood),v=h(`<header class="ref-top"><button class="ib" id="bk" aria-label="Înapoi">${I.back}</button><button class="ib" id="mood-fav" aria-label="Salvează starea la favorite" aria-pressed="${P.favM.includes(mood)}">${I.heart(P.favM.includes(mood))}</button></header><section class="state-intro ${mood==='stressed'?'stones-intro':''}">${mood==='stressed'?'':`<div class="state-symbol mood-${e.icon}">${moodIcon(e)}</div>`}<h1>${SHORT[mood]}</h1><p>${mood==='stressed'?'Relaxează-te, eliberează tensiunea<br>și redescoperă calmul.':esc(e.description)}</p></section><div class="experience-menu">${menuRow('playlist',I.play,mood==='stressed'?'Playlist Relaxare':'Muzică pentru tine',esc(moodLabel(e)))}${menuRow('breath',LEAF,'Respirație ghidată','5 min')}${menuRow('meditate',LOTUS,'Meditație','10 min · acompaniament muzical')}${menuRow('quotes',I.msg,'Citate motivaționale',D.QUOTES.length+' mesaje')}</div>`);
 $('#bk',v).onclick=()=>go('home');$('#mood-fav',v).onclick=ev=>toggleMood(mood,ev.currentTarget);
 $('#playlist',v).onclick=()=>openPlayer(mood);$('#breath',v).onclick=()=>{P.session=5;go('breathe');};
 $('#meditate',v).onclick=async()=>{await playMood(e);setTimer(10);openPlayer(mood);};$('#quotes',v).onclick=()=>go('messages');return v;
};
function vPlayer(mood){
 const e=D.EXPERIENCES.find(x=>x.mood===mood)||D.EXPERIENCES[0];
 const v=h(`<header class="ref-top"><button class="ib" id="bk" aria-label="Înapoi">${I.back}</button>${brand()}<button class="ib" id="mf" aria-label="Salvează starea la favorite" aria-pressed="${P.favM.includes(e.mood)}">${I.heart(P.favM.includes(e.mood))}</button></header><div class="full-player"><h1>${TITLES[e.mood]}</h1><p>${esc(e.description)}</p><div class="play-progress"><input id="full-seek" type="range" min="0" max="100" value="0" aria-label="Poziția în melodie"><div class="play-times"><span id="elapsed">0:00</span><span id="duration">0:00</span></div></div><div class="full-controls"><button class="ib" id="repeat" aria-label="Repetă">${I.rep}</button><button class="ib" id="prev" aria-label="Piesa anterioară">${I.prev}</button><button class="ib play-main" id="play" aria-label="Redă sau pune pauză">${I.play}</button><button class="ib" id="next" aria-label="Piesa următoare">${I.next}</button><button class="ib" id="timer" aria-label="Oprire după 15 minute">${I.timer}</button></div><p class="player-status" id="status" role="status"></p><div class="player-quote glass"><span aria-hidden="true">“</span><p>${esc(e.message)}</p></div></div>`);
 $('#bk',v).onclick=()=>{state.overlay={type:'exp',mood:e.mood};state.refresh=null;render();};$('#mf',v).onclick=ev=>toggleMood(e.mood,ev.currentTarget);
 const update=()=>{if(!v.isConnected)return;$('#play',v).innerHTML=Pl.playing?I.pause:I.play;$('#elapsed',v).textContent=fmt(Pl.elapsed);$('#duration',v).textContent=fmt(Pl.now?.duration||0);$('#full-seek',v).value=Pl.now?100*Pl.elapsed/Pl.now.duration:0;$('#full-seek',v).disabled=Pl.now?.kind!=='user';$('#prev',v).disabled=$('#next',v).disabled=!Pl.now?.trackId;$('#repeat',v).setAttribute('aria-pressed',Pl.repeat);$('#status',v).textContent=Pl.err||(Pl.timerLeft?'Oprire în '+fmt(Pl.timerLeft):'');};
 $('#play',v).onclick=async()=>{if(!Pl.now)await playMood(e);else await toggle();update();};$('#prev',v).onclick=()=>step(-1);$('#next',v).onclick=()=>step(1);$('#repeat',v).onclick=()=>{Pl.repeat=!Pl.repeat;update();};$('#timer',v).onclick=()=>{setTimer(Pl.timerLeft?null:15);update();};
 $('#full-seek',v).onchange=ev=>{const t=trackById(Pl.now?.trackId);if(t?.kind==='user')playUser(t,Number(ev.target.value)*Pl.now.duration/100);};
 state.refresh=update;requestAnimationFrame(update);const tick=setInterval(()=>{if(!v.isConnected)clearInterval(tick);else update();},1000);return v;
}
vProfile=function(){
 const v=h(`<header class="ref-top"><button class="ib" id="home" aria-label="Acasă">${MENU}</button><h1>Profilul meu</h1><span class="ib"></span></header><div class="profile-hero"><div class="profile-avatar ico">${I.user}</div><p>Călătorul Soul</p></div><section class="progress-card glass"><span class="ico">${LEAF}</span><div><b>Evoluția mea</b><p>${P.visits.length} ${P.visits.length===1?'zi cu Soul':'zile cu Soul'}</p><div class="visit-bar"><i style="width:${Math.min(100,P.visits.length/7*100)}%"></i></div></div></section><div class="profile-menu glass">${menuRow('favorites',I.heart(false),'Favoritele mele')}${menuRow('offline','<svg viewBox="0 0 24 24"><path d="M12 2v13m-5-5 5 5 5-5M4 16v5h16v-5"/></svg>','Conținut offline')}${menuRow('history',I.timer,'Istoric ascultări')}${menuRow('settings',SETTINGS,'Setări (sunet, aspect)')}${menuRow('about',I.help,'Despre Soul')}</div><button class="welcome-link" id="intro">Revezi ecranul de bun venit</button>`);
 $('#home',v).onclick=()=>go('home');$('#favorites',v).onclick=()=>openPanel('favorites');$('#offline',v).onclick=()=>go('music',{category:'mine'});$('#history',v).onclick=()=>openPanel('history');$('#settings',v).onclick=()=>openPanel('settings');$('#about',v).onclick=()=>openPanel('help');$('#intro',v).onclick=()=>showWelcome(v);return v;
};
function vSettings(){const v=SettingsView();const b=document.createElement('button');b.className='ib';b.ariaLabel='Înapoi la profil';b.innerHTML=I.back;b.onclick=()=>go('profile');v.prepend(b);return v;}
function vSaved(type){
 const isHistory=type==='history';const entries=isHistory?P.history:P.favM.map(mood=>({mood}));
 const v=h(`<header class="ref-top"><button class="ib" id="bk" aria-label="Înapoi">${I.back}</button><h1>${isHistory?'Istoric ascultări':'Favoritele mele'}</h1></header><div class="saved-list">${entries.length?entries.map((x,i)=>{const e=D.EXPERIENCES.find(e=>e.mood===x.mood);return e?menuRow('saved-'+i,moodIcon(e),esc(e.title),isHistory?new Date(x.at).toLocaleString('ro-RO'):''):'';}).join(''):'<p class="glass card">'+(isHistory?'Experiențele ascultate vor apărea aici.':'Apasă inima dintr-o stare pentru a o păstra aici.')+'</p>'}</div>${isHistory?'':menuRow('tracks',I.music,'Piese favorite')+menuRow('quotes',I.msg,'Citate favorite')}`);
 $('#bk',v).onclick=()=>go('profile');entries.forEach((x,i)=>{const b=$('#saved-'+i,v);if(b)b.onclick=()=>openMood(x.mood);});if(!isHistory){$('#tracks',v).onclick=()=>go('music',{category:'fav'});$('#quotes',v).onclick=()=>go('messages',{category:'fav'});}return v;
}
// Screen backgrounds follow the supplied composition, with selected personal scenes preserved elsewhere.
const legacyScene=setScene;
setScene=function(id){
 const kind=state.overlay?.type, mood=state.overlay?.mood;
 let asset=kind==='player'?'assets/player-lake.webp':kind==='exp'&&mood==='stressed'?'assets/zen-stones.webp':!kind&&(state.tab==='home'||state.tab==='profile')?'assets/welcome-mountains.webp':null;
 if(asset){curScene='ref-'+asset;$('#bg').dataset.scene=id;$('#bg').style.backgroundImage=`url("${asset}")`;$('#bg').style.setProperty('--scene-tint','transparent');}else legacyScene(id);
};
const originalRender=render;
render=function(opts){state.options=opts||{};originalRender(opts);$('#app').dataset.mood=state.overlay?.mood||'';const nav=$('#nav');nav.hidden=!!state.overlay&&['exp','player'].includes(state.overlay.type);if(state.tab==='home'&&!state.overlay){const b=nav.querySelector('[data-tab="profile"]');if(b){b.innerHTML=I.heart(false)+'Favorite';b.onclick=()=>openPanel('favorites');}}};
render();
