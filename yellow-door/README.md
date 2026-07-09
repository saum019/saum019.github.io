# Yellow Door

Standalone magic door effect for any website: a yellow door fixed to the bottom-right opens on scroll or click, and a bird flies out on click with wing animation, white sparkles, and a mixed black/white star trail.

This folder is a portable copy of the Chrome extension magic door effect. The extension continues to use `premium/effects/magic-door.js`; use this package when you want the same effect on a normal web page.

## Folder contents

```
yellow-door/
├── README.md
├── demo.html          # Local test page
├── yellow-door.js     # Standalone script (no extension APIs)
└── assets/
    ├── close-door.svg
    ├── open-door.svg
    └── bird0.svg … bird5.svg
```

## Quick start

1. Copy the entire `yellow door` folder into your project (keep `assets/` next to `yellow-door.js`).
2. Add the script to your page.
3. Call `YellowDoor.init()`.

```html
<script src="/path/to/yellow-door/yellow-door.js"></script>
<script>
  YellowDoor.init({
    assetBase: "/path/to/yellow-door/assets/",
    speed: 3
  });
</script>
```

Open `demo.html` in a browser (via a local server if your browser blocks file URLs for assets) to try it immediately.

## API

### `YellowDoor.init(options)`

Starts the effect. Calling `init` again replaces any previous instance.

| Option | Default | Description |
|--------|---------|-------------|
| `assetBase` | `"./assets/"` | URL prefix for SVG files. Must end with `/` or one will be added. |
| `speed` | `3` | Bird flight speed. `1` = slower, `5` = faster. |
| `doorRight` | `14` | Distance from the right edge of the viewport (px). |
| `doorBottom` | `10` | Distance from the bottom edge of the viewport (px). |
| `listenClick` | `true` | Open door and launch bird on document click. |
| `listenScroll` | `true` | Open door on scroll (no bird). |

Returns a runtime object with `destroy()`, `openDoorOnly()`, `launchBird()`, and `setSpeed()`.

### `YellowDoor.destroy()`

Removes the overlay, styles, and event listeners.

### `YellowDoor.openDoor()`

Opens the door without launching the bird.

### `YellowDoor.launchBird()`

Opens the door and launches the bird (respects cooldown).

### `YellowDoor.setSpeed(speed)`

Updates bird flight speed at runtime.

## Behavior

- **Scroll** — door opens briefly; no bird.
- **Click** — door opens and the bird flies upward in a sine-wave spiral.
- **Cooldown** — 480 ms between triggers.
- **Bird** — 6-frame wing loop (`0→1→2→3→4→5→4→3→2→1`), flips horizontally with direction.
- **Sparkles** — tiny white dots around the bird while it flies.
- **Trail** — random mix of black/white star sparkles with yellow glow, spawned behind the bird.

## Integration notes

- The overlay uses high `z-index` values and `pointer-events: none`, so it should not block clicks on your page.
- Serve SVG assets from the same origin as the page, or configure CORS if they are hosted elsewhere.
- Class names use the `magic-door-*` prefix to match the extension implementation.
- To remove the effect (e.g. on route change in a SPA), call `YellowDoor.destroy()`.

## Example: React

```jsx
import { useEffect } from "react";

export function YellowDoorEffect() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/yellow-door/yellow-door.js";
    script.onload = () => {
      window.YellowDoor.init({ assetBase: "/yellow-door/assets/" });
    };
    document.body.appendChild(script);

    return () => {
      window.YellowDoor?.destroy();
      script.remove();
    };
  }, []);

  return null;
}
```

## Example: manual triggers only

```javascript
YellowDoor.init({
  assetBase: "./assets/",
  listenClick: false,
  listenScroll: false
});

document.getElementById("launch-bird").addEventListener("click", () => {
  YellowDoor.launchBird();
});
```

## Tuning flight (advanced)

Open `yellow-door.js` and edit the constants at the top:

- `SPIRAL_RADIUS_PX` — width of the spiral
- `SPIRAL_LOOPS` — number of loops while rising
- `RISE_SPEED_PX_PER_S` — base rise speed
- `DOOR_WIDTH` / `DOOR_HEIGHT` — door size on screen
- `BIRD_WIDTH` — bird sprite width

## License

Use the same license as the parent Project Phoenix / animation-overlay-extension project.
