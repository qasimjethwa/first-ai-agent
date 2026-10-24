/* First AI Agent — chat UI, brain panel, memory panel */
'use strict';

FAA.renderBrain = function (steps) {
  const el = FAA.$('brain-steps');
  FAA.$('brain-live').hidden = false;
  el.innerHTML = steps.map(s => {
    const label = s.label.replace(/^\S+\s+/, ''); /* strip the step's emoji prefix — the checklist carries the meaning */
    return `<li class="${s.state}"><span class="st">${s.state === 'done' ? '✓' : s.state === 'doing' ? '…' : ''}</span><span>${FAA.esc(label)}</span></li>`;
  }).join('');
  FAA.$('brain-sub').textContent = 'Live trace of this reply — this is the agent loop.';
};

FAA.setTrace = function (lines) {
  const d = FAA.$('brain-detail');
  d.hidden = false;
  FAA.$('brain-trace').textContent = lines.filter(Boolean).join('\n');
  setTimeout(() => { FAA.$('brain-live').hidden = true; }, 600);
};

FAA.brainReset = function () {
  FAA.$('brain-steps').innerHTML = '<li class="brain-idle">Send a message and watch the loop fire.</li>';
  FAA.$('brain-sub').textContent = 'Every reply shows the real loop: understand → plan → pick a tool → run it → answer.';
};

function who(agent) {
  return `<div class="who">${FAA.avatarTile(agent.avatar)} ${FAA.esc(agent.name)} · ${FAA.esc(FAA.ROLES[agent.role].label)}</div>`;
}

FAA.appendUser = function (text) {
  const log = FAA.$('chat-log');
  const d = document.createElement('div');
  d.className = 'msg user';
  d.textContent = text;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
};

FAA.appendAgent = function (content, isHtml) {
  const log = FAA.$('chat-log');
  const agent = FAA.state.agent;
  const d = document.createElement('div');
  d.className = 'msg agent';
  d.innerHTML = who(agent) + (isHtml ? content : FAA.md(content));
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
  return d;
};

FAA.appendSys = function (text) {
  const log = FAA.$('chat-log');
  const d = document.createElement('div');
  d.className = 'msg sys';
  d.innerHTML = text;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
};

let sending = false;
FAA.send = async function (text) {
  if (sending || !text.trim()) return;
  sending = true;
  FAA.appendUser(text.trim());
  FAA.$('chat-input').value = '';
  const typing = FAA.appendAgent('<span class="typing"><i></i><i></i><i></i></span>', true);
  try {
    const reply = await FAA.runLoop(text.trim());
    typing.remove();
    if (reply && reply.html !== undefined && reply.text === null) {
      FAA.appendAgent(reply.html, true);
    } else {
      FAA.appendAgent(typeof reply === 'string' ? reply : reply.text || '');
    }
  } catch (e) {
    typing.remove();
    FAA.appendAgent('Something glitched on my end — try that again?');
  }
  sending = false;
};

/* ---------- memory panel ---------- */
FAA.renderMemory = function () {
  const list = FAA.$('memory-list');
  FAA.$('memory-count').textContent = FAA.state.memory.length;
  const c2 = FAA.$('memory-count-2');
  if (c2) c2.textContent = FAA.state.memory.length;
  if (!FAA.state.memory.length) {
    list.innerHTML = '<li class="memory-empty">Nothing stored yet.</li>';
  } else {
    list.innerHTML = FAA.state.memory.map(f =>
      `<li><span>${FAA.esc(f.text)}</span><button class="del" data-forget="${f.id}" title="Forget">✕</button></li>`
    ).join('');
  }
  if (FAA.renderHome) FAA.renderHome();
};

/* ---------- quick chips ---------- */
const CHIPS = [
  '12% of 450', '10 miles to km', 'Quiz me on my notes',
  'Remember that my exam is Friday', 'Pros and cons of learning Rust', 'Plan my day: emails, gym, study'
];
FAA.renderChips = function () {
  FAA.$('quick-chips').innerHTML = CHIPS.map(c => `<button class="chip" data-chip="${FAA.esc(c)}">${FAA.esc(c)}</button>`).join('');
};

FAA.syncChatHeader = function () {
  const a = FAA.state.agent;
  FAA.$('chat-avatar').innerHTML = FAA.robotSVG(a.avatar);
  FAA.$('chat-agent-name').textContent = a.name;
  FAA.$('chat-agent-role').textContent = FAA.ROLES[a.role].label;
};

/* ---------- delegated clicks: chips, quiz, deck, memory ---------- */
document.addEventListener('click', e => {
  const chip = e.target.closest('[data-chip]');
  if (chip) { FAA.send(chip.dataset.chip); return; }
  const qb = e.target.closest('[data-quiz]');
  if (qb && !qb.disabled) {
    qb.disabled = true;
    qb.closest('.msg').querySelectorAll('[data-quiz]').forEach(b => b.disabled = true);
    FAA.quizAnswer(parseInt(qb.dataset.quiz));
    return;
  }
  if (e.target.closest('[data-quiz-restart]')) {
    FAA.send('quiz me on my notes');
    return;
  }
  const dk = e.target.closest('[data-deck]');
  if (dk) { FAA.deckNav(dk.dataset.deck); return; }
  const fg = e.target.closest('[data-forget]');
  if (fg) {
    FAA.state.memory = FAA.state.memory.filter(f => f.id !== fg.dataset.forget);
    FAA.save(); FAA.renderMemory();
    return;
  }
});

document.addEventListener('submit', e => {
  if (e.target.id === 'chat-form') {
    e.preventDefault();
    FAA.send(FAA.$('chat-input').value);
  }
});

/* Enter sends, Shift+Enter = newline */
document.addEventListener('keydown', e => {
  if (e.target.id === 'chat-input' && e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    FAA.send(e.target.value);
  }
});
