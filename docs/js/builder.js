/* First AI Agent — Studio: the agent builder */
'use strict';

const AVATARS = ['🤖', '🦾', '🧠', '✨', '🚀', '🎓', '🔬', '🦊', '🐙', '⚡', '🌟', '💎', '🎧', '🗺', '🔮', '🦄', '🐝', '🦉', '👾', '💡', '🎯', '🔥', '🌊', '🍀'];

const ROLE_DEFAULTS = {
  generalist: { instructions: '', tools: null },
  research:   { instructions: 'Always cite which part of the knowledge base you used. Prefer summarising over long quotes.', tools: { summarise: true, vocab: true, notes: true, calc: true, convert: true } },
  study:      { instructions: 'Be encouraging but honest. Quiz me before explaining — test first, teach after.', tools: { quiz: true, flashcards: true, schedule: true, summarise: true, vocab: true } },
  support:    { instructions: 'Be patient and clear. Break solutions into numbered steps.', tools: { proscons: true, notes: true, planner: true, summarise: true } },
  planner:    { instructions: 'Be concrete: times, durations, order. No vague advice.', tools: { planner: true, schedule: true, calc: true, proscons: true, notes: true } },
  quizmaster: { instructions: 'Relentless but fair. Always explain the right answer after I respond.', tools: { quiz: true, flashcards: true } }
};

FAA.renderBuilder = function () {
  const a = FAA.state.agent;

  /* avatar grid — robot tiles (values stay the original avatar strings) */
  FAA.$('avatar-grid').innerHTML = AVATARS.map(e =>
    `<button data-av="${e}" class="${a.avatar === e ? 'sel' : ''}" title="Avatar">${FAA.robotSVG(e)}</button>`).join('');

  /* role presets */
  FAA.$('role-grid').innerHTML = Object.entries(FAA.ROLES).map(([id, r]) =>
    `<button data-role="${id}" class="${a.role === id ? 'sel' : ''}"><b><span class="ic">${FAA.icon(FAA.ROLE_ICONS[id] || 'bot')}</span>${r.label}</b><span>${r.blurb}</span></button>`).join('');

  /* fields */
  FAA.$('ag-name').value = a.name;
  FAA.$('ag-instructions').value = a.instructions;
  FAA.$('kb-input').value = a.kb;
  for (const s of ['warmth', 'formality', 'playfulness']) {
    FAA.$('sl-' + s).value = a[s];
    FAA.$('sl-' + s + '-v').textContent = a[s];
  }
  FAA.updateKbStats();
  FAA.renderTools();
};

FAA.updateKbStats = function () {
  const kb = FAA.$('kb-input').value;
  const words = (kb.match(/\S+/g) || []).length;
  const chunks = kb.split(/\n\s*\n/).filter(c => c.trim().length > 20).length;
  FAA.$('kb-stats').innerHTML = kb.trim()
    ? `<b>${words}</b> words · <b>${chunks}</b> knowledge chunks — your agent can answer from this`
    : 'Empty — paste notes and your agent will answer questions from them.';
};

FAA.renderTools = function () {
  const a = FAA.state.agent;
  const on = FAA.TOOLS.filter(t => a.tools[t.id]).length;
  FAA.$('tools-pill').textContent = `${on} on`;
  FAA.$('tool-grid').innerHTML = FAA.TOOLS.map(t =>
    `<div class="tool-card ${a.tools[t.id] ? 'on' : ''}" data-tool="${t.id}">
       <button class="toggle" aria-label="toggle ${t.name}"></button>
       <div class="t-head"><span class="ti">${FAA.icon(FAA.TOOL_ICONS[t.id] || 'spark')}</span> ${t.name}</div>
       <p>${t.desc}</p>
     </div>`).join('');
  if (FAA.renderHome) FAA.renderHome();
};

FAA.saveAgent = function (silent) {
  const a = FAA.state.agent;
  a.name = FAA.$('ag-name').value.trim().slice(0, 32) || 'Nova';
  a.instructions = FAA.$('ag-instructions').value.slice(0, 600);
  a.kb = FAA.$('kb-input').value;
  for (const s of ['warmth', 'formality', 'playfulness']) a[s] = parseInt(FAA.$('sl-' + s).value);
  FAA.save();
  FAA.syncChatHeader();
  if (FAA.renderHome) FAA.renderHome();
  if (FAA.renderPreview) FAA.renderPreview();
  FAA.checkMission('created');
  if (a.kb.trim().length > 200) FAA.checkMission('kb');
  if (!silent) FAA.appendSys(`Agent <b>${FAA.esc(a.name)}</b> saved. ${a.kb.trim() ? 'Knowledge base loaded.' : ''} Take it for a spin in Chat.`);
};

FAA.initBuilder = function () {
  FAA.renderBuilder();

  FAA.$('avatar-grid').addEventListener('click', e => {
    const b = e.target.closest('[data-av]');
    if (!b) return;
    FAA.state.agent.avatar = b.dataset.av;
    FAA.$('avatar-grid').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
    if (FAA.renderPreview) FAA.renderPreview();
  });

  FAA.$('role-grid').addEventListener('click', e => {
    const b = e.target.closest('[data-role]');
    if (!b) return;
    const id = b.dataset.role;
    FAA.state.agent.role = id;
    const def = ROLE_DEFAULTS[id];
    if (def.instructions && !FAA.$('ag-instructions').value.trim())
      FAA.$('ag-instructions').value = def.instructions;
    if (def.tools) {
      for (const t of FAA.TOOLS) FAA.state.agent.tools[t.id] = !!def.tools[t.id];
      FAA.renderTools();
    }
    FAA.$('role-grid').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
    if (FAA.renderPreview) FAA.renderPreview();
  });

  for (const s of ['warmth', 'formality', 'playfulness'])
    FAA.$('sl-' + s).addEventListener('input', e => { FAA.$('sl-' + s + '-v').textContent = e.target.value; });

  FAA.$('kb-input').addEventListener('input', FAA.updateKbStats);

  FAA.$('tool-grid').addEventListener('click', e => {
    const card = e.target.closest('[data-tool]');
    if (!card) return;
    const id = card.dataset.tool;
    FAA.state.agent.tools[id] = !FAA.state.agent.tools[id];
    card.classList.toggle('on', FAA.state.agent.tools[id]);
    const on = FAA.TOOLS.filter(t => FAA.state.agent.tools[t.id]).length;
    FAA.$('tools-pill').textContent = `${on} on`;
    if (on >= 6) FAA.checkMission('tools');
  });

  FAA.$('save-agent').addEventListener('click', () => FAA.saveAgent(false));
  FAA.$('reset-agent').addEventListener('click', () => {
    if (!confirm('Reset your agent to defaults? Memory and missions stay.')) return;
    const mem = FAA.state.memory, mis = FAA.state.missions;
    FAA.state.agent = (function () {
      const d = { name: 'Nova', avatar: '🤖', role: 'generalist', warmth: 70, formality: 35, playfulness: 45, instructions: '', kb: '', tools: {} };
      FAA.TOOLS.forEach(t => d.tools[t.id] = true);
      return d;
    })();
    FAA.state.memory = mem; FAA.state.missions = mis;
    FAA.save(); FAA.renderBuilder(); FAA.syncChatHeader();
    if (FAA.renderHome) FAA.renderHome();
    if (FAA.renderPreview) FAA.renderPreview();
    FAA.appendSys('Agent reset to defaults.');
  });

  FAA.$('edit-agent').addEventListener('click', () => FAA.showView('studio'));
};
