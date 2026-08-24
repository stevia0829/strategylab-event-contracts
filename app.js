const $ = (id) => document.getElementById(id);
let direction = 'UP';
let candidateValidated = false;

const baselineCurve = [100,101,99,103,105,102,108,112,109,115,118,113,107,110,116,121,119,124,120,126,128,123,118,121,126,129,125,132,135,131,138,142,139,144,147,143,150,146,153,156];
const candidateCurve = [100,101,100,103,105,104,108,111,110,114,116,115,112,114,117,120,120,123,122,125,127,126,124,126,129,131,130,134,136,135,139,142,141,145,147,146,150,151,154,157];

const skillDefinitions = [
  {id:'temporal-integrity', label:'Temporal integrity', detail:'No future data detected', state:'pass'},
  {id:'execution-realism', label:'Execution realism', detail:'Fees + 800ms latency modeled', state:'pass'},
  {id:'minimum-sample', label:'Minimum sample', detail:'67 trades · borderline', state:'warn'},
  {id:'risk-profile', label:'Risk profile', detail:'Drawdown exceeds 20% guardrail', state:'fail'},
  {id:'parameter-stability', label:'Parameter stability', detail:'RSI threshold is locally fragile', state:'warn'},
  {id:'profit-concentration', label:'Profit concentration', detail:'Top 3 trades = 68% of profit', state:'fail'},
  {id:'deployment-readiness', label:'Deployment readiness', detail:'Hard gates incomplete', state:'fail'}
];

function strategyIR(){
  return {
    version:'1.0', name:'RSI Reversal', universe:{underlying:$('asset').value, contract_window:`${$('window').value}m`},
    features:[{id:'signal',type:$('indicator').value.toUpperCase(),period:$('indicator').value==='rsi'?14:5},{id:'vol20',type:'VOLATILITY',period:20}],
    decision:{when:{all:[{left:'signal',op:$('operator').value==='lt'?'<':'>',right:Number($('threshold').value)},{left:'vol20',op:$('volOperator').value==='lt'?'<':'>',right:Number($('volatility').value)/100}]},action:direction},
    risk:{stake_usdso:Number($('stake').value),max_consecutive_losses:Number($('lossLimit').value)},
    execution:{data_tier:'RECONSTRUCTED',fee_bps:15,latency_ms:800}
  };
}

function renderSkills(defs=skillDefinitions){
  $('skills').innerHTML=defs.map(s=>`<article class="skill ${s.state}"><span class="skill-icon">${s.state==='pass'?'✓':s.state==='fail'?'!':'~'}</span><div><b>${s.label}</b><small>${s.detail}</small></div><em>${s.state.toUpperCase()}</em></article>`).join('');
}

function pathFor(values){
  const min=90,max=165,w=760,h=175;
  return values.map((v,i)=>`${i?'L':'M'} ${(i/(values.length-1)*w).toFixed(1)} ${(h-(v-min)/(max-min)*h+8).toFixed(1)}`).join(' ');
}

function drawChart(showCandidate=false){
  const svg=$('equityChart');
  const base=pathFor(baselineCurve); const cand=pathFor(candidateCurve);
  svg.innerHTML=`<defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9e6cf" stop-opacity=".45"/><stop offset="1" stop-color="#b9e6cf" stop-opacity="0"/></linearGradient></defs>${[25,65,105,145].map(y=>`<line class="gridline" x1="0" x2="760" y1="${y}" y2="${y}"/>`).join('')}<path class="area" d="${base} L 760 190 L 0 190 Z"/><path class="baseline-line" d="${base}"/>${showCandidate?`<path class="candidate-line" d="${cand}"/>`:''}`;
}

function runBacktest(){
  const threshold=Number($('threshold').value), stake=Number($('stake').value), vol=Number($('volatility').value);
  const trades=Math.max(24,Math.round(82-Math.abs(threshold-42)*1.5-vol*2));
  const win=direction==='UP'?55+Math.min(5,(threshold-30)/4):52+Math.min(5,(45-threshold)/5);
  const dd=Math.min(39,15+stake*.85+Math.max(0,vol-2)*2.2);
  const ret=(win-50)*1.45-stake*.08+vol*.55;
  $('netReturn').textContent=`${ret>=0?'+':''}${ret.toFixed(1)}%`;
  $('drawdown').textContent=`−${dd.toFixed(1)}%`;
  $('winRate').textContent=`${win.toFixed(1)}%`;
  $('tradeCount').textContent=`${trades} trades`;
  $('profitFactor').textContent=(1+Math.max(-.2,ret)/42).toFixed(2);
  const defs=skillDefinitions.map(s=>({...s}));
  const sample=defs.find(s=>s.id==='minimum-sample'); sample.state=trades>=60?'pass':'warn';sample.detail=`${trades} trades · ${trades>=60?'guardrail met':'borderline'}`;
  const risk=defs.find(s=>s.id==='risk-profile');risk.state=dd<=20?'pass':'fail';risk.detail=dd<=20?'Within 20% guardrail':'Drawdown exceeds 20% guardrail';
  renderSkills(defs);drawChart(false);candidateValidated=false;resetCandidateUI();showToast('Backtest complete · 7 deterministic Skills executed');
}

function testCandidate(){
  $('testCandidate').disabled=true;$('testCandidate').textContent='Running holdout…';
  setTimeout(()=>{
    candidateValidated=true;drawChart(true);
    const card=$('validationCard');card.className='validation validated';
    $('validationStatus').textContent='VALIDATED';$('validationStatus').style.background='#dcefe3';$('validationStatus').style.color='#39775e';
    $('validationTitle').textContent='Improvement confirmed';$('validationCopy').textContent='Passed all hard gates on frozen holdout 2026-07. Coverage decreased, but risk-adjusted outcome improved.';
    $('compareDrawdown').textContent='28.4 → 17.1%';$('compareEv').textContent='$0.18 → $0.24';
    $('candidateVersion').className='version validated';$('versionState').textContent='VALIDATED';$('deployButton').disabled=false;
    $('readinessScore').textContent='82';document.querySelector('.score-ring').style.background='conic-gradient(#54b88a 82%, #e0e1da 0)';$('readinessLabel').textContent='Testnet ready';
    $('testCandidate').textContent='Validated on holdout';showToast('Candidate validated · Testnet deployment unlocked');
  },900);
}

function resetCandidateUI(){
  $('validationCard').className='validation locked';$('validationStatus').textContent='AWAITING TEST';$('validationStatus').removeAttribute('style');$('validationTitle').textContent='Independent validation';$('validationCopy').textContent='Candidate must pass the same seven Skills on data it has not seen.';$('compareDrawdown').textContent='—';$('compareEv').textContent='—';$('candidateVersion').className='version muted';$('versionState').textContent='PENDING';$('deployButton').disabled=true;$('testCandidate').disabled=false;$('testCandidate').textContent='Test on frozen holdout';$('readinessScore').textContent='42';document.querySelector('.score-ring').style.background='conic-gradient(var(--amber) 42%,#e0e1da 0)';$('readinessLabel').textContent='Sandbox only';
}

function showToast(message){const t=$('toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}

document.querySelectorAll('[data-direction]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-direction]').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');direction=btn.dataset.direction}));
$('runButton').addEventListener('click',runBacktest);
$('testCandidate').addEventListener('click',testCandidate);
$('viewIr').addEventListener('click',()=>{$('irOutput').textContent=JSON.stringify(strategyIR(),null,2);$('irDialog').showModal()});
$('closeDialog').addEventListener('click',()=>$('irDialog').close());
$('copyIr').addEventListener('click',async()=>{await navigator.clipboard.writeText($('irOutput').textContent);showToast('Strategy IR copied')});
$('deployButton').addEventListener('click',()=>showToast('Dry-run created · No funds were submitted'));
$('resetDemo').addEventListener('click',()=>{resetCandidateUI();drawChart(false);renderSkills();showToast('Demo reset to baseline')});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')runBacktest()});
renderSkills();drawChart(false);
