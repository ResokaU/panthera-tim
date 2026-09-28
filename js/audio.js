// ===== ПАНТЕРА ТИМ · аудио-движок: звуки, мем-радио, визуализатор =====
  // ===== ЗВУКИ (WebAudio, без файлов) =====
  let actx, master, analyser, vizData;
  function audioCtx() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain();
      master.gain.value = 1;
      master.connect(actx.destination);
      analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.82;
      master.connect(analyser);
      vizData = new Uint8Array(analyser.frequencyBinCount);
      startViz();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function roarSound() {
    try {
      const ctx = audioCtx(), t = ctx.currentTime, dur = 1.1;
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.6);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const filt = ctx.createBiquadFilter(); filt.type = 'lowpass';
      filt.frequency.setValueAtTime(900, t);
      filt.frequency.exponentialRampToValueAtTime(120, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const osc = ctx.createOscillator(); osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(48, t + dur);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.25, t);
      og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filt).connect(g).connect(master);
      osc.connect(og).connect(master);
      src.start(t); osc.start(t); osc.stop(t + dur);
    } catch (e) {}
  }

  function airhorn() {
    try {
      const ctx = audioCtx(), t = ctx.currentTime, dur = 0.9;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + 0.03);
      g.gain.setValueAtTime(0.5, t + dur - 0.15);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      [466, 470, 462].forEach(fr => {
        const o = ctx.createOscillator(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(fr, t);
        const og = ctx.createGain(); og.gain.value = 0.16;
        o.connect(og).connect(g); o.start(t); o.stop(t + dur);
      });
      g.connect(master);
    } catch (e) {}
  }

  function boingSound() {
    try {
      const ctx = audioCtx(), t = ctx.currentTime, dur = 0.5;
      const o = ctx.createOscillator(); o.type = 'triangle';
      o.frequency.setValueAtTime(500, t);
      o.frequency.exponentialRampToValueAtTime(90, t + dur);
      const v = ctx.createOscillator(); v.frequency.value = 14;
      const vg = ctx.createGain(); vg.gain.value = 60;
      v.connect(vg).connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master);
      o.start(t); v.start(t); o.stop(t + dur); v.stop(t + dur);
    } catch (e) {}
  }

  function playFile(src, vol) {
    try {
      const a = new Audio(src);
      a.volume = vol || 0.6;
      a.play().catch(() => {});
      return a;
    } catch (e) {}
  }

  function popSound() {
    try {
      navigator.vibrate && navigator.vibrate(12);
      const ctx = audioCtx(), t = ctx.currentTime, dur = 0.09;
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(700, t);
      o.frequency.exponentialRampToValueAtTime(180, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master);
      o.start(t); o.stop(t + dur);
    } catch (e) {}
  }

  // эмодзи-взрыв
  function spawnEmoji(x, y, list, n) {
    for (let i = 0; i < (n || 8); i++) {
      const s = document.createElement('span');
      s.className = 'boom';
      s.textContent = list[Math.floor(Math.random() * list.length)];
      s.style.left = (x + (Math.random() * 80 - 40)) + 'px';
      s.style.top = (y + (Math.random() * 40 - 20)) + 'px';
      s.style.fontSize = (Math.random() * 22 + 16) + 'px';
      s.style.setProperty('--dx', (Math.random() * 140 - 70) + 'px');
      s.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');
      s.style.animationDuration = (Math.random() * .7 + .8) + 's';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1700);
    }
  }


  // МЕМ-РАДИО 🎵 v2 — реальные треки (Wikimedia Commons) + синт-хардбасс
  const musBtn = document.getElementById('musicBtn');
  const radioTracks = [
    { name: '🎪 ЦИРК ПРИШЁЛ', src: 'sounds/circus.mp3' },
    { name: '🪗 УЛЬТРА ПОЛКА', src: 'sounds/polka.mp3' },
    { name: '🤯 8-БИТ НАРУШЕНИЕ УШЕЙ', src: 'sounds/ear.mp3' },
    { name: '🎪🤖 8-БИТ ЦИРК', src: 'sounds/bitcircus.mp3' },
    { name: '🪗 ГИМН НА КАЗУ', src: 'sounds/kazoo-gymn.mp3' },
    { name: '🔊 ХАРДБАСС ПРАЙДА (СИНТ)', synth: true },
  ];
  let trackI = -1, audioEl = null, station = 1, musicStep = 0, musicTimer = null;

  function kick(t) {
    const o = audioCtx().createOscillator(), g = audioCtx().createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 0.16);
  }
  function bassNote(t, f) {
    const o = audioCtx().createOscillator(), g = audioCtx().createGain(), fl = audioCtx().createBiquadFilter();
    o.type = 'square'; o.frequency.setValueAtTime(f, t);
    fl.type = 'lowpass'; fl.frequency.value = 500;
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(fl).connect(g).connect(master);
    o.start(t); o.stop(t + 0.19);
  }
  function hat(t) {
    const ctx = audioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000;
    const g = ctx.createGain(); g.gain.value = 0.08;
    src.connect(f).connect(g).connect(master);
    src.start(t);
  }

  function scheduleMusicStep() {
    const ctx = audioCtx();
    const t = ctx.currentTime + 0.06;
    const s = musicStep % 16;
    if (s % 4 === 0) kick(t);
    if (s % 4 === 2) bassNote(t, [55, 55, 65.41, 49][Math.floor(musicStep / 4) % 4]);
    if (s % 2 === 1) hat(t);
    musicStep++;
  }
  function stopSynth() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }
  function startSynth() {
    stopSynth();
    audioCtx();
    musicTimer = setInterval(scheduleMusicStep, 200);
  }
  function stopAllMusic() {
    if (audioEl) { audioEl.pause(); audioEl = null; }
    stopSynth();
    document.body.classList.remove('music-on');
  }
  musBtn.addEventListener('click', () => {
    trackI = (trackI + 1) % (radioTracks.length + 1);
    stopAllMusic();
    if (trackI === radioTracks.length) {
      musBtn.textContent = '🎵 МЕМ-РАДИО: ВЫКЛ';
      musBtn.classList.remove('on');
      return;
    }
    const tr = radioTracks[trackI];
    musBtn.textContent = tr.name;
    musBtn.classList.add('on');
    document.body.classList.add('music-on');
    popSound();
    unlock('music_on');
    if (tr.src) {
      audioEl = new Audio(tr.src);
      audioEl.loop = true;
      audioEl.volume = 0.45;
      audioEl.addEventListener('error', () => {
        stopAllMusic();
        station = 1; startSynth();
        musBtn.textContent = '🔊 ХАРДБАСС ПРАЙДА (СИНТ)';
      });
      const srcNode = audioCtx().createMediaElementSource(audioEl);
      srcNode.connect(master);
      audioEl.play().catch(() => {
        stopAllMusic();
        station = 1; startSynth();
        musBtn.textContent = '🔊 ХАРДБАСС ПРАЙДА (СИНТ)';
      });
    } else {
      station = 1; startSynth();
    }
  });
  addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'm' && !e.repeat) musBtn.click();
  });

  // ===== ВИЗУАЛИЗАТОР =====
  const vizCanvas = document.getElementById('viz');
  const vctx = vizCanvas ? vizCanvas.getContext('2d') : null;
  function vizResize() {
    if (!vizCanvas) return;
    vizCanvas.width = innerWidth;
    vizCanvas.height = 56;
  }
  addEventListener('resize', vizResize);
  vizResize();
  function startViz() {
    function draw() {
      requestAnimationFrame(draw);
      if (!vctx) return;
      vctx.clearRect(0, 0, vizCanvas.width, vizCanvas.height);
      if (!document.body.classList.contains('music-on') || !analyser) return;
      analyser.getByteFrequencyData(vizData);
      const n = vizData.length;
      const w = vizCanvas.width / n;
      for (let i = 0; i < n; i++) {
        const h = (vizData[i] / 255) * 52;
        if (h < 2) continue;
        vctx.fillStyle = 'rgba(' + (168 - i * 2) + ',' + (85 + i * 2) + ',247,' + (0.25 + h / 80) + ')';
        vctx.fillRect(i * w + 1, vizCanvas.height - h, w - 2, h);
      }
    }
    draw();
  }
