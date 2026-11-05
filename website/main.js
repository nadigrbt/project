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

// =====================================================================
// Вещи на орбитах. Все модели собраны из простых форм и намеренно
// безбрендовые: без логотипов, надписей и узнаваемых фирменных дизайнов.
// Любую можно заменить своей моделью (GLTF) в списке rings ниже.
// =====================================================================

// --- Материалы ---
const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({
  color, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, ...o,
});
const C = {
  white: mat(0xffffff, { roughness: 0.22 }),
  cream: mat(0xf0e9dc, { roughness: 0.35 }),
  black: mat(0x141414, { roughness: 0.25 }),
  graphite: mat(0x3a3a40, { roughness: 0.3 }),
  grey: mat(0xcfcfd2, { roughness: 0.35 }),
  lime: mat(0xe4ff7a, { roughness: 0.25 }),
  orange: mat(0xff7a45, { roughness: 0.35 }),
  red: mat(0xd8322b, { roughness: 0.3 }),
  blue: mat(0x2c5bff, { roughness: 0.3 }),
  navy: mat(0x16245c, { roughness: 0.35 }),
  pink: mat(0xff9fc8, { roughness: 0.3 }),
  rose: mat(0xe0709f, { roughness: 0.35 }),
  teal: mat(0x1fb6a6, { roughness: 0.3 }),
  brown: mat(0x5b3a1e, { roughness: 0.4 }),
  tan: mat(0xc08552, { roughness: 0.55, clearcoat: 0.3 }),
  darkTan: mat(0x8f5a30, { roughness: 0.55, clearcoat: 0.3 }),
  coffee: mat(0xb98756, { roughness: 0.5 }),
  rubber: mat(0x202020, { roughness: 0.85, clearcoat: 0 }),
  chrome: mat(0xffffff, { metalness: 1, roughness: 0.12, clearcoat: 0 }),
  gold: mat(0xd9ac3c, { metalness: 1, roughness: 0.22, clearcoat: 0 }),
  glass: mat(0xdff1ff, { roughness: 0.04, transparent: true, opacity: 0.42 }),
  glassPink: mat(0xffc2dc, { roughness: 0.04, transparent: true, opacity: 0.5 }),
  lens: mat(0x15151c, { roughness: 0.08, metalness: 0.5 }),
  screen: mat(0x1d2f6b, { roughness: 0.1, emissive: 0x1a2a66, emissiveIntensity: 0.6 }),
};
const redBothSides = C.red.clone();
redBothSides.side = THREE.DoubleSide;

// --- Помощники ---
const PI = Math.PI;
const rb = (w, h, d, r, m) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m);
const cy = (rt, rbm, h, m, seg = 40) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rbm, h, seg), m);
const sp = (r, m) => new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), m);
const to = (r, t, m, arc = PI * 2) => new THREE.Mesh(new THREE.TorusGeometry(r, t, 16, 48, arc), m);
function put(obj, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
  obj.position.set(...p);
  obj.rotation.set(...r);
  obj.scale.set(...s);
  return obj;
}
const group = (...parts) => { const g = new THREE.Group(); g.add(...parts); return g; };
const AXIS_Z = [PI / 2, 0, 0];   // цилиндр, повёрнутый осью к зрителю
const AXIS_X = [0, 0, PI / 2];   // цилиндр, лежащий вдоль x

// Приводит модель к нужному размеру и центрирует вокруг начала координат,
// чтобы она вращалась вокруг своего центра.
const _box = new THREE.Box3(), _c = new THREE.Vector3(), _s = new THREE.Vector3();
function fit(obj, size) {
  obj.updateMatrixWorld(true);
  _box.setFromObject(obj).getSize(_s);
  obj.scale.multiplyScalar(size / Math.max(_s.x, _s.y, _s.z));
  obj.updateMatrixWorld(true);
  _box.setFromObject(obj).getCenter(_c);
  obj.position.sub(_c);
  const wrap = new THREE.Group();
  wrap.add(obj);
  return wrap;
}

// --- Модели ---
const tote = () => group(
  put(rb(1.2, 1.0, 0.5, 0.1, C.tan)),
  put(rb(0.62, 0.42, 0.06, 0.05, C.darkTan), [0, -0.12, 0.27]),
  put(to(0.36, 0.04, C.darkTan, PI), [0, 0.5, 0]),
  put(cy(0.05, 0.05, 0.04, C.gold), [0, 0.05, 0.31], AXIS_Z),
);

function sneaker({ upper, accent, toe, sole, midsole, chunk = 1 }) {
  const g = new THREE.Group();
  const h = 0.16 * chunk;
  g.add(put(rb(1.5, h, 0.6, 0.08, sole)));                                     // подошва
  if (chunk > 1) g.add(put(rb(1.46, 0.12, 0.58, 0.05, midsole), [0, h / 2 + 0.05, 0]));
  const y0 = h / 2 + (chunk > 1 ? 0.1 : 0);
  g.add(put(sp(1, upper), [0.3, y0 + 0.2, 0], [0, 0, 0], [0.6, 0.26, 0.29]));   // носок
  g.add(put(sp(1, toe), [0.6, y0 + 0.14, 0], [0, 0, 0], [0.28, 0.17, 0.27]));   // накладка на носке
  g.add(put(rb(0.62, 0.54, 0.54, 0.22, upper), [-0.4, y0 + 0.3, 0]));          // пятка и голенище
  g.add(put(sp(1, C.rubber), [-0.4, y0 + 0.56, 0], [0, 0, 0], [0.23, 0.04, 0.2])); // отверстие для ноги
  g.add(put(rb(0.07, 0.22, 0.22, 0.03, accent), [-0.72, y0 + 0.32, 0]));        // язычок на пятке
  for (const z of [0.285, -0.285]) {
    g.add(put(rb(0.62, 0.1, 0.03, 0.015, accent), [-0.15, y0 + 0.24, z], [0, 0, -0.18]));
  }
  g.add(put(rb(0.18, 0.38, 0.14, 0.06, upper), [0.02, y0 + 0.44, 0], [0, 0, -0.5]));  // язык
  for (let i = 0; i < 3; i++) {
    g.add(put(cy(0.022, 0.022, 0.36, C.white), [0.1 + i * 0.12, y0 + 0.38 - i * 0.03, 0], AXIS_Z));
  }
  return g;
}

const perfume = () => group(
  put(rb(0.72, 0.92, 0.32, 0.12, C.glassPink)),
  put(rb(0.6, 0.5, 0.22, 0.08, C.rose), [0, -0.2, 0]),
  put(cy(0.1, 0.1, 0.14, C.chrome), [0, 0.52, 0]),
  put(rb(0.34, 0.34, 0.3, 0.08, C.gold), [0, 0.74, 0]),
);

const sunglasses = () => {
  const eye = (x) => [
    put(rb(0.82, 0.6, 0.07, 0.24, C.brown), [x, 0, 0]),
    put(rb(0.7, 0.48, 0.08, 0.2, C.lens), [x, 0, 0.015]),
  ];
  return group(
    ...eye(-0.47), ...eye(0.47),
    put(rb(0.22, 0.08, 0.07, 0.03, C.brown), [0, 0.12, 0]),
    put(rb(0.07, 0.07, 0.9, 0.03, C.brown), [-0.9, 0.12, -0.45]),
    put(rb(0.07, 0.07, 0.9, 0.03, C.brown), [0.9, 0.12, -0.45]),
  );
};

const headphones = () => group(
  put(to(0.62, 0.06, C.black, PI), [0, 0.06, 0]),
  put(cy(0.3, 0.3, 0.2, C.white), [-0.62, -0.05, 0], AXIS_X),
  put(cy(0.3, 0.3, 0.2, C.white), [0.62, -0.05, 0], AXIS_X),
  put(cy(0.24, 0.24, 0.1, C.rubber), [-0.52, -0.05, 0], AXIS_X),
  put(cy(0.24, 0.24, 0.1, C.rubber), [0.52, -0.05, 0], AXIS_X),
);

const earbudsCase = () => group(
  put(rb(0.82, 0.58, 0.36, 0.22, C.graphite)),
  put(rb(0.84, 0.03, 0.38, 0.015, C.chrome), [0, 0.06, 0]),
  put(sp(0.035, C.lime), [0, -0.08, 0.185]),
);

const smartwatch = () => group(
  put(rb(0.62, 0.72, 0.17, 0.18, C.black)),
  put(rb(0.54, 0.64, 0.02, 0.14, C.screen), [0, 0, 0.09]),
  put(rb(0.3, 0.04, 0.02, 0.015, C.lime), [0, 0.1, 0.105]),
  put(cy(0.05, 0.05, 0.1, C.chrome), [0.34, 0.12, 0], AXIS_X),
  put(rb(0.46, 0.42, 0.08, 0.05, C.orange), [0, 0.52, -0.02]),
  put(rb(0.46, 0.42, 0.08, 0.05, C.orange), [0, -0.52, -0.02]),
);

const backpack = () => group(
  put(rb(0.95, 1.25, 0.5, 0.24, C.blue)),
  put(rb(0.72, 0.52, 0.22, 0.12, C.navy), [0, -0.25, 0.3]),
  put(rb(0.5, 0.03, 0.03, 0.01, C.lime), [0, -0.02, 0.42]),
  put(to(0.11, 0.03, C.navy, PI), [0, 0.62, 0]),
  put(rb(0.1, 0.95, 0.06, 0.03, C.navy), [-0.3, -0.05, -0.27]),
  put(rb(0.1, 0.95, 0.06, 0.03, C.navy), [0.3, -0.05, -0.27]),
);

const wallet = () => group(
  put(rb(0.9, 0.95, 0.04, 0.03, C.lime), [0, 0.2, 0]),
  put(rb(1.1, 0.75, 0.14, 0.08, C.tan)),
  put(rb(1.1, 0.35, 0.04, 0.04, C.darkTan), [0, 0.2, 0.09]),
  put(cy(0.06, 0.06, 0.04, C.gold), [0, 0.05, 0.12], AXIS_Z),
);

const lipstick = () => group(
  put(cy(0.18, 0.18, 0.55, C.gold), [0, -0.3, 0]),
  put(cy(0.185, 0.185, 0.08, C.black), [0, 0.0, 0]),
  put(cy(0.13, 0.13, 0.38, C.red), [0, 0.23, 0]),
  put(cy(0.06, 0.13, 0.14, C.red), [0, 0.49, 0]),
);

const instantCamera = () => group(
  put(rb(1.12, 0.78, 0.5, 0.14, C.cream)),
  put(rb(1.12, 0.2, 0.52, 0.1, C.pink), [0, 0.35, 0]),
  put(cy(0.27, 0.27, 0.16, C.black), [0.12, -0.04, 0.3], AXIS_Z),
  put(cy(0.3, 0.3, 0.05, C.chrome), [0.12, -0.04, 0.255], AXIS_Z),
  put(sp(0.14, C.blue), [0.12, -0.04, 0.38]),
  put(rb(0.24, 0.14, 0.05, 0.03, C.grey), [-0.38, 0.2, 0.26]),
  put(rb(0.2, 0.12, 0.05, 0.03, C.red), [-0.38, -0.2, 0.26]),
);

const cap = () => {
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.55, 40, 24, 0, PI * 2, 0, PI / 2), redBothSides);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.05, 40, 1, false, -PI / 2, PI), C.navy);
  return group(
    crown,
    put(brim, [0, 0.02, 0.3], [0.15, 0, 0]),
    put(sp(0.06, C.navy), [0, 0.55, 0]),
    put(to(0.55, 0.03, C.white), [0, 0, 0], [PI / 2, 0, 0]),
  );
};

const skateboard = () => {
  const deck = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 1.2, 8, 24), C.teal);
  const parts = [put(deck, [0, 0, 0], [0, 0, PI / 2], [0.22, 1, 1])];
  for (const sx of [-0.55, 0.55]) {
    parts.push(put(rb(0.07, 0.06, 0.56, 0.02, C.chrome), [sx, -0.1, 0]));
    for (const sz of [-0.24, 0.24]) {
      parts.push(put(cy(0.11, 0.11, 0.1, C.black), [sx, -0.17, sz], AXIS_Z));
    }
  }
  return group(...parts);
};

const vinyl = () => {
  const grooves = [0.3, 0.38, 0.46, 0.54].flatMap((r) => [
    put(to(r, 0.004, C.graphite), [0, 0, 0.021]),
    put(to(r, 0.004, C.graphite), [0, 0, -0.021]),
  ]);
  return group(
    put(cy(0.62, 0.62, 0.04, C.black, 64), [0, 0, 0], AXIS_Z),
    put(cy(0.2, 0.2, 0.046, C.orange), [0, 0, 0], AXIS_Z),
    put(cy(0.03, 0.03, 0.05, C.cream, 16), [0, 0, 0], AXIS_Z),
    ...grooves,
  );
};

const controller = () => group(
  put(rb(1.2, 0.5, 0.28, 0.18, C.white)),
  put(rb(0.34, 0.55, 0.26, 0.14, C.white), [-0.5, -0.3, 0], [0, 0, 0.25]),
  put(rb(0.34, 0.55, 0.26, 0.14, C.white), [0.5, -0.3, 0], [0, 0, -0.25]),
  put(rb(0.2, 0.06, 0.05, 0.02, C.black), [-0.4, 0.05, 0.15]),
  put(rb(0.06, 0.2, 0.05, 0.02, C.black), [-0.4, 0.05, 0.15]),
  put(cy(0.07, 0.07, 0.06, C.black), [-0.15, -0.12, 0.16], AXIS_Z),
  put(cy(0.07, 0.07, 0.06, C.black), [0.2, -0.12, 0.16], AXIS_Z),
  put(cy(0.04, 0.04, 0.05, C.lime), [0.45, 0.14, 0.15], AXIS_Z),
  put(cy(0.04, 0.04, 0.05, C.red), [0.55, 0.06, 0.15], AXIS_Z),
  put(cy(0.04, 0.04, 0.05, C.blue), [0.45, -0.02, 0.15], AXIS_Z),
  put(cy(0.04, 0.04, 0.05, C.orange), [0.35, 0.06, 0.15], AXIS_Z),
);

const tumbler = () => group(
  put(cy(0.34, 0.27, 0.92, C.glass)),
  put(cy(0.31, 0.245, 0.62, C.coffee), [0, -0.14, 0]),
  put(rb(0.16, 0.16, 0.16, 0.04, C.glass), [-0.1, 0.2, 0.05], [0.4, 0.3, 0.1]),
  put(rb(0.16, 0.16, 0.16, 0.04, C.glass), [0.1, 0.22, -0.05], [0.2, 0.5, 0.3]),
  put(cy(0.355, 0.355, 0.07, C.white), [0, 0.49, 0]),
  put(cy(0.03, 0.03, 1.0, C.lime, 12), [0.08, 0.62, 0], [0, 0, -0.12]),
);

const smartphone = () => group(
  put(rb(0.56, 1.1, 0.07, 0.1, C.black)),
  put(rb(0.5, 1.04, 0.012, 0.08, C.screen), [0, 0, 0.04]),
  put(rb(0.14, 0.04, 0.014, 0.02, C.black), [0, 0.46, 0.048]),
  put(rb(0.12, 0.12, 0.014, 0.04, C.pink), [-0.15, -0.3, 0.05]),
  put(rb(0.12, 0.12, 0.014, 0.04, C.lime), [0, -0.3, 0.05]),
  put(rb(0.12, 0.12, 0.014, 0.04, C.orange), [0.15, -0.3, 0.05]),
  put(rb(0.24, 0.24, 0.03, 0.07, C.graphite), [-0.12, 0.38, -0.05]),
  put(cy(0.05, 0.05, 0.04, C.lens, 24), [-0.17, 0.43, -0.065], AXIS_Z),
  put(cy(0.05, 0.05, 0.04, C.lens, 24), [-0.07, 0.43, -0.065], AXIS_Z),
  put(cy(0.05, 0.05, 0.04, C.lens, 24), [-0.12, 0.33, -0.065], AXIS_Z),
);

const speaker = () => group(
  put(rb(1.1, 0.58, 0.4, 0.22, C.orange)),
  put(cy(0.19, 0.19, 0.04, C.black), [-0.27, 0, 0.2], AXIS_Z),
  put(cy(0.19, 0.19, 0.04, C.black), [0.27, 0, 0.2], AXIS_Z),
  put(cy(0.07, 0.07, 0.05, C.chrome), [-0.27, 0, 0.205], AXIS_Z),
  put(cy(0.07, 0.07, 0.05, C.chrome), [0.27, 0, 0.205], AXIS_Z),
  put(to(0.3, 0.03, C.black, PI), [0, 0.29, 0]),
);

const crossbody = () => group(
  put(rb(0.95, 0.62, 0.3, 0.14, C.pink)),
  put(rb(0.97, 0.34, 0.07, 0.1, C.rose), [0, 0.14, 0.17]),
  put(cy(0.06, 0.06, 0.04, C.gold), [0, 0, 0.215], AXIS_Z),
  put(to(0.47, 0.025, C.gold, PI), [0, 0.3, 0]),
);

// --- Абстрактные фигуры (внутреннее кольцо) ---
function glossy(color, roughness = 0.3) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness, clearcoat: 1, clearcoatRoughness: 0.12,
  });
}
const shapes = [
  () => new THREE.Mesh(new THREE.TorusKnotGeometry(0.46, 0.16, 160, 24), glossy(0xff7a45, 0.35)),
  () => new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 0), Object.assign(glossy(0xe4ff7a, 0.25), { flatShading: true })),
  () => new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.2, 32, 64), glossy(0x5b3a1e, 0.4)),
  () => new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.75, 16, 32), glossy(0xffffff, 0.2)),
  () => new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 48), glossy(0xd9d9d9, 0.35)),
  () => new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.9, 0.9, 6, 0.18), glossy(0x151515, 0.22)),
  () => new THREE.Mesh(new THREE.SphereGeometry(0.46, 48, 32), glossy(0xe4ff7a, 0.15)),
];

const item = (build, size) => () => fit(build(), size);

// --- Три орбиты: разный радиус, наклон, направление и скорость ---
const rings = [
  {
    rx: 4.15, rz: 2.7, dir: 1, speed: 0.14, tilt: 0.12, spin: 0.5, spinStep: 0.35,
    ys: [0.95, -1.05, 1.5, -0.35, 1.1, -1.4, 0.2],
    make: shapes,
  },
  {
    rx: 5.6, rz: 3.3, dir: -1, speed: 0.09, tilt: 0.38, spin: 0.3, spinStep: 0.15, yScale: 0.74,
    ys: [1.4, -1.2, 0.2, 1.9, -0.5, -1.8, 0.9, -0.1, 1.6, -1.5],
    make: [
      item(tote, 1.5),
      item(() => sneaker({ upper: C.white, accent: C.red, toe: C.cream, sole: C.rubber }), 1.9),
      item(perfume, 1.4),
      item(headphones, 1.6),
      item(instantCamera, 1.5),
      item(skateboard, 2.1),
      item(backpack, 1.6),
      item(smartwatch, 1.5),
      item(speaker, 1.4),
      item(cap, 1.6),
    ],
  },
  {
    rx: 4.9, rz: 3.8, dir: 1, speed: 0.11, tilt: -0.34, spin: 0.3, spinStep: 0.15, yScale: 0.74,
    ys: [-1.0, 1.2, 0.4, -1.6, 1.7, -0.3, 1.0, -1.9, 0.1, -0.8],
    make: [
      item(() => sneaker({ upper: C.grey, accent: C.orange, toe: C.white, sole: C.white, midsole: C.black, chunk: 2 }), 1.9),
      item(sunglasses, 1.6),
      item(crossbody, 1.4),
      item(lipstick, 1.4),
      item(vinyl, 1.6),
      item(controller, 1.5),
      item(tumbler, 1.6),
      item(smartphone, 1.5),
      item(wallet, 1.3),
      item(earbudsCase, 1.1),
    ],
  },
];

const bodies = [];
rings.forEach((ring, ri) => {
  ring.group = new THREE.Group();
  ring.group.rotation.x = ring.tilt;
  scene.add(ring.group);
  ring.make.forEach((make, i) => {
    const obj = make();
    obj.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    ring.group.add(obj);
    bodies.push({
      mesh: obj,
      ring,
      angle: (i / ring.make.length) * Math.PI * 2 + ri * 0.6,
      y0: ring.ys[i] * (ring.yScale ?? 1),
      baseY: ring.ys[i] * (ring.yScale ?? 1),
      phase: i * 1.7 + ri,
      axis: new THREE.Vector3(Math.sin(i * 2.1 + ri), Math.cos(i * 1.3), Math.sin(i * 0.7 + 1)).normalize(),
      speed: ring.spin + (i % 3) * ring.spinStep,
    });
  });
});
const MAX_RX = Math.max(...rings.map((r) => r.rx));

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
  // Орбиты не должны выходить за края экрана: на узких экранах сужаем их по ширине
  // и растягиваем по высоте, где места много. Сами предметы почти не уменьшаем.
  const halfVisible = visibleW / 2;
  const kx = Math.min(1, (halfVisible * 0.86) / (MAX_RX + 0.8));
  const halfVisibleH = halfVisible / camera.aspect;
  const ky = THREE.MathUtils.clamp((halfVisibleH * 0.7) / 2.2, 1, 4.5);
  const ks = THREE.MathUtils.clamp(kx, 0.75, 1) * THREE.MathUtils.clamp(1 + (ky - 1) * 0.2, 1, 1.6);
  for (const b of bodies) {
    b.mesh.position.x = Math.cos(b.angle) * b.ring.rx * kx;
    b.mesh.position.z = Math.sin(b.angle) * b.ring.rz * kx;
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
let orbitSpin = 0;     // скорость вращения орбит после свайпа
let boost = 0;         // дополнительная раскрутка самих предметов
let tilt = 0.12;       // наклон орбит от вертикального свайпа
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

  // Орбиты: постоянное кружение в разные стороны плюс инерция от свайпа
  for (const ring of rings) {
    ring.group.rotation.y += (reduceMotion ? 0 : ring.speed * dt) * ring.dir + orbitSpin * ring.dir;
    ring.group.rotation.x = ring.tilt + (tilt - 0.12);
  }
  if (!dragging) orbitSpin *= 0.95;
  if (Math.abs(orbitSpin) < 0.0003) orbitSpin = 0;
  tilt += (0.12 - tilt) * 0.015;
  boost *= 0.965;

  // Каждая вещь вращается вокруг своей оси и слегка плавает; свайп разгоняет вращение
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
