import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

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

// --- Размер ---
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Подгоняем дистанцию, чтобы значок занимал ~62% ширины экрана
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const targetWidth = W * 1.12;
  const visibleW = targetWidth / (w < 700 ? 0.9 : 0.62);
  const distance = visibleW / (2 * Math.tan(fov / 2) * camera.aspect);
  camera.position.set(0, 0, distance);
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// --- Управление: наклон за курсором, перетаскивание и «щелчок-раскрутка» ---
const pointer = { x: 0, y: 0 };
const target = { x: 0, y: 0 };
let spin = 0;          // угловая скорость после броска
let dragging = false;
let lastX = 0;
let dragMoved = 0;

window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  if (dragging) {
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    dragMoved += Math.abs(dx);
    rig.rotation.y += dx * 0.01;
    spin = dx * 0.01;
  }
});
canvas.addEventListener('pointerdown', (e) => {
  dragging = true; lastX = e.clientX; dragMoved = 0;
  canvas.setPointerCapture(e.pointerId);
});
const endDrag = () => {
  if (dragging && dragMoved < 4) spin = 0.22;  // простой клик — раскрутка
  dragging = false;
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

// --- Цикл ---
const clock = new THREE.Clock();
let started = false;

function frame() {
  const t = clock.getElapsedTime();

  if (!reduceMotion) {
    sway.rotation.y = Math.sin(t * 0.55) * 0.35;
    sway.rotation.x = Math.sin(t * 0.42 + 1.2) * 0.12;
    sway.rotation.z = Math.sin(t * 0.33) * 0.04;
    sway.position.y = Math.sin(t * 0.8) * 0.06;
  }

  if (!dragging) {
    rig.rotation.y += spin;
    spin *= 0.94;
    if (Math.abs(spin) < 0.0005) spin = 0;
    // Когда раскрутка затихла, плавно возвращаем значок лицом к зрителю
    if (spin === 0) {
      const turn = Math.PI * 2;
      const wrapped = rig.rotation.y - Math.round(rig.rotation.y / turn) * turn;
      rig.rotation.y = wrapped * 0.97;
    }
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
