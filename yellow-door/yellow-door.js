(function (global) {
  const ASSET_VERSION = "25";
  const BIRD_FRAME_COUNT = 6;
  const BIRD_FRAME_LOOP = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];
  const DOOR_SVG_ASPECT = 1608.4 / 1752.3;
  const DOOR_WIDTH = 210;
  const DOOR_HEIGHT = Math.round(DOOR_WIDTH * DOOR_SVG_ASPECT);
  const TRIGGER_COOLDOWN_MS = 480;
  const DOOR_OPEN_MS = 1800;
  const BIRD_WIDTH = 36;
  const EXIT_ABOVE_SCREEN = 220;
  const FRAME_BASE_MS = 105;
  const SPIRAL_RADIUS_PX = 48;
  const SPIRAL_LOOPS = 6;
  const RISE_SPEED_PX_PER_S = 155;
  const RISE_SPEED_SLIDER_CENTER = 3;
  const RISE_SPEED_SLIDER_STEP = 0.22;
  const SPIRAL_STEPS_PER_LOOP = 8;
  const MAX_ACTIVE_BIRDS = 4;
  const STYLE_ID = "yellow-door-styles";
  const OVERLAY_ID = "yellow-door-overlay";

  function buildSpiralRiseKeyframes(loops, radiusPx, stepsPerLoop) {
    const totalSteps = loops * stepsPerLoop;
    const frames = [];

    for (let step = 0; step <= totalSteps; step += 1) {
      const progress = step / totalSteps;
      const percent = `${(progress * 100).toFixed(3)}%`;
      const riseY = `calc(-50% - var(--rise) * ${progress})`;
      const offsetX = Math.round(Math.sin(progress * loops * Math.PI * 2) * radiusPx);

      frames.push(
        `        ${percent} {
          transform: translate(calc(-50% + ${offsetX}px), ${riseY});
        }`
      );
    }

    return frames.join("\n");
  }

  function getBirdRiseSpeedPxPerSec(speedSlider) {
    return (
      RISE_SPEED_PX_PER_S *
      (1 + (speedSlider - RISE_SPEED_SLIDER_CENTER) * RISE_SPEED_SLIDER_STEP)
    );
  }

  const SPIRAL_RISE_KEYFRAMES = buildSpiralRiseKeyframes(
    SPIRAL_LOOPS,
    SPIRAL_RADIUS_PX,
    SPIRAL_STEPS_PER_LOOP
  );

  function assetUrl(base, fileName) {
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    return `${normalizedBase}${encodeURI(fileName)}?v=${ASSET_VERSION}`;
  }

  function buildStyles(doorRight, doorBottom) {
    return `
      #${OVERLAY_ID} {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2147483640;
      }

      .magic-door-scene {
        position: fixed;
        right: ${doorRight}px;
        bottom: ${doorBottom}px;
        width: ${DOOR_WIDTH}px;
        height: ${DOOR_HEIGHT}px;
        pointer-events: none;
        z-index: 2147483645;
      }

      .magic-door-frame {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        filter: drop-shadow(0 10px 18px rgba(15, 23, 42, 0.38));
      }

      .magic-door-frame img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
        pointer-events: none;
        background: transparent;
      }

      .magic-door-bird-track {
        position: fixed;
        pointer-events: none;
        z-index: 2147483646;
        overflow: visible;
        animation: magic-door-spiral-rise var(--duration) linear forwards;
        will-change: transform;
      }

      @keyframes magic-door-spiral-rise {
${SPIRAL_RISE_KEYFRAMES}
      }

      .magic-door-bird-orient {
        position: relative;
        overflow: visible;
        z-index: 2;
        transition: transform 140ms ease-out;
        transform: scaleX(1);
      }

      .magic-door-bird-orient.is-facing-left {
        transform: scaleX(-1);
      }

      .magic-door-bird {
        display: block;
        width: ${BIRD_WIDTH}px;
        height: auto;
        opacity: 1;
        animation: magic-door-wing-tilt var(--wobble-period) ease-in-out infinite;
        will-change: transform;
        filter: drop-shadow(0 2px 6px rgba(15, 23, 42, 0.16));
      }

      .magic-door-bird.is-frame-pop {
        animation:
          magic-door-wing-tilt var(--wobble-period) ease-in-out infinite,
          magic-door-frame-pop 180ms ease-out;
      }

      @keyframes magic-door-frame-pop {
        from { transform: scale(0.9); }
        to { transform: scale(1); }
      }

      @keyframes magic-door-wing-tilt {
        0%, 100% { transform: rotate(-6deg); }
        50% { transform: rotate(6deg); }
      }

      .magic-door-bird-sparkles {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 0;
        height: 0;
        pointer-events: none;
        z-index: 1;
        overflow: visible;
      }

      .magic-door-white-sparkle {
        position: absolute;
        left: 0;
        top: 0;
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        pointer-events: none;
        background: radial-gradient(
          circle,
          #fff 0%,
          rgba(255, 255, 255, 0.85) 45%,
          rgba(255, 255, 255, 0.2) 75%,
          transparent 100%
        );
        box-shadow:
          0 0 3px rgba(255, 255, 255, 0.9),
          0 0 5px rgba(255, 255, 255, 0.35);
        animation: magic-door-sparkle-twinkle var(--life) ease-in-out forwards;
      }

      @keyframes magic-door-sparkle-twinkle {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.25); }
        25% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.15); }
      }

      .magic-door-behind-sparkle {
        position: fixed;
        pointer-events: none;
        z-index: 2147483645;
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: radial-gradient(
          circle,
          #fff 0%,
          rgba(255, 255, 255, 0.85) 45%,
          rgba(255, 255, 255, 0.2) 75%,
          transparent 100%
        );
        box-shadow:
          0 0 3px rgba(255, 255, 255, 0.9),
          0 0 5px rgba(255, 255, 255, 0.35);
        animation: magic-door-sparkle-twinkle var(--life) ease-in-out forwards;
      }

      .magic-door-trail {
        position: fixed;
        pointer-events: none;
        z-index: 2147483644;
        width: var(--w);
        height: var(--h);
        transform: translate(-50%, -50%) rotate(var(--angle));
        clip-path: polygon(
          50% 0%,
          61% 35%,
          98% 35%,
          68% 57%,
          79% 91%,
          50% 70%,
          21% 91%,
          32% 57%,
          2% 35%,
          39% 35%
        );
        animation: magic-door-trail-fade var(--life) ease-out forwards;
      }

      .magic-door-trail.is-white {
        background: linear-gradient(145deg, #fff 0%, rgba(255, 255, 255, 0.75) 100%);
        filter:
          drop-shadow(0 0 0.5px rgba(250, 204, 21, 1))
          drop-shadow(0 0 5px rgba(250, 204, 21, 0.6));
      }

      .magic-door-trail.is-black {
        background: linear-gradient(145deg, #111 0%, rgba(30, 30, 30, 0.85) 100%);
        filter:
          drop-shadow(0 0 0.5px rgba(250, 204, 21, 1))
          drop-shadow(0 0 5px rgba(250, 204, 21, 0.6));
      }

      @keyframes magic-door-trail-fade {
        0% {
          opacity: 0.95;
          transform: translate(-50%, -50%) rotate(var(--angle)) scale(1);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) rotate(var(--angle)) scale(0.2);
        }
      }
    `;
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function speedDuration(base, speedValue) {
    const speed = typeof speedValue === "number" ? speedValue : 3;
    return Math.max(120, Math.round(base * (4.2 / speed)));
  }

  function createRuntime(config) {
    const assetBase = config.assetBase || "./assets/";
    const settings = { speed: config.speed ?? 3 };
    const doorRight = config.doorRight ?? 14;
    const doorBottom = config.doorBottom ?? 10;
    const listenClick = config.listenClick !== false;
    const listenScroll = config.listenScroll !== false;
    const spawnBirdOnScroll = config.spawnBirdOnScroll === true;

    const closedUrl = assetUrl(assetBase, "close-door.svg");
    const openUrl = assetUrl(assetBase, "open-door.svg");
    const birdUrls = Array.from({ length: BIRD_FRAME_COUNT }, (_, index) =>
      assetUrl(assetBase, `bird${index}.svg`)
    );

    let overlay = null;
    let scene = null;
    let doorImg = null;
    let closeTimer = null;
    let doorIsOpen = false;
    let lastTriggerAt = 0;
    let lastBirdAt = 0;
    let imagesPreloaded = false;
    let clickHandler = null;
    let scrollHandler = null;
    const activeBirdSessions = [];
    let birdBatchLocked = false;

    function canSpawnBird() {
      return !birdBatchLocked && activeBirdSessions.length < MAX_ACTIVE_BIRDS;
    }

    function finishBirdSession(session) {
      if (session.cleaned) {
        return;
      }

      session.cleaned = true;
      session.timers.forEach((timerId) => {
        window.clearInterval(timerId);
        window.clearTimeout(timerId);
      });
      session.track?.remove();

      const index = activeBirdSessions.indexOf(session);
      if (index >= 0) {
        activeBirdSessions.splice(index, 1);
      }

      if (activeBirdSessions.length === 0) {
        birdBatchLocked = false;
      }
    }

    const ctx = {
      overlay: null,
      settings,
      randomBetween,
      speedDuration,
      removeLater(element, delay) {
        window.setTimeout(() => {
          element.remove();
        }, delay);
      },
      ensureOverlay() {
        if (overlay?.isConnected) {
          ctx.overlay = overlay;
          return overlay;
        }

        overlay = document.createElement("div");
        overlay.id = OVERLAY_ID;
        document.body.appendChild(overlay);
        ctx.overlay = overlay;
        return overlay;
      }
    };

    function injectStyles() {
      if (document.getElementById(STYLE_ID)) {
        return;
      }

      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = buildStyles(doorRight, doorBottom);
      document.head.appendChild(style);
    }

    function preloadImages() {
      if (imagesPreloaded) {
        return;
      }

      imagesPreloaded = true;
      [closedUrl, openUrl, ...birdUrls].forEach((url) => {
        const image = new Image();
        image.src = url;
      });
    }

    function mountScene() {
      ctx.ensureOverlay();
      preloadImages();

      if (scene?.isConnected) {
        return scene;
      }

      const nextScene = document.createElement("div");
      const frame = document.createElement("div");
      const img = document.createElement("img");

      nextScene.className = "magic-door-scene";
      frame.className = "magic-door-frame";
      img.src = closedUrl;
      img.alt = "";
      img.draggable = false;
      frame.appendChild(img);
      nextScene.appendChild(frame);
      ctx.overlay.appendChild(nextScene);

      scene = nextScene;
      doorImg = img;
      return nextScene;
    }

    function extendDoorOpenTimer() {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
      }

      closeTimer = window.setTimeout(() => {
        if (doorImg) {
          doorImg.src = closedUrl;
        }
        doorIsOpen = false;
        closeTimer = null;
      }, DOOR_OPEN_MS);
    }

    function openDoor() {
      if (!doorImg) {
        return;
      }

      doorImg.src = openUrl;
      doorIsOpen = true;
      extendDoorOpenTimer();
    }

    function spawnBirdIfReady() {
      const now = Date.now();
      if (now - lastBirdAt < TRIGGER_COOLDOWN_MS || !canSpawnBird()) {
        return false;
      }

      lastBirdAt = now;
      launchAnimatedBird();
      return true;
    }

    function getDoorOrigin() {
      const rect = scene?.getBoundingClientRect();
      if (!rect) {
        return {
          x: window.innerWidth - 90,
          y: window.innerHeight - 120
        };
      }

      return {
        x: rect.left + rect.width * 0.52,
        y: rect.top + rect.height * 0.34
      };
    }

    function getBehindPoint(motion, minDistance, maxDistance) {
      const distance = randomBetween(minDistance, maxDistance);
      const spread = randomBetween(-7, 7);
      const perpX = -motion.dy;
      const perpY = motion.dx;

      return {
        x: motion.centerX - motion.dx * distance + perpX * spread,
        y: motion.centerY - motion.dy * distance + perpY * spread
      };
    }

    function spawnAroundSparkle(wrap, life, radius) {
      const sparkle = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const offsetX = Math.round(Math.cos(angle) * radius);
      const offsetY = Math.round(Math.sin(angle) * radius);

      sparkle.className = "magic-door-white-sparkle";
      sparkle.style.left = `${offsetX}px`;
      sparkle.style.top = `${offsetY}px`;
      sparkle.style.setProperty("--size", `${randomBetween(2, 4)}px`);
      sparkle.style.setProperty("--life", `${life + randomBetween(-80, 80)}ms`);
      wrap.appendChild(sparkle);

      window.setTimeout(() => {
        sparkle.remove();
      }, life + 180);
    }

    function spawnCompanionSparkles(wrap, life) {
      const innerCount = randomBetween(1, 2);

      for (let index = 0; index < innerCount; index += 1) {
        spawnAroundSparkle(wrap, life, randomBetween(5, 14));
      }

      if (Math.random() < 0.55) {
        spawnAroundSparkle(wrap, life, randomBetween(14, 22));
      }
    }

    function spawnBehindWhiteSparkle(motion, life) {
      const point = getBehindPoint(motion, 16, 32);
      const sparkle = document.createElement("span");

      sparkle.className = "magic-door-behind-sparkle";
      sparkle.style.left = `${point.x}px`;
      sparkle.style.top = `${point.y}px`;
      sparkle.style.setProperty("--size", `${randomBetween(2, 4)}px`);
      sparkle.style.setProperty("--life", `${life + randomBetween(-60, 60)}ms`);
      ctx.overlay.appendChild(sparkle);
      ctx.removeLater(sparkle, life + 120);
    }

    function spawnTrailSparkle(motion, life) {
      const point = getBehindPoint(motion, 18, 36);
      const sparkle = document.createElement("span");
      const useWhite = Math.random() < 0.5;

      sparkle.className = `magic-door-trail ${useWhite ? "is-white" : "is-black"}`;
      sparkle.style.left = `${point.x}px`;
      sparkle.style.top = `${point.y}px`;
      sparkle.style.setProperty("--w", `${randomBetween(7, 12)}px`);
      sparkle.style.setProperty("--h", `${randomBetween(7, 12)}px`);
      sparkle.style.setProperty("--angle", `${randomBetween(0, 180)}deg`);
      sparkle.style.setProperty("--life", `${life}ms`);
      ctx.overlay.appendChild(sparkle);
      ctx.removeLater(sparkle, life);
    }

    function launchAnimatedBird() {
      if (!canSpawnBird()) {
        return;
      }

      const origin = getDoorOrigin();
      const rise = origin.y + EXIT_ABOVE_SCREEN;
      const riseSpeedPxPerSec = getBirdRiseSpeedPxPerSec(settings.speed);
      const duration = Math.round((rise / riseSpeedPxPerSec) * 1000);
      const wobblePeriod = Math.max(340, Math.round(560 / (riseSpeedPxPerSec / RISE_SPEED_PX_PER_S)));
      const frameMs = Math.max(
        70,
        Math.round(FRAME_BASE_MS / (riseSpeedPxPerSec / RISE_SPEED_PX_PER_S))
      );
      const sparkleLife = Math.max(480, Math.round(750 / (riseSpeedPxPerSec / RISE_SPEED_PX_PER_S)));
      const sparkleIntervalMs = Math.max(70, Math.round(95 / (riseSpeedPxPerSec / RISE_SPEED_PX_PER_S)));
      const trailLife = speedDuration(3000, settings.speed + 0.5);
      const behindLife = Math.max(400, Math.round(650 / (riseSpeedPxPerSec / RISE_SPEED_PX_PER_S)));

      const track = document.createElement("div");
      const sparklesWrap = document.createElement("div");
      const orient = document.createElement("div");
      const bird = document.createElement("img");

      track.className = "magic-door-bird-track";
      track.style.left = `${origin.x}px`;
      track.style.top = `${origin.y}px`;
      track.style.setProperty("--rise", `${rise}px`);
      track.style.setProperty("--duration", `${duration}ms`);
      track.style.setProperty("--wobble-period", `${wobblePeriod}ms`);

      sparklesWrap.className = "magic-door-bird-sparkles";
      orient.className = "magic-door-bird-orient";
      bird.className = "magic-door-bird";
      bird.src = birdUrls[BIRD_FRAME_LOOP[0]];
      bird.alt = "";
      bird.draggable = false;
      bird.style.opacity = "1";
      orient.appendChild(bird);
      track.appendChild(sparklesWrap);
      track.appendChild(orient);
      ctx.overlay.appendChild(track);

      const session = {
        track,
        timers: [],
        cleaned: false
      };
      activeBirdSessions.push(session);
      if (activeBirdSessions.length >= MAX_ACTIVE_BIRDS) {
        birdBatchLocked = true;
      }

      let frameStep = 0;
      let lastCenterX = origin.x;
      let lastTrailX = origin.x;
      let lastTrailY = origin.y;
      let currentMotion = { centerX: origin.x, centerY: origin.y, dx: 0, dy: 1 };
      bird.classList.add("is-frame-pop");

      const flipTimer = window.setInterval(() => {
        if (!track.isConnected) {
          window.clearInterval(flipTimer);
          return;
        }

        const rect = track.getBoundingClientRect();
        const centerX = rect.left + rect.width * 0.5;
        const centerY = rect.top + rect.height * 0.55;
        let dx = centerX - lastTrailX;
        let dy = centerY - lastTrailY;
        const magnitude = Math.hypot(dx, dy);

        if (magnitude >= 0.6) {
          dx /= magnitude;
          dy /= magnitude;
        } else {
          dx = currentMotion.dx;
          dy = currentMotion.dy;
        }

        currentMotion = { centerX, centerY, dx, dy };
        lastTrailX = centerX;
        lastTrailY = centerY;

        if (centerX < lastCenterX - 0.4) {
          orient.classList.add("is-facing-left");
        } else if (centerX > lastCenterX + 0.4) {
          orient.classList.remove("is-facing-left");
        }

        lastCenterX = centerX;
      }, 48);
      session.timers.push(flipTimer);

      const frameTimer = window.setInterval(() => {
        if (!bird.isConnected) {
          window.clearInterval(frameTimer);
          return;
        }

        frameStep = (frameStep + 1) % BIRD_FRAME_LOOP.length;
        bird.classList.remove("is-frame-pop");
        void bird.offsetWidth;
        bird.classList.add("is-frame-pop");
        bird.src = birdUrls[BIRD_FRAME_LOOP[frameStep]];
      }, frameMs);
      session.timers.push(frameTimer);

      const sparkleTimer = window.setInterval(() => {
        if (!track.isConnected) {
          window.clearInterval(sparkleTimer);
          return;
        }

        spawnCompanionSparkles(sparklesWrap, sparkleLife);
      }, sparkleIntervalMs);
      session.timers.push(sparkleTimer);

      const trailInterval = window.setInterval(() => {
        if (!track.isConnected) {
          window.clearInterval(trailInterval);
          return;
        }

        spawnTrailSparkle(currentMotion, trailLife);

        if (Math.random() < 0.65) {
          spawnBehindWhiteSparkle(currentMotion, behindLife);
        }
      }, Math.max(75, Math.round(105 / (riseSpeedPxPerSec / RISE_SPEED_PX_PER_S))));
      session.timers.push(trailInterval);

      const cleanupTimer = window.setTimeout(() => {
        finishBirdSession(session);
      }, duration);
      session.timers.push(cleanupTimer);
    }

    function triggerDoor(spawnBird) {
      if (!scene?.isConnected) {
        return;
      }

      if (doorIsOpen) {
        extendDoorOpenTimer();
        if (spawnBird) {
          spawnBirdIfReady();
        }
        return;
      }

      const now = Date.now();
      if (now - lastTriggerAt < TRIGGER_COOLDOWN_MS) {
        return;
      }

      lastTriggerAt = now;
      openDoor();

      if (spawnBird) {
        if (!canSpawnBird()) {
          return;
        }

        lastBirdAt = now;
        launchAnimatedBird();
      }
    }

    function bindListeners() {
      if (listenClick) {
        clickHandler = () => triggerDoor(true);
        document.addEventListener("click", clickHandler, true);
      }

      if (listenScroll) {
        scrollHandler = () => triggerDoor(spawnBirdOnScroll);
        window.addEventListener("scroll", scrollHandler, { passive: true });
      }
    }

    function unbindListeners() {
      if (clickHandler) {
        document.removeEventListener("click", clickHandler, true);
        clickHandler = null;
      }

      if (scrollHandler) {
        window.removeEventListener("scroll", scrollHandler);
        scrollHandler = null;
      }
    }

    return {
      init() {
        injectStyles();
        mountScene();
        bindListeners();
      },
      destroy() {
        unbindListeners();

        if (closeTimer) {
          window.clearTimeout(closeTimer);
          closeTimer = null;
        }

        [...activeBirdSessions].forEach((session) => {
          finishBirdSession(session);
        });
        activeBirdSessions.length = 0;
        birdBatchLocked = false;

        overlay?.remove();
        document.getElementById(STYLE_ID)?.remove();

        overlay = null;
        scene = null;
        doorImg = null;
        doorIsOpen = false;
        lastTriggerAt = 0;
        lastBirdAt = 0;
        imagesPreloaded = false;
        ctx.overlay = null;
      },
      openDoorOnly() {
        triggerDoor(false);
      },
      launchBird() {
        triggerDoor(true);
      },
      setSpeed(nextSpeed) {
        settings.speed = nextSpeed;
      }
    };
  }

  let activeRuntime = null;

  global.YellowDoor = {
    init(options = {}) {
      activeRuntime?.destroy();
      activeRuntime = createRuntime(options);
      activeRuntime.init();
      return activeRuntime;
    },

    destroy() {
      activeRuntime?.destroy();
      activeRuntime = null;
    },

    openDoor() {
      activeRuntime?.openDoorOnly();
    },

    launchBird() {
      activeRuntime?.launchBird();
    },

    setSpeed(speed) {
      activeRuntime?.setSpeed(speed);
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
