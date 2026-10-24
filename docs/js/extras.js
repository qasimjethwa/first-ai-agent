/* First AI Agent — missions, templates, share/export */
'use strict';

/* ============ MISSIONS ============ */
const MISSIONS = [
  { id: 'created', icon: '👶', title: 'First contact', text: 'Give your agent a name and hit Save in the Studio. Every agent starts with an identity.' },
  { id: 'tools', icon: '🧰', title: 'Tool up', text: 'Enable at least 6 tools. Tools are what turn a chatbot into an agent — toggle them in the Studio.' },
  { id: 'kb', icon: '📚', title: 'Feed it knowledge', text: 'Paste 200+ characters into the knowledge base. Your agent will answer questions from it.' },
  { id: 'stump', icon: '🎯', title: 'Stump the agent', text: 'Ask a question your agent can only answer from its knowledge base — watch the brain panel hit "Search knowledge base".' },
  { id: 'ship', icon: '🚀', title: 'Ship it', text: 'Export your agent as JSON or copy its share link. Real agents get deployed — yours gets shared.' }
];

FAA.checkMission = function (id) {
  if (FAA.state.missions[id]) return;
  FAA.state.missions[id] = true;
  FAA.save();
  FAA.renderMissions();
  const m = MISSIONS.find(x => x.id === id);
  if (m) FAA.appendSys(`Mission complete: <b>${m.title}</b>`);
};

FAA.renderMissions = function () {
  const done = MISSIONS.filter(m => FAA.state.missions[m.id]).length;
  FAA.$('missions-pill').textContent = `${done}/${MISSIONS.length}`;
  FAA.$('missions-fill').style.width = (100 * done / MISSIONS.length) + '%';
  FAA.$('missions-list').innerHTML = MISSIONS.map(m => {
    const isDone = !!FAA.state.missions[m.id];
    const go = m.id === 'created' || m.id === 'tools' || m.id === 'kb' ? 'studio'
      : m.id === 'stump' ? 'playground' : null;
    return `<div class="mission ${isDone ? 'done' : ''}">
      <div class="m-check">${FAA.icon(isDone ? 'check' : (FAA.MISSION_ICONS[m.id] || 'target'))}</div>
      <div><h4>${m.title}</h4><p>${m.text}</p></div>
      ${go ? `<button class="btn small ghost m-go" data-go="${go}">Go →</button>` : `<button class="btn small ghost m-go" data-goship="1">Open share</button>`}
    </div>`;
  }).join('');
  if (FAA.renderHome) FAA.renderHome();
};

document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go) FAA.showView(go.dataset.go);
  if (e.target.closest('[data-goship]')) FAA.openShare();
});

/* ============ TEMPLATES ============ */
const TEMPLATES = [
  {
    id: 'ranger', name: 'Research Ranger', avatar: '🔬', role: 'research',
    desc: 'Reads long text and gives you the gist. Loaded with a primer on how transformers work.',
    instructions: 'Always cite which part of the knowledge base you used. Prefer summarising over long quotes.',
    tools: { summarise: true, vocab: true, notes: true, calc: true, convert: true },
    kb: `The transformer is a neural network architecture introduced in 2017 by Vaswani et al. in the paper "Attention Is All You Need".\nIt relies on self-attention mechanisms instead of recurrence, which lets it process sequences in parallel.\nGPT stands for Generative Pre-trained Transformer and is built on the transformer decoder stack.\nTraining GPT-3 used approximately 175 billion parameters and cost an estimated several million dollars in compute.\nThe attention mechanism computes weighted averages of value vectors, where weights come from query-key similarity scores.`
  },
  {
    id: 'crusher', name: 'Exam Crusher', avatar: '🎓', role: 'study',
    desc: 'Turns any chapter into quizzes and flashcards. Ships with a cell-biology knowledge pack.',
    instructions: 'Be encouraging but honest. Quiz me before explaining — test first, teach after.',
    tools: { quiz: true, flashcards: true, schedule: true, summarise: true, vocab: true },
    kb: `Mitochondria are known as the powerhouse of the cell because they produce ATP through cellular respiration.\nPhotosynthesis occurs in chloroplasts and converts light energy into chemical energy stored as glucose.\nThe human body has 206 bones at adulthood, down from about 300 at birth as bones fuse.\nDNA stands for deoxyribonucleic acid and has a double-helix structure discovered in 1953.\nEnzymes are biological catalysts that speed up reactions; each enzyme works best at a specific optimal pH.`
  },
  {
    id: 'architect', name: 'Trip Architect', avatar: '🗺', role: 'planner',
    desc: 'Plans days and converts anything. Comes with a starter pack of travel rules of thumb.',
    instructions: 'Be concrete: times, durations, order. No vague advice.',
    tools: { planner: true, schedule: true, calc: true, convert: true, proscons: true },
    kb: `A good travel rule is to arrive at the airport 2 hours before domestic flights and 3 hours before international ones.\nPacking cubes reduce suitcase volume usage by roughly 30 percent compared to loose packing.\nThe 3-3-3 rule for trips: 3 tops, 3 bottoms, 3 pairs of shoes covers most week-long travel.\nJet lag recovery takes about 1 day per timezone crossed when travelling east.\nTravel insurance typically costs 4 to 10 percent of the total trip price.`
  },
  {
    id: 'coach', name: 'Habit Coach', avatar: '💪', role: 'support',
    desc: 'Helps you decide, plan and stick to routines. Loaded with habit-science basics.',
    instructions: 'Be patient and encouraging. Break everything into small steps.',
    tools: { planner: true, schedule: true, proscons: true, notes: true },
    kb: `Habit stacking means attaching a new habit to an existing one, for example meditating right after morning coffee.\nResearch suggests forming a habit takes an average of 66 days, not 21 as commonly claimed.\nThe 2-minute rule says any habit should take less than two minutes to start.\nImplementation intentions use the format "I will do X at time Y in location Z" and measurably improve follow-through.\nTracking streaks works because of loss aversion: people hate breaking a chain more than they enjoy extending it.`
  },
  {
    id: 'advisor', name: 'Startup Advisor', avatar: '🦄', role: 'support',
    desc: 'Weighs decisions and organises chaos. Ships with launch-day fundamentals.',
    instructions: 'Be direct and honest. No hype — tell me the unsexy truth.',
    tools: { proscons: true, notes: true, planner: true, calc: true, summarise: true },
    kb: `The average SaaS startup takes 3 to 5 years to reach meaningful profitability.\nCustomer acquisition cost should stay below one third of customer lifetime value for a healthy business.\nA landing page converting above 5 percent is considered strong for early-stage products.\nFounders should talk to at least 20 potential customers before writing significant code.\nThe most common startup killer is building something nobody wants, ahead of running out of cash.`
  },
  {
    id: 'trivia', name: 'Trivia Night Host', avatar: '🏆', role: 'quizmaster',
    desc: 'Relentless questioning on space facts. Say "quiz me" and defend your honour.',
    instructions: 'Be dramatic and fun. Always explain the right answer after I respond.',
    tools: { quiz: true, flashcards: true, vocab: true },
    kb: `Jupiter is the largest planet in the solar system with a diameter of about 139,820 kilometers.\nA day on Venus lasts longer than its year: it rotates once every 243 Earth days but orbits in 225 days.\nNeutron stars can spin up to 600 times per second after collapsing.\nThe Moon is drifting away from Earth at about 3.8 centimeters per year.\nSaturn's moon Titan has lakes and rivers of liquid methane and ethane.`
  }
];

FAA.renderTemplates = function () {
  FAA.$('templates-grid').innerHTML = TEMPLATES.map(t => {
    const n = Object.values(t.tools).filter(Boolean).length;
    return `<div class="tpl">
      ${t.role === 'study' ? '<span class="badge-pop">Popular</span>' : ''}
      <div class="tpl-head">${FAA.avatarTile(t.avatar, 'tpl-av')}
        <div><h4>${t.name}</h4><div class="tpl-role">${FAA.ROLES[t.role].label}</div></div></div>
      <p>${t.desc}</p>
      <div class="tpl-tools">${n} tools · knowledge pack included</div>
      <button class="btn small gold" data-tpl="${t.id}">Use Template</button>
    </div>`;
  }).join('');
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-tpl]');
  if (!b) return;
  const t = TEMPLATES.find(x => x.id === b.dataset.tpl);
  if (!t) return;
  const a = FAA.state.agent;
  a.name = t.name; a.avatar = t.avatar; a.role = t.role;
  a.instructions = t.instructions; a.kb = t.kb;
  a.warmth = 70; a.formality = 35; a.playfulness = 60;
  for (const tool of FAA.TOOLS) a.tools[tool.id] = !!t.tools[tool.id];
  FAA.resetSession();
  FAA.save(); FAA.renderBuilder(); FAA.syncChatHeader();
  FAA.checkMission('created'); FAA.checkMission('kb'); FAA.checkMission('tools');
  if (FAA.renderHome) FAA.renderHome();
  FAA.showView('playground');
  FAA.appendSys(`Template loaded: <b>${t.name}</b> — knowledge pack included. Say <b>hi</b> or <b>quiz me</b>.`);
});

/* ============ SHARE / EXPORT ============ */
FAA.openShare = function () {
  const a = FAA.state.agent;
  const nTools = FAA.TOOLS.filter(t => a.tools[t.id]).length;
  const words = (a.kb.match(/\S+/g) || []).length;
  FAA.$('agent-card').innerHTML = `
    ${FAA.avatarTile(a.avatar, 'ac-av')}
    <div><h3>${FAA.esc(a.name)}</h3>
      <div class="ac-role">${FAA.esc(FAA.ROLES[a.role].label)}</div>
      <div class="ac-stats">${nTools} tools enabled · ${words} words of knowledge · ${FAA.state.memory.length} memories<br>
      <span style="color:var(--dim)">"${FAA.esc((a.instructions || 'No custom instructions').slice(0, 80))}"</span></div>
    </div>`;
  FAA.$('share-link').value = FAA.exportToHash(a);
  FAA.$('share-modal').hidden = false;
};

FAA.shareToast = function (msg) {
  const t = FAA.$('share-toast');
  t.hidden = false; t.textContent = msg;
  setTimeout(() => t.hidden = true, 2600);
};

FAA.initShare = function () {
  FAA.$('open-share').addEventListener('click', FAA.openShare);
  FAA.$('close-share').addEventListener('click', () => FAA.$('share-modal').hidden = true);
  FAA.$('share-modal').addEventListener('click', e => {
    if (e.target.id === 'share-modal') FAA.$('share-modal').hidden = true;
  });
  FAA.$('copy-link').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(FAA.$('share-link').value); }
    catch (e) { FAA.$('share-link').select(); document.execCommand('copy'); }
    FAA.checkMission('ship');
    FAA.shareToast('Share link copied — anyone opening it gets your agent.');
  });
  FAA.$('export-json').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(FAA.state.agent, null, 2)], { type: 'application/json' });
    const aEl = document.createElement('a');
    aEl.href = URL.createObjectURL(blob);
    aEl.download = FAA.state.agent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-agent.json';
    aEl.click();
    setTimeout(() => URL.revokeObjectURL(aEl.href), 4000);
    FAA.checkMission('ship');
    FAA.shareToast('Agent exported as JSON.');
  });
  FAA.$('import-json').addEventListener('click', () => FAA.$('import-file').click());
  FAA.$('import-file').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const agent = JSON.parse(r.result);
        if (!agent || typeof agent.name !== 'string') throw new Error('bad file');
        FAA.state.agent = FAA.saneAgent(agent);
        FAA.resetSession();
        FAA.save(); FAA.renderBuilder(); FAA.syncChatHeader();
        FAA.shareToast('Agent imported.');
        if (FAA.renderHome) FAA.renderHome();
        FAA.appendSys(`Imported agent <b>${FAA.esc(agent.name)}</b>.`);
      } catch (err) { FAA.shareToast('That file is not a valid agent export.'); }
    };
    r.readAsText(f);
    e.target.value = '';
  });
};
