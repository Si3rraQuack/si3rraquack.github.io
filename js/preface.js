/* ======================================================
   PREFACE OVERLAY — PREFACE.JS
   Three.js triangle tessellation + typewriter greeting
   + KAMI 2-inspired fold dismiss animation
   ====================================================== */

(function () {
  'use strict';

  var overlay = document.getElementById('preface-overlay');
  var canvas = document.getElementById('preface-canvas');
  var btn = document.getElementById('preface-btn');
  var textEl = btn.querySelector('.preface-text');

  if (!overlay || !canvas || !btn || !textEl) return;

  /* =============================================
     SECTION A — THREE.JS TRIANGLE TESSELLATION
     ============================================= */

  var COLORS = [
    new THREE.Color(0x0f2027),
    new THREE.Color(0x163a3a),
    new THREE.Color(0x1a4a4a),
    new THREE.Color(0x204e4e),
    new THREE.Color(0x153535),
    new THREE.Color(0x122e2e),
  ];

  var scene, camera, renderer;
  var triangleMeshes = [];
  var triSize = 80;

  function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(
      -window.innerWidth / 2, window.innerWidth / 2,
      window.innerHeight / 2, -window.innerHeight / 2,
      0.1, 100
    );
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0f2027);

    buildTriangleGrid();
    renderer.render(scene, camera);
  }

  function buildTriangleGrid() {
    for (var i = triangleMeshes.length - 1; i >= 0; i--) {
      scene.remove(triangleMeshes[i]);
      triangleMeshes[i].geometry.dispose();
      triangleMeshes[i].material.dispose();
    }
    triangleMeshes = [];

    var w = window.innerWidth;
    var h = window.innerHeight;
    var triH = triSize * Math.sqrt(3) / 2;

    var cols = Math.ceil(w / triSize) + 4;
    var rows = Math.ceil(h / triH) + 4;

    var offsetX = -w / 2 - triSize * 2;
    var offsetY = -h / 2 - triH * 2;

    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols * 2; col++) {
        var isUp = (col % 2 === 0);
        var geom = new THREE.BufferGeometry();

        var x = offsetX + Math.floor(col / 2) * triSize + (row % 2 === 1 ? triSize / 2 : 0);
        var y = offsetY + row * triH;

        var vertices;
        if (isUp) {
          vertices = new Float32Array([
            x, y, 0,
            x + triSize, y, 0,
            x + triSize / 2, y + triH, 0,
          ]);
        } else {
          vertices = new Float32Array([
            x + triSize / 2, y, 0,
            x + triSize, y + triH, 0,
            x, y + triH, 0,
          ]);
        }

        geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geom.computeBoundingSphere();

        var cx = (vertices[0] + vertices[3] + vertices[6]) / 3;
        var cy = (vertices[1] + vertices[4] + vertices[7]) / 3;

        var colorIdx = (row * 3 + col * 7 + (isUp ? 0 : 3)) % COLORS.length;
        var mat = new THREE.MeshBasicMaterial({ color: COLORS[colorIdx], side: THREE.DoubleSide });
        var mesh = new THREE.Mesh(geom, mat);

        mesh.userData = {
          cx: cx,
          cy: cy,
          isUp: isUp,
          row: row,
          col: col,
          origVertices: new Float32Array(vertices),
          foldProgress: 0,
          foldDelay: 0,
          foldStarted: false,
          foldDone: false,
        };

        scene.add(mesh);
        triangleMeshes.push(mesh);
      }
    }
  }

  initThree();

  /* =============================================
     SECTION B — TYPEWRITER GREETING LOOP
     ============================================= */

  var greetings = ['Hello', 'Bonjour', 'Hola', 'Hallo', 'こんにちは', '안녕하세요', 'Здравствуйте', 'مرحبا'];
  var greetIdx = 0;
  var charPos = 0;
  var typewriterPhase = 'typing'; // typing | display | deleting
  var typewriterTimer = null;
  var typewriterStopped = false;

  var CHAR_INTERVAL = 125;
  var DISPLAY_DURATION = 3000;
  var BASE_FONT_SIZE = 24;
  var BTN_INNER_WIDTH = 192 - 4 * 2 - 16 * 2;
  var currentFontSize = BASE_FONT_SIZE;
  var measureCtx = document.createElement('canvas').getContext('2d');

  function computeFontSizeForGreeting(text) {
    measureCtx.font = '600 ' + BASE_FONT_SIZE + 'px Poppins, sans-serif';
    var textWidth = measureCtx.measureText(text).width;
    if (textWidth > BTN_INNER_WIDTH) {
      return Math.max(Math.floor(BASE_FONT_SIZE * BTN_INNER_WIDTH / textWidth), 12);
    }
    return BASE_FONT_SIZE;
  }

  function typewriterTick() {
    if (typewriterStopped) return;

    var current = greetings[greetIdx];

    if (typewriterPhase === 'typing') {
      if (charPos === 0) {
        currentFontSize = computeFontSizeForGreeting(current);
        btn.style.fontSize = currentFontSize + 'px';
      }
      charPos++;
      textEl.textContent = current.substring(0, charPos);
      if (charPos >= current.length) {
        typewriterPhase = 'display';
        typewriterTimer = setTimeout(typewriterTick, DISPLAY_DURATION);
      } else {
        typewriterTimer = setTimeout(typewriterTick, CHAR_INTERVAL);
      }
    } else if (typewriterPhase === 'display') {
      typewriterPhase = 'deleting';
      typewriterTimer = setTimeout(typewriterTick, CHAR_INTERVAL);
    } else if (typewriterPhase === 'deleting') {
      charPos--;
      textEl.textContent = current.substring(0, charPos);
      if (charPos <= 0) {
        greetIdx = (greetIdx + 1) % greetings.length;
        typewriterPhase = 'typing';
        typewriterTimer = setTimeout(typewriterTick, CHAR_INTERVAL);
      } else {
        typewriterTimer = setTimeout(typewriterTick, CHAR_INTERVAL);
      }
    }
  }

  typewriterTick();

  /* =============================================
     SECTION C — KAMI 2 FOLD DISMISS ANIMATION
     ============================================= */

  var animating = false;
  var animStartTime = 0;
  var FOLD_DURATION = 600;
  var FOLD_STAGGER = 1.8;
  var maxDist = 0;

  function easeInQuad(t) {
    return t * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function startFoldAnimation() {
    if (animating) return;
    animating = true;

    typewriterStopped = true;
    if (typewriterTimer) clearTimeout(typewriterTimer);
    btn.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    btn.style.opacity = '0';
    btn.style.transform = 'scale(0.5)';

    var w2 = window.innerWidth / 2;
    var h2 = window.innerHeight / 2;
    maxDist = 0;

    for (var i = 0; i < triangleMeshes.length; i++) {
      var ud = triangleMeshes[i].userData;
      var dx = ud.cx;
      var dy = ud.cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) maxDist = dist;
    }

    for (var j = 0; j < triangleMeshes.length; j++) {
      var ud2 = triangleMeshes[j].userData;
      var dx2 = ud2.cx;
      var dy2 = ud2.cy;
      var dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      ud2.foldDelay = (dist2 / (maxDist || 1)) * FOLD_STAGGER;
      ud2.foldProgress = 0;
      ud2.foldStarted = false;
      ud2.foldDone = false;

      var angle = Math.atan2(dy2, dx2);
      ud2.flyDirX = Math.cos(angle);
      ud2.flyDirY = Math.sin(angle);
    }

    animStartTime = performance.now();
    requestAnimationFrame(animateFrame);
  }

  function animateFrame(now) {
    var elapsed = (now - animStartTime) / 1000;
    var allDone = true;

    for (var i = 0; i < triangleMeshes.length; i++) {
      var mesh = triangleMeshes[i];
      var ud = mesh.userData;

      if (ud.foldDone) continue;
      allDone = false;

      var localTime = elapsed - ud.foldDelay;
      if (localTime < 0) continue;

      ud.foldStarted = true;

      var foldSec = FOLD_DURATION / 1000;
      var t = Math.min(localTime / foldSec, 1);
      var eased = easeOutCubic(t);

      var positions = mesh.geometry.attributes.position.array;
      var orig = ud.origVertices;

      var foldAngle = eased * Math.PI;

      var isUp = ud.isUp;
      var baseIdx1, baseIdx2, tipIdx;
      if (isUp) {
        baseIdx1 = 0;
        baseIdx2 = 1;
        tipIdx = 2;
      } else {
        baseIdx1 = 1;
        baseIdx2 = 2;
        tipIdx = 0;
      }

      var bx1 = orig[baseIdx1 * 3];
      var by1 = orig[baseIdx1 * 3 + 1];
      var bx2 = orig[baseIdx2 * 3];
      var by2 = orig[baseIdx2 * 3 + 1];

      var tx = orig[tipIdx * 3];
      var ty = orig[tipIdx * 3 + 1];

      var edgeDx = bx2 - bx1;
      var edgeDy = by2 - by1;
      var edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
      var enx = edgeDx / edgeLen;
      var eny = edgeDy / edgeLen;

      var tipRelX = tx - bx1;
      var tipRelY = ty - by1;
      var projLen = tipRelX * enx + tipRelY * eny;
      var perpX = tipRelX - projLen * enx;
      var perpY = tipRelY - projLen * eny;

      var flippedPerpX = perpX * Math.cos(foldAngle) ;
      var flippedPerpY = perpY * Math.cos(foldAngle);

      var newTipX = bx1 + projLen * enx + flippedPerpX;
      var newTipY = by1 + projLen * eny + flippedPerpY;

      positions[baseIdx1 * 3] = orig[baseIdx1 * 3];
      positions[baseIdx1 * 3 + 1] = orig[baseIdx1 * 3 + 1];
      positions[baseIdx2 * 3] = orig[baseIdx2 * 3];
      positions[baseIdx2 * 3 + 1] = orig[baseIdx2 * 3 + 1];
      positions[tipIdx * 3] = newTipX;
      positions[tipIdx * 3 + 1] = newTipY;

      mesh.geometry.attributes.position.needsUpdate = true;

      if (t >= 0.5) {
        var flyT = (t - 0.5) / 0.5;
        var flyEased = easeInQuad(flyT);
        var flyDist = flyEased * Math.max(window.innerWidth, window.innerHeight) * 0.8;
        mesh.position.x = ud.flyDirX * flyDist;
        mesh.position.y = ud.flyDirY * flyDist;
      }

      var opacity = 1 - easeInQuad(Math.max(0, (t - 0.6) / 0.4));
      mesh.material.opacity = opacity;
      mesh.material.transparent = opacity < 1;

      if (t >= 1) {
        ud.foldDone = true;
        mesh.visible = false;
      }
    }

    renderer.render(scene, camera);

    if (!allDone) {
      requestAnimationFrame(animateFrame);
    } else {
      finishPreface();
    }
  }

  /* =============================================
     SECTION D — CLEANUP & RESIZE
     ============================================= */

  function finishPreface() {
    document.body.classList.remove('preface-active');

    for (var i = 0; i < triangleMeshes.length; i++) {
      triangleMeshes[i].geometry.dispose();
      triangleMeshes[i].material.dispose();
    }
    triangleMeshes = [];
    renderer.dispose();

    overlay.parentNode.removeChild(overlay);
    window.removeEventListener('resize', handleResize);
  }

  function handleResize() {
    if (animating) return;

    camera.left = -window.innerWidth / 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = -window.innerHeight / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    buildTriangleGrid();
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', handleResize);

  btn.addEventListener('click', function () {
    startFoldAnimation();
  });
})();
