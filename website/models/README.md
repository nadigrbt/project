# Модели вещей

Положите сюда GLB-файлы и опишите их в `manifest.json`. Вещи из манифеста заменят встроенные заглушки, остальные останутся как есть. Если манифеста нет, сайт работает на заглушках.

## Слоты

`tote`, `sneaker`, `chunkySneaker`, `perfume`, `sunglasses`, `headphones`, `earbuds`, `smartwatch`, `backpack`, `wallet`, `lipstick`, `camera`, `cap`, `skateboard`, `vinyl`, `controller`, `tumbler`, `phone`, `speaker`, `crossbody`

## Пример `manifest.json`

```json
{
  "sneaker": { "file": "sneaker.glb", "size": 1.9 },
  "perfume": { "file": "perfume.glb", "size": 1.4, "rotation": [0, 1.57, 0] },
  "camera": "camera.glb"
}
```

- `file` — имя файла в этой папке.
- `size` — размер большей стороны модели в условных единицах (по умолчанию как у заглушки, 1–2).
- `rotation` — поворот в радианах, если модель стоит «не так».

## Лицензии

Используйте только модели, на которые у вас есть права: свои, купленные, заказанные или с открытой лицензией (CC0, CC-BY). Для CC-BY добавьте автора ниже.

| Слот | Источник | Лицензия | Автор |
| --- | --- | --- | --- |
