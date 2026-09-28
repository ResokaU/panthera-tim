// ===== ПРАЙД-ДРАЙВ 3D · игра на Three.js (грузится лениво) =====
(function () {
  function fallback() {
    const s = document.getElementById('g3dStart');
    if (s) s.textContent = '3D НЕ ЗАГРУЗИЛОСЬ — ИНТЕРНЕТ ФИДИТ 🥲';
  }
  if (!window.THREE) { fallback(); return; }
  const wrap = document.getElementById('g3dWrap');
  if (!wrap) return;

  const hudName = document.getElementById('g3dName');
  const hudScore = document.getElementById('g3dScore');
  const hudTime = document.getElementById('g3dTime');
  const hudBest = document.getElementById('g3dBest');
  const startEl = document.getElementById('g3dStart');
  const overEl = document.getElementById('g3dOver');
  const overScore = document.getElementById('g3dFinal');

  const chars = [
    { name: 'ДАНЯ 👑', color: 0xa855f7, eye: 0x67e8f9 },
    { name: 'ВАЛЕРА ⚡', color: 0x22d3ee, eye: 0xffffff },
    { name: 'МАКСИМ 🔥', color: 0xfb923c, eye: 0xffe4b8 },
    { name: 'РИТА 🌙', color: 0xf472b6, eye: 0xffd6f5 },
  ];
  let ci = Math.min(3, parseInt(localStorage.getItem('panthera_3d_char') || '0', 10));

  let renderer, scene, camera, player, headMat, earMat, nameSprite;
  let objects = [], running = false, score = 0, tleft = 30;
  let spawnTimer = null, timeTimer = null, shakeT = 0;
  const keys = {};
  const BOUND = 9;

  function emojiSprite(ch) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.font = '96px serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(ch, 64, 72);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c), transparent: true,
    }));
    sp.scale.set(1.4, 1.4, 1);
    return sp;
  }

  function nameLabel(text, color) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    const g = c.getContext('2d');
    g.font = 'bold 38px Unbounded, Arial, sans-serif';
    g.textAlign = 'center';
    g.fillStyle = '#' + color.toString(16).padStart(6, '0');
    g.shadowColor = '#000';
    g.shadowBlur = 10;
    g.fillText(text, 128, 44);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c), transparent: true,
    }));
    sp.scale.set(3, 0.75, 1);
    sp.position.y = 1.9;
    return sp;
  }

  function buildPlayer() {
    if (player) scene.remove(player);
    const ch = chars[ci];
    player = new THREE.Group();
    headMat = new THREE.MeshStandardMaterial({
      color: ch.color, roughness: .4, metalness: .2,
      emissive: ch.color, emissiveIntensity: .15,
    });
    earMat = headMat.clone();
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.15, .95, .95), headMat);
    const e1 = new THREE.Mesh(new THREE.ConeGeometry(.24, .55, 4), earMat);
    e1.position.set(-.34, .72, 0);
    const e2 = e1.clone(); e2.position.x = .34;
    const eyeMat = new THREE.MeshStandardMaterial({
      color: ch.eye, emissive: ch.eye, emissiveIntensity: 1,
    });
    const ey1 = new THREE.Mesh(new THREE.BoxGeometry(.16, .1, .06), eyeMat);
    ey1.position.set(-.22, .12, .48);
    const ey2 = ey1.clone(); ey2.position.x = .22;
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(.12, .2, 4),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: .8 })
    );
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, -.08, .52);
    player.add(head, e1, e2, ey1, ey2, nose);
    nameSprite = nameLabel(chars[ci].name, ch.color);
    player.add(nameSprite);
    player.position.set(0, .5, 0);
    scene.add(player);
  }

  function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    wrap.insertBefore(renderer.domElement, wrap.firstChild);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060512);
    scene.fog = new THREE.Fog(0x060512, 14, 30);
    camera = new THREE.PerspectiveCamera(60, wrap.clientWidth / wrap.clientHeight, .1, 100);
    camera.position.set(0, 7.5, 11);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x8877bb, .7));
    const p1 = new THREE.PointLight(0xa855f7, 1.2, 40); p1.position.set(8, 10, 8); scene.add(p1);
    const p2 = new THREE.PointLight(0x22d3ee, .8, 40); p2.position.set(-8, 10, -6); scene.add(p2);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x0b0a1d, roughness: .9 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const grid = new THREE.GridHelper(40, 40, 0xa855f7, 0x221a4a);
    grid.position.y = .01;
    scene.add(grid);

    const sg = new THREE.BufferGeometry();
    const pos = [];
    for (let i = 0; i < 250; i++) {
      pos.push((Math.random() - .5) * 60, Math.random() * 20 + 2, (Math.random() - .5) * 60);
    }
    sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x9f8fff, size: .12 })));

    buildPlayer();

    addEventListener('resize', resize);
    addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
    addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

    let dragging = false;
    wrap.addEventListener('pointerdown', () => { dragging = true; });
    addEventListener('pointerup', () => { dragging = false; });
    wrap.addEventListener('pointermove', e => {
      if (!dragging || !running) return;
      const r = wrap.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - .5) * 2 * BOUND;
      const z = ((e.clientY - r.top) / r.height - .5) * 2 * BOUND;
      player.position.x = Math.max(-BOUND, Math.min(BOUND, x));
      player.position.z = Math.max(-BOUND, Math.min(BOUND, z));
    });

    document.querySelectorAll('#g3dSelect .g3d-char').forEach((b, i) => {
      if (i === ci) b.classList.add('active');
      b.addEventListener('click', () => {
        ci = i;
        localStorage.setItem('panthera_3d_char', ci);
        document.querySelectorAll('#g3dSelect .g3d-char').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        buildPlayer();
        hudName.textContent = chars[ci].name;
        renderBest();
        popSound();
      });
    });

    startEl.addEventListener('click', start);
    document.getElementById('g3dAgain').addEventListener('click', start);
    hudName.textContent = chars[ci].name;
    renderBest();
    animate();
  }

  function resize() {
    if (!renderer) return;
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    camera.aspect = wrap.clientWidth / wrap.clientHeight;
    camera.updateProjectionMatrix();
  }

  function renderBest() {
    hudBest.textContent = parseInt(localStorage.getItem('panthera_3d_best_' + ci) || '0', 10);
  }

  function spawn() {
    if (objects.length > 14) return;
    const good = Math.random() < .7;
    const ch = good
      ? ['🍕', '🍗', '⭐'][Math.floor(Math.random() * 3)]
      : ['💩', '💀'][Math.floor(Math.random() * 2)];
    const sp = emojiSprite(ch);
    sp.position.set((Math.random() - .5) * 2 * (BOUND - 1), 1, (Math.random() - .5) * 2 * (BOUND - 1));
    sp.userData = { good, star: ch === '⭐', t: Math.random() * 6, life: 7 };
    scene.add(sp);
    objects.push(sp);
  }

  function start() {
    score = 0; tleft = 30;
    hudScore.textContent = '0'; hudTime.textContent = '30';
    objects.forEach(o => scene.remove(o)); objects = [];
    startEl.classList.add('hidden');
    overEl.classList.add('hidden');
    running = true;
    unlock('p3d_played');
    for (let i = 0; i < 6; i++) spawn();
    spawnTimer = setInterval(spawn, 750);
    timeTimer = setInterval(() => {
      tleft--;
      hudTime.textContent = tleft;
      if (tleft <= 0) end();
    }, 1000);
  }

  function end() {
    running = false;
    clearInterval(spawnTimer); clearInterval(timeTimer);
    objects.forEach(o => scene.remove(o)); objects = [];
    const key = 'panthera_3d_best_' + ci;
    const b = parseInt(localStorage.getItem(key) || '0', 10);
    if (score > b) {
      localStorage.setItem(key, score);
      renderBest();
      overScore.textContent = score + ' 🏆';
    } else {
      overScore.textContent = score;
    }
    overEl.classList.remove('hidden');
    if (score >= 10) unlock('p3d_pro');
    popSound();
  }

  function collect(o) {
    if (o.userData.good) {
      score += o.userData.star ? 2 : 1;
      popSound();
    } else {
      score -= 2;
      shakeT = .35;
    }
    hudScore.textContent = score;
  }

  let last = performance.now();
  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    if (running && player) {
      const sp = 10 * dt;
      if (keys['arrowleft'] || keys['a']) player.position.x -= sp;
      if (keys['arrowright'] || keys['d']) player.position.x += sp;
      if (keys['arrowup'] || keys['w']) player.position.z -= sp;
      if (keys['arrowdown'] || keys['s']) player.position.z += sp;
      player.position.x = Math.max(-BOUND, Math.min(BOUND, player.position.x));
      player.position.z = Math.max(-BOUND, Math.min(BOUND, player.position.z));

      objects.forEach(o => {
        o.userData.t += dt;
        o.material.rotation += dt * 2;
        o.position.y = 1 + Math.sin(o.userData.t * 3) * .18;
      });
      for (let i = objects.length - 1; i >= 0; i--) {
        const o = objects[i];
        o.userData.life -= dt;
        if (player.position.distanceTo(o.position) < 1.35) {
          collect(o);
          scene.remove(o);
          objects.splice(i, 1);
          continue;
        }
        if (o.userData.life <= 0) {
          scene.remove(o);
          objects.splice(i, 1);
        }
      }
      camera.position.x += (player.position.x * .35 - camera.position.x) * .06;
      camera.lookAt(player.position.x * .3, 0, player.position.z * .3);
      if (shakeT > 0) {
        shakeT -= dt;
        camera.position.x += (Math.random() - .5) * .3;
        camera.position.y = 7.5 + (Math.random() - .5) * .2;
      }
    }
    if (renderer) renderer.render(scene, camera);
  }

  try { init(); } catch (e) { console.warn('3D init fail', e); fallback(); }
})();
