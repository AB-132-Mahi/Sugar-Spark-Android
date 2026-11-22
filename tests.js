// Automated engine regression tests: run `node tests.js`
const assert=require('node:assert/strict');
const E=require('./game.js');
const {W,H}=E;
const candy=t=>({type:t,special:null});
function boardOf(rows){return rows.map(row=>row.map(candy))}
function deterministic(){let n=0;return ()=>n++%E.TYPES}
{
 let b=E.createBoard(()=>0,false);
 assert.equal(b.length,8);assert.ok(b.every(row=>row.length===8));
}
{
 let b=boardOf([
 [0,1,2,3,4,5,0,1],[1,2,3,4,5,0,1,2],[2,3,4,5,0,1,2,3],
 [3,4,5,0,1,2,3,4],[4,5,0,1,2,3,4,5],[5,0,1,2,3,4,5,0],
 [0,1,2,3,4,5,0,1],[1,2,3,4,5,0,1,2]]).map(row=>row.map(candy));
 b[0][0]=candy(3);b[0][1]=candy(3);b[0][2]=candy(3);
 assert.equal(E.findMatches(b).size,3,'horizontal triple found');
}
{
 let b=Array.from({length:8},()=>Array(8).fill(null));b[7][0]=candy(1);b[4][0]=candy(2);b[0][0]=candy(3);
 E.gravity(b);assert.equal(b[7][0].type,1);assert.equal(b[6][0].type,2);assert.equal(b[5][0].type,3);
 assert.equal(b[0][0],null);assert.equal(b[4][0],null);
}
{
 let b=Array.from({length:8},()=>Array(8).fill(null));b[7][0]=candy(4);
 E.refill(b,()=>2);assert.ok(b.every(row=>row.every(cell=>cell!==null)));
 assert.equal(b[7][0].type,4);assert.equal(b[0][0].type,2);
}
{
 let b=boardOf(Array.from({length:8},(_,r)=>Array.from({length:8},(_,c)=>(r+c)%6)));
 // force a triple after swap; use safe test configuration
 b[0][0]=candy(0);b[0][1]=candy(1);b[0][2]=candy(0);b[1][1]=candy(0);b[2][1]=candy(0);
 const res=E.swapAndResolve(b,{r:0,c:1},{r:0,c:0},deterministic);
 assert.equal(res.valid,true);E.assertBoard(b);assert.ok(res.score>=180);assert.ok(b.every(row=>row.every(Boolean)));
}
{
 let b=Array.from({length:8},()=>Array.from({length:8},()=>candy(1)));
 // Controlled triple-clearing with no accidental ambiguity: cascade must complete and refill board
 let result=E.cascade(b,new Set([0,1,2]),deterministic);
 assert.ok(result.score>=180);assert.ok(b.every(row=>row.every(Boolean)));assert.equal(b.length* b[0].length,64);
}
{
 // Repeated valid moves on refilled boards must retain the 64-cell invariant.
 let b=E.createBoard();let rng=deterministic();
 for(let n=0;n<25;n++){let found=false;for(let r=0;r<8&&!found;r++)for(let c=0;c<8&&!found;c++)for(const [dr,dc] of [[0,1],[1,0]]){if(r+dr>=8||c+dc>=8)continue;let res=E.swapAndResolve(b,{r,c},{r:r+dr,c:c+dc},rng);if(res.valid){found=true;E.assertBoard(b)}}assert.equal(b.flat().length,64);assert.ok(b.flat().every(Boolean));}
}
console.log('All Sugar Spark engine tests passed.');
{
 // Level configuration progression: original first 30 target values remain exact;
 // generated targets are increasing and world boundaries are every 30 levels.
 const legacy=Array.from({length:30},(_,i)=>500+Math.floor(i/3)*350+i*45);
 legacy.forEach((t,i)=>assert.equal(E.targetForLevel(i+1),t,`legacy level ${i+1} target retained`));
 for(let n=2;n<=1000;n++)assert.ok(E.targetForLevel(n)>E.targetForLevel(n-1),`target rises at level ${n}`);
 assert.equal(E.worldForLevel(1),1);assert.equal(E.worldForLevel(30),1);assert.equal(E.worldForLevel(31),2);assert.equal(E.worldForLevel(1000),34);
}
