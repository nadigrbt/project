import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const hero = document.querySelector('.hero');
const canvas = document.getElementById('stage');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

// Мягкий свет сверху-слева, чтобы глянец читался
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(-4, 6, 8);
scene.add(key);

// --- Форма значка-заглушки: «таблетка» с двумя отверстиями по краям ---
const W = 7.2, H = 3.0, R = H / 2;
const shape = new THREE.Shape();
shape.moveTo(-W / 2 + R, -H / 2);
shape.lineTo(W / 2 - R, -H / 2);
shape.absarc(W / 2 - R, 0, R, -Math.PI / 2, Math.PI / 2, false);
shape.lineTo(-W / 2 + R, H / 2);
shape.absarc(-W / 2 + R, 0, R, Math.PI / 2, (Math.PI * 3) / 2, false);

for (const sx of [-1, 1]) {
  const hole = new THREE.Path();
  hole.absarc(sx * (W / 2 - R), 0, 0.42, 0, Math.PI * 2, true);
  shape.holes.push(hole);
}

const geometry = new THREE.ExtrudeGeometry(shape, {
  depth: 0.45,
  bevelEnabled: true,
  bevelThickness: 0.28,
  bevelSize: 0.28,
  bevelSegments: 14,
  curveSegments: 64,
});
geometry.center();

// UV по x/y, чтобы наложить рельефную надпись на лицевую сторону
{
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  const pos = geometry.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x);
    uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y);
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

// Рельеф: заглушка вместо логотипа — подставьте свой текст или картинку
function makeBump(text) {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 850;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '700 340px "Inter Tight", system-ui, sans-serif';
  g.filter = 'blur(10px)';
  g.fillText(text, c.width / 2, c.height / 2 + 10);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  return t;
}

const material = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.28,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  bumpMap: makeBump('LOGO'),
  bumpScale: 6,
});

const mesh = new THREE.Mesh(geometry, material);
const rig = new THREE.Group();   // вращение по мыши и импульсу
const sway = new THREE.Group();  // фоновое покачивание
sway.add(mesh);
rig.add(sway);
scene.add(rig);

// --- Предметы по орбите вокруг значка ---
// Набор заглушек: замените геометрии и материалы своими моделями.
function glossy(color, roughness = 0.3) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness, clearcoat: 1, clearcoatRoughness: 0.12,
  });
}

const items = [
  { geo: new THREE.TorusKnotGeometry(0.46, 0.16, 160, 24), mat: glossy(0xff7a45, 0.35) },
  { geo: new THREE.IcosahedronGeometry(0.62, 0), mat: glossy(0xe4ff7a, 0.25), flat: true },
  { geo: new THREE.TorusGeometry(0.5, 0.2, 32, 64), mat: glossy(0x5b3a1e, 0.4) },
  { geo: new THREE.CapsuleGeometry(0.27, 0.75, 16, 32), mat: glossy(0xffffff, 0.2) },
  { geo: new THREE.ConeGeometry(0.5, 1.1, 48), mat: glossy(0xd9d9d9, 0.35) },
  { geo: new RoundedBoxGeometry(0.9, 0.9, 0.9, 6, 0.18), mat: glossy(0x151515, 0.22) },
  { geo: new THREE.SphereGeometry(0.46, 48, 32), mat: glossy(0xe4ff7a, 0.15) },
];

const orbit = new THREE.Group();
scene.add(orbit);

const RX = 4.15;  // радиус орбиты по ширине
const RZ = 2.7;   // по глубине: часть предметов проходит перед значком, часть за ним
const ys = [0.95, -1.05, 1.5, -0.35, 1.1, -1.4, 0.2];

const bodies = items.map((it, i) => {
  if (it.flat) it.mat.flatShading = true;
  const m = new THREE.Mesh(it.geo, it.mat);
  const a = (i / items.length) * Math.PI * 2;
  m.position.set(Math.cos(a) * RX, ys[i], Math.sin(a) * RZ);
  m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
  orbit.add(m);
  return {
    mesh: m,
    angle: a,
    y0: ys[i],
    baseY: ys[i],
    phase: i * 1.7,
    axis: new THREE.Vector3(Math.sin(i * 2.1), Math.cos(i * 1.3), Math.sin(i * 0.7 + 1)).normalize(),
    speed: 0.5 + (i % 3) * 0.35,
  };
});
orbit.rotation.x = 0.12;

// --- Размер ---
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Подгоняем дистанцию, чтобы значок занимал ~62% ширины экрана
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const targetWidth = W * 1.12;
  const visibleW = targetWidth / (w < 700 ? 0.74 : 0.62);
  const distance = visibleW / (2 * Math.tan(fov / 2) * camera.aspect);
  camera.position.set(0, 0, distance);
  camera.updateProjectionMatrix();
  // Орбита не должна выходить за края экрана: на узких экранах сужаем её по ширине
  // и растягиваем по высоте, где места много. Сами предметы почти не уменьшаем.
  const halfVisible = visibleW / 2;
  const kx = Math.min(1, (halfVisible * 0.78) / (RX + 0.7));
  const ky = THREE.MathUtils.clamp(1 / camera.aspect / 1.2, 1, 2.2);
  const ks = THREE.MathUtils.clamp(kx, 0.75, 1);
  for (const b of bodies) {
    b.mesh.position.x = Math.cos(b.angle) * RX * kx;
    b.mesh.position.z = Math.sin(b.angle) * RZ * kx;
    b.baseY = b.y0 * ky;
    b.mesh.scale.setScalar(ks);
  }
}
window.addEventListener('resize', resize);
resize();

// --- Управление: наклон за курсором, свайп и «щелчок-раскрутка» ---
const pointer = { x: 0, y: 0 };
const target = { x: 0, y: 0 };
let spin = 0;          // скорость вращения значка после броска
let orbitSpin = 0;     // скорость вращения орбиты после свайпа
let boost = 0;         // дополнительная раскрутка самих предметов
let tilt = 0.12;       // наклон орбиты от вертикального свайпа
let dragging = false;
let lastX = 0;
let lastY = 0;
let dragMoved = 0;

hero.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  dragMoved += Math.abs(dx) + Math.abs(dy);
  rig.rotation.y += dx * 0.01;
  spin = dx * 0.01;
  orbitSpin = dx * 0.006;
  boost = Math.min(1, boost + Math.hypot(dx, dy) * 0.012);
  tilt = THREE.MathUtils.clamp(tilt + dy * 0.003, -0.5, 0.7);
});
hero.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.bar')) return;
  dragging = true;
  lastX = e.clientX; lastY = e.clientY; dragMoved = 0;
  hero.setPointerCapture(e.pointerId);
});
const endDrag = () => {
  if (dragging && dragMoved < 4) { spin = 0.22; orbitSpin = 0.05; boost = 1; }  // простой клик — раскрутка
  dragging = false;
};
hero.addEventListener('pointerup', endDrag);
hero.addEventListener('pointercancel', endDrag);

// --- Цикл ---
const clock = new THREE.Clock();
const q = new THREE.Quaternion();
let started = false;

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (!reduceMotion) {
    sway.rotation.y = Math.sin(t * 0.55) * 0.35;
    sway.rotation.x = Math.sin(t * 0.42 + 1.2) * 0.12;
    sway.rotation.z = Math.sin(t * 0.33) * 0.04;
    sway.position.y = Math.sin(t * 0.8) * 0.06;
  }

  // Значок: инерция после броска и возврат лицом к зрителю
  if (!dragging) {
    rig.rotation.y += spin;
    spin *= 0.94;
    if (Math.abs(spin) < 0.0005) spin = 0;
    if (spin === 0) {
      const turn = Math.PI * 2;
      const wrapped = rig.rotation.y - Math.round(rig.rotation.y / turn) * turn;
      rig.rotation.y = wrapped * 0.97;
    }
  }

  // Орбита: постоянное медленное кружение плюс инерция от свайпа
  orbit.rotation.y += (reduceMotion ? 0 : 0.14 * dt) + orbitSpin;
  if (!dragging) orbitSpin *= 0.95;
  if (Math.abs(orbitSpin) < 0.0003) orbitSpin = 0;
  tilt += (0.12 - tilt) * 0.015;
  orbit.rotation.x = tilt;
  boost *= 0.965;

  // Каждый предмет вращается вокруг своей оси и слегка плавает; свайп разгоняет вращение
  for (const b of bodies) {
    const rate = (reduceMotion ? 0 : b.speed) + boost * 7;
    q.setFromAxisAngle(b.axis, rate * dt);
    b.mesh.quaternion.premultiply(q);
    b.mesh.position.y = b.baseY + (reduceMotion ? 0 : Math.sin(t * 0.9 + b.phase) * 0.14);
  }

  target.x += (pointer.x - target.x) * 0.06;
  target.y += (pointer.y - target.y) * 0.06;
  rig.rotation.x = target.y * 0.35;
  rig.position.x = target.x * 0.25;

  renderer.render(scene, camera);
  if (!started) { started = true; canvas.classList.add('is-ready'); }
  requestAnimationFrame(frame);
}
frame();
