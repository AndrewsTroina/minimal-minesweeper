window.MOSS = window.MOSS || {};
MOSS.Game = (function(){
  let state=null, finished=false, started=false, seconds=0, timerId=null;
  let listeners={};
  function on(ev,fn){ (listeners[ev]=listeners[ev]||[]).push(fn); }
  function emit(ev,p){ (listeners[ev]||[]).forEach(fn=>fn(p)); }

  function newGame(config){
    stopTimer();
    finished=false; started=false; seconds=0;
    state = MOSS.createBoard(config.cols, config.rows, config.mines);
    emit('newgame',{state,config});
    emit('tick',{seconds});
    emit('mines',{remaining:state.mineCount});
  }
  function startTimer(){
    if(started) return;
    started=true;
    timerId=setInterval(()=>{ seconds++; emit('tick',{seconds}); },1000);
  }
  function stopTimer(){ if(timerId){ clearInterval(timerId); timerId=null; } }

  function reveal(r,c){
    if(finished||!state) return;
    const i=r*state.cols+c;
    if(state.revealed[i]||state.flagged[i]) return;
    startTimer();

    const stack=[[r,c]];
    let hitMine=false;

    while(stack.length){
      const [cr,cc]=stack.pop();
      const ci=cr*state.cols+cc;
      if(state.revealed[ci]||state.flagged[ci]) continue;
      if(state.counts[ci]===-1){ state.revealed[ci]=true; hitMine=true; break; }
      state.revealed[ci]=true;
      if(state.counts[ci]===0){
        for(let dr=-1;dr<=1;dr++){
          for(let dc=-1;dc<=1;dc++){
            if(dr===0&&dc===0) continue;
            const nr=cr+dr, nc=cc+dc;
            if(nr<0||nr>=state.rows||nc<0||nc>=state.cols) continue;
            const ni=nr*state.cols+nc;
            if(!state.revealed[ni]&&!state.flagged[ni]) stack.push([nr,nc]);
          }
        }
      }
    }

    emit('reveal',{state});
    if(hitMine) return endGame(false);
    if(checkWin()) return endGame(true);
  }

  function toggleFlag(r,c){
    if(finished||!state) return;
    const i=r*state.cols+c;
    if(state.revealed[i]) return;
    state.flagged[i]=!state.flagged[i];
    const remaining = state.mineCount - state.flagged.filter(Boolean).length;
    emit('flag',{state,r,c});
    emit('mines',{remaining:Math.max(0,remaining)});
  }

  // Vitória = TODAS as células não-mina reveladas
  function checkWin(){
    const total = state.cols * state.rows;
    const nonMineCells = total - state.mineCount;
    let revealedSafe = 0;
    for(let i=0;i<total;i++){
      if(state.counts[i] !== -1 && state.revealed[i]) revealedSafe++;
    }
    const won = revealedSafe === nonMineCells;
    if (won) console.log('[MOSS] win!', revealedSafe, '/', nonMineCells);
    return won;
  }

  function endGame(win){
    finished=true; stopTimer();
    if(!win){
      for(let i=0;i<state.counts.length;i++){
        if(state.counts[i]===-1) state.revealed[i]=true;
      }
    }
    emit('end',{state,win});
  }

  return { on, newGame, reveal, toggleFlag,
    getState:()=>state,
    isFinished:()=>finished,
    getSeconds:()=>seconds };
})();