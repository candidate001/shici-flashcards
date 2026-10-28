(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let words = [];
  try { const stored=JSON.parse(localStorage.getItem('shici-deck-v1') || '[]'); if(Array.isArray(stored)) words=stored; } catch (_) {}
  const STORAGE = 'shici-mastered-v1';
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(STORAGE) || '[]'); if (!Array.isArray(saved)) saved = []; } catch (_) {}
  let mastered = new Set(saved), current = [], index = 0, revealed = false;
  function list() {
    const query = $('search').value.trim().toLowerCase(), filter = $('filter').value;
    current = words.filter(w => (!query || w.word.toLowerCase().includes(query)) && (filter === 'all' || (filter === 'mastered') === mastered.has(w.word.toLowerCase())));
    const order = $('order').value;
    current.sort((a,b) => order === 'alpha' ? a.word.localeCompare(b.word,'en') : order === 'source' ? a.sourceIndex-b.sourceIndex : (b.frequency || 0)-(a.frequency || 0) || a.sourceIndex-b.sourceIndex);
    index = 0; revealed = false; render();
  }
  function render() {
    const w = current[index];
    $('masteredCount').textContent = mastered.size;
    $('position').textContent = w ? `${index+1} / ${current.length}` : '没有找到单词';
    $('frequency').textContent = w ? (w.frequency ? `参考资料：${w.frequency} 次` : '暂无参考词频') : '';
    $('cardWord').textContent = w ? w.word : '试试其他搜索条件';
    $('phonetic').textContent = w && revealed && w.phonetic ? `[${w.phonetic}]` : '';
    $('meaning').textContent = w && revealed ? w.meaning : '';
    $('meaning').hidden = !revealed;
    $('sideHint').textContent = revealed ? '词典释义' : '想想它的意思';
    $('cardBottom').textContent = w ? (revealed ? '点击返回单词' : '点击翻面 · 空格键') : '';
    $('flip').textContent = revealed ? '返回单词' : '查看释义';
    $('master').textContent = w && mastered.has(w.word.toLowerCase()) ? '★ 已掌握 · 点击撤销' : '☆ 标记为已掌握';
    $('prev').disabled = !w || index === 0; $('next').disabled = !w || index === current.length-1;
    $('flip').disabled = $('master').disabled = !w;
    $('message').textContent = w && !w.meaning ? '暂无匹配释义，请查阅其他词典。' : '';
  }
  function flip(){if(current[index]){revealed=!revealed;render();}}
  function move(delta){if(index+delta>=0 && index+delta<current.length){index+=delta;revealed=false;render();}}
  $('card').addEventListener('click',flip); $('flip').addEventListener('click',flip);
  $('prev').addEventListener('click',()=>move(-1)); $('next').addEventListener('click',()=>move(1));
  $('search').addEventListener('input',list); $('order').addEventListener('change',list); $('filter').addEventListener('change',list);
  $('master').addEventListener('click',()=>{const w=current[index];if(!w)return;const key=w.word.toLowerCase();mastered.has(key)?mastered.delete(key):mastered.add(key);try{localStorage.setItem(STORAGE,JSON.stringify([...mastered]));}catch(_){$('message').textContent='无法保存学习状态，请检查浏览器存储设置。';} if($('filter').value==='all')render();else list();});
  $('shuffle').addEventListener('click',()=>{if(current.length){index=Math.floor(Math.random()*current.length);revealed=false;render();}});
  $('importFile').addEventListener('change',async event=>{
    const file=event.target.files[0]; if(!file)return;
    try {
      if(file.size>8*1024*1024) throw Error('词表超过 8 MB。');
      const data=JSON.parse(await file.text());
      if(!Array.isArray(data)||!data.length||data.length>20000||data.some(x=>!x||typeof x.word!=='string'||!x.word.trim()||typeof x.meaning!=='string')) throw Error('格式不正确：请使用单词和释义组成的 JSON 数组。');
      const prepared=data.map((x,i)=>({word:x.word.trim(),meaning:x.meaning,phonetic:typeof x.phonetic==='string'?x.phonetic:'',frequency:Number.isFinite(x.frequency)&&x.frequency>0?x.frequency:null,sourceIndex:i}));
      localStorage.setItem('shici-deck-v1',JSON.stringify(prepared));
      words=prepared; $('search').value=''; $('filter').value='all'; list();
      $('message').textContent=`已在本浏览器导入 ${words.length} 张卡片。`;
    } catch(error) { $('message').textContent=`导入失败：${error.message}`; }
    event.target.value='';
  });
  document.addEventListener('keydown',e=>{if(/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target.tagName)||e.target.isContentEditable)return;if(e.key===' '){e.preventDefault();flip();}else if(e.key==='ArrowLeft')move(-1);else if(e.key==='ArrowRight')move(1);});
  list();
})();
