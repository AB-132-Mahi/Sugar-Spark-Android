(() => {
'use strict';
const W=8,H=8,TYPES=6, emojis=['🍓','🍋','🍇','🍊','🍏','🫐'], colors=['#ff9cbb','#ffe17a','#c7a3f4','#ffb46f','#a8e69c','#9ac9ff'];
const legacyTargets=Array.from({length:30},(_,i)=>500+Math.floor(i/3)*350+i*45), moveBase=25;
const targetForLevel=n=>n<=30?legacyTargets[n-1]:Math.round(legacyTargets[29]+(n-30)*520+Math.pow(n-30,1.22)*24);
const worldForLevel=n=>Math.ceil(n/30);
const SAVE_KEY='sugarSparkSave';
const randType=()=>Math.floor(Math.random()*TYPES);
const newCandy=(random=randType,special=null)=>{let type=random();if(!Number.isInteger(type)||type<0||type>=TYPES)type=randType();return {type,special};};
function createBoard(random=randType, avoidInitialMatches=true){
 const b=Array.from({length:H},()=>Array(W).fill(null));
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){let t=random(),tries=0;
  if(avoidInitialMatches)while(tries++<30&&((c>=2&&b[r][c-1]?.type===t&&b[r][c-2]?.type===t)||(r>=2&&b[r-1][c]?.type===t&&b[r-2][c]?.type===t)))t=random();
  b[r][c]={type:t,special:null};
 }return b;
}
function findMatches(b){const out=new Set();for(let r=0;r<H;r++){let c=0;while(c<W){if(!b[r][c]){c++;continue}let start=c,t=b[r][c].type;c++;while(c<W&&b[r][c]?.type===t)c++;if(c-start>=3)for(let k=start;k<c;k++)out.add(r*W+k)}}
 for(let c=0;c<W;c++){let r=0;while(r<H){if(!b[r][c]){r++;continue}let start=r,t=b[r][c].type;r++;while(r<H&&b[r][c]?.type===t)r++;if(r-start>=3)for(let k=start;k<r;k++)out.add(k*W+c)}}return out}
function matchSpecial(matchSet,b){let rowCounts={},colCounts={};for(const i of matchSet){let r=Math.floor(i/W),c=i%W;rowCounts[r]=(rowCounts[r]||0)+1;colCounts[c]=(colCounts[c]||0)+1}let max=Math.max(0,...Object.values(rowCounts),...Object.values(colCounts));return max>=5?'bomb':max===4?'stripe':null}
function gravity(b){
 for(let c=0;c<W;c++){
  const survivors=[];
  for(let r=H-1;r>=0;r--)if(b[r][c]!=null)survivors.push(b[r][c]);
  let write=H-1;
  for(const candy of survivors)b[write--][c]=candy;
  while(write>=0)b[write--][c]=null;
 }
 return b;
}
function refill(b,random=randType){
 for(let c=0;c<W;c++)for(let r=H-1;r>=0;r--)if(b[r][c]==null)b[r][c]=newCandy(random,null);
 return b;
}
function settle(b,random=randType){gravity(b);refill(b,random);return b;}
function assertBoard(b){
 if(!Array.isArray(b)||b.length!==H||b.some(row=>!Array.isArray(row)||row.length!==W))throw Error('Board dimensions invalid');
 const invalid=b.some(row=>row.some(cell=>!cell||!Number.isInteger(cell.type)||cell.type<0||cell.type>=TYPES));
 if(invalid)throw Error('Board contains empty/invalid cells: '+JSON.stringify(b.map(row=>row.map(cell=>cell?cell.type:null))));
 return true;
}
function cascade(b,extra=new Set(),random=randType,cap=100){
 let total=0,iterations=0,created=[];
 while(iterations++<cap){
  const actual=findMatches(b),matched=new Set(actual);for(const i of extra)matched.add(i);
  if(!matched.size)break;
  const special=matchSpecial(actual,b);let keep=-1;
  if(special){keep=[...actual].sort((a,z)=>a-z).at(-1);created.push({index:keep,special});}
  total+=matched.size*60;
  for(const i of matched){if(i===keep)continue;b[Math.floor(i/W)][i%W]=null;}
  if(keep>=0){const r=Math.floor(keep/W),c=keep%W;b[r][c]=newCandy(random,special);}
  // Compact each column and refill from the top in one atomic pass.
  for(let c=0;c<W;c++){
   const survivors=[];for(let r=H-1;r>=0;r--)if(b[r][c]!=null)survivors.push(b[r][c]);
   let r=H-1;for(const item of survivors)b[r--][c]=item;
   while(r>=0)b[r--][c]=newCandy(random,null);
  }
  extra=new Set();
 }
 if(iterations>cap)throw Error('Cascade safety limit reached');
 // Final integrity guard: replace any malformed cell before it can reach rendering.
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){const cell=b[r][c];if(!cell||!Number.isInteger(cell.type)||cell.type<0||cell.type>=TYPES)b[r][c]=newCandy(random,null);}
 assertBoard(b);return {score:total,iterations:iterations-1,created};
}
function swapAndResolve(b,a,z,random=randType){
 const A=b[a.r][a.c],Z=b[z.r][z.c];b[a.r][a.c]=Z;b[z.r][z.c]=A;
 let extra=new Set();
 if(A.special==='bomb'||Z.special==='bomb'){
  const color=A.special==='bomb'?Z.type:A.type;
  for(let i=0;i<H*W;i++)if(b[Math.floor(i/W)][i%W]?.type===color)extra.add(i);
  extra.add(a.r*W+a.c);extra.add(z.r*W+z.c);
 }
 if(A.special==='stripe'||Z.special==='stripe'){
  for(const i of [a.r*W+a.c,z.r*W+z.c]){const r=Math.floor(i/W),c=i%W;for(let k=0;k<W;k++)extra.add(r*W+k);for(let k=0;k<H;k++)extra.add(k*W+c)}
 }
 const valid=findMatches(b).size>0||extra.size>0;
 if(!valid){b[a.r][a.c]=A;b[z.r][z.c]=Z;return {valid:false,score:0,iterations:0,created:[]}}
 return {valid:true,...cascade(b,extra,random)};
}
const Engine={W,H,TYPES,targetForLevel,worldForLevel,createBoard,findMatches,matchSpecial,gravity,refill,assertBoard,cascade,swapAndResolve};
if(typeof module!=='undefined'&&module.exports)module.exports=Engine;
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);
let board=[],score=0,moves=moveBase,level=1,unlocked=1,best=0,selected=null,busy=false,sound=true,starsByLevel={},bestByLevel={};
function load(){try{let s=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');level=Math.max(1,Number(s.level)||1);unlocked=Math.max(1,Number(s.unlocked)||1);best=Number(s.best)||0;starsByLevel=s.starsByLevel||{};bestByLevel=s.bestByLevel||{};sound=s.sound!==false;}catch{} level=Math.min(1000,level);unlocked=Math.min(1000,unlocked)}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:2,level,unlocked,best,starsByLevel,bestByLevel,sound}))}catch(e){$('message').textContent='Progress could not be saved. Check device storage.'}}
function fresh(){board=createBoard();score=0;moves=moveBase;selected=null;busy=false;render();update()}
function render(){const el=$('board');el.innerHTML='';for(let r=0;r<H;r++)for(let c=0;c<W;c++){let candy=board[r][c],b=document.createElement('button');b.className='cell'+(selected&&selected.r===r&&selected.c===c?' selected':'')+(candy?.special==='bomb'?' bomb':'')+(candy?.special==='stripe'?' striped':'');if(candy){b.style.background=colors[candy.type];b.textContent=candy.special==='bomb'?'🌈':emojis[candy.type];b.setAttribute('aria-label',`row ${r+1} col ${c+1} ${candy.special||'candy'}`)}else{b.classList.add('empty');b.disabled=true;b.setAttribute('aria-label',`empty cell row ${r+1} col ${c+1}`)}b.onclick=()=>tap(r,c);el.appendChild(b)}}
function update(){$('levelNum').textContent=level;$('target').textContent=targetForLevel(level);$('worldNum').textContent=worldForLevel(level);$('moves').textContent=moves;$('score').textContent=score.toLocaleString();$('best').textContent=best.toLocaleString();$('progressFill').style.width=Math.min(100,score/targetForLevel(level)*100)+'%';$('stars').textContent=starText(score);levelDisplay()}
function starCount(s){let t=targetForLevel(level);return s>=t*1.5?3:s>=t?2:s>=t*.55?1:0}
function starText(s){return '★'.repeat(starCount(s))+'☆'.repeat(3-starCount(s))}
function levelDisplay(){let e=$('levelList');e.innerHTML='';let start=Math.max(1,Math.floor((level-1)/30)*30+1),end=Math.min(1000,start+29);$('worldLabel').textContent='World '+worldForLevel(level)+' · Levels '+start+'–'+end;for(let n=start;n<=end;n++){let x=document.createElement('button');x.type='button';x.className='level-chip'+(n===level?' active':'')+(n<=unlocked?' unlocked':'');x.textContent=n;x.title=n<=unlocked?'Level '+n+' · '+(starsByLevel[n]||0)+' stars':'Locked';x.disabled=n>unlocked;x.setAttribute('aria-label',x.title);x.onclick=()=>{if(n<=unlocked){level=n;save();fresh();$('message').textContent='Ready for Level '+n+'!'}};e.appendChild(x)}}
function tap(r,c){if(busy||!board[r][c])return;if(!selected){selected={r,c};render();return}let a=selected;selected=null;if(a.r===r&&a.c===c){render();return}if(Math.abs(a.r-r)+Math.abs(a.c-c)!==1){selected={r,c};render();return}performSwap(a,{r,c})}
async function performSwap(a,z){if(busy)return;busy=true;let result=Engine.swapAndResolve(board,a,z);if(!result.valid){busy=false;render();$('message').textContent='No match—try another swap!';return}moves--;score+=result.score;render();update();$('message').textContent='Sweet match!';await wait(100);Engine.assertBoard(board);busy=false;render();update();if(score>=targets[level-1])win();else if(moves<=0)lose()}
function wait(ms){return new Promise(res=>setTimeout(res,ms))}
function win(){unlocked=Math.max(unlocked,Math.min(1000,level+1));best=Math.max(best,score);bestByLevel[level]=Math.max(Number(bestByLevel[level])||0,score);starsByLevel[level]=Math.max(Number(starsByLevel[level])||0,starCount(score));save();showModal('🎉','Level complete!',`You scored ${score.toLocaleString()} points!`,starText(score),'Continue',()=>{if(level<1000)level++;save();fresh();hideModal()})}
function lose(){best=Math.max(best,score);save();showModal('💔','Out of moves',`You scored ${score.toLocaleString()}. Try again!`,starText(score),'Retry',()=>{fresh();hideModal()})}
function showModal(icon,title,txt,stars,btn,fn){$('modalIcon').textContent=icon;$('modalTitle').textContent=title;$('modalText').textContent=txt;$('modalStars').textContent=stars;$('modalBtn').textContent=btn;$('modalBtn').onclick=fn;$('modal').classList.remove('hidden')}
function hideModal(){$('modal').classList.add('hidden')}
$('shuffleBtn').onclick=()=>{if(busy)return;fresh();$('message').textContent='Board shuffled!'}
$('hintBtn').onclick=()=>{if(busy)return;for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(let [dr,dc] of [[0,1],[1,0]]){let rr=r+dr,cc=c+dc;if(rr>=H||cc>=W)continue;let a={r,c},z={r:rr,c:cc};[board[r][c],board[rr][cc]]=[board[rr][cc],board[r][c]];let ok=Engine.findMatches(board).size>0;[board[r][c],board[rr][cc]]=[board[rr][cc],board[r][c]];if(ok){selected=a;render();$('message').textContent='Try the glowing candy!';return}}$('message').textContent='No hint found—shuffle the board.'}
$('resetBtn').onclick=()=>{if(confirm('Reset all Sugar Spark progress?')){localStorage.removeItem('sugarSparkSave');level=unlocked=1;best=0;fresh()}}
$('soundBtn').onclick=()=>{sound=!sound;$('soundBtn').textContent=sound?'🔊':'🔇';save()}
load();fresh();
})();