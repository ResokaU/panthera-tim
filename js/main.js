  // частицы
  const field = document.getElementById('particles');
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('div');
    p.className = 'p';
    const s = Math.random() * 4 + 2;
    p.style.width = p.style.height = s + 'px';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (Math.random() * 14 + 10) + 's';
    p.style.animationDelay = (-Math.random() * 24) + 's';
    p.style.background = Math.random() > .5 ? 'rgba(168,85,247,.55)' : 'rgba(255,45,85,.5)';
    field.appendChild(p);
  }

  // появление при скролле
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // глаза следят за курсором
  const pupils = document.querySelector('.pupils');
  const pantherSvg = document.querySelector('.panther');
  addEventListener('mousemove', e => {
    if (!pupils || !pantherSvg) return;
    const r = pantherSvg.getBoundingClientRect();
    if (!r.width) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height * .45;
    const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 300)) * 8;
    const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 300)) * 6;
    pupils.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  // свечение за курсором
  const glow = document.getElementById('cursor-glow');
  addEventListener('mousemove', e => {
    glow.style.transform = `translate(${e.clientX - 260}px, ${e.clientY - 260}px)`;
  });

  // кринж-метр
  const meterBar = document.getElementById('meterBar');
  const meterChip = document.getElementById('meterChip');
  function updateMeter() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? Math.round(h.scrollTop / max * 100) : 0;
    meterBar.style.width = p + '%';
    meterChip.textContent = 'КРИНЖ-МЕТР: ' + p + '%' + (p >= 100 ? ' 🔥' : '');
  }
  addEventListener('scroll', updateMeter, { passive: true });
  updateMeter();

  // рык по клику на пантеру
  const wrap = document.getElementById('panther');
  wrap.addEventListener('click', e => {
    wrap.classList.remove('roar');
    void wrap.offsetWidth;
    wrap.classList.add('roar');
    roarSound();
    unlock('first_roar');
    if (document.body.classList.contains('cringe')) spawnEmoji(e.clientX, e.clientY, ['🔥','🐾','💥'], 6);
  });

  // счётчик фидов Максима
  const fc = document.getElementById('feedCounter');
  const fcNum = document.getElementById('fcNum');
  let feeds = 200000;
  fc.addEventListener('click', e => {
    feeds++;
    fcNum.textContent = feeds.toLocaleString('ru-RU');
    popSound();
    fc.style.transform = 'scale(.96)';
    setTimeout(() => fc.style.transform = '', 90);
    if (feeds % 25 === 0) {
      airhorn();
      spawnEmoji(e.clientX, e.clientY, ['💀','🔥','💩','😱'], 12);
    } else if (document.body.classList.contains('cringe')) {
      spawnEmoji(e.clientX, e.clientY, ['💀','🔥'], 4);
    }
  });

  // КРИНЖ-РЕЖИМ 🌈 (+ гудок)
  const cringeBtn = document.getElementById('cringeBtn');
  cringeBtn.addEventListener('click', () => {
    const on = document.body.classList.toggle('cringe');
    cringeBtn.setAttribute('aria-pressed', on);
    cringeBtn.textContent = on ? '🔥 КРИНЖ ВКЛЮЧЁН' : '🌈 КРИНЖ-РЕЖИМ';
    airhorn();
    if (on) unlock('cringe_on');
  });

  // взрывы эмодзи при клике в кринж-режиме
  document.addEventListener('click', e => {
    if (!document.body.classList.contains('cringe')) return;
    spawnEmoji(e.clientX, e.clientY, ['🔥','🐾','💖','💯','✨','😎','🐔','👑','🌪️','🐆'], 10);
  });

  // клик по пантерам состава → фразы + поп
  const cardPhrases = [
    ['АНКА! 🐆','меньше всех фидит — это я','варды — для слабых','смотрите мини-карту, ораторы'],
    ['я умный, спрашивайте ⚡','громкость 100%','какой план? мы идём бить'],
    ['РАШ Б! 🔥','главный фидер на связи','я в драке, чё','смерть — это статистика'],
    ['мяу! 💖','я в деле!','винрейт 100%','н trained by cats'],
  ];
  document.querySelectorAll('.team-grid .card').forEach((card, i) => {
    card.addEventListener('click', e => {
      popSound();
      const arr = cardPhrases[i % cardPhrases.length];
      const b = document.createElement('div');
      b.className = 'card-bubble';
      b.textContent = arr[Math.floor(Math.random() * arr.length)];
      card.appendChild(b);
      setTimeout(() => b.remove(), 1600);
      if (document.body.classList.contains('cringe')) spawnEmoji(e.clientX, e.clientY, ['✨','💯','🔥'], 5);
    });
  });
  // жребий: кто сегодня мид
  const dice = document.getElementById('dice');
  const diceRes = document.getElementById('diceRes');
  const panthers = [
    ['ДАНЯ 👑', 'даня на миде. все в панике'],
    ['ВАЛЕРА ⚡', 'план готов. план всегда готов'],
    ['МАКСИМ 🔥', 'раш б. вопросы? вопросов нет'],
    ['РИТА 🌙', 'винрейт 100% прилагается'],
  ];
  let rolling = false;
  dice.addEventListener('click', e => {
    if (rolling) return;
    rolling = true;
    diceRes.classList.remove('rolled');
    popSound();
    let i = 0;
    const iv = setInterval(() => {
      diceRes.textContent = panthers[i % panthers.length][0];
      i++;
    }, 70);
    setTimeout(() => {
      clearInterval(iv);
      const pick = panthers[Math.floor(Math.random() * panthers.length)];
      diceRes.textContent = pick[0];
      diceRes.classList.add('rolled');
      airhorn();
      spawnEmoji(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2, ['🎲','🔥','👑','✨'], 9);
      rolling = false;
    }, 70 * 14);
  });

  // кнопка наверх
  const toTop = document.getElementById('toTop');
  addEventListener('scroll', () => {
    toTop.classList.toggle('show', scrollY > 700);
  }, { passive: true });
  toTop.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: 'smooth' });
    popSound();
  });

  // заголовок вкладки, когда ушёл из прайда
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? '🐱 вернись в прайд!' : 'ПАНТЕРА ТИМ — кибер-прайд';
  });

  // ОРАКУЛ: Даня-8 билл
  const danyaAns = [
    'да','нет','ещё катка','это мета','я в деле',
    'спроси Валеру — он не знает','после пиццы — обсудим',
    'сначала варды… шутка','респавн через 30 сек, подожди',
    'победа близко (нет)','максим, слезь с миникарты','мяу. то есть да',
  ];
  const danyaAnsEl = document.getElementById('danyaAns');
  document.getElementById('askDanya').addEventListener('click', e => {
    popSound();
    let i = 0;
    const iv = setInterval(() => {
      danyaAnsEl.textContent = danyaAns[i % danyaAns.length];
      i++;
    }, 80);
    setTimeout(() => {
      clearInterval(iv);
      danyaAnsEl.textContent = danyaAns[Math.floor(Math.random() * danyaAns.length)];
      airhorn();
      unlock('oracle');
      spawnEmoji(e.clientX, e.clientY, ['🔮','👑','✨'], 8);
    }, 80 * 10);
  });

  // ОРАКУЛ: игра вечера
  const gamesList = [
    'DOTA 2 ⚔️','STANDOFF 2 🔫','CHICKEN GUN 🐔','MINECRAFT ⛏️',
    'ROBLOX 🧱','AMONG US 🔪','BRAWL STARS ⭐','GEOMETRY DASH 🔺',
  ];
  const gameAnsEl = document.getElementById('gameAns');
  document.getElementById('askGame').addEventListener('click', e => {
    popSound();
    let i = 0;
    const iv = setInterval(() => {
      gameAnsEl.textContent = gamesList[i % gamesList.length];
      i++;
    }, 80);
    setTimeout(() => {
      clearInterval(iv);
      gameAnsEl.textContent = gamesList[Math.floor(Math.random() * gamesList.length)];
      airhorn();
      spawnEmoji(e.clientX, e.clientY, ['🎮','🔥','✨'], 8);
    }, 80 * 12);
  });

  // КУРИЦА-КЛИКЕР
  const chickenBtn = document.getElementById('chickenBtn');
  const chNum = document.getElementById('chNum');
  let scared = 0;
  chickenBtn.addEventListener('click', e => {
    scared++;
    chNum.textContent = scared.toLocaleString('ru-RU');
    if (scared === 10) unlock('chicken10');
    chickenBtn.classList.remove('scared');
    void chickenBtn.offsetWidth;
    chickenBtn.classList.add('scared');
    popSound();
    if (scared % 25 === 0) {
      airhorn();
      spawnEmoji(e.clientX, e.clientY, ['🐔','💥','😱','🪶'], 12);
    } else if (document.body.classList.contains('cringe')) {
      spawnEmoji(e.clientX, e.clientY, ['🐔','🪶'], 4);
    }
  });

  // факты в футере
  const facts = [
    'Рита не проиграла ни одной катки. Официально. (Каток было: 0)',
    'Даня фидит реже всех. Это не ошибка. Это статистика.',
    'Валера думает, что он умный. Мы не спорим — так тише.',
    'Фиды Максима растут быстрее инфляции.',
    'Курица из Chicken Gun до сих пор в шоке.',
    'КРИНЖ-МЕТР показывает правду. Всегда.',
    'Пантера видит тебя. Прямо сейчас.',
  ];
  const factText = document.getElementById('factText');
  let factI = 0;
  factText.textContent = facts[0];
  setInterval(() => {
    factText.style.opacity = 0;
    setTimeout(() => {
      factI = (factI + 1) % facts.length;
      factText.textContent = facts[factI];
      factText.style.opacity = 1;
    }, 400);
  }, 6000);

  // звук при открытии FAQ
  document.querySelectorAll('.faq-list details').forEach(d => {
    d.addEventListener('toggle', () => { if (d.open) popSound(); });
  });

  // ГЕНЕРАТОР НИКОВ
  const nickPre = ['Пантера','Фидер','Кибер','Мурмур','Ночной','Токсик','Барбошка','Коготь','Смурф','Крипер'];
  const nickMid = ['XxX','_Pro','2007','_YT','228','TT','Бог','Легенда','_Main','Кликер','_Facebook','1337'];
  const nickAnsEl = document.getElementById('nickAns');
  document.getElementById('askNick').addEventListener('click', e => {
    popSound();
    let i = 0;
    const iv = setInterval(() => {
      nickAnsEl.textContent = nickPre[i % nickPre.length] + nickMid[i % nickMid.length];
      i++;
    }, 70);
    setTimeout(() => {
      clearInterval(iv);
      const nick = nickPre[Math.floor(Math.random() * nickPre.length)] +
                   nickMid[Math.floor(Math.random() * nickMid.length)];
      nickAnsEl.textContent = nick;
      unlock('nick_gen');
      spawnEmoji(e.clientX, e.clientY, ['🎮','✨','😎'], 6);
    }, 70 * 10);
  });

  // АРКАДА: поймай пантеру
  const arcArena = document.getElementById('arcArena');
  const arcCat = document.getElementById('arcCat');
  const arcStart = document.getElementById('arcStart');
  const arcScoreEl = document.getElementById('arcScore');
  const arcBestEl = document.getElementById('arcBest');
  const arcTimeEl = document.getElementById('arcTime');
  let arcPlaying = false, arcScore = 0, arcLeft = 20, arcTimer = null, arcMover = null;
  let arcBest = parseInt(localStorage.getItem('panthera_best') || '0', 10);
  arcBestEl.textContent = arcBest;

  function placeCat() {
    const w = arcArena.clientWidth, h = arcArena.clientHeight;
    arcCat.style.left = (16 + Math.random() * (w - 90)) + 'px';
    arcCat.style.top = (14 + Math.random() * (h - 90)) + 'px';
  }
  function endArc() {
    arcPlaying = false;
    clearInterval(arcTimer); clearInterval(arcMover);
    arcCat.classList.add('hidden');
    arcStart.style.display = 'grid';
    if (arcScore > arcBest) {
      arcBest = arcScore;
      localStorage.setItem('panthera_best', arcBest);
      arcBestEl.textContent = arcBest;
      airhorn();
      arcStart.textContent = '🏆 НОВЫЙ РЕКОРД: ' + arcScore + ' · ЕЩЁ РАЗ?';
    } else {
      popSound();
      arcStart.textContent = '🎮 СЧЁТ: ' + arcScore + ' · ЕЩЁ РАЗ?';
    }
  }
  arcStart.addEventListener('click', () => {
    if (arcPlaying) return;
    arcPlaying = true;
    arcScore = 0; arcLeft = 20;
    arcScoreEl.textContent = '0'; arcTimeEl.textContent = '20';
    arcStart.style.display = 'none';
    arcCat.classList.remove('hidden');
    placeCat();
    unlock('arcade_played');
    arcMover = setInterval(placeCat, 850);
    arcTimer = setInterval(() => {
      arcLeft--;
      arcTimeEl.textContent = arcLeft;
      if (arcLeft <= 0) endArc();
    }, 1000);
  });
  arcCat.addEventListener('click', e => {
    if (!arcPlaying) return;
    arcScore++;
    arcScoreEl.textContent = arcScore;
    popSound();
    spawnEmoji(e.clientX, e.clientY, ['🐾','✨'], 2);
    placeCat();
  });

  // СЕКРЕТНЫЙ КОД: ↑↑↓↓←→←→BA
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiI = 0;
  addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konamiI = (k === konami[konamiI]) ? konamiI + 1 : (k === konami[0] ? 1 : 0);
    if (konamiI === konami.length) {
      konamiI = 0;
      airhorn();
      unlock('konami');
      for (let i = 0; i < 30; i++) {
        const s = document.createElement('span');
        s.className = 'panther-rain';
        s.textContent = Math.random() > .5 ? '🐆' : '🐾';
        s.style.left = Math.random() * 100 + 'vw';
        s.style.fontSize = (Math.random() * 22 + 16) + 'px';
        s.style.animationDuration = (Math.random() * 1.6 + 1.6) + 's';
        s.style.animationDelay = (Math.random() * 1.4) + 's';
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 5000);
      }
    }
  });

  // салют на 100% кринж-метра
  let maxCringe = false;
  addEventListener('scroll', () => {
    if (maxCringe) return;
    const m = meterChip.textContent.match(/(\d+)%/);
    if (m && parseInt(m[1], 10) >= 100) {
      maxCringe = true;
      airhorn();
      unlock('max_meter');
      for (let i = 0; i < 14; i++) {
        spawnEmoji(Math.random() * innerWidth, innerHeight - 60, ['🌈','🔥','💯','🎉'], 1);
      }
    }
  }, { passive: true });

  // ЭКРАН ЗАГРУЗКИ
  const loader = document.getElementById('loader');
  function hideLoader() { loader.classList.add('done'); }
  addEventListener('load', () => setTimeout(hideLoader, 900));
  setTimeout(hideLoader, 3500);
  loader.addEventListener('click', hideLoader);

  // COUNT-UP цифр в hero
  function countUp(el, target, suffix, pad, dur) {
    const t0 = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - t0) / dur);
      const v = Math.round(target * (.5 - .5 * Math.cos(Math.PI * p)));
      el.textContent = String(v).padStart(pad, '0') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  countUp(document.getElementById('st1'), 4, '', 2, 1200);
  countUp(document.getElementById('st2'), 2300, '+', 0, 1600);
  countUp(document.getElementById('st3'), 100, '%', 0, 1200);

  // СЧЁТЧИК «ДАНЯ В ДОТЕ» (тикает)
  const dcTime = document.getElementById('dcTime');
  const dcBase = 1700 * 3600;
  const dcT0 = Date.now();
  function dcTick() {
    const s = dcBase + Math.floor((Date.now() - dcT0) / 1000);
    const hh = String(Math.floor(s / 3600) % 24).padStart(2, '0');
    const mm = String(Math.floor(s / 60) % 60).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    dcTime.textContent = Math.floor(s / 3600) + 'ч ' + hh + ':' + mm + ':' + ss;
  }
  dcTick();
  setInterval(dcTick, 1000);

  // ЛАЙТБОКС для галереи
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  document.querySelectorAll('.gal').forEach(fig => {
    const img = fig.querySelector('img');
    const cap = fig.querySelector('figcaption');
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lbCap.textContent = cap ? cap.textContent : '';
      lb.classList.add('open');
      unlock('lightbox');
    });
  });
  lb.addEventListener('click', () => lb.classList.remove('open'));

  // ГОЛОСОВАНИЕ
  const votes = JSON.parse(localStorage.getItem('panthera_votes') || 'null') ||
    { 'Даня': 3, 'Валера': 1, 'Максим': 17, 'Рита': 99 };
  function renderVotes() {
    const max = Math.max(...Object.values(votes), 1);
    for (const name in votes) {
      document.querySelector(`.vb-bar i[data-n="${name}"]`).style.width =
        (votes[name] / max * 100) + '%';
      document.querySelector(`.vb-c[data-c="${name}"]`).textContent = votes[name];
    }
  }
  renderVotes();
  document.querySelectorAll('.vote-btn').forEach(b => {
    b.addEventListener('click', () => {
      const name = b.dataset.n;
      votes[name]++;
      localStorage.setItem('panthera_votes', JSON.stringify(votes));
      renderVotes();
      popSound();
      unlock('voted');
      if (votes[name] % 50 === 0) airhorn();
    });
  });


  // УГАР НА 5 СЕК
  const ugarBtn = document.getElementById('ugarBtn');
  let ugarOn = false;
  ugarBtn.addEventListener('click', () => {
    if (ugarOn) return;
    ugarOn = true;
    airhorn();
    unlock('ugar');
    document.body.classList.add('ugar');
    setTimeout(() => {
      document.body.classList.remove('ugar');
      ugarOn = false;
    }, 5000);
  });

  // глиттер-хвост за курсором в кринж-режиме
  let lastTrail = 0;
  addEventListener('mousemove', e => {
    if (!document.body.classList.contains('cringe')) return;
    const now = Date.now();
    if (now - lastTrail < 150) return;
    lastTrail = now;
    spawnEmoji(e.clientX, e.clientY, ['✨','💜'], 1);
  });

  // СТЕНА БУРМАЛДЫ
  const burmalaLines = [
    'если долго смотреть в миникарту — миникарта начнёт смотреть в тебя',
    'курица из Chicken Gun знает, что ты сделал в том матче',
    'даня сказал «ещё катку». было 4:00 утра. это было вчера',
    'у валеры всегда есть план. он просто его не помнит',
    'максим играет на 0.75 скорости, зато громко',
    'рита не проиграла ни одной катки. вопрос — а играла ли',
    '9 из 10 крипов боятся прайда. десятый — максим',
    'пантера спит 20 часов в сутки. как мы на созвонах',
    'каждый раз, когда ты фидишь, где-то плачет крип',
    'чтобы понять прайд, нужно стать прайдом. не делай этого',
    'гусь видел твой последний клатч. он не в восторге',
    'хомяк фармит лес быстрее. это доказано официально',
    'в нашей команде нет токсиков. есть амфибии',
    'лучший саппорт — тишина в голосовом после фида',
    'бабушка максима прошла Geometry Dash с закрытыми глазами',
    'этот сайт весит меньше, чем холодильник максима',
    'даня не фидит. он делает красиво. просто вы не видите красоты',
    'прайд бьёт первым. иногда — себя',
  ];
  const bmPalette = ['#a855f7', '#22d3ee', '#ff2d55', '#facc15', '#4ade80', '#f472b6'];
  const bmGrid = document.getElementById('burmalaGrid');
  function renderBurmala() {
    const pool = [...burmalaLines].sort(() => Math.random() - .5);
    bmGrid.innerHTML = '';
    pool.slice(0, 6).forEach(txt => {
      const d = document.createElement('div');
      d.className = 'bm-card';
      d.style.setProperty('--c', bmPalette[Math.floor(Math.random() * bmPalette.length)]);
      d.style.setProperty('--r', (Math.random() * 3 - 1.5).toFixed(2) + 'deg');
      d.textContent = txt;
      bmGrid.appendChild(d);
    });
  }
  renderBurmala();
  document.getElementById('shuffleBurmala').addEventListener('click', e => {
    popSound();
    unlock('burmala_shuffled');
    bmGrid.style.opacity = 0;
    setTimeout(() => { renderBurmala(); bmGrid.style.opacity = 1; }, 250);
    if (document.body.classList.contains('cringe')) spawnEmoji(e.clientX, e.clientY, ['🌀','✨','🔥'], 6);
  });

  // КНОПКА НИЧЕГО
  const nothingBtn = document.getElementById('nothingBtn');
  const nothingNote = document.getElementById('nothingNote');
  let nothingCount = 0;
  nothingBtn.addEventListener('click', e => {
    nothingCount++;
    if (nothingCount === 1) nothingNote.textContent = 'ничего не произошло.';
    else if (nothingCount === 2) nothingNote.textContent = 'всё ещё ничего. попробуй ещё раз.';
    else if (nothingCount === 3) nothingNote.textContent = 'упорный. мне нравится.';
    else if (nothingCount === 4) {
      nothingNote.textContent = 'ладно. вот твоя награда 🎁';
      airhorn();
      spawnEmoji(e.clientX, e.clientY, ['🎁','🎉','🔥','🐾','👑','💖'], 16);
    } else nothingNote.textContent = 'награда уже выдана. дальше ничего. честно.';
  });

  // ===== ДОСТИЖЕНИЯ =====
  const ACH = {
    first_roar: 'Первый рык 🐆',
    chicken10: 'Напугал курицу 10 раз 🐔',
    voted: 'Избиратель прайда 🗳',
    arcade_played: 'Охотник открыл сезон 🎯',
    nick_gen: 'Ник века сгенерирован 🎮',
    music_on: 'Диджей прайда 🎵',
    konami: 'ЧИТЕР 🗝',
    burmala_shuffled: 'Повелитель бурмалды 🌀',
    guestbook: 'Первая надпись на стене 📝',
    cringe_on: 'Кринж-мастер 🌈',
    max_meter: '100% кринжа 🔥',
    lightbox: 'Арт-критик 🖼',
    ugar: 'Акробат года 🤸',
    oracle: 'Познал оракула 🔮',
    react_played: 'Нейронка работает ⚡',
  };
  function renderAchCount() {
    const seen = JSON.parse(localStorage.getItem('panthera_ach') || '[]');
    const badge = document.getElementById('achBadge');
    if (badge) badge.textContent = '🏅 ' + seen.length + '/' + Object.keys(ACH).length;
  }
  function unlock(id) {
    const seen = JSON.parse(localStorage.getItem('panthera_ach') || '[]');
    if (seen.includes(id) || !ACH[id]) return;
    seen.push(id);
    localStorage.setItem('panthera_ach', JSON.stringify(seen));
    renderAchCount();
    const t = document.createElement('div');
    t.className = 'ach-toast';
    t.innerHTML = '<b>🏅 ДОСТИЖЕНИЕ ПОЛУЧЕНО</b>';
    t.appendChild(document.createTextNode(ACH[id]));
    document.getElementById('achToasts').appendChild(t);
    setTimeout(() => t.remove(), 4000);
    popSound();
  }
  renderAchCount();

  // ===== ТИР РЕАКЦИИ =====
  const rcZone = document.getElementById('rcZone');
  const rcMsEl = document.getElementById('rcMs');
  const rcBestEl = document.getElementById('rcBest');
  let rcState = 'idle', rcT0 = 0, rcGoTimer = null;
  let rcBestMs = parseInt(localStorage.getItem('panthera_rc') || '0', 10);
  if (rcBestMs) rcBestEl.textContent = rcBestMs;
  function rcReset(txt) {
    rcState = 'idle';
    rcZone.className = 'rc-zone';
    rcZone.textContent = txt;
  }
  rcZone.addEventListener('click', () => {
    if (rcState === 'idle') {
      rcState = 'wait';
      rcZone.className = 'rc-zone rc-wait';
      rcZone.textContent = 'ЖДИ ЗЕЛЁНОГО… НЕ ТОПНИ РАНЬШЕ';
      rcGoTimer = setTimeout(() => {
        if (rcState !== 'wait') return;
        rcState = 'go';
        rcT0 = performance.now();
        rcZone.className = 'rc-zone rc-go';
        rcZone.textContent = 'ЖМИ!!!';
        setTimeout(() => { if (rcState === 'go') rcReset('ПРОЗЕВАЛ! Как максим. Жми снова'); }, 2500);
      }, 1000 + Math.random() * 2200);
    } else if (rcState === 'wait') {
      clearTimeout(rcGoTimer);
      rcReset('ФАЛЬСТАРТ! Как Валера с планом. Жми снова');
    } else if (rcState === 'go') {
      const ms = Math.round(performance.now() - rcT0);
      rcMsEl.textContent = ms;
      unlock('react_played');
      popSound();
      if (!rcBestMs || ms < rcBestMs) {
        rcBestMs = ms;
        localStorage.setItem('panthera_rc', rcBestMs);
        rcBestEl.textContent = ms;
      }
      rcReset(ms + ' МС! Жми снова');
    }
  });

  // ===== ГОСТЕВАЯ КНИГА =====
  const gbInput = document.getElementById('gbInput');
  const gbBtn = document.getElementById('gbBtn');
  const gbList = document.getElementById('gbList');
  let gbMsgs = JSON.parse(localStorage.getItem('panthera_gb') || '[]');
  function renderGb() {
    gbList.innerHTML = '';
    const last = gbMsgs.slice(-6).reverse();
    if (!last.length) {
      const e = document.createElement('div');
      e.className = 'gb-empty';
      e.textContent = 'пока пусто. будь первым — прайд читает всё.';
      gbList.appendChild(e);
      return;
    }
    const cols = ['#a855f7','#22d3ee','#fb923c','#f472b6','#4ade80'];
    last.forEach((m, i) => {
      const d = document.createElement('div');
      d.className = 'gb-msg';
      const b = document.createElement('b');
      b.style.color = cols[i % cols.length];
      b.textContent = m.nick;
      const t = document.createElement('span');
      t.className = 't';
      t.textContent = m.time;
      const p = document.createElement('p');
      p.textContent = m.text;
      d.appendChild(b); d.appendChild(t); d.appendChild(p);
      gbList.appendChild(d);
    });
  }
  function postGb() {
    const text = gbInput.value.trim();
    if (!text) {
      gbInput.classList.remove('shake');
      void gbInput.offsetWidth;
      gbInput.classList.add('shake');
      return;
    }
    const nick = nickPre[Math.floor(Math.random() * nickPre.length)] +
                 nickMid[Math.floor(Math.random() * nickMid.length)];
    gbMsgs.push({
      nick,
      text,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    });
    localStorage.setItem('panthera_gb', JSON.stringify(gbMsgs));
    gbInput.value = '';
    renderGb();
    unlock('guestbook');
    popSound();
  }
  gbBtn.addEventListener('click', postGb);
  gbInput.addEventListener('keydown', e => { if (e.key === 'Enter') postGb(); });
  renderGb();