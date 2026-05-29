const raw = window.ALICUOTAS_DATA || [];
const fmtPct = v => (Number.isFinite(v) ? v.toLocaleString('es-AR', {minimumFractionDigits:1, maximumFractionDigits:2}) : 's/d') + '%';
const $ = id => document.getElementById(id);

const state = { products: [], jurisdictions: [], metricMode: 'avg', topN: 15 };
let barChart, histChart, productChart, mapGeo = null;
const tooltip = document.createElement('div'); tooltip.className = 'tooltip'; tooltip.style.display='none'; document.body.appendChild(tooltip);

const nameMap = {
  'Ciudad Autónoma de Buenos Aires':'CABA','CABA':'CABA','Buenos Aires':'Buenos Aires',
  'Catamarca':'Catamarca','Chaco':'Chaco','Chubut':'Chubut','Córdoba':'Córdoba','Cordoba':'Córdoba',
  'Corrientes':'Corrientes','Entre Ríos':'Entre Ríos','Entre Rios':'Entre Ríos','Formosa':'Formosa',
  'Jujuy':'Jujuy','La Pampa':'La Pampa','La Rioja':'La Rioja','Mendoza':'Mendoza','Misiones':'Misiones',
  'Neuquén':'Neuquén','Neuquen':'Neuquén','Río Negro':'Río Negro','Rio Negro':'Río Negro',
  'Salta':'Salta','San Juan':'San Juan','San Luis':'San Luis','Santa Cruz':'Santa Cruz','Santa Fe':'Santa Fe',
  'Santiago del Estero':'Santiago del Estero','Tierra del Fuego, Antártida e Islas del Atlántico Sur':'Tierra del Fuego',
  'Tierra del Fuego':'Tierra del Fuego','Tucumán':'Tucumán','Tucuman':'Tucumán'
};

const products = Array.from(new Map(raw.map(d => [`${d.actividad} · ${d.descripcion}`, {key:`${d.actividad} · ${d.descripcion}`, actividad:d.actividad, descripcion:d.descripcion}])).values())
  .sort((a,b)=>a.key.localeCompare(b.key,'es'));
const jurisdictions = [...new Set(raw.map(d=>d.jurisdiccion))].sort((a,b)=>a.localeCompare(b,'es'));

function fillSelects(){
  renderProductOptions('');
  renderJurisdictionOptions('');
  $('jurisdictionSelect').value = '';
  for (const opt of $('jurisdictionSelect').options) opt.selected = true;
  state.jurisdictions = jurisdictions.slice();
}
function renderProductOptions(q){
  const sel = $('productSelect'), selected = new Set([...sel.selectedOptions].map(o=>o.value));
  const filtered = products.filter(p => p.key.toLowerCase().includes(q.toLowerCase())).slice(0, 700);
  sel.innerHTML = filtered.map(p => `<option value="${escapeHtml(p.key)}" ${selected.has(p.key)?'selected':''}>${escapeHtml(p.key)}</option>`).join('');
}
function renderJurisdictionOptions(q){
  const sel = $('jurisdictionSelect'), selected = new Set([...sel.selectedOptions].map(o=>o.value));
  sel.innerHTML = jurisdictions.filter(j=>j.toLowerCase().includes(q.toLowerCase())).map(j => `<option value="${escapeHtml(j)}" ${selected.has(j)?'selected':''}>${escapeHtml(j)}</option>`).join('');
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}

function selectedProducts(){ return [...$('productSelect').selectedOptions].map(o=>o.value); }
function selectedJurisdictions(){ return [...$('jurisdictionSelect').selectedOptions].map(o=>o.value); }

function filteredData(){
  const ps = selectedProducts(), js = selectedJurisdictions();
  state.products = ps; state.jurisdictions = js.length ? js : jurisdictions.slice();
  return raw.filter(d => (ps.length===0 || ps.includes(`${d.actividad} · ${d.descripcion}`)) && state.jurisdictions.includes(d.jurisdiccion));
}
function aggregateByJurisdiction(data){
  const m = new Map();
  for (const d of data){
    if(!m.has(d.jurisdiccion)) m.set(d.jurisdiccion, []);
    m.get(d.jurisdiccion).push(+d.alicuota);
  }
  return [...m.entries()].map(([jur, arr]) => ({
    jur, count: arr.length, value: metric(arr), min: Math.min(...arr), max: Math.max(...arr), avg: arr.reduce((a,b)=>a+b,0)/arr.length
  })).sort((a,b)=>b.value-a.value);
}
function metric(arr){
  if(!arr.length) return NaN;
  if(state.metricMode==='max') return Math.max(...arr);
  if(state.metricMode==='min') return Math.min(...arr);
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}
function update(){
  state.metricMode = document.querySelector('input[name="metricMode"]:checked').value;
  state.topN = +$('topN').value; $('topNLabel').textContent = `${state.topN} jurisdicciones`;
  const data = filteredData();
  const byJur = aggregateByJurisdiction(data);
  updateKpis(data, byJur);
  drawBar(byJur.slice(0,state.topN));
  drawHist(data);
  drawProducts(data);
  drawTable(data);
  drawMap(byJur);
}
function updateKpis(data, byJur){
  $('kpiRows').textContent = data.length.toLocaleString('es-AR');
  $('kpiJur').textContent = new Set(data.map(d=>d.jurisdiccion)).size;
  $('kpiProd').textContent = new Set(data.map(d=>`${d.actividad} · ${d.descripcion}`)).size.toLocaleString('es-AR');
  $('kpiAvg').textContent = fmtPct(metric(data.map(d=>+d.alicuota)));
}
function chartDefaults(){
  Chart.defaults.font.family = 'Inter, Segoe UI, Arial';
  Chart.defaults.color = '#334155';
}
function drawBar(rows){
  const ctx = $('barChart');
  if(barChart) barChart.destroy();
  barChart = new Chart(ctx, {type:'bar', data:{labels:rows.map(r=>r.jur), datasets:[{label:'Alícuota', data:rows.map(r=>r.value), borderWidth:1}]},
    options:{responsive:true, plugins:{legend:{display:false}, tooltip:{callbacks:{label:c=>fmtPct(c.raw)}}}, scales:{y:{ticks:{callback:v=>v+'%'}}}}});
}
function drawHist(data){
  const bins = [0,1,2,3,4,5,6,7,8,9,10,12,15,20]; const counts = bins.slice(0,-1).map(()=>0);
  for(const d of data){ for(let i=0;i<bins.length-1;i++){ if(d.alicuota>=bins[i] && d.alicuota<bins[i+1]){counts[i]++; break;} } }
  if(histChart) histChart.destroy();
  histChart = new Chart($('histChart'), {type:'bar', data:{labels:bins.slice(0,-1).map((b,i)=>`${b}-${bins[i+1]}%`), datasets:[{label:'Registros', data:counts}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}});
}
function drawProducts(data){
  const m = new Map();
  for(const d of data){ const k=`${d.actividad} · ${d.descripcion}`; if(!m.has(k)) m.set(k,[]); m.get(k).push(+d.alicuota); }
  const rows=[...m.entries()].map(([k,a])=>({k, v:metric(a)})).sort((a,b)=>b.v-a.v).slice(0,12);
  if(productChart) productChart.destroy();
  productChart = new Chart($('productChart'), {type:'bar', data:{labels:rows.map(r=>r.k.length>44?r.k.slice(0,44)+'…':r.k), datasets:[{label:'Alícuota', data:rows.map(r=>r.v)}]},
    options:{indexAxis:'y', plugins:{legend:{display:false}, tooltip:{callbacks:{label:c=>fmtPct(c.raw)}}}, scales:{x:{ticks:{callback:v=>v+'%'}}}}});
}
function drawTable(data){
  const tb = $('resultsTable').querySelector('tbody');
  tb.innerHTML = data.slice(0,1000).map(d=>`<tr><td>${escapeHtml(d.jurisdiccion)}</td><td>${escapeHtml(d.actividad)}</td><td>${escapeHtml(d.descripcion)}</td><td>${fmtPct(d.alicuota)}</td><td>${escapeHtml(d.tituloNota||'')}</td></tr>`).join('');
}
function colorScale(values){
  const valid=values.filter(Number.isFinite); const min=Math.min(...valid), max=Math.max(...valid);
  return v => {
    if(!Number.isFinite(v)) return '#e5e7eb';
    const t = max===min ? .55 : (v-min)/(max-min);
    return d3.interpolateRgbBasis(['#8b5cf6','#60a5fa','#22d3ee','#20c997'])(t);
  };
}
async function initMap(){
  try{
    const urls=[
      'https://cdn.jsdelivr.net/gh/ign-argentina/georef-ar-api@master/datos/limites-provinciales.geojson',
      'https://raw.githubusercontent.com/ign-argentina/georef-ar-api/master/datos/limites-provinciales.geojson'
    ];
    for (const url of urls){
      try{ const r=await fetch(url); if(r.ok){ mapGeo=await r.json(); break; } } catch(e){}
    }
    $('mapStatus').textContent = mapGeo ? 'Mapa geográfico cargado. Pase el cursor sobre una provincia.' : 'No se pudo cargar el mapa geográfico. Se muestra mapa esquemático.';
  } catch(e){ $('mapStatus').textContent = 'Se muestra mapa esquemático.'; }
  update();
}
function drawMap(byJur){
  const svg=d3.select('#argMap'); svg.selectAll('*').remove();
  const values = new Map(byJur.map(d=>[d.jur,d]));
  const color = colorScale(byJur.map(d=>d.value));
  if(mapGeo && mapGeo.features){
    const projection=d3.geoMercator().fitSize([720,900], mapGeo);
    const path=d3.geoPath(projection);
    svg.append('g').attr('transform','translate(20,20)').selectAll('path').data(mapGeo.features).join('path')
      .attr('class','province').attr('d',path).attr('fill', f => {
        const n=nameMap[f.properties.nombre] || nameMap[f.properties.name] || f.properties.nombre; return color(values.get(n)?.value);
      }).on('mousemove',(ev,f)=>{
        const n=nameMap[f.properties.nombre] || f.properties.nombre; const r=values.get(n);
        showTip(ev, `<b>${n}</b><br>Alícuota: ${r?fmtPct(r.value):'s/d'}<br>Registros: ${r?r.count:0}`);
      }).on('mouseleave', hideTip);
  } else {
    drawFallbackMap(svg, values, color);
  }
  drawLegend(svg, byJur.map(d=>d.value));
}
function drawFallbackMap(svg, values, color){
  const nodes=[
    ['Jujuy',270,60],['Salta',230,110],['Formosa',410,110],['Chaco',390,165],['Tucumán',275,170],['Catamarca',235,220],['Santiago del Estero',330,220],
    ['Misiones',520,220],['Corrientes',465,260],['La Rioja',240,285],['Santa Fe',385,320],['San Juan',205,350],['Córdoba',320,375],['Entre Ríos',430,385],
    ['Mendoza',190,440],['San Luis',270,445],['Buenos Aires',395,505],['CABA',475,495],['La Pampa',290,535],['Neuquén',220,620],['Río Negro',310,670],
    ['Chubut',310,755],['Santa Cruz',330,840],['Tierra del Fuego',420,925]
  ];
  svg.selectAll('rect').data(nodes).join('rect').attr('class','province').attr('rx',18).attr('x',d=>d[1]).attr('y',d=>d[2]).attr('width',110).attr('height',48)
    .attr('fill',d=>color(values.get(d[0])?.value)).on('mousemove',(ev,d)=>{const r=values.get(d[0]);showTip(ev,`<b>${d[0]}</b><br>Alícuota: ${r?fmtPct(r.value):'s/d'}<br>Registros: ${r?r.count:0}`)}).on('mouseleave',hideTip);
  svg.selectAll('text.province-label').data(nodes).join('text').attr('class','province-label').attr('x',d=>d[1]+55).attr('y',d=>d[2]+28).attr('text-anchor','middle').text(d=>d[0]);
}
function drawLegend(svg, vals){
  const g=svg.append('g').attr('class','legend').attr('transform','translate(580,780)');
  const defs=svg.append('defs'); const grad=defs.append('linearGradient').attr('id','grad').attr('x1','0%').attr('x2','0%').attr('y1','100%').attr('y2','0%');
  grad.append('stop').attr('offset','0%').attr('stop-color','#8b5cf6'); grad.append('stop').attr('offset','33%').attr('stop-color','#60a5fa'); grad.append('stop').attr('offset','66%').attr('stop-color','#22d3ee'); grad.append('stop').attr('offset','100%').attr('stop-color','#20c997');
  g.append('text').attr('x',0).attr('y',-12).text('Menor tasa'); g.append('rect').attr('width',44).attr('height',140).attr('fill','url(#grad)').attr('rx',10); g.append('text').attr('x',0).attr('y',162).text('Mayor tasa');
}
function showTip(ev, html){tooltip.innerHTML=html; tooltip.style.display='block'; tooltip.style.left=(ev.clientX+14)+'px'; tooltip.style.top=(ev.clientY+14)+'px';}
function hideTip(){tooltip.style.display='none';}
function downloadCsv(){
  const data=filteredData();
  const header=['jurisdiccion','actividad','descripcion','alicuota','anio','tituloNota'];
  const lines=[header.join(';'), ...data.map(d=>header.map(h=>`"${String(d[h]??'').replace(/"/g,'""')}"`).join(';'))];
  const blob=new Blob([lines.join('\n')], {type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='alicuotas_filtradas.csv'; a.click(); URL.revokeObjectURL(a.href);
}

$('productSearch').addEventListener('input', e=>renderProductOptions(e.target.value));
$('jurisdictionSearch').addEventListener('input', e=>renderJurisdictionOptions(e.target.value));
$('productSelect').addEventListener('change', update); $('jurisdictionSelect').addEventListener('change', update);
document.querySelectorAll('input[name="metricMode"]').forEach(x=>x.addEventListener('change', update));
$('topN').addEventListener('input', update);
$('selectAllJurisdictions').addEventListener('click',()=>{[...$('jurisdictionSelect').options].forEach(o=>o.selected=true); update();});
$('clearFilters').addEventListener('click',()=>{[...$('productSelect').options].forEach(o=>o.selected=false);[...$('jurisdictionSelect').options].forEach(o=>o.selected=true); update();});
$('downloadCsv').addEventListener('click', downloadCsv);

chartDefaults(); fillSelects(); initMap();
