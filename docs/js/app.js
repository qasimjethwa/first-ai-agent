/* First AI Agent — boot */
'use strict';

(function boot() {
  const had = FAA.load();

  /* shared agent via #a= link */
  const shared = FAA.importFromHash();
  if (shared) {
    FAA.state.agent = shared; /* importFromHash returns a complete, sanitised agent */
    FAA.save();
    history.replaceState(null, '', location.pathname);
  }

  FAA.initBuilder();
  FAA.initShare();
  FAA.renderChips();
  FAA.renderMemory();
  FAA.renderMissions();
  FAA.renderTemplates();
  FAA.syncChatHeader();
  FAA.brainReset();
  FAA.initUI();
  FAA.renderHome();

  if (shared) {
    FAA.appendSys(`Loaded a shared agent: <b>${FAA.esc(FAA.state.agent.name)}</b>. Say hi!`);
  } else if (!had) {
    FAA.appendSys(`Welcome to <b>First AI Agent</b> — the zero-code agent studio.<br><br>
      <b>2-minute path:</b> 1. open <b>Build</b>, name your agent & paste some notes 2. come back here and say <b>"quiz me on my notes"</b> 3. watch the <b>Agent brain</b> panel check off each step.<br><br>
      Or skip the setup: grab a <b>template</b> and start chatting.`);
    setTimeout(() => FAA.send('hi'), 900);
  }
})();
