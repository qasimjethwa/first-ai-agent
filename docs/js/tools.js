/* First AI Agent — the 10 tools. Every tool really runs client-side. */
'use strict';

/* ============ TOOL 1: calculator ============ */
function calcEval(src) {
  let expr = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '');
  // "12% of 450" / "12 percent of 450"
  let m = expr.match(/([\d.]+)\s*(%|percent)\s*of\s*([\d.]+)/i);
  if (m) return { value: parseFloat(m[1]) / 100 * parseFloat(m[3]), shown: `${m[1]}% of ${m[3]}` };
  expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
  const tok = expr.match(/sqrt|abs|sin|cos|tan|\d+\.?\d*|\.\d+|[+\-*/^()]/gi);
  if (!tok) return { error: true };
  // validate: tokens must reconstruct the expression (minus spaces)
  if (tok.join('') !== expr.replace(/\s+/g, '')) return { error: true };
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3, u: 4 };
  const fn = { sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan };
  const out = [], ops = [];
  const apply = () => {
    const op = ops.pop();
    if (op === 'u') { out.push(-out.pop()); return; }
    if (fn[op]) { out.push(fn[op](out.pop())); return; }
    const b = out.pop(), a = out.pop();
    out.push(op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : op === '/' ? a / b : Math.pow(a, b));
  };
  let prev = null;
  for (const t of tok) {
    if (/^\d/.test(t) || /^\.\d/.test(t)) { out.push(parseFloat(t)); }
    else if (fn[t.toLowerCase()]) { ops.push(t.toLowerCase()); }
    else if (t === '(') { ops.push(t); }
    else if (t === ')') { while (ops.length && ops[ops.length - 1] !== '(') apply(); ops.pop(); if (ops.length && fn[ops[ops.length - 1]]) apply(); }
    else {
      let op = t;
      if ((t === '-' || t === '+') && (prev === null || prev === '(' || '+-*/^'.includes(prev))) op = t === '-' ? 'u' : null;
      if (op === null) { prev = t; continue; }
      while (ops.length && ops[ops.length - 1] !== '(' && (prec[ops[ops.length - 1]] > prec[op] || (prec[ops[ops.length - 1]] === prec[op] && op !== '^' && op !== 'u'))) apply();
      ops.push(op);
    }
    prev = t;
  }
  while (ops.length) apply();
  if (out.length !== 1 || !isFinite(out[0])) return { error: true };
  return { value: out[0], shown: src.trim() };
}

/* ============ TOOL 2: unit converter ============ */
const UNIT_CATS = {
  length: { units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 } },
  mass: { units: { mg: 1e-6, g: 0.001, kg: 1, oz: 0.0283495, lb: 0.453592, t: 1000 } },
  speed: { units: { 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, 'ft/s': 0.3048 } },
  data: { units: { b: 1, kb: 1e3, mb: 1e6, gb: 1e9, tb: 1e12 } },
  time: { units: { s: 1, sec: 1, min: 60, hr: 3600, h: 3600, day: 86400, week: 604800 } }
};
const UNIT_ALIASES = {
  millimeter: 'mm', millimeters: 'mm', centimeter: 'cm', centimeters: 'cm', meter: 'm', meters: 'm', metre: 'm', metres: 'm',
  kilometer: 'km', kilometers: 'km', kilometre: 'km', kilometres: 'km', inch: 'in', inches: 'in', foot: 'ft', feet: 'ft',
  yard: 'yd', yards: 'yd', mile: 'mi', miles: 'mi', milligram: 'mg', milligrams: 'mg', gram: 'g', grams: 'g',
  kilogram: 'kg', kilograms: 'kg', ounce: 'oz', ounces: 'oz', pound: 'lb', pounds: 'lb', lbs: 'lb', ton: 't', tons: 't',
  celsius: 'c', centigrade: 'c', fahrenheit: 'f', kelvin: 'k', second: 's', seconds: 's', secs: 's', minute: 'min',
  minutes: 'min', mins: 'min', hour: 'hr', hours: 'hr', hours: 'hr', day: 'day', days: 'day', week: 'week', weeks: 'week',
  byte: 'b', bytes: 'b', kilobyte: 'kb', kilobytes: 'kb', megabyte: 'mb', megabytes: 'mb', gigabyte: 'gb', gigabytes: 'gb',
  terabyte: 'tb', terabytes: 'tb', kmh: 'km/h', kph: 'km/h', ms: 'm/s'
};
function normUnit(u) {
  u = u.toLowerCase().replace(/°/g, '').replace(/s$/, s => s); // keep simple
  u = u.replace(/per/g, '/');
  if (UNIT_ALIASES[u]) return UNIT_ALIASES[u];
  return u;
}
function unitCat(u) { for (const c in UNIT_CATS) if (UNIT_CATS[c].units[u]) return c; return null; }
function convertVal(v, from, to) {
  from = normUnit(from); to = normUnit(to);
  if (['c', 'f', 'k'].includes(from) || ['c', 'f', 'k'].includes(to)) {
    if (!['c', 'f', 'k'].includes(from) || !['c', 'f', 'k'].includes(to)) return null;
    let c = from === 'c' ? v : from === 'f' ? (v - 32) * 5 / 9 : v - 273.15;
    return to === 'c' ? c : to === 'f' ? c * 9 / 5 + 32 : c + 273.15;
  }
  const cf = unitCat(from), ct = unitCat(to);
  if (!cf || cf !== ct) return null;
  return v * UNIT_CATS[cf].units[from] / UNIT_CATS[cf].units[to];
}

/* ============ TOOL 3: extractive summariser ============ */
function summarise(text, maxS = 3) {
  const sents = FAA.sentences(text);
  if (sents.length <= maxS) return { summary: sents, sents, kept: sents.length };
  const freq = {};
  FAA.keywords(text).forEach(w => freq[w] = (freq[w] || 0) + 1);
  const scored = sents.map((s, i) => {
    const ks = FAA.keywords(s);
    const score = ks.reduce((a, w) => a + (freq[w] || 0), 0) / Math.max(1, Math.sqrt(ks.length));
    return { s, i, score: score + (i === 0 ? 0.6 : 0) + (i === sents.length - 1 ? 0.25 : 0) };
  });
  const top = scored.sort((a, b) => b.score - a.score).slice(0, maxS).sort((a, b) => a.i - b.i);
  return { summary: top.map(t => t.s), sents, kept: maxS };
}

/* ============ shared fact extraction (quiz + flashcards) ============ */
function extractFacts(text) {
  const facts = [];
  for (const s of FAA.sentences(text)) {
    const m = s.match(/^(.{2,42}?)\s+(is|are|was|were|means)\s+(.{5,140})$/);
    if (m && !/^(it|this|that|they|he|she|we|you)$/i.test(m[1].trim()))
      facts.push({ type: 'def', term: m[1].trim().replace(/^the /i, ''), def: m[3].trim(), sentence: s });
    const nums = s.match(/\b\d[\d,.]*(?:\s*(?:%|percent|million|billion|thousand))?\b/gi);
    if (nums && nums.length)
      facts.push({ type: 'num', sentence: s, numbers: [...new Set(nums.map(n => n.trim()))].slice(0, 2) });
  }
  return facts;
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ============ TOOL 6 fallback: affix-based word breakdown ============ */
const PREFIXES = ['un', 're', 'pre', 'dis', 'mis', 'over', 'under', 'sub', 'super', 'anti', 'auto', 'bi', 'tri', 'micro', 'macro', 'tele', 'photo', 'geo', 'bio', 'hyper', 'hypo', 'inter', 'intra', 'trans', 'de', 'ex', 'en', 'em', 'non', 'counter', 'co', 'post', 'semi', 'multi', 'poly', 'mono', 'omni', 'neo', 'arch', 'chron', 'morph', 'path', 'phon', 'graph', 'therm', 'psycho', 'socio'];
const SUFFIXES = ['tion', 'sion', 'ness', 'ment', 'ity', 'able', 'ible', 'less', 'ful', 'ous', 'ive', 'ic', 'al', 'ary', 'ery', 'ory', 'ate', 'ify', 'ize', 'ise', 'ist', 'ism', 'er', 'or', 'ly', 'ing', 'ed'];
function syllables(w) { const m = w.toLowerCase().replace(/[^a-z]/g, '').replace(/e$/, '').match(/[aeiouy]+/g); return Math.max(1, m ? m.length : 1); }
function affixBreak(w) {
  w = w.toLowerCase().replace(/[^a-z]/g, '');
  let pre = '', suf = '', root = w;
  for (const p of PREFIXES.sort((a, b) => b.length - a.length))
    if (root.startsWith(p) && root.length - p.length >= 3) { pre = p; root = root.slice(p.length); break; }
  for (const s of SUFFIXES.sort((a, b) => b.length - a.length))
    if (root.endsWith(s) && root.length - s.length >= 3) { suf = s; root = root.slice(0, -s.length); break; }
  return { pre, root, suf, syllables: syllables(w) };
}

/* ============ THE TOOL REGISTRY ============ */
FAA.TOOLS = [
  {
    id: 'calc', icon: '🧮', name: 'Calculator',
    desc: 'Real math: expressions, percentages, roots.',
    triggers: ['calculat', 'compute', ' percent of', 'percentage', 'sqrt(', 'square root', 'how much is', 'solve '],
    match: t => /(\d[\d.,\s]*[+\-*/^%×÷][\d\s+\-*/^%×÷().]*)|(\d+\s*%?\s*(percent\s+)?of\s+\d+)|sqrt\s*\(/i.test(t) ? 3 : 0,
    run(text) {
      let expr = text.replace(/^(calculate|compute|solve|what is|what's|how much is)\s+/i, '').replace(/\?$/, '').trim();
      const r = calcEval(expr);
      if (r.error) return { text: `I couldn't parse that as math. Try something like "12% of 450" or "(8+4)*3".`, trace: `calc: parse failed on "${expr}"` };
      return { text: `**${FAA.esc(r.shown)} = ${FAA.fmtNum(r.value)}**`, trace: `calc: "${r.shown}" = ${r.value}` };
    }
  },
  {
    id: 'convert', icon: '📐', name: 'Unit converter',
    desc: 'Length, mass, temperature, speed, data, time.',
    triggers: ['convert', 'celsius', 'fahrenheit', 'kelvin', ' miles', ' kilometer', ' pounds', ' kilogram'],
    match: t => /[\d.]+\s*[a-z°\/]+\s+(to|in|as|=)\s*[a-z°\/]+/i.test(t) ? 3 : 0,
    run(text) {
      const m = text.match(/([\d.,]+)\s*([a-zA-Z°\/]+)\s+(?:to|in|as|=)\s*([a-zA-Z°\/]+)/i);
      if (!m) return { text: 'Give me a conversion like **"10 miles to km"** or **"32 F to C"**.', trace: 'convert: no pattern found' };
      const v = parseFloat(m[1].replace(/,/g, ''));
      const out = convertVal(v, m[2], m[3]);
      if (out === null) return { text: `I can't convert ${m[2]} → ${m[3]}. I handle length, mass, temperature, speed, data and time.`, trace: `convert: incompatible ${m[2]} -> ${m[3]}` };
      return { text: `**${v} ${m[2]} = ${FAA.fmtNum(out)} ${m[3]}**`, trace: `convert: ${v} ${m[2]} -> ${out} ${m[3]}` };
    }
  },
  {
    id: 'summarise', icon: '📝', name: 'Summariser',
    desc: 'Extractive summaries of pasted text or your notes.',
    triggers: ['summar', 'tl;dr', 'tldr', 'key points', 'in brief', 'condense'],
    match: t => /(summar|tl;?dr|condense)/i.test(t) ? 2 : 0,
    run(text, ctx) {
      let body = text.replace(/^(please\s+)?(summarise|summarize|condense)\s+(this|it|the following|my notes|the text)?\s*:?\s*/i, '').trim();
      if (/^(my notes|my knowledge|the knowledge base)$/i.test(body) || (!body && ctx.kb)) body = ctx.kb;
      if (!body || body.length < 60) {
        ctx.session.pending = { tool: 'summarise' };
        return { text: 'Paste the text you want summarised and I\'ll pull out the key sentences.', trace: 'summarise: waiting for text' };
      }
      const { summary, sents, kept } = summarise(body, 3);
      const pct = Math.round(100 * kept / Math.max(1, sents.length));
      return {
        text: `**Summary** (${sents.length} → ${kept} sentences):\n\n${summary.map(s => `- ${s}`).join('\n')}`,
        trace: `summarise: ${sents.length} sentences scored by term frequency, kept top ${kept} (${pct}% of original)`
      };
    },
    resume(body, ctx) {
      ctx.session.pending = null;
      return FAA.TOOLS.find(t => t.id === 'summarise').run('summarise: ' + body, ctx);
    }
  },
  {
    id: 'quiz', icon: '❓', name: 'Quiz generator',
    desc: 'Builds real quizzes from your notes. Interactive.',
    triggers: ['quiz', 'test me', 'ask me', 'practice questions', 'mcq'],
    match: t => /(quiz|test me|practice questions|ask me .*question)/i.test(t) ? 3 : 0,
    run(text, ctx) {
      if (/stop|quit|cancel/i.test(text) && ctx.session.quiz) { ctx.session.quiz = null; return { text: 'Quiz stopped. Say "quiz me" anytime to run it again.', trace: 'quiz: stopped' }; }
      let src = text.replace(/^(make|give|create)\s+(me\s+)?a?\s*quiz\s+(on|about|from)?\s*/i, '').replace(/^(quiz me|test me)\s+(on|about)?\s*/i, '').trim();
      if (!src || /^(my notes|my knowledge)$/i.test(src)) src = ctx.kb;
      if (!src || src.length < 60) {
        ctx.session.pending = { tool: 'quiz' };
        return { text: 'Paste the material you want to be quizzed on — or say **"quiz me on my notes"** if your knowledge base is loaded.', trace: 'quiz: waiting for material' };
      }
      const facts = extractFacts(src);
      if (facts.length < 2) return { text: 'I need at least a couple of factual sentences (with numbers or "X is Y" definitions) to build a quiz.', trace: 'quiz: too few facts' };
      const pool = shuffle(facts).slice(0, 5);
      const numPool = facts.filter(f => f.type === 'num').flatMap(f => f.numbers);
      const defPool = facts.filter(f => f.type === 'def');
      const qs = pool.map((f, i) => {
        if (f.type === 'num') {
          const ans = f.numbers[0];
          const distract = shuffle(numPool.filter(n => n !== ans)).slice(0, 3);
          while (distract.length < 3) distract.push(String(Math.round(parseFloat(ans.replace(/[^0-9.]/g, '')) * (1 + 0.2 * (distract.length + 1)) * 100) / 100));
          const q = f.sentence.replace(ans, '**____**');
          return { q: `Fill in the blank:\n\n"${q}"`, options: shuffle([ans, ...distract.slice(0, 3)]), answer: 0 };
        }
        const others = shuffle(defPool.filter(d => d.term !== f.term)).slice(0, 3).map(d => d.def);
        while (others.length < 3) others.push('(none of these)');
        const opts = shuffle([f.def, ...others.slice(0, 3)]);
        return { q: `What is **${f.term}**?`, options: opts, answer: opts.indexOf(f.def) };
      });
      qs.forEach(q => q.answer = q.options.indexOf(q.options[q.answer]));
      ctx.session.quiz = { qs, i: 0, score: 0, n: qs.length };
      return FAA.quizAsk(ctx, true);
    },
    resume(body, ctx) {
      ctx.session.pending = null;
      return FAA.TOOLS.find(t => t.id === 'quiz').run('quiz on ' + body, ctx);
    }
  },
  {
    id: 'flashcards', icon: '🃏', name: 'Flashcard maker',
    desc: 'Turns notes into flippable flashcards.',
    triggers: ['flashcard', 'flash card', 'memoris', 'memorize'],
    match: t => /flash\s*cards?/i.test(t) ? 3 : 0,
    run(text, ctx) {
      let src = text.replace(/^(make|create|give me)\s+(some\s+)?flashcards?\s+(on|about|from)?\s*/i, '').trim();
      if (!src || /^(my notes|my knowledge)$/i.test(src)) src = ctx.kb;
      if (!src || src.length < 40) {
        ctx.session.pending = { tool: 'flashcards' };
        return { text: 'Paste the material (or "term: definition" lines) and I\'ll turn it into flashcards.', trace: 'flashcards: waiting for material' };
      }
      const cards = [];
      for (const line of src.split('\n')) {
        const m = line.match(/^(.{2,50}?)\s*[:–—-]\s*(.{4,160})$/);
        if (m) cards.push({ front: m[1].trim(), back: m[2].trim() });
      }
      for (const f of extractFacts(src).filter(f => f.type === 'def'))
        if (!cards.some(c => c.front.toLowerCase() === f.term.toLowerCase()))
          cards.push({ front: f.term, back: f.def });
      if (!cards.length) return { text: 'I couldn\'t find term/definition pairs. Try "Photosynthesis: converts light to chemical energy" style lines.', trace: 'flashcards: no pairs found' };
      ctx.session.deck = { cards: shuffle(cards.slice(0, 20)), i: 0, flipped: false };
      return FAA.deckShow(ctx, true);
    },
    resume(body, ctx) {
      ctx.session.pending = null;
      return FAA.TOOLS.find(t => t.id === 'flashcards').run('flashcards ' + body, ctx);
    }
  },
  {
    id: 'vocab', icon: '📖', name: 'Word explainer',
    desc: 'Definitions via dictionary API, offline fallback.',
    triggers: ['define', 'definition', 'meaning of', 'what does', 'explain the word', 'vocab', 'synonym'],
    match: t => /(define|definition of|meaning of|what does .* mean|explain the word)/i.test(t) ? 2 : 0,
    async run(text) {
      const m = text.match(/(?:define|definition of|meaning of|what does|explain the word)\s+(?:the word\s+)?["“]?([a-zA-Z-]{2,30})["”]?/i);
      const word = m ? m[1].toLowerCase() : null;
      if (!word) return { text: 'Which word? Try **"define serendipity"**.', trace: 'vocab: no word found' };
      try {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word), { signal: ctrl.signal });
        clearTimeout(to);
        if (res.ok) {
          const d = await res.json();
          const e = d[0];
          const defs = (e.meanings || []).slice(0, 2).map(mn =>
            `**${mn.partOfSpeech || 'word'}** — ${((mn.definitions || [])[0] || {}).definition || '—'}`).join('\n');
          const ex = ((e.meanings || [])[0] || {}).definitions;
          const example = ex && ex[0] && ex[0].example ? `\n\n*Example: "${ex[0].example}"*` : '';
          return {
            text: `**${e.word}** ${e.phonetic ? `(${e.phonetic})` : ''}\n\n${defs}${example}\n\n_Breakdown: ${affixBreak(word).syllables} syllable(s)._`,
            trace: `vocab: dictionaryapi.dev lookup for "${word}" ✓`
          };
        }
      } catch (err) { /* offline fallback below */ }
      const b = affixBreak(word);
      const parts = [b.pre && `prefix **${b.pre}-**`, `root **${b.root}**`, b.suf && `suffix **-${b.suf}**`].filter(Boolean).join(' + ');
      return {
        text: `**${word}** — dictionary is unreachable right now, so here's the structural breakdown:\n\n${parts}\n${b.syllables} syllable(s), ${word.length} letters.\n\n_Tip: the root usually carries the core meaning — try it in a sentence and I'll sanity-check your usage._`,
        trace: `vocab: offline affix breakdown for "${word}"`
      };
    }
  },
  {
    id: 'planner', icon: '📋', name: 'Task planner',
    desc: 'Turns a brain-dump into a timeboxed plan.',
    triggers: ['plan my', 'plan for', 'to-do', 'todo', 'task list', 'organise my day', 'organize my day', 'schedule my day'],
    match: t => /(plan my|to-?do|task list|organis[ez]e my day)/i.test(t) ? 2 : 0,
    run(text) {
      let body = text.replace(/^(please\s+)?(plan|organise|organize)\s+(my\s+)?(day|tasks|tomorrow|week)?\s*:?\s*/i, '').trim();
      if (!body) return { text: 'Dump your tasks here — e.g. **"plan my day: emails, workout, study transformers, call bank"** — and I\'ll order and timebox them.', trace: 'planner: no tasks given' };
      const raw = body.split(/[\n;]+|,(?![^()]*\))/).map(s => s.trim()).filter(s => s.length > 1);
      const dur = t => {
        t = t.toLowerCase();
        if (/email|inbox/.test(t)) return 15; if (/meeting|call/.test(t)) return 30;
        if (/workout|gym|run/.test(t)) return 45; if (/study|learn|read|course/.test(t)) return 50;
        if (/cook|lunch|dinner|eat/.test(t)) return 40; if (/code|build|project/.test(t)) return 60;
        return 25;
      };
      let mins = 9 * 60;
      const rows = raw.slice(0, 12).map(t => {
        const d = dur(t);
        const s = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
        mins += d;
        const e = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
        return `| ☐ | ${t} | ${s}–${e} | ${d}m |`;
      });
      const total = mins - 540;
      return {
        text: `**Your plan** — ${raw.length} tasks, ~${Math.floor(total / 60)}h ${total % 60}m:\n\n|  | Task | Time | For |\n|---|---|---|---|\n${rows.join('\n')}\n\n_Hardest task is placed early. Adjust by telling me new durations._`,
        trace: `planner: ${raw.length} tasks sequenced from 09:00, ${total} min total`
      };
    }
  },
  {
    id: 'schedule', icon: '🗓', name: 'Study-schedule maker',
    desc: 'Spaced-repetition timetables from subjects + hours.',
    triggers: ['study schedule', 'study plan', 'timetable', 'revision plan', 'study timetable'],
    match: t => /(study (schedule|plan)|timetable|revision plan)/i.test(t) ? 3 : 0,
    run(text, ctx) {
      const subjM = text.match(/subjects?\s*:\s*([^;.\n]+)/i);
      const daysM = text.match(/(\d+)\s*days?/i);
      const hrsM = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\s*(?:per|a|\/)?\s*day/i);
      if (!subjM || !daysM || !hrsM) {
        ctx.session.pending = { tool: 'schedule' };
        return { text: 'Tell me: **subjects, days, hours per day** — e.g. _"subjects: math, physics, chemistry; 6 days; 2 hours per day"_ — and I\'ll build a spaced-repetition timetable.', trace: 'schedule: waiting for subjects/days/hours' };
      }
      const subjects = subjM[1].split(',').map(s => s.trim()).filter(Boolean).slice(0, 8);
      const days = FAA.clamp(parseInt(daysM[1]), 1, 14), hpd = FAA.clamp(parseFloat(hrsM[1]), 0.5, 8);
      const slots = Math.floor(hpd);
      let rows = [];
      for (let d = 1; d <= days; d++) {
        const cells = [];
        for (let s = 0; s < slots; s++) {
          const idx = (d - 1 + s) % subjects.length;
          const isReview = (d + s) % 3 === 0 && d > 1;
          cells.push(isReview ? `🔁 ${subjects[(idx + subjects.length - 1) % subjects.length]}` : subjects[idx]);
        }
        rows.push(`| Day ${d} | ${cells.join(' | ')} |`);
      }
      const header = `| Day | ${Array.from({ length: slots }, (_, i) => `Hour ${i + 1}`).join(' | ')} |`;
      return {
        text: `**${days}-day study plan** — ${subjects.join(', ')} (${hpd}h/day):\n\n${header}\n|---|${'---|'.repeat(slots)}\n${rows.join('\n')}\n\n🔁 = spaced review of an earlier subject. Consistency beats cramming.`,
        trace: `schedule: ${days} days × ${slots}h, ${subjects.length} subjects, review every 3rd slot`
      };
    },
    resume(body, ctx) {
      ctx.session.pending = null;
      return FAA.TOOLS.find(t => t.id === 'schedule').run('study schedule ' + body, ctx);
    }
  },
  {
    id: 'notes', icon: '🗂', name: 'Note organiser',
    desc: 'Turns messy pasted notes into structure.',
    triggers: ['organis', 'organize', 'messy notes', 'tidy', 'my notes'],
    match: t => /(organis|organiz)e (my |these )?notes|messy notes|tidy .*notes/i.test(t) ? 2 : 0,
    run(text, ctx) {
      let body = text.replace(/^(please\s+)?(organise|organize|tidy up)\s+(my|these)?\s*notes?\s*:?\s*/i, '').trim();
      if (!body || body.length < 30) {
        ctx.session.pending = { tool: 'notes' };
        return { text: 'Paste your messy notes and I\'ll sort them into headings, key points and action items.', trace: 'notes: waiting for notes' };
      }
      const heads = [], actions = [], bullets = [];
      for (const line of body.split('\n').map(l => l.trim()).filter(Boolean)) {
        const clean = line.replace(/^[-•*#\d.)\s]+/, '');
        if (/^(#{1,3}\s|.*:$)/.test(line) || (line === line.toUpperCase() && line.length < 60 && /[A-Z]/.test(line))) heads.push({ h: clean.replace(/:$/, ''), items: [] });
        else if (/(todo|to-do|need to|must|should|follow ?up|deadline|asap|remind)/i.test(line)) actions.push(clean);
        else (heads.length ? heads[heads.length - 1].items : bullets).push(clean);
      }
      let out = '**Organised notes**\n';
      heads.forEach(h => { out += `\n### ${h.h}\n` + h.items.map(i => `- ${i}`).join('\n'); });
      if (bullets.length) out += `\n### Notes\n` + bullets.map(i => `- ${i}`).join('\n');
      if (actions.length) out += `\n\n### ✅ Action items\n` + actions.map(a => `- ☐ ${a}`).join('\n');
      return { text: out, trace: `notes: ${heads.length} headings, ${bullets.length} notes, ${actions.length} actions classified` };
    },
    resume(body, ctx) {
      ctx.session.pending = null;
      return FAA.TOOLS.find(t => t.id === 'notes').run('organise notes ' + body, ctx);
    }
  },
  {
    id: 'proscons', icon: '⚖', name: 'Pros/cons decider',
    desc: 'Weighs a decision and gives a verdict.',
    triggers: ['pros and cons', 'should i', 'decide', 'decision', 'weigh'],
    match: t => /(pros and cons|should i\b)/i.test(t) ? 3 : 0,
    run(text, ctx) {
      /* topic = text before the first pro:/con: marker */
      let topicSrc = text.replace(/^(give me |list )?pros and cons of\s+/i, '').replace(/^(should i\s+)/i, '');
      const cutAt = topicSrc.search(/\bpro\s*(\(\d\))?\s*:|\bcon\s*(\(\d\))?\s*:/i);
      const topic = ((cutAt > 0 ? topicSrc.slice(0, cutAt) : topicSrc).replace(/\?$/, '').trim() || 'this decision');
      /* normalise inline "pro: … con: …" onto separate lines */
      const norm = text.replace(/\b(pro|con)\s*(\(\d\))?\s*:/gi, '\n$1$2:');
      const proLines = [], conLines = [];
      for (const line of norm.split('\n')) {
        let m = line.match(/^\s*pro\b\s*(?:\((\d)\))?\s*[:–-]?\s*(.+)/i);
        if (m && m[2].trim()) { proLines.push({ t: m[2].trim(), w: parseInt(m[1] || 1) }); continue; }
        m = line.match(/^\s*con\b\s*(?:\((\d)\))?\s*[:–-]?\s*(.+)/i);
        if (m && m[2].trim()) conLines.push({ t: m[2].trim(), w: parseInt(m[1] || 1) });
      }
      if (!proLines.length && !conLines.length) {
        ctx.session.pending = { tool: 'proscons', topic };
        return { text: `Okay — **${topic}**. Give me your points as lines starting with **pro:** and **con:** (add (2) or (3) to weight a big one), and I'll score it.`, trace: 'proscons: waiting for points' };
      }
      const ps = proLines.reduce((a, p) => a + p.w, 0), cs = conLines.reduce((a, p) => a + p.w, 0);
      const verdict = ps > cs ? `✅ Leans **yes** (${ps} vs ${cs})` : cs > ps ? `🛑 Leans **no** (${cs} vs ${ps})` : `🤝 Dead even (${ps} vs ${cs}) — sleep on it`;
      return {
        text: `**${topic}**\n\n| 👍 Pros (${ps}) | 👎 Cons (${cs}) |\n|---|---|\n${Array.from({ length: Math.max(proLines.length, conLines.length) }, (_, i) => `| ${proLines[i] ? proLines[i].t + (proLines[i].w > 1 ? ` (×${proLines[i].w})` : '') : ''} | ${conLines[i] ? conLines[i].t + (conLines[i].w > 1 ? ` (×${conLines[i].w})` : '') : ''} |`).join('\n')}\n\n${verdict}\n\n_Weights are yours — a (3) on one con can flip the whole table._`,
        trace: `proscons: ${proLines.length} pros (${ps}) vs ${conLines.length} cons (${cs})`
      };
    },
    resume(body, ctx) {
      const topic = (ctx.session.pending && ctx.session.pending.topic) || 'this decision';
      ctx.session.pending = null;
      return FAA.TOOLS.find(t => t.id === 'proscons').run('pros and cons of ' + topic + '\n' + body, ctx);
    }
  }
];
