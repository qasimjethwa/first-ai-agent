/* First AI Agent — core: utils, state, storage, router */
'use strict';

const FAA = window.FAA = {};

/* ---------- utils ---------- */
FAA.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
FAA.$ = id => document.getElementById(id);
FAA.sleep = ms => new Promise(r => setTimeout(r, ms));
FAA.uid = () => Math.random().toString(36).slice(2, 10);
FAA.clamp = (n, a, b) => Math.max(a, Math.min(b, n));

FAA.stopwords = new Set(('a,an,the,and,or,but,if,then,else,when,at,by,for,with,about,into,through,during,before,after,above,below,to,from,up,down,in,out,on,off,over,under,again,further,once,here,there,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,can,will,just,don,should,now,of,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,would,could,ought,i,you,he,she,it,we,they,them,his,her,its,our,their,this,that,these,those,am,my,your,me,us,what,which,who,whom,as,because,until,while,between,among,per,via,also,may,might,must,shall,let,like,get,got,make,made,much,many,one,two,still,even,ever,never,always,often,please,tell,know,think,doesnt,dont,cant,wont,im,youre,whats,thats,theres,lets,us').split(','));

FAA.keywords = text => (text.toLowerCase().match(/[a-z0-9%+.\-/]+/g) || [])
  .map(w => w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ''))
  .filter(w => w.length > 2 && !FAA.stopwords.has(w));

FAA.sentences = text => (text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?|\S[^.!?]*$/g) || [])
  .map(s => s.trim()).filter(s => s.length > 12);

FAA.fmtNum = n => {
  if (!isFinite(n)) return 'undefined';
  const r = Math.round(n * 10000) / 10000;
  return Math.abs(r) >= 1e12 || (Math.abs(r) < 1e-6 && r !== 0) ? r.toExponential(4) : String(r);
};

/* simple markdown-ish renderer for agent output */
FAA.md = raw => {
  let h = FAA.esc(raw);
  h = h.replace(/^### (.*)$/gm, '<b>$1</b>')
       .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
       .replace(/^[-•] (.*)$/gm, '<li>$1</li>')
       .replace(/^(\d+)[.)] (.*)$/gm, '<li>$2</li>');
  h = h.replace(/(<li>.*<\/li>\n?)+/g, m => '<ul>' + m + '</ul>');
  h = h.replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
  return h;
};

/* ---------- state ---------- */
const DEFAULT_AGENT = () => ({
  name: 'Nova', avatar: '🤖', role: 'generalist',
  warmth: 70, formality: 35, playfulness: 45,
  instructions: '',
  kb: '',
  tools: { calc: true, convert: true, summarise: true, quiz: true, flashcards: true, vocab: true, planner: true, schedule: true, notes: true, proscons: true }
});

FAA.state = {
  agent: DEFAULT_AGENT(),
  memory: [],
  missions: {},
  session: {},      // ephemeral per-chat tool sessions (quiz/flashcards)
  booted: false
};

FAA.save = () => {
  try {
    localStorage.setItem('faa_v1', JSON.stringify({
      agent: FAA.state.agent, memory: FAA.state.memory, missions: FAA.state.missions
    }));
  } catch (e) {}
};

FAA.load = () => {
  try {
    const raw = localStorage.getItem('faa_v1');
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (d.agent) FAA.state.agent = Object.assign(DEFAULT_AGENT(), d.agent);
    if (Array.isArray(d.memory)) FAA.state.memory = d.memory;
    if (d.missions) FAA.state.missions = d.missions;
    return true;
  } catch (e) { return false; }
};

/* share-link import: #a=<base64url json> */
FAA.importFromHash = () => {
  const m = location.hash.match(/#a=([A-Za-z0-9\-_]+)/);
  if (!m) return null;
  try {
    const json = decodeURIComponent(escape(atob(m[1].replace(/-/g, '+').replace(/_/g, '/'))));
    const agent = JSON.parse(json);
    if (agent && typeof agent.name === 'string') return agent;
  } catch (e) {}
  return null;
};

FAA.exportToHash = agent => {
  const json = JSON.stringify(agent);
  const b64 = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return location.origin + location.pathname + '#a=' + b64;
};

/* ---------- view router ---------- */
FAA.showView = name => {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-it[data-view]').forEach(t => t.classList.toggle('active', t.dataset.view === name && !t.dataset.focus));
  const el = FAA.$('view-' + name);
  if (el) el.classList.add('active');
  if (name === 'home' && FAA.renderHome) FAA.renderHome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
