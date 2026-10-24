/* First AI Agent — UI layer: icons, robot avatars, mascot, sidebar, home, wizard */
'use strict';

/* ---------- inline SVG line icons (24 viewBox, stroke) ---------- */
const P = {
  spark: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M18.6 15.6l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  home: '<path d="M4 11.2 12 4l8 7.2"/><path d="M6 9.8V20h12V9.8"/><path d="M10 20v-5h4v5"/>',
  build: '<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2.2"/><circle cx="9" cy="16" r="2.2"/>',
  chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H12l-4.5 3.6v-3.6H6.5A2.5 2.5 0 0 1 4 13.5z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  bot: '<rect x="5" y="9" width="14" height="10" rx="3.5"/><path d="M12 9V5.4"/><circle cx="12" cy="4" r="1.3"/><circle cx="9.4" cy="14" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.6" cy="14" r="1.1" fill="currentColor" stroke="none"/>',
  memory: '<ellipse cx="12" cy="5.8" rx="7" ry="2.8"/><path d="M5 5.8v12.4c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8V5.8"/><path d="M5 12c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8"/>',
  learn: '<path d="M12 5 2.8 9.3 12 13.6l9.2-4.3z"/><path d="M6.4 11.4v4.4c0 1.5 2.5 3 5.6 3s5.6-1.5 5.6-3v-4.4"/><path d="M21.2 9.3v5"/>',
  share: '<path d="M12 15V4"/><path d="m7.5 8 4.5-4.5L16.5 8"/><path d="M5 13.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-5.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>',
  arrow: '<path d="M4 12h15M13.5 6l6 6-6 6"/>',
  send: '<path d="M21 3 10.2 13.8"/><path d="M21 3 14.4 21l-4.2-7.2L3 9.6z"/>',
  zap: '<path d="M13 2.5 4.5 13.5H11L9.8 21.5l8.6-11H12z"/>',
  think: '<path d="M9 18.5h6M10 21h4"/><path d="M12 3.5a6 6 0 0 1 3.5 10.9c-.7.5-1 1-1 1.9h-5c0-.9-.3-1.4-1-1.9A6 6 0 0 1 12 3.5z"/>',
  plan: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="m3.6 6 1 1 1.8-2M3.6 12l1 1 1.8-2M3.6 18l1 1 1.8-2"/>',
  wrench: '<path d="M14.5 6.2a4.4 4.4 0 0 1 5.9-4.1l-2.9 2.9.6 2.4 2.4.6 2.9-2.9a4.4 4.4 0 0 1-5.6 5.3L8 20.3a2 2 0 0 1-2.9 0l-1.3-1.3a2 2 0 0 1 0-2.9l9.9-9.9a4.4 4.4 0 0 1 .8-1z"/>',
  answer: '<path d="M21 12a8 8 0 0 1-8 8H4l2-3.2A8 8 0 1 1 21 12z"/><path d="m8.6 12.2 2.3 2.3 4.3-4.6"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  doc: '<path d="M6 3.5h8L19 8.5V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V5A1.5 1.5 0 0 1 6 3.5z"/><path d="M13.5 3.5v5.5H19"/><path d="M8.5 13h7M8.5 16.5h5"/>',
  book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.7A1.7 1.7 0 0 0 5 19.7z"/><path d="M5 19.5A1.5 1.5 0 0 1 6.5 18H19v3H6.5A1.5 1.5 0 0 1 5 19.5z"/>',
  scale: '<path d="M12 4v16M8 20h8"/><path d="M12 6.5 5.5 8 12 6.5 18.5 8"/><path d="M5.5 8 3 14a3.4 3.4 0 0 0 5 0zM18.5 8 16 14a3.4 3.4 0 0 0 5 0z"/>',
  calc: '<rect x="5.5" y="3.5" width="13" height="17" rx="2"/><path d="M8.5 7.5h7M8.8 12h.01M12 12h.01M15.2 12h.01M8.8 15.5h.01M12 15.5h.01M15.2 15.5h.01"/>',
  swap: '<path d="M4 8.5h13M13.5 4.5 17.5 8.5l-4 4"/><path d="M20 15.5H7M10.5 11.5l-4 4 4 4"/>',
  quiz: '<circle cx="12" cy="12" r="8.8"/><path d="M9.6 9.3A2.6 2.6 0 0 1 12 8a2.6 2.6 0 1 1 0 5.2c-.8 0-1.2.5-1.2 1.3v.6"/><path d="M12 18h.01"/>',
  cards: '<rect x="3.5" y="7" width="12" height="13" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h9A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H15"/>',
  planner: '<rect x="4" y="4" width="16" height="16.5" rx="2"/><path d="m8 12.5 2.6 2.6L16.5 9"/>',
  calendar: '<rect x="3.5" y="5.5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/>',
  folder: '<path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4.2l2 2.5h7.3A1.5 1.5 0 0 1 20 9v9a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18z"/>',
  cap: '<path d="M12 4.5 2.5 9 12 13.5 21.5 9z"/><path d="M6.2 11.2v4c0 1.4 2.6 2.8 5.8 2.8s5.8-1.4 5.8-2.8v-4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  bulb: '<path d="M9 18.5h6M10 21.5h4"/><path d="M12 3a6.2 6.2 0 0 1 3.4 11.3c-.6.5-.9 1-1 1.8H9.6c-.1-.8-.4-1.3-1-1.8A6.2 6.2 0 0 1 12 3z"/>',
  trophy: '<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 5.5H4a3.6 3.6 0 0 0 3.7 4.3M16.5 5.5H20a3.6 3.6 0 0 1-3.7 4.3"/><path d="M12 13.5V16M8.8 20.5h6.4M12 16c-1 .8-1.6 2-1.7 4.5h3.4c-.1-2.5-.7-3.7-1.7-4.5z"/>'
};
FAA.icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.spark}</svg>`;
FAA.iconsInto = root => {
  (root || document).querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = FAA.icon(el.dataset.icon); });
};

/* tool + role icon names (chrome icons replace tool emojis) */
FAA.TOOL_ICONS = { calc: 'calc', convert: 'swap', summarise: 'doc', quiz: 'quiz', flashcards: 'cards', vocab: 'book', planner: 'planner', schedule: 'calendar', notes: 'folder', proscons: 'scale' };
FAA.ROLE_ICONS = { generalist: 'bot', research: 'compass', study: 'learn', support: 'chat', planner: 'calendar', quizmaster: 'trophy' };
FAA.TPL_ICONS = { ranger: 'compass', crusher: 'learn', architect: 'plan', coach: 'target', advisor: 'bulb', trivia: 'trophy' };
FAA.MISSION_ICONS = { created: 'spark', tools: 'wrench', kb: 'book', stump: 'target', ship: 'send' };

/* ---------- robot avatars ---------- */
/* The 24 saved avatar values stay identical; each renders as a gradient robot tile. */
const AV_GRADS = [
  ['#7C5CFF', '#B18CFF'], ['#0FB5A8', '#5EEAD4'], ['#E3B959', '#F0D089'], ['#F472B6', '#FDA4AF'],
  ['#38BDF8', '#818CF8'], ['#FB923C', '#FBBF24'], ['#34D399', '#A3E635'], ['#6366F1', '#A78BFA'],
  ['#22D3EE', '#67E8F9'], ['#FB7185', '#FCA5A5']
];
const AV_LIST = ['🤖', '🦾', '🧠', '✨', '🚀', '🎓', '🔬', '🦊', '🐙', '⚡', '🌟', '💎', '🎧', '🗺', '🔮', '🦄', '🐝', '🦉', '👾', '💡', '🎯', '🔥', '🌊', '🍀'];
let avUid = 0;
FAA.avatarGrad = emoji => AV_GRADS[Math.max(0, AV_LIST.indexOf(emoji)) % AV_GRADS.length];
FAA.robotSVG = function (emoji, big) {
  const [c1, c2] = FAA.avatarGrad(emoji);
  const id = 'avg' + (++avUid);
  const variant = Math.max(0, AV_LIST.indexOf(emoji)) % 3;
  const antenna = variant === 0
    ? '<line x1="32" y1="16" x2="32" y2="7" stroke="#0B1120" stroke-width="3"/><circle cx="32" cy="6" r="3.6" fill="#0B1120"/>'
    : variant === 1
    ? '<rect x="23" y="5" width="18" height="4.6" rx="2.3" fill="#0B1120"/>'
    : '<rect x="9" y="28" width="5" height="12" rx="2.5" fill="#0B1120"/><rect x="50" y="28" width="5" height="12" rx="2.5" fill="#0B1120"/>';
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>` +
    `<rect width="64" height="64" fill="url(#${id})"/>${antenna}` +
    `<rect x="13" y="15" width="38" height="32" rx="11" fill="#101828"/>` +
    `<rect x="18.5" y="21" width="27" height="17" rx="8" fill="#EAF2FF"/>` +
    `<circle cx="27" cy="29.5" r="3.1" fill="#0B1120"/><circle cx="37" cy="29.5" r="3.1" fill="#0B1120"/>` +
    `<circle cx="28.1" cy="28.4" r="1" fill="#fff"/><circle cx="38.1" cy="28.4" r="1" fill="#fff"/>` +
    `<path d="M27 41.5q5 3.4 10 0" stroke="#0B1120" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
    `<circle cx="21.5" cy="36" r="2.4" fill="#F9A8C9" opacity=".75"/><circle cx="42.5" cy="36" r="2.4" fill="#F9A8C9" opacity=".75"/></svg>`;
};
FAA.avatarTile = (emoji, cls) => `<span class="avtile ${cls || ''}">${FAA.robotSVG(emoji)}</span>`;

/* ---------- hero mascot (inline SVG) ---------- */
FAA.renderMascot = function () {
  const el = FAA.$('mascot');
  if (!el) return;
  el.innerHTML = `<svg viewBox="0 0 340 300" role="img" aria-label="Friendly robot agent">
  <defs>
    <radialGradient id="mglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#F0D089" stop-opacity=".5"/><stop offset="1" stop-color="#F0D089" stop-opacity="0"/></radialGradient>
    <linearGradient id="mgold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5DFA6"/><stop offset="1" stop-color="#D9A93F"/></linearGradient>
    <linearGradient id="mbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22335C"/><stop offset="1" stop-color="#101A30"/></linearGradient>
  </defs>
  <ellipse cx="170" cy="150" rx="165" ry="140" fill="url(#mglow)"/>
  <ellipse cx="170" cy="146" rx="138" ry="104" fill="none" stroke="url(#mgold)" stroke-width="1.4" opacity=".75" transform="rotate(-13 170 146)"/>
  <ellipse cx="170" cy="146" rx="152" ry="76" fill="none" stroke="#41538A" stroke-width="1" opacity=".55" transform="rotate(16 170 146)"/>
  <circle cx="42" cy="96" r="2.4" fill="#F0D089"/><circle cx="306" cy="66" r="2" fill="#9DABC4"/><circle cx="288" cy="196" r="2.4" fill="#F0D089" opacity=".8"/><circle cx="56" cy="210" r="1.8" fill="#9DABC4"/>
  <ellipse cx="170" cy="262" rx="86" ry="13" fill="#0A0F1F" opacity=".65"/>
  <ellipse cx="170" cy="252" rx="72" ry="11" fill="none" stroke="url(#mgold)" stroke-width="2" opacity=".9"/>
  <ellipse cx="170" cy="246" rx="52" ry="8" fill="none" stroke="#F0D089" stroke-width="1" opacity=".5"/>
  <path d="M128 236q42 14 84 0l-6 12q-36 10-72 0z" fill="url(#mbody)" stroke="#33477A" stroke-width="1"/>
  <rect x="112" y="168" width="116" height="66" rx="30" fill="url(#mbody)" stroke="#33477A" stroke-width="1.2"/>
  <circle cx="170" cy="198" r="13" fill="none" stroke="url(#mgold)" stroke-width="2.4"/>
  <circle cx="170" cy="198" r="5.5" fill="#F0D089"/>
  <rect x="88" y="112" width="13" height="34" rx="6.5" fill="#16233F" stroke="#33477A"/>
  <rect x="239" y="112" width="13" height="34" rx="6.5" fill="#16233F" stroke="#33477A"/>
  <line x1="170" y1="58" x2="170" y2="40" stroke="#F0D089" stroke-width="3" stroke-linecap="round"/>
  <circle cx="170" cy="35" r="6" fill="url(#mgold)"/>
  <rect x="94" y="56" width="152" height="106" rx="46" fill="url(#mbody)" stroke="#3A4E82" stroke-width="1.4"/>
  <rect x="110" y="72" width="120" height="66" rx="32" fill="#EAF2FF"/>
  <circle cx="146" cy="103" r="10.5" fill="#0B1120"/><circle cx="194" cy="103" r="10.5" fill="#0B1120"/>
  <circle cx="149.5" cy="99.5" r="3.4" fill="#fff"/><circle cx="197.5" cy="99.5" r="3.4" fill="#fff"/>
  <path d="M152 122q18 13 36 0" stroke="#0B1120" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <circle cx="126" cy="120" r="7" fill="#F9A8C9" opacity=".7"/><circle cx="214" cy="120" r="7" fill="#F9A8C9" opacity=".7"/>
</svg>`;
};

/* ---------- home rendering ---------- */
FAA.renderHome = function () {
  const a = FAA.state.agent;
  /* quick-start templates (first 3 + all 6 in 3-col grid) */
  const ht = FAA.$('home-templates');
  if (ht && typeof TEMPLATES !== 'undefined') {
    ht.innerHTML = TEMPLATES.map(t => `
      <div class="htpl">
        ${t.role === 'study' ? '<span class="badge-pop">Popular</span>' : ''}
        <span class="ht-ic">${FAA.icon(FAA.TPL_ICONS[t.id] || 'spark')}</span>
        <h4>${FAA.esc(t.name)}</h4><p>${FAA.esc(t.desc)}</p>
        <button class="btn small ghost" data-tpl="${t.id}">Use Template</button>
      </div>`).join('');
  }
  /* my agents rail */
  const ha = FAA.$('home-agents');
  if (ha) {
    const on = FAA.TOOLS.filter(t => a.tools[t.id]).length;
    ha.innerHTML = `
      <div class="rail-agent">${FAA.avatarTile(a.avatar)}
        <div class="ra-meta"><div class="ra-name">${FAA.esc(a.name)}</div><div class="ra-role">${FAA.esc(FAA.ROLES[a.role].label)} · current agent</div></div>
        <button class="btn small gold" data-goto="playground">Chat</button></div>
      <div class="rail-agent">${FAA.avatarTile('🦄')}
        <div class="ra-meta"><div class="ra-name">Templates</div><div class="ra-role">6 ready-made agents</div></div>
        <button class="btn small ghost" data-goto="templates">Browse</button></div>
      <div class="rail-agent">${FAA.avatarTile('⚡')}
        <div class="ra-meta"><div class="ra-name">${on} of 10 tools on</div><div class="ra-role">Tune them in Build → Tools</div></div>
        <button class="btn small ghost" data-goto="studio">Tune</button></div>`;
  }
  /* tools rail */
  const htl = FAA.$('home-tools');
  if (htl) {
    htl.innerHTML = FAA.TOOLS.map(t => `
      <div class="rail-tool ${a.tools[t.id] ? '' : 'off'}">${FAA.icon(FAA.TOOL_ICONS[t.id] || 'spark')}<span>${FAA.esc(t.name)}</span></div>`).join('');
    const n = FAA.TOOLS.filter(t => a.tools[t.id]).length;
    FAA.$('home-tools-count').textContent = `${n} Tools Enabled`;
  }
  /* memory rail */
  const hm = FAA.$('home-memory');
  if (hm) {
    hm.innerHTML = FAA.state.memory.length
      ? FAA.state.memory.slice(-4).reverse().map(f => `<li><span>${FAA.esc(f.text)}</span><span class="rm-date">${new Date(f.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></li>`).join('')
      : '<li class="rail-mem-empty">Nothing stored yet — tell your agent “remember that…”.</li>';
  }
  /* missions teaser */
  if (FAA.$('home-missions-fill') && typeof MISSIONS !== 'undefined') {
    const done = MISSIONS.filter(m => FAA.state.missions[m.id]).length;
    FAA.$('home-missions-fill').style.width = (100 * done / MISSIONS.length) + '%';
    FAA.$('home-missions-count').textContent = `${done}/${MISSIONS.length}`;
  }
};

/* ---------- studio wizard + live preview ---------- */
let wizStep = 1;
FAA.wizGo = function (n) {
  wizStep = Math.max(1, Math.min(5, n));
  document.querySelectorAll('.wpanel').forEach(p => p.classList.toggle('active', +p.dataset.wpanel === wizStep));
  document.querySelectorAll('.wstep-dot').forEach(d => {
    d.classList.toggle('active', +d.dataset.wstep === wizStep);
    d.classList.toggle('done', +d.dataset.wstep < wizStep);
  });
  FAA.$('wiz-prev').style.visibility = wizStep === 1 ? 'hidden' : 'visible';
  FAA.$('wiz-next').hidden = wizStep === 5;
  FAA.$('wiz-save').hidden = wizStep !== 5;
  FAA.renderPreview();
};
FAA.renderPreview = function () {
  const a = FAA.state.agent;
  const name = (FAA.$('ag-name') ? FAA.$('ag-name').value.trim() : '') || a.name || 'Nova';
  const role = FAA.ROLES[a.role];
  if (FAA.$('pv-avatar')) FAA.$('pv-avatar').innerHTML = FAA.avatarTile(a.avatar);
  if (FAA.$('pv-msg-av')) FAA.$('pv-msg-av').innerHTML = FAA.avatarTile(a.avatar);
  if (FAA.$('pv-name')) FAA.$('pv-name').textContent = name;
  if (FAA.$('pv-role')) FAA.$('pv-role').textContent = role.label;
  if (FAA.$('pv-desc')) FAA.$('pv-desc').textContent = role.blurb + ' — ' + role.frame + '.';
  if (FAA.$('pv-msg')) FAA.$('pv-msg').textContent = `Hi! I'm ${name}. Ask me anything — or say "help" to see my tools.`;
  if (FAA.$('pv-tools')) {
    const on = FAA.TOOLS.filter(t => a.tools[t.id]);
    FAA.$('pv-tools').innerHTML = on.slice(0, 5).map(t => `<span class="pt">${FAA.esc(t.name)}</span>`).join('') +
      (on.length > 5 ? `<span class="pt">+${on.length - 5} more</span>` : '');
  }
  const rr = FAA.$('review-rows');
  if (rr) {
    const nTools = FAA.TOOLS.filter(t => a.tools[t.id]).length;
    const words = ((FAA.$('kb-input') ? FAA.$('kb-input').value : a.kb).match(/\S+/g) || []).length;
    rr.innerHTML = [
      ['Name', name], ['Avatar', 'Robot tile ' + (AV_LIST.indexOf(a.avatar) + 1) + ' of ' + AV_LIST.length],
      ['Role preset', role.label],
      ['Personality', `Warmth ${a.warmth} · Formality ${a.formality} · Playful ${a.playfulness}`],
      ['Knowledge base', words ? words + ' words loaded' : 'Empty'],
      ['Tools enabled', nTools + ' of ' + FAA.TOOLS.length],
      ['Memories stored', FAA.state.memory.length]
    ].map(([k, v]) => `<div class="rev-row"><span class="rk">${k}</span><span class="rv">${FAA.esc(v)}</span></div>`).join('');
  }
};

/* ---------- init: icons, sidebar, home CTAs, wizard ---------- */
FAA.initUI = function () {
  FAA.iconsInto(document);
  FAA.renderMascot();

  document.querySelectorAll('.nav-it[data-view]').forEach(b =>
    b.addEventListener('click', () => {
      FAA.showView(b.dataset.view);
      if (b.dataset.focus === 'memory') {
        const mp = FAA.$('memory-panel');
        if (mp) { mp.scrollIntoView({ behavior: 'smooth', block: 'center' }); mp.style.borderColor = 'var(--gold)'; setTimeout(() => mp.style.borderColor = '', 1600); }
      }
    }));
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-goto]');
    if (g) FAA.showView(g.dataset.goto);
  });
  const shareNav = document.querySelector('[data-share]');
  if (shareNav) shareNav.addEventListener('click', FAA.openShare);
  if (FAA.$('brand-home')) FAA.$('brand-home').addEventListener('click', () => FAA.showView('home'));
  if (FAA.$('home-new-agent')) FAA.$('home-new-agent').addEventListener('click', () => { FAA.showView('studio'); FAA.wizGo(1); });
  if (FAA.$('rail-new-agent')) FAA.$('rail-new-agent').addEventListener('click', () => { FAA.showView('studio'); FAA.wizGo(1); });
  if (FAA.$('home-watch-demo')) FAA.$('home-watch-demo').addEventListener('click', () => {
    FAA.showView('playground');
    setTimeout(() => FAA.send('quiz me on my notes'), 450);
  });
  if (FAA.$('home-all-templates')) FAA.$('home-all-templates').addEventListener('click', () => FAA.showView('templates'));
  if (FAA.$('chat-new')) FAA.$('chat-new').addEventListener('click', () => {
    FAA.$('chat-log').innerHTML = '';
    FAA.resetSession();
    FAA.brainReset();
    FAA.appendSys('New chat started. Your agent and its memory are unchanged.');
  });

  /* wizard */
  document.querySelectorAll('.wstep-dot').forEach(d =>
    d.addEventListener('click', () => FAA.wizGo(+d.dataset.wstep)));
  FAA.$('wiz-prev').addEventListener('click', () => FAA.wizGo(wizStep - 1));
  FAA.$('wiz-next').addEventListener('click', () => FAA.wizGo(wizStep + 1));
  FAA.$('wiz-save').addEventListener('click', () => FAA.saveAgent(false));

  /* live preview follows builder edits */
  ['ag-name', 'ag-instructions', 'kb-input'].forEach(id => {
    const el = FAA.$(id);
    if (el) el.addEventListener('input', FAA.renderPreview);
  });
  const instr = FAA.$('ag-instructions');
  if (instr) {
    const upd = () => { const c = FAA.$('instr-count'); if (c) c.textContent = instr.value.length; };
    instr.addEventListener('input', upd); upd();
  }
  FAA.wizGo(1);
};
