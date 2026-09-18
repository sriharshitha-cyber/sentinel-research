// Flying Paper Animation Canvas for Sentinel Research Anime Office
window.initFlyingPaperCanvas = function (canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return () => {};
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", handleResize);

  // Flying Paper Particle System
  const paperCount = 14;
  const papers = [];

  class FlyingPaper {
    constructor(initRandom = false) {
      this.reset(initRandom);
    }

    reset(initRandom = false) {
      if (initRandom) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      } else {
        // Natural spawn point: desk area (bottom-center and bottom-right)
        this.x = width * (0.35 + Math.random() * 0.65);
        this.y = height * 0.68 + Math.random() * (height * 0.3);
      }

      this.z = Math.random() * 0.7 + 0.45; // Depth factor: 0.45 to 1.15
      this.baseWidth = 28 * this.z;
      this.baseHeight = 38 * this.z;

      // Drift upward and toward the window on the left
      this.vx = -(Math.random() * 1.3 + 0.6) * (this.z * 1.1);
      this.vy = -(Math.random() * 0.95 + 0.45) * (this.z * 1.1);

      // Wind turbulence & wave motion
      this.wavePhase = Math.random() * Math.PI * 2;
      this.waveSpeed = Math.random() * 0.03 + 0.015;
      this.waveAmp = Math.random() * 1.6 + 0.8;

      // 3D rotation angles
      this.rotX = Math.random() * Math.PI * 2;
      this.rotY = Math.random() * Math.PI * 2;
      this.rotZ = (Math.random() - 0.5) * 0.8;

      this.rotSpeedX = (Math.random() - 0.5) * 0.035;
      this.rotSpeedY = (Math.random() - 0.5) * 0.045;
      this.rotSpeedZ = (Math.random() - 0.5) * 0.015;

      this.opacity = Math.random() * 0.25 + 0.75;
      this.cornerFold = Math.random() > 0.55;
      this.lineCount = Math.floor(Math.random() * 3) + 3;
    }

    update() {
      this.wavePhase += this.waveSpeed;
      this.x += this.vx + Math.sin(this.wavePhase) * this.waveAmp;
      this.y += this.vy + Math.cos(this.wavePhase * 0.7) * 0.45;

      this.rotX += this.rotSpeedX;
      this.rotY += this.rotSpeedY;
      this.rotZ += this.rotSpeedZ;

      // Recycle when drifting off screen
      if (this.x < -80 || this.y < -80) {
        this.reset(false);
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotZ);

      // 3D perspective tumbling
      const scaleX = Math.cos(this.rotY);
      const scaleY = Math.cos(this.rotX);

      if (Math.abs(scaleX) < 0.06 || Math.abs(scaleY) < 0.06) {
        ctx.restore();
        return;
      }

      ctx.scale(scaleX, scaleY);

      const w = this.baseWidth;
      const h = this.baseHeight;

      // Ambient drop shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
      ctx.shadowBlur = 12 * this.z;
      ctx.shadowOffsetX = 5 * this.z;
      ctx.shadowOffsetY = 7 * this.z;

      // Paper surface
      ctx.fillStyle = `rgba(253, 253, 255, ${this.opacity})`;
      ctx.strokeStyle = `rgba(203, 213, 225, ${this.opacity * 0.9})`;
      ctx.lineWidth = 0.9;

      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 2);
      ctx.fill();
      ctx.stroke();

      // Dog-eared corner fold
      if (this.cornerFold) {
        const fold = 5.5 * this.z;
        ctx.fillStyle = `rgba(226, 232, 240, ${this.opacity})`;
        ctx.beginPath();
        ctx.moveTo(w / 2 - fold, -h / 2);
        ctx.lineTo(w / 2, -h / 2 + fold);
        ctx.lineTo(w / 2 - fold, -h / 2 + fold);
        ctx.closePath();
        ctx.fill();
      }

      // Printed document lines
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = `rgba(148, 163, 184, ${this.opacity * 0.65})`;
      ctx.lineWidth = 1.1 * this.z;

      const spacing = (h - 10) / (this.lineCount + 1);
      for (let i = 1; i <= this.lineCount; i++) {
        const lineY = -h / 2 + 5 + i * spacing;
        const lineLen = w * (0.55 + Math.sin(i * 1.5) * 0.25);
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 4, lineY);
        ctx.lineTo(-w / 2 + 4 + lineLen, lineY);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Floating ambient sunlight particles
  const dustCount = 28;
  const dust = [];
  for (let i = 0; i < dustCount; i++) {
    dust.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      vx: -(Math.random() * 0.4 + 0.1),
      vy: -(Math.random() * 0.3 + 0.1),
      alpha: Math.random() * 0.55 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    });
  }

  for (let i = 0; i < paperCount; i++) {
    papers.push(new FlyingPaper(true));
  }

  let animationFrameId;

  function loop() {
    ctx.clearRect(0, 0, width, height);

    // Draw sunlight motes
    for (const d of dust) {
      d.pulse += 0.035;
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = width;
      if (d.y < 0) d.y = height;

      const currentAlpha = d.alpha * (0.7 + 0.3 * Math.sin(d.pulse));
      ctx.fillStyle = `rgba(255, 255, 220, ${currentAlpha})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw flying papers
    for (const p of papers) {
      p.update();
      p.draw(ctx);
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  loop();

  return () => {
    window.removeEventListener("resize", handleResize);
    cancelAnimationFrame(animationFrameId);
  };
};
