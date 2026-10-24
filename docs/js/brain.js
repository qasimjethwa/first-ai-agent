/* First AI Agent — brain: the agent loop (understand → plan → tool → answer) */
'use strict';

FAA.ROLES = {
  generalist:     { label: 'Generalist', icon: '🤖', blurb: 'A bit of everything', frame: 'your all-round helper' },
  research:       { label: 'Research helper', icon: '🔬', blurb: 'Summarises & explains', frame: 'your research helper' },
  study:          { label: 'Study coach', icon: '🎓', blurb: 'Quizzes & flashcards', frame: 'your study coach' },
  support:        { label: 'Support agent', icon: '🎧', blurb: 'Decisions & notes', frame: 'your support agent' },
  planner:        { label: 'Planner', icon: '🗓', blurb: 'Plans & schedules', frame: 'your planner' },
  quizmaster:     { label: 'Quiz master', icon: '🏆', blurb: 'Relentless questioning', frame: 'your quiz master' }
};

/* ---------- tone ---------- */
function tone(agent) {
  const w = agent.warmth, f = agent.formality, p = agent.playfulness;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const opener = w > 75 ? pick(['Love this one. ', 'Great question — ', 'On it! '])
    : w > 40 ? pick(['Got it. ', 'Sure — ', 'Here you go: '])
    : pick(['Processing. ', 'Acknowledged. ', '']);
  const closer = p > 70 ? pick([' Want another round? 🎲', ' Your move. ♟', ''])
    : p > 35 ? pick([' Anything else?', '']) : '';
  const casual = f < 40;
  return { opener: casual ? opener : opener.replace(/!$/, '.'), closer, casual };
}

/* ---------- knowledge base retrieval ---------- */
function kbAnswer(query, kb) {
  const chunks = kb.split(/\n\s*\n|\r?\n/).map(c => c.trim()).filter(c => c.length > 20);
  if (!chunks.length) return null;
  const qk = FAA.keywords(query);
  if (!qk.length) return null;
  let best = null, bestScore = 0;
  for (const c of chunks) {
    const ck = new Set(FAA.keywords(c));
    const shared = qk.filter(w => ck.has(w) || [...ck].some(k => k.includes(w) || w.includes(k)));
    const score = shared.length / Math.sqrt(qk.length);
    if (score > bestScore) { bestScore = score; best = { chunk: c, shared }; }
  }
  if (best && best.shared.length >= 2) return best;
  return null;
}

/* ---------- the loop ---------- */
FAA.runLoop = async function (rawText) {
  const agent = FAA.state.agent;
  const text = rawText.trim();
  const steps = [];
  const step = (label, state) => {
    const ex = steps.find(s => s.label === label);
    if (ex) ex.state = state; else steps.push({ label, state });
    FAA.renderBrain(steps);
  };
  const trace = [];
  const ctx = { session: FAA.state.session, kb: agent.kb };

  step('👁 Understand the message', 'doing');
  await FAA.sleep(420);

  /* --- memory commands --- */
  let m = text.match(/remember that (.+)/i) || text.match(/remember[:\s]+(.+)/i);
  if (m && !/^(to|your)/i.test(m[1])) {
    const fact = m[1].replace(/\.$/, '').trim();
    FAA.state.memory.push({ id: FAA.uid(), text: fact, ts: Date.now() });
    FAA.save(); FAA.renderMemory();
    step('👁 Understand the message', 'done'); step('🧠 Store in long-term memory', 'doing');
    await FAA.sleep(300);
    step('🧠 Store in long-term memory', 'done'); step('💡 Answer', 'doing');
    await FAA.sleep(250); step('💡 Answer', 'done');
    trace.push(`memory: stored "${fact}" (${FAA.state.memory.length} facts)`);
    FAA.setTrace(trace);
    const t = tone(agent);
    return `Noted — I'll remember that **${FAA.esc(fact)}**.${t.closer}`;
  }
  if (/^(what do you remember|list (your )?memory|show memory)/i.test(text)) {
    step('👁 Understand the message', 'done'); step('🧠 Recall long-term memory', 'doing');
    await FAA.sleep(350); step('🧠 Recall long-term memory', 'done');
    trace.push(`memory: recalled ${FAA.state.memory.length} facts`);
    FAA.setTrace(trace);
    if (!FAA.state.memory.length) return `My long-term memory is empty. Tell me **"remember that…"** and I'll keep it.`;
    return `Here's what I remember:\n\n${FAA.state.memory.map((f, i) => `${i + 1}. ${FAA.esc(f.text)}`).join('\n')}`;
  }
  m = text.match(/forget (?:that |about )?(.+)/i);
  if (m) {
    const q = m[1].toLowerCase().replace(/\.$/, '');
    const before = FAA.state.memory.length;
    FAA.state.memory = FAA.state.memory.filter(f => !f.text.toLowerCase().includes(q) && !q.includes(f.text.toLowerCase().slice(0, 12)));
    const n = before - FAA.state.memory.length;
    FAA.save(); FAA.renderMemory();
    step('👁 Understand the message', 'done'); step('🧠 Update long-term memory', 'done');
    trace.push(`memory: forgot ${n} fact(s) matching "${q}"`);
    FAA.setTrace(trace);
    return n ? `Done — forgot ${n} ${n === 1 ? 'thing' : 'things'} about that.` : `I don't have anything stored about that.`;
  }

  /* --- pending multi-turn tool --- */
  if (ctx.session.pending) {
    const tool = FAA.TOOLS.find(t => t.id === ctx.session.pending.tool);
    step('👁 Understand the message', 'done');
    step('🗺 Plan: continue the ' + tool.name + ' flow', 'doing');
    await FAA.sleep(300); step('🗺 Plan: continue the ' + tool.name + ' flow', 'done');
    step('🧰 Run tool: ' + tool.name, 'doing');
    await FAA.sleep(350);
    let res = tool.resume ? await tool.resume(text, ctx) : { text: 'Hmm, lost the thread — let\'s start over.', trace: 'session expired' };
    step('🧰 Run tool: ' + tool.name, 'done'); step('💡 Answer', 'doing');
    await FAA.sleep(250); step('💡 Answer', 'done');
    trace.push(res.trace || '');
    FAA.setTrace(trace);
    if (res.html) { FAA.checkMission('tools'); return res; }
    return FAA.applyStyle(res.text, agent);
  }

  /* --- help / greeting --- */
  if (/^(help|what can you do|commands)$/i.test(text)) {
    step('👁 Understand the message', 'done'); step('💡 Answer', 'done');
    FAA.setTrace(['help: listed enabled tools']);
    const on = FAA.TOOLS.filter(t => agent.tools[t.id]);
    return `I'm **${FAA.esc(agent.name)}**, ${FAA.ROLES[agent.role].frame}. Here's my toolkit:\n\n${on.map(t => `${t.icon} **${t.name}** — ${t.desc}`).join('\n')}\n\n_Try: "12% of 450" · "10 miles to km" · "quiz me on my notes" · "remember that my exam is Friday"_`;
  }
  if (/^(hi|hey|hello|yo|namaste)\b/i.test(text) && text.length < 24) {
    step('👁 Understand the message', 'done'); step('💡 Answer', 'done');
    FAA.setTrace(['greeting: no tool needed']);
    const t = tone(agent);
    const role = FAA.ROLES[agent.role];
    return `${t.opener}I'm **${FAA.esc(agent.name)}** ${role.icon}, ${role.frame}. ${agent.kb ? 'I\'ve got your knowledge base loaded. ' : ''}Ask me anything — or say **help** to see my tools.${t.closer}`;
  }

  /* --- score tools --- */
  step('👁 Understand the message', 'done');
  step('🗺 Plan: pick the right tool', 'doing');
  await FAA.sleep(380);
  const scored = FAA.TOOLS
    .filter(t => agent.tools[t.id])
    .map(t => {
      let s = (t.match ? t.match(text) : 0);
      const low = text.toLowerCase();
      for (const k of t.triggers) if (low.includes(k)) s += 1;
      return { t, s };
    })
    .sort((a, b) => b.s - a.s);
  trace.push('intent scores: ' + scored.slice(0, 4).map(x => `${x.t.id}=${x.s}`).join(', '));
  const winner = scored[0] && scored[0].s >= 2 ? scored[0].t : null;
  if (winner) step('🗺 Plan: pick the right tool', 'done');
  else step('🗺 Plan: pick the right tool', 'done');

  /* --- tool route --- */
  if (winner) {
    const planLabel = { calc: 'calculate', convert: 'convert units', summarise: 'summarise text', quiz: 'build a quiz', flashcards: 'make flashcards', vocab: 'explain a word', planner: 'draft a plan', schedule: 'build a timetable', notes: 'organise notes', proscons: 'weigh the decision' }[winner.id];
    step(`🗺 Plan: ${planLabel} → answer`, 'doing');
    await FAA.sleep(300); step(`🗺 Plan: ${planLabel} → answer`, 'done');
    step('🧰 Run tool: ' + winner.name, 'doing');
    await FAA.sleep(420);
    let res;
    try { res = await winner.run(text, ctx); }
    catch (e) { res = { text: 'That tool hit an error — mind rephrasing?', trace: winner.id + ': exception ' + e.message }; }
    step('🧰 Run tool: ' + winner.name, 'done');
    step('💡 Answer in character', 'doing');
    await FAA.sleep(280); step('💡 Answer in character', 'done');
    trace.push(res.trace || winner.id + ': ran');
    FAA.setTrace(trace);
    FAA.checkMission('tools');
    if (res.html) return res;
    return FAA.applyStyle(res.text, agent);
  }

  /* --- knowledge base route --- */
  if (agent.kb && agent.kb.trim().length > 40) {
    step('📚 Search knowledge base', 'doing');
    await FAA.sleep(450);
    const hit = kbAnswer(text, agent.kb);
    if (hit) {
      step('📚 Search knowledge base', 'done');
      step('💡 Answer from knowledge', 'doing');
      await FAA.sleep(280); step('💡 Answer from knowledge', 'done');
      trace.push(`kb: matched chunk on "${hit.shared.slice(0, 4).join(', ')}"`);
      FAA.setTrace(trace);
      FAA.checkMission('stump');
      const t = tone(agent);
      return `${t.opener}From your knowledge base:\n\n> ${FAA.esc(hit.chunk)}\n\n${t.closer}`;
    }
    step('📚 Search knowledge base', 'done');
    trace.push('kb: no chunk matched (need ≥2 keyword overlaps)');
  }

  /* --- fallback chat --- */
  step('💡 Answer in character', 'doing');
  await FAA.sleep(350); step('💡 Answer in character', 'done');
  trace.push('fallback: no tool, no KB hit — conversational reply');
  FAA.setTrace(trace);
  const t = tone(agent);
  const role = FAA.ROLES[agent.role];
  const mem = FAA.state.memory.length ? ` I remember ${FAA.state.memory.length} thing${FAA.state.memory.length > 1 ? 's' : ''} about you, by the way.` : '';
  const kbHint = agent.kb ? '' : ' If you paste notes into my knowledge base (Studio tab), I can answer from them.';
  return `${t.opener}As ${role.frame}, I want to give you a useful answer — but I don't have a tool or knowledge for that one yet.${mem}${kbHint} Try **help** to see what I *can* do, or enable more tools in the Studio.${t.closer}`;
};

/* apply custom instructions lightly: honour brevity requests */
FAA.applyStyle = function (text, agent) {
  const ins = (agent.instructions || '').toLowerCase();
  if (/(short|brief|concise|under \d|1-2 sentences)/.test(ins)) {
    const parts = text.split(/\n\n/);
    if (parts.length > 2) return parts.slice(0, 2).join('\n\n') + '\n\n_(trimmed per your instructions)_';
  }
  return text;
};

/* ---------- quiz interaction ---------- */
FAA.quizAsk = function (ctx, first) {
  const qz = ctx.session.quiz;
  const q = qz.qs[qz.i];
  const letters = ['A', 'B', 'C', 'D'];
  const html = `<div class="quiz-q"><b>Question ${qz.i + 1}/${qz.n}</b> · score ${qz.score}<br><br>${FAA.md(q.q)}<br>` +
    q.options.map((o, i) => `<button class="qbtn" data-quiz="${i}">${letters[i]}. ${FAA.esc(o.length > 90 ? o.slice(0, 90) + '…' : o)}</button>`).join('') + '</div>';
  return { html, text: null, trace: `quiz: Q${qz.i + 1}/${qz.n} asked` };
};
FAA.quizAnswer = async function (choice) {
  const qz = FAA.state.session.quiz;
  if (!qz) return;
  const q = qz.qs[qz.i];
  const right = choice === q.answer;
  if (right) qz.score++;
  qz.i++;
  const letters = ['A', 'B', 'C', 'D'];
  let html;
  if (qz.i >= qz.qs.length) {
    const pct = Math.round(100 * qz.score / qz.n);
    const verdict = pct === 100 ? '🏆 Flawless. Quiz master approved.' : pct >= 60 ? '💪 Solid — review the ones you missed.' : '📚 Worth another pass over the material.';
    html = `<b>Quiz complete!</b><br><br>You scored <b>${qz.score}/${qz.n}</b> (${pct}%).<br>${verdict}<br><br><button class="qbtn" data-quiz-restart="1">↻ Run it again</button>`;
    FAA.state.session.quiz = null;
  } else {
    const nq = qz.qs[qz.i];
    html = `${right ? '✅' : '❌'} <b>${right ? 'Correct!' : 'Not quite — the answer was ' + letters[q.answer] + '.'}</b><br><br><b>Question ${qz.i + 1}/${qz.n}</b> · score ${qz.score}<br><br>${FAA.md(nq.q)}<br>` +
      nq.options.map((o, i) => `<button class="qbtn" data-quiz="${i}">${letters[i]}. ${FAA.esc(o.length > 90 ? o.slice(0, 90) + '…' : o)}</button>`).join('');
  }
  FAA.appendAgent(html, true);
};

/* ---------- flashcard interaction ---------- */
FAA.deckShow = function (ctx, first) {
  const d = ctx.session.deck;
  const c = d.cards[d.i];
  const html = `<b>🃏 Flashcards</b> — card ${d.i + 1}/${d.cards.length}<br>` +
    `<div class="fcard" data-deck="flip"><div>${d.flipped ? FAA.esc(c.back) : FAA.esc(c.front)}<span class="side-hint">${d.flipped ? 'BACK — click to flip' : 'FRONT — click to flip'}</span></div></div>` +
    `<button class="qbtn" data-deck="prev">← Prev</button><button class="qbtn" data-deck="flip">Flip</button>` +
    `<button class="qbtn" data-deck="shuffle">🔀 Shuffle</button><button class="qbtn" data-deck="next">Next →</button>`;
  return { html, text: null, trace: `flashcards: deck of ${d.cards.length} built` };
};
FAA.deckNav = function (action) {
  const d = FAA.state.session.deck;
  if (!d) return;
  if (action === 'flip') d.flipped = !d.flipped;
  if (action === 'next') { d.i = (d.i + 1) % d.cards.length; d.flipped = false; }
  if (action === 'prev') { d.i = (d.i - 1 + d.cards.length) % d.cards.length; d.flipped = false; }
  if (action === 'shuffle') { d.cards = shuffle(d.cards); d.i = 0; d.flipped = false; }
  const last = document.querySelector('#chat-log .msg.agent:last-child');
  if (last) last.innerHTML = `<div class="who">${FAA.avatarTile(FAA.state.agent.avatar)} ${FAA.esc(FAA.state.agent.name)} · Flashcards</div>` + FAA.deckShow({ session: FAA.state.session }).html;
};
