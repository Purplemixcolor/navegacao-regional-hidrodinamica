(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const defaults={dtc:{lm:5.976,lambda:59.407,sm:6.243,rhom:998.8,num:1.09e-6,rhos:1025,nus:1.19e-6,k:.094,g:9.81,points:[[1.335,20.34],[1.401,22.06],[1.469,24.14],[1.535,26.46],[1.602,28.99],[1.668,31.83]]},professor:{lm:4.3,lambda:30,sm:3.75,rhom:1000,num:1.14e-6,rhos:1025,nus:1.19e-6,k:.15,g:9.81,points:[[1.5,18]]}};
  const fields={lm:['Comprimento Lm','m','geometryInputs'],lambda:['Escala λ','—','geometryInputs'],sm:['Área molhada Sm','m²','geometryInputs'],k:['Fator de forma k','—','geometryInputs'],rhom:['Densidade ρm','kg/m³','waterInputs'],num:['Viscosidade νm','m²/s','waterInputs'],rhos:['Densidade ρs','kg/m³','waterInputs'],nus:['Viscosidade νs','m²/s','waterInputs'],g:['Gravidade g','m/s²','waterInputs']};
  const fmt=(x,n=2)=>x.toLocaleString('pt-BR',{minimumFractionDigits:n,maximumFractionDigits:n});
  const sci=x=>x.toExponential(6).replace('.',',');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let current=null,active='dtc',selectedIndex=5,visibleMethods={f:true,h:true},toastTimer,resizeFrame;
  for(const [key,[label,unit,parent]] of Object.entries(fields)){
    $(parent).insertAdjacentHTML('beforeend',`<div class="field ${key==='g'?'full-field':''}"><label for="${key}">${label}<span class="unit">${unit==='—'?'':unit}</span></label><input id="${key}" type="number" step="any" min="${key==='k'?0:'0.000000000001'}" required aria-label="${label}${unit==='—'?'':' ('+unit+')'}"></div>`);
  }
  function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').hidden=true;},2500);}
  function load(name){active=name;const p=defaults[name];for(const key of Object.keys(fields))$(key).value=p[key];$('points').value=p.points.map(a=>a.join('; ')).join('\n');selectedIndex=p.points.length-1;for(const [id,key] of [['loadDTC','dtc'],['loadProfessor','professor']])$(id).setAttribute('aria-pressed',String(name===key));update();}
  function read(){const p={};for(const [key,[label]] of Object.entries(fields)){if(!$(key).value.trim())throw new Error('Preencha '+label+'.');p[key]=Number($(key).value);}const points=$('points').value.split(/\r?\n/).filter(x=>x.trim()).map((line,i)=>{const cols=line.trim().split(';');if(cols.length!==2)throw new Error('Linha '+(i+1)+': use Vm; RTm.');return cols.map(v=>v.trim()?Number(v.trim().replace(',','.')):NaN);});return {p,points};}
  function selectedRow(){return current?current.result.rows[selectedIndex]:null;}
  function refreshSelection(){
    if(!current)return;
    const rows=current.result.rows;
    selectedIndex=Math.max(0,Math.min(rows.length-1,selectedIndex));const row=rows[selectedIndex];
    $('speedSelect').value=selectedIndex;$('detailSelect').value=selectedIndex;
    $('selectedSpeed').textContent=fmt(row.kn,2);$('selectedFn').textContent=fmt(row.fn,4);
    $('selectedTestLabel').textContent=`Ensaio ${selectedIndex+1} de ${rows.length}`;
    for(const [id,key] of [['selectedRTF','rtf'],['selectedRTH','rth'],['selectedPEF','pef'],['selectedPEH','peh']])$(id).textContent=fmt(row[key],2);
    const delta=row.rtf!==0?(row.rtf-row.rth)/row.rtf*100:NaN;
    $('methodDelta').innerHTML=Number.isFinite(delta)?`Diferença entre os métodos: <b>${fmt(Math.abs(delta),2)}%</b> na resistência total.`:'Revise os parâmetros e as resistências do ensaio.';
    document.querySelectorAll('#results tbody tr').forEach((tr,i)=>{tr.classList.toggle('selected',i===selectedIndex);tr.querySelector('button').setAttribute('aria-pressed',String(i===selectedIndex));});
    document.querySelectorAll('#speedTicks button').forEach((btn,i)=>btn.setAttribute('aria-pressed',String(i===selectedIndex)));
    showDetail();drawCharts();
  }
  function selectIndex(index){if(!current)return;selectedIndex=Math.max(0,Math.min(current.result.rows.length-1,Number(index)));hideTooltips();refreshSelection();}
  function update(){
    try{
      const {p,points}=read(),result=Extrapolacao.calcular(p,points);current={p,points,result};
      const original=defaults[active],modified=Object.keys(fields).some(k=>p[k]!==original[k])||JSON.stringify(points)!==JSON.stringify(original.points);
      $('caseTitle').textContent=active==='dtc'?(modified?'DTC · parâmetros ajustados':'Resultados do modelo DTC'):(modified?'Exercício · parâmetros ajustados':'Resultados do exercício');
      $('error').hidden=true;$('ls').textContent=fmt(result.ls,3)+' m';$('ss').textContent=fmt(result.ss,2)+' m²';$('count').textContent=result.rows.length+(result.rows.length===1?' ensaio':' ensaios');
      $('results').querySelector('tbody').innerHTML=result.rows.map((r,i)=>`<tr data-index="${i}"><td><button class="row-select" type="button" data-index="${i}" aria-label="Selecionar ensaio ${i+1}, Vm ${fmt(r.vm,3)} m/s" aria-pressed="false">${fmt(r.fn,4)}</button></td>`+[r.kn,r.rtf,r.rth,r.pef,r.peh].map(v=>`<td>${fmt(v,2)}</td>`).join('')+'</tr>').join('');
      $('warnings').innerHTML=result.rows.flatMap((r,i)=>r.warnings.map(s=>`<div class="warning">Ensaio ${i+1}: ${esc(s)}</div>`)).join('');
      $('speedSelect').max=result.rows.length-1;$('speedSelect').disabled=result.rows.length<2;
      $('speedTicks').innerHTML=result.rows.map((r,i)=>`<button type="button" data-index="${i}" aria-label="Selecionar velocidade ${fmt(r.kn,2)} nós" aria-pressed="false">${fmt(r.kn,1)}</button>`).join('');
      $('detailSelect').innerHTML=result.rows.map((r,i)=>`<option value="${i}">Vm = ${fmt(r.vm,3)} m/s</option>`).join('');
      const singleSpeed=new Set(result.rows.map(r=>r.vm)).size<2;
      $('chartNotice').hidden=!singleSpeed;
      $('chartNotice').textContent=singleSpeed?'Há apenas uma velocidade de ensaio. Os gráficos mostram um ponto para cada método. Para formar curvas, informe pelo menos duas velocidades diferentes.':'';
      $('csv').disabled=false;$('showMemory').disabled=false;refreshSelection();
    }catch(error){
      current=null;$('error').textContent=error.message;$('error').hidden=false;
      $('chartNotice').hidden=false;$('chartNotice').textContent='Não foi possível gerar os gráficos: '+error.message;
      for(const id of ['ls','ss','count','selectedSpeed','selectedFn','selectedRTF','selectedRTH','selectedPEF','selectedPEH','selectedTestLabel','methodDelta'])$(id).textContent='—';
      for(const id of ['rtChart','peChart','detail','detailSelect','speedTicks','warnings'])$(id).innerHTML='';
      $('results').querySelector('tbody').innerHTML='';$('csv').disabled=true;$('showMemory').disabled=true;$('speedSelect').disabled=true;hideTooltips();
    }
  }
  function yScale(values){
    let lo=Math.min(0,...values),hi=Math.max(0,...values);
    if(lo===hi)hi=lo+1;
    const raw=(hi-lo)/4,exponent=Math.pow(10,Math.floor(Math.log10(raw))),factor=raw/exponent;
    const step=([1,2,2.5,5,10].find(n=>n>=factor)||10)*exponent;
    lo=Math.floor(lo/step)*step;hi=Math.ceil(hi/step)*step;
    if(hi===lo)hi=lo+step;
    const ticks=[];for(let v=lo;v<=hi+step/100;v+=step)ticks.push(v);
    return {lo,hi,ticks};
  }
  function drawCharts(){if(!current)return;drawChart('rtChart','rtf','rth','kN');drawChart('peChart','pef','peh','kW');}
  function drawChart(id,keyF,keyH,unit){
    const svg=$(id),rows=current.result.rows,axis=$('xAxis').value;
    const w=Math.max(280,Math.round(svg.getBoundingClientRect().width)),h=Math.round(svg.getBoundingClientRect().height)||300,l=w<360?59:68,r=16,t=22,b=43;
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('height',String(h));
    let xmin=Math.min(...rows.map(v=>v[axis])),xmax=Math.max(...rows.map(v=>v[axis]));
    const pad=xmin===xmax?Math.abs(xmin)*.05||.01:(xmax-xmin)*.07;xmin-=pad;xmax+=pad;
    const keys=[...(visibleMethods.f?[keyF]:[]),...(visibleMethods.h?[keyH]:[])];
    const yr=yScale(rows.flatMap(v=>keys.map(k=>v[k])));
    const x=v=>l+(v-xmin)/(xmax-xmin)*(w-l-r),y=v=>h-b-(v-yr.lo)/(yr.hi-yr.lo)*(h-t-b);
    const selected=rows[selectedIndex],axisLabel=axis==='fn'?'Número de Froude (−)':axis==='kn'?'Velocidade do protótipo (nós)':'Velocidade do protótipo (m/s)';
    let str=`<title>${unit==='kN'?'Resistência total':'Potência efetiva'} nos ${rows.length} ensaios</title><desc>Froude em círculos verdes e Hughes em losangos dourados. Os pontos podem ser selecionados para explorar o cálculo.</desc><defs><linearGradient id="${id}Shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#497a40" stop-opacity=".06"/><stop offset="1" stop-color="#497a40" stop-opacity="0"/></linearGradient></defs>`;
    for(const yy of yr.ticks){const Y=y(yy);str+=`<line class="grid-line" x1="${l}" x2="${w-r}" y1="${Y}" y2="${Y}"/><text class="axis-text" x="${l-12}" y="${Y+4}" text-anchor="end">${fmt(yy,yr.hi-yr.lo<5?1:0)}</text>`;}
    const tickCount=w<400?3:4;
    for(let i=0;i<=tickCount;i++){const xx=xmin+(xmax-xmin)*i/tickCount;str+=`<text class="axis-text" x="${x(xx)}" y="${h-b+22}" text-anchor="middle">${fmt(xx,axis==='fn'?3:1)}</text>`;}
    str+=`<text class="axis-label" x="${(w+l-r)/2}" y="${h-3}" text-anchor="middle">${axisLabel}</text><line class="selected-line" x1="${x(selected[axis])}" x2="${x(selected[axis])}" y1="${t}" y2="${h-b}"/>`;
    const sorted=rows.map((row,index)=>({row,index})).sort((a,b)=>a.row[axis]-b.row[axis]);
    if(visibleMethods.f&&rows.length>1){const pts=sorted.map(({row:v})=>`${x(v[axis])},${y(v[keyF])}`).join(' ');str+=`<polygon points="${x(sorted[0].row[axis])},${y(Math.max(0,yr.lo))} ${pts} ${x(sorted.at(-1).row[axis])},${y(Math.max(0,yr.lo))}" fill="url(#${id}Shade)"/>`;}
    for(const [method,key,color,name] of [['f',keyF,'#236c55','Froude'],['h',keyH,'#a77b3f','Hughes']]){
      if(!visibleMethods[method])continue;
      const pts=sorted.map(({row:v})=>`${x(v[axis])},${y(v[key])}`).join(' ');
      if(rows.length>1)str+=`<polyline class="series-line" data-series="${method}" points="${pts}" stroke="${color}" fill="none" stroke-width="2.2" ${method==='h'?'stroke-dasharray="5 5"':''}/>`;
      for(const {row:v,index} of sorted){const X=x(v[axis]),Y=y(v[key]),rad=index===selectedIndex?5.3:3.7,label=`Ensaio ${index+1}, ${name}: ${fmt(v[key],2)} ${unit}, Fn ${fmt(v.fn,4)}`;
        str+=`<g class="data-mark" data-index="${index}" data-series="${method}" data-x="${X}" data-y="${Y}" role="button" tabindex="0" aria-label="${esc(label)}" aria-pressed="${index===selectedIndex}"><circle cx="${X}" cy="${Y}" r="11" fill="transparent"/>${index===selectedIndex?`<circle cx="${X}" cy="${Y}" r="9.5" stroke="${color}" stroke-width="1" fill="white" stroke-opacity=".3"/>`:''}${method==='f'?`<circle class="dot" cx="${X}" cy="${Y}" r="${rad}" fill="${color}"/>`:`<polygon points="${X},${Y-rad-1} ${X+rad+1},${Y} ${X},${Y+rad+1} ${X-rad-1},${Y}" fill="${color}"/>`}</g>`;
      }
    }
    svg.innerHTML=str;
  }
  function hideTooltips(){$('rtTooltip').hidden=true;$('peTooltip').hidden=true;}
  function showTooltip(chartId,mark){
    if(!current)return;const index=Number(mark.dataset.index),row=current.result.rows[index],isRT=chartId==='rtChart';
    const tip=$(isRT?'rtTooltip':'peTooltip'),panel=$(isRT?'rtPanel':'pePanel'),svg=$(chartId);
    tip.innerHTML=`<strong>${fmt(row.kn,2)} nós · Fn ${fmt(row.fn,4)}</strong><div>Froude<span>${fmt(row[isRT?'rtf':'pef'],2)} ${isRT?'kN':'kW'}</span></div><div class="gold">Hughes<span>${fmt(row[isRT?'rth':'peh'],2)} ${isRT?'kN':'kW'}</span></div>`;
    tip.hidden=false;const sr=svg.getBoundingClientRect(),pr=panel.getBoundingClientRect();
    tip.style.left=Math.max(12,Math.min(sr.left-pr.left+Number(mark.dataset.x)-tip.offsetWidth/2,panel.clientWidth-tip.offsetWidth-12))+'px';
    tip.style.top=Math.max(43,Math.min(sr.top-pr.top+Number(mark.dataset.y)-tip.offsetHeight-16,panel.clientHeight-tip.offsetHeight-38))+'px';
  }
  for(const id of ['rtChart','peChart']){
    $(id).addEventListener('pointerover',e=>{const mark=e.target.closest('.data-mark');if(mark)showTooltip(id,mark);});
    $(id).addEventListener('focusin',e=>{const mark=e.target.closest('.data-mark');if(mark)showTooltip(id,mark);});
    $(id).addEventListener('pointerleave',hideTooltips);$(id).addEventListener('focusout',hideTooltips);
    $(id).addEventListener('click',e=>{const mark=e.target.closest('.data-mark');if(mark)selectIndex(mark.dataset.index);});
    $(id).addEventListener('keydown',e=>{const mark=e.target.closest('.data-mark');if(mark&&(e.key==='Enter'||e.key===' ')){e.preventDefault();const {index,series}=mark.dataset;selectIndex(index);$(id).querySelector(`[data-index="${index}"][data-series="${series}"]`)?.focus({preventScroll:true});}});
  }
  function showDetail(){
    if(!current)return;const {p,result}=current,r=selectedRow();
    const groups=[['01','Escala, velocidade e Reynolds',[
      `Ensaio: Vm = ${fmt(r.vm,3)} m/s; RTm = ${fmt(r.rtm,2)} N.`,
      `Ls = λ × Lm = ${fmt(p.lambda,3)} × ${fmt(p.lm,3)} = ${fmt(result.ls,6)} m`,
      `Ss = λ² × Sm = ${fmt(p.lambda,3)}² × ${fmt(p.sm,3)} = ${fmt(result.ss,6)} m²`,
      `Vs = Vm × √λ = ${fmt(r.vs,6)} m/s = ${fmt(r.kn,4)} nós`,
      `Fn = Vm / √(g × Lm) = ${fmt(r.fn,6)}`,
      `Rem = Vm × Lm / νm = ${sci(r.rem)}`,
      `Res = Vs × Ls / νs = ${sci(r.res)}`]],
      ['02','Coeficientes do modelo e de atrito',[
      `CTm = RTm / (0,5 × ρm × Sm × Vm²) = ${fmt(r.ctm,9)}`,
      `CFm = 0,075 / (log10(Rem) − 2)² = ${fmt(r.cfm,9)}`,
      `CFs = 0,075 / (log10(Res) − 2)² = ${fmt(r.cfs,9)}`]],
      ['03','Extrapolação por Froude',[
      `CRm = CTm − CFm = ${fmt(r.cr,9)}`,
      `CTs,F = CRm + CFs = ${fmt(r.ctf,9)}`,
      `RTs,F = CTs,F × 0,5 × ρs × Ss × Vs² = ${fmt(r.rtf,3)} kN`,
      `PE,F = RTs,F × Vs = ${fmt(r.pef,3)} kW`]],
      ['04','Extrapolação por Hughes',[
      `1+k = ${fmt(1+p.k,3)}`,
      `CWm = CTm − (1+k)CFm = ${fmt(r.cw,9)}`,
      `CTs,H = CWm + (1+k)CFs = ${fmt(r.cth,9)}`,
      `RTs,H = CTs,H × 0,5 × ρs × Ss × Vs² = ${fmt(r.rth,3)} kN`,
      `PE,H = RTs,H × Vs = ${fmt(r.peh,3)} kW`]]];
    const openStates=[...$('detail').querySelectorAll('details')].map(d=>d.open);
    $('detail').innerHTML=groups.map(([num,title,lines],i)=>`<details class="memory-step" ${openStates.length?(openStates[i]?'open':''):(i===0?'open':'')}><summary><span class="step-index">${num}</span>${title}</summary><div class="formulas">${lines.map((line,j)=>`<div class="formula ${i>1&&j>=lines.length-2?'formula-result':''}">${esc(line)}</div>`).join('')}</div></details>`).join('');
  }
  function exportCSV(){
    if(!current)return;const cols=['vm','rtm','fn','vs','kn','rem','res','ctm','cfm','cfs','cr','ctf','rtf','pef','cw','cth','rth','peh'];
    const heads=['Vm (m/s)','RTm (N)','Fn','Vs (m/s)','Vs (nós)','Rem','Res','CTm','CFm','CFs','CRm','CTs Froude','RTs Froude (kN)','PE Froude (kW)','CWm','CTs Hughes','RTs Hughes (kN)','PE Hughes (kW)'];
    const csv='\ufeff'+heads.join(';')+'\r\n'+current.result.rows.map(r=>cols.map(k=>String(r[k]).replace('.',',')).join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='ensaios-froude-hughes.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  const original=Extrapolacao.calcular(defaults.professor,defaults.professor.points).rows[0];
  const checks=[['Vs (m/s)',8.22,original.vs],['Fn (−)',.23,original.fn],['RT Froude (kN)',292.18,original.rtf],['PE Froude (kW)',2401.7,original.pef],['RT Hughes (kN)',261.2,original.rth],['PE Hughes (kW)',2147.1,original.peh]];
  $('validation').innerHTML=checks.map(([name,expected,actual])=>`<tr><td>${name}</td><td>${fmt(expected,3)}</td><td>${fmt(actual,3)}</td><td>${fmt(Math.abs(actual/expected-1)*100,3)}%</td></tr>`).join('');
  for(const key of Object.keys(fields))$(key).addEventListener('input',update);
  $('points').addEventListener('input',update);$('xAxis').addEventListener('change',()=>{hideTooltips();drawCharts();});
  $('speedSelect').addEventListener('input',e=>selectIndex(e.target.value));$('detailSelect').addEventListener('change',e=>selectIndex(e.target.value));
  $('speedTicks').addEventListener('click',e=>{const btn=e.target.closest('button[data-index]');if(btn)selectIndex(btn.dataset.index);});
  $('results').addEventListener('click',e=>{const row=e.target.closest('tbody tr[data-index]');if(row)selectIndex(row.dataset.index);});
  $('loadDTC').onclick=()=>load('dtc');$('loadProfessor').onclick=()=>load('professor');$('resetData').onclick=()=>{load(active);toast('Dados de referência restaurados.');};
  $('showMemory').onclick=()=>{$('calculos').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
  $('csv').onclick=exportCSV;$('print').onclick=()=>window.print();
  for(const [id,key] of [['toggleFroude','f'],['toggleHughes','h']])$(id).onclick=()=>{
    const other=key==='f'?'h':'f';if(visibleMethods[key]&&!visibleMethods[other])return;
    visibleMethods[key]=!visibleMethods[key];
    for(const [button,k] of [['toggleFroude','f'],['toggleHughes','h']]){$(button).setAttribute('aria-pressed',String(visibleMethods[k]));$(button).disabled=visibleMethods[k]&&!visibleMethods[k==='f'?'h':'f'];}
    hideTooltips();drawCharts();
  };
  let printStates=[];
  window.addEventListener('beforeprint',()=>{printStates=[...document.querySelectorAll('details')].map(d=>[d,d.open]);for(const [d] of printStates)d.open=true;drawCharts();});
  window.addEventListener('afterprint',()=>{for(const [d,open] of printStates)d.open=open;drawCharts();});
  if('ResizeObserver' in window){const observer=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(drawCharts);});for(const id of ['rtPanel','pePanel'])observer.observe($(id));}
  if('IntersectionObserver' in window){const navObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.nav-links a[href^="#"]').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-85px 0px -55% 0px',threshold:0});for(const id of ['laboratorio','curvas','referencia'])navObserver.observe($(id));}
  load('dtc');
})();
