// Anime-inspired Futuristic Corporate Workspace Canvas Renderer (Dual Theme: Light & Dark)
window.initAnimeWorkspaceCanvas = function (canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Floating particles
  const particleCount = 45;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.5 - 0.1,
      alpha: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    });
  }

  // Blinking server lights
  const serverLights = [];
  for (let col = 0; col < 6; col++) {
    for (let row = 0; row < 18; row++) {
      serverLights.push({
        col,
        row,
        color: Math.random() > 0.85 ? "#10b981" : Math.random() > 0.1 ? "#0284c7" : "#6366f1",
        blinkSpeed: Math.random() * 0.05 + 0.02,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  let time = 0;

  function render() {
    time += 0.015;
    ctx.clearRect(0, 0, width, height);

    const isLight = document.body.classList.contains("theme-light");

    // 1. Atmospheric background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (isLight) {
      bgGrad.addColorStop(0, "#f8fafc");
      bgGrad.addColorStop(0.5, "#f1f5f9");
      bgGrad.addColorStop(1, "#e2e8f0");
    } else {
      bgGrad.addColorStop(0, "#05070e");
      bgGrad.addColorStop(0.5, "#090f1d");
      bgGrad.addColorStop(1, "#0d1527");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Futuristic Office Architectural Lines
    ctx.save();
    ctx.lineWidth = 1.2;

    const beamGrad = ctx.createLinearGradient(0, 0, width, height * 0.4);
    if (isLight) {
      beamGrad.addColorStop(0, "rgba(2, 132, 199, 0.15)");
      beamGrad.addColorStop(1, "rgba(2, 132, 199, 0.0)");
    } else {
      beamGrad.addColorStop(0, "rgba(56, 189, 248, 0.15)");
      beamGrad.addColorStop(1, "rgba(14, 165, 233, 0.0)");
    }
    ctx.strokeStyle = beamGrad;

    for (let x = -width * 0.2; x < width * 1.4; x += 180) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 220, height * 0.45);
      ctx.stroke();
    }

    // Floor grid
    const floorY = height * 0.65;
    ctx.strokeStyle = isLight ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.12)";
    for (let y = floorY; y < height; y += (y - floorY) * 0.35 + 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const horizonCenterX = width * 0.5;
    for (let x = -width * 0.5; x <= width * 1.5; x += 90) {
      ctx.beginPath();
      ctx.moveTo(horizonCenterX, floorY);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 3. Server Tower Silhouettes
    ctx.fillStyle = isLight ? "rgba(226, 232, 240, 0.5)" : "rgba(11, 19, 38, 0.65)";
    ctx.fillRect(30, height * 0.2, 140, height * 0.7);
    ctx.strokeStyle = isLight ? "rgba(2, 132, 199, 0.2)" : "rgba(56, 189, 248, 0.25)";
    ctx.strokeRect(30, height * 0.2, 140, height * 0.7);

    // Server LEDs blinking
    serverLights.forEach((light) => {
      const lx = 45 + light.col * 20;
      const ly = height * 0.24 + light.row * 24;
      const alpha = (Math.sin(time * 3 + light.phase) + 1) * 0.4 + 0.2;
      ctx.fillStyle = light.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(lx, ly, 7, 3);
    });
    ctx.globalAlpha = 1.0;

    // Right Glass Partition / Holographic Terminal Silhouette
    ctx.fillStyle = isLight ? "rgba(241, 245, 249, 0.4)" : "rgba(15, 23, 42, 0.45)";
    ctx.beginPath();
    ctx.moveTo(width - 40, height * 0.15);
    ctx.lineTo(width - 240, height * 0.3);
    ctx.lineTo(width - 240, height * 0.85);
    ctx.lineTo(width - 40, height * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isLight ? "rgba(147, 51, 234, 0.15)" : "rgba(168, 85, 247, 0.2)";
    ctx.stroke();

    // Floating Particles
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < 0) {
        p.y = height;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = isLight
        ? `rgba(2, 132, 199, ${Math.max(0.1, Math.min(0.5, p.alpha))})`
        : `rgba(56, 189, 248, ${Math.max(0.1, Math.min(0.8, p.alpha))})`;
      ctx.fill();
    });

    ctx.restore();
    requestAnimationFrame(render);
  }

  render();
};
