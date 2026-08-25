import type { CustomIndicator, Direction, EvaluationSkill, InputMode, StrategyIR } from './types';
import '../styles.css';

const $ = (id: string): any => document.getElementById(id);
let direction: Direction = 'UP';
let candidateValidated = false;
let activeFilter = 'attention';
let currentSkills: EvaluationSkill[] = [];
let inputMode: InputMode = 'visual';
const customIndicators: CustomIndicator[] = [];

let baselineCurve = simulateEquityCurve(0.128, 0.28, 38);
let candidateCurve: number[] = [];

function setWorkflow(stage: 'define'|'evaluate'|'improve'|'testnet') {
  const order=['define','evaluate','improve','testnet'];
  const current=order.indexOf(stage);
  document.querySelectorAll<HTMLElement>('[data-workflow]').forEach((step)=>{
    const index=order.indexOf(step.dataset.workflow||'');
    step.classList.toggle('active',index===current);
    step.classList.toggle('complete',index<current);
  });
}

function revealImprovement() {
  $('improveWorkspace').classList.remove('hidden');
  setWorkflow('improve');
  $('improveWorkspace').scrollIntoView({behavior:'smooth',block:'start'});
}

function simulateEquityCurve(targetReturn: number, volatility: number, seed: number): number[] {
  const points = 40;
  const raw = Array.from({length:points},(_,i)=>Math.sin((i+seed)*1.73)*.72+Math.sin((i+seed)*.47)*.38);
  let equity=100;
  const curve=[equity];
  for(let i=1;i<points;i++){
    const progress=i/(points-1);
    const shock=raw[i]??0;
    const regime=i>14&&i<22?-volatility*.62:0;
    equity=100+(targetReturn*100*progress)+(shock*volatility*8)+regime*18*Math.sin((i-14)/8*Math.PI);
    curve.push(Number(equity.toFixed(2)));
  }
  curve[curve.length-1]=Number((100*(1+targetReturn)).toFixed(2));
  return curve;
}

const skillDefinitions: EvaluationSkill[] = [
  {id:'temporal-integrity', label:'Temporal integrity', detail:'No future data detected', state:'pass', evidence:'31,680 feature timestamps checked · 0 violations', method:'Point-in-time feature lineage · Skill v1.0'},
  {id:'execution-realism', label:'Execution realism', detail:'Fees + 800ms latency modeled', state:'pass', evidence:'15 bps fee · 800 ms latency · partial fills enabled', method:'Event Contract fill simulation · Skill v1.0'},
  {id:'minimum-sample', label:'Minimum sample', detail:'67 trades · borderline', state:'warn', evidence:'67 trades across 52 independent windows', method:'Product evidence guardrail · Skill v1.0'},
  {id:'risk-profile', label:'Risk profile', detail:'Drawdown exceeds 20% guardrail', state:'fail', evidence:'Peak $142 → trough $102 · 7 consecutive losses', method:'Peak-to-trough drawdown · Skill v1.0'},
  {id:'parameter-stability', label:'Parameter stability', detail:'RSI threshold is locally fragile', state:'warn', evidence:'Return turns negative at RSI 35 and 41', method:'±5% / ±10% perturbation · Skill v1.0'},
  {id:'profit-concentration', label:'Profit concentration', detail:'Top 3 trades = 68% of profit', state:'fail', evidence:'Trades #08, #31, #54 · +$42.60', method:'Top-N contribution and leave-best-out · Skill v1.0'},
  {id:'deployment-readiness', label:'Deployment readiness', detail:'Hard gates incomplete', state:'fail', evidence:'Risk profile and concentration gates failed', method:'Non-compensating deployment gate · Skill v1.0'}
];

function strategyIR(): StrategyIR {
  return {
    version:'1.0', name:'RSI Reversal', universe:{underlying:$('asset').value, contract_window:`${$('window').value}m`},
    input_mode:inputMode,
    custom_indicators:customIndicators,
    features:[{id:'signal',type:$('indicator').value.toUpperCase(),period:$('indicator').value==='rsi'?14:5},{id:'market_filter',type:$('filterIndicator').value.toUpperCase(),period:20}],
    decision:{when:{all:[{left:'signal',op:$('operator').value==='lt'?'<':'>',right:Number($('threshold').value)},{left:'vol20',op:$('volOperator').value==='lt'?'<':'>',right:Number($('volatility').value)/100}]},action:direction},
    risk:{stake_usdso:Number($('stake').value),max_consecutive_losses:Number($('lossLimit').value)},
    execution:{data_tier:'RECONSTRUCTED',fee_bps:15,latency_ms:800}
  };
}

function renderSkills(defs: EvaluationSkill[]=skillDefinitions){
  currentSkills=defs;
  const visible=(s: EvaluationSkill)=>activeFilter==='all'||(activeFilter==='passed'?s.state==='pass':s.state!=='pass');
  $('skills').innerHTML=defs.map(s=>`<article class="skill ${s.state} ${visible(s)?'':'hidden'}" data-skill="${s.id}" tabindex="0"><span class="skill-icon">${s.state==='pass'?'✓':s.state==='fail'?'!':'~'}</span><div><b>${s.label}</b><small>${s.detail}</small></div><em>${s.state.toUpperCase()}</em></article>`).join('');
  $('attentionCount').textContent=defs.filter(s=>s.state!=='pass').length;
  $('passedCount').textContent=defs.filter(s=>s.state==='pass').length;
  document.querySelectorAll<HTMLElement>('.skill:not(.hidden)').forEach(el=>el.addEventListener('click',()=>showSkillDetail(el.dataset.skill)));
  const first=defs.find(visible); if(first) showSkillDetail(first.id);
}

function showSkillDetail(id?: string){
  const skill=currentSkills.find(s=>s.id===id); if(!skill)return;
  document.querySelectorAll<HTMLElement>('.skill').forEach(el=>el.classList.toggle('selected',el.dataset.skill===id));
  $('detailSeverity').textContent=skill.state==='fail'?'HIGH RISK':skill.state==='warn'?'REVIEW':'PASSED';
  $('detailSeverity').className=`status ${skill.state==='fail'?'fail':''}`;
  $('detailTitle').textContent=skill.label;$('detailFinding').textContent=`${skill.detail}.`;
  $('detailEvidence').textContent=skill.evidence;$('detailMethod').textContent=skill.method;
}

function pathFor(values: number[]): string {
  const combined=[...baselineCurve,...candidateCurve];const min=Math.min(...combined)-5,max=Math.max(...combined)+5,w=720,h=165;
  return values.map((v,i)=>`${i?'L':'M'} ${(i/(values.length-1)*w).toFixed(1)} ${(h-(v-min)/(max-min)*h+8).toFixed(1)}`).join(' ');
}

function drawChart(showCandidate=false){
  const svg=$('equityChart');
  const base=pathFor(baselineCurve); const cand=pathFor(candidateCurve);
  const baseEnd=baselineCurve.at(-1)?.toFixed(1);const candEnd=candidateCurve.at(-1)?.toFixed(1);
  svg.innerHTML=`<defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9e6cf" stop-opacity=".35"/><stop offset="1" stop-color="#b9e6cf" stop-opacity="0"/></linearGradient></defs>${[25,65,105,145].map(y=>`<line class="gridline" x1="0" x2="760" y1="${y}" y2="${y}"/>`).join('')}<path class="area" d="${base} L 720 190 L 0 190 Z"/><path class="baseline-line" d="${base}"/><circle class="baseline-dot" cx="720" cy="${base.split(' ').at(-1)}" r="4"/><text class="chart-label baseline-label" x="730" y="20">v1 ${baseEnd}</text>${showCandidate?`<path class="candidate-line" d="${cand}"/><circle class="candidate-dot" cx="720" cy="${cand.split(' ').at(-1)}" r="4"/><text class="chart-label candidate-label" x="730" y="36">v2 ${candEnd}</text>`:''}`;
}

function runBacktest(){
  const threshold=Number($('threshold').value), stake=Number($('stake').value), vol=Number($('volatility').value);
  const trades=Math.max(24,Math.round(82-Math.abs(threshold-42)*1.5-vol*2));
  const win=direction==='UP'?55+Math.min(5,(threshold-30)/4):52+Math.min(5,(45-threshold)/5);
  const dd=Math.min(39,15+stake*.85+Math.max(0,vol-2)*2.2);
  const ret=(win-50)*1.45-stake*.08+vol*.55;
  baselineCurve=simulateEquityCurve(ret/100,Math.min(.5,dd/100),Math.round(threshold+stake+vol));candidateCurve=[];
  $('netReturn').textContent=`${ret>=0?'+':''}${ret.toFixed(1)}%`;
  $('drawdown').textContent=`−${dd.toFixed(1)}%`;
  $('winRate').textContent=`${win.toFixed(1)}%`;
  $('tradeCount').textContent=`${trades} trades`;
  $('profitFactor').textContent=(1+Math.max(-.2,ret)/42).toFixed(2);
  const defs=skillDefinitions.map(s=>({...s}));
  const sample=defs.find(s=>s.id==='minimum-sample'); if(!sample) throw new Error('minimum-sample Skill missing'); sample.state=trades>=60?'pass':'warn';sample.detail=`${trades} trades · ${trades>=60?'guardrail met':'borderline'}`;
  const risk=defs.find(s=>s.id==='risk-profile');if(!risk) throw new Error('risk-profile Skill missing');risk.state=dd<=20?'pass':'fail';risk.detail=dd<=20?'Within 20% guardrail':'Drawdown exceeds 20% guardrail';
  risk.evidence=`Calculated drawdown ${dd.toFixed(1)}% · product guardrail 20%`;
  renderSkills(defs);drawChart(false);candidateValidated=false;resetCandidateUI();$('improveWorkspace').classList.add('hidden');$('evaluationResults').scrollIntoView({behavior:'smooth',block:'start'});showToast('Evaluation complete · Review the evidence before creating a Candidate');
}

function testCandidate(){
  $('testCandidate').disabled=true;$('testCandidate').textContent='Running holdout…';
  setTimeout(()=>{
    const baselineReturn=(baselineCurve.at(-1)??100)/100-1;candidateCurve=simulateEquityCurve(Math.max(.04,baselineReturn+.07),.12,71);
    candidateValidated=true;drawChart(true);$('candidateChartState').textContent='holdout complete';$('candidateChartState').className='ready';$('candidateLegend').className='candidate-legend ready';$('candidateLegendText').textContent='Validated candidate · v2';
    const card=$('validationCard');card.className='validation validated';
    $('validationStatus').textContent='VALIDATED';$('validationStatus').style.background='#dcefe3';$('validationStatus').style.color='#39775e';
    $('validationTitle').textContent='Improvement confirmed';$('validationCopy').textContent='Passed all hard gates on frozen holdout 2026-07. Coverage decreased, but risk-adjusted outcome improved.';
    $('compareDrawdown').textContent='28.4 → 17.1%';$('compareEv').textContent='$0.18 → $0.24';
    $('candidateVersion').className='version validated';$('versionState').textContent='VALIDATED';$('deployButton').disabled=false;$('deployButton').querySelector('small').textContent='DreamDEX testnet · dry-run';
    $('readinessScore').textContent='82';(document.querySelector('.score-ring') as HTMLElement).style.background='conic-gradient(#54b88a 82%, #e0e1da 0)';$('readinessLabel').textContent='Testnet ready';
    $('verdict').className='verdict positive';($('verdict').querySelector('.verdict-mark') as HTMLElement).textContent='✓';
    $('verdictTitle').textContent='Improvement validated on unseen data';$('verdictBody').textContent='Risk decreased without breaking evidence or execution gates. Lower coverage remains visible as a trade-off.';$('reviewImprovement').textContent='Review testnet order →';
    $('chartExplanation').textContent='Black = current strategy (v1). Green dashed = validated candidate (v2). Both use the same frozen holdout; endpoint labels show final equity.';
    $('testCandidate').textContent='Validation complete ✓';setWorkflow('testnet');showToast('Candidate validated · Testnet dry-run unlocked');
  },900);
}

function resetCandidateUI(){
  $('validationCard').className='validation locked';$('validationStatus').textContent='AWAITING TEST';$('validationStatus').removeAttribute('style');$('validationTitle').textContent='Independent validation';$('validationCopy').textContent='Candidate must pass the same seven Skills on data it has not seen.';$('compareDrawdown').textContent='—';$('compareEv').textContent='—';$('candidateVersion').className='version muted';$('versionState').textContent='PENDING';$('deployButton').disabled=true;$('deployButton').querySelector('small').textContent='Locked until validation';$('testCandidate').disabled=false;$('testCandidate').textContent='Validate candidate on unseen data';$('readinessScore').textContent='42';(document.querySelector('.score-ring') as HTMLElement).style.background='conic-gradient(var(--amber) 42%,#e0e1da 0)';$('readinessLabel').textContent='Sandbox only';
  $('verdict').className='verdict caution';($('verdict').querySelector('.verdict-mark') as HTMLElement).textContent='!';$('verdictTitle').textContent='Promising return, but not safe to deploy';$('verdictBody').textContent='The result relies on a few trades and drawdown is above your risk guardrail.';$('reviewImprovement').textContent='Review Agent improvement →';
  $('candidateLegend').className='candidate-legend hidden';$('candidateChartState').textContent='holdout complete';$('candidateChartState').className='';$('chartExplanation').textContent='Only the current strategy is shown. The green candidate curve appears after independent holdout validation.';setWorkflow('evaluate');
}

function showToast(message: string){const t=$('toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}

document.querySelectorAll<HTMLElement>('[data-direction]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-direction]').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');direction=btn.dataset.direction as Direction}));
document.querySelectorAll<HTMLElement>('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');inputMode=btn.dataset.mode as InputMode;
  $('visualBuilder').classList.toggle('hidden',inputMode!=='visual');$('pythonBuilder').classList.toggle('hidden',inputMode!=='python');
  $('viewIr').textContent=inputMode==='python'?'View sandbox contract →':'View Strategy IR →';
}));
$('addCondition').addEventListener('click',()=>showToast('MVP supports 2 visible rules · More conditions compile to the same Strategy IR'));
$('createIndicator').addEventListener('click',()=>$('indicatorDialog').showModal());
$('closeIndicator').addEventListener('click',()=>$('indicatorDialog').close());
$('saveIndicator').addEventListener('click',()=>{
  const name=$('customName').value.trim(),formula=$('customFormula').value.trim();
  const allowed=/^[a-zA-Z0-9_+\-*/().,\s]+$/.test(formula)&&!/(eval|exec|import|open|__|future|settlement)/i.test(formula);
  if(!name||!formula||!allowed){$('formulaStatus').textContent='Invalid formula · use registered functions and market fields only';$('formulaStatus').className='python-validation';return}
  const id=`custom_${Date.now()}`;const definition={id,name,formula,period:Number($('customPeriod').value),unit:$('customUnit').value};customIndicators.push(definition);
  [$('indicator'),$('filterIndicator')].forEach(select=>{let group:any=select.querySelector('optgroup[label="Custom indicators"]');if(!group){group=document.createElement('optgroup');group.label='Custom indicators';select.appendChild(group)}const option=document.createElement('option');option.value=id;option.textContent=`◇ ${name}`;group.appendChild(option)});
  $('indicator').value=id;$('formulaStatus').textContent='Formula validated · added to this strategy catalog';$('formulaStatus').className='python-validation pass';showToast(`${name} added to indicator catalog`);setTimeout(()=>$('indicatorDialog').close(),650);
});
$('validatePython').addEventListener('click',()=>{const code=$('pythonCode').value;const valid=code.includes('class Strategy')&&code.includes('def decide')&&!/(import\s+(os|sys|socket|subprocess)|open\s*\()/m.test(code);$('pythonValidation').textContent=valid?'Contract valid · Ready for isolated backtest':'Validation failed · Use Strategy.decide and allowed context only';$('pythonValidation').className=`python-validation ${valid?'pass':''}`;showToast(valid?'Python contract passed static validation':'Python contract needs attention')});
$('showMemories').addEventListener('click',()=>{const el=document.querySelector<HTMLElement>('.agent-brief');if(!el)return;el.classList.remove('memory-highlight');void el.offsetWidth;el.classList.add('memory-highlight');showToast('4 memories · 3 validated · 1 rejected · current match 87%')});
$('runButton').addEventListener('click',runBacktest);
document.querySelectorAll<HTMLElement>('[data-workflow]').forEach(step=>step.addEventListener('click',()=>{
  const target=step.dataset.workflow;
  if(target==='define'){$('strategyBuilder').scrollIntoView({behavior:'smooth',block:'start'});return}
  if(target==='evaluate'){$('evaluationResults').scrollIntoView({behavior:'smooth',block:'start'});return}
  if(target==='improve'){if($('improveWorkspace').classList.contains('hidden'))revealImprovement();else $('improveWorkspace').scrollIntoView({behavior:'smooth',block:'start'});return}
  if(candidateValidated){$('lineageBody').classList.remove('hidden');$('lineageBody').scrollIntoView({behavior:'smooth',block:'center'})}else showToast('Validate a Candidate before opening the testnet review');
}));
$('reviewImprovement').addEventListener('click',()=>candidateValidated?($('lineageBody').classList.remove('hidden'),$('lineageBody').scrollIntoView({behavior:'smooth',block:'center'})):revealImprovement());
$('testCandidate').addEventListener('click',testCandidate);
$('toggleSkills').addEventListener('click',()=>{const hidden=$('skillsBody').classList.toggle('hidden');$('toggleSkills').textContent=hidden?'Show full Skill report ↓':'Hide full Skill report ↑'});
$('toggleLineage').addEventListener('click',()=>{const hidden=$('lineageBody').classList.toggle('hidden');$('toggleLineage').textContent=hidden?'Show version history ↓':'Hide version history ↑'});
$('viewIr').addEventListener('click',()=>{$('irOutput').textContent=JSON.stringify(strategyIR(),null,2);$('irDialog').showModal()});
$('closeDialog').addEventListener('click',()=>$('irDialog').close());
$('copyIr').addEventListener('click',async()=>{await navigator.clipboard.writeText($('irOutput').textContent);showToast('Strategy IR copied')});
$('deployButton').addEventListener('click',()=>showToast('Dry-run created · No funds were submitted'));
$('resetDemo').addEventListener('click',()=>{resetCandidateUI();drawChart(false);renderSkills();$('improveWorkspace').classList.add('hidden');showToast('Demo reset to diagnosis')});
document.querySelectorAll<HTMLElement>('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');activeFilter=btn.dataset.filter||'attention';renderSkills(currentSkills)}));
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')runBacktest()});
renderSkills();drawChart(false);
