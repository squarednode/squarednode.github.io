export class TimelinePlayer {
  constructor(renderer, onDebug = () => {}) {
    this.renderer = renderer;
    this.onDebug = onDebug;
    this.running = false;
    this.raf = null;
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  playShot(shot, onDone = () => {}) {
    this.stop();
    this.renderer.buildShot(shot);
    const durationMs = (shot.duration || 5) * 1000;
    const start = performance.now();
    this.running = true;

    const loop = now => {
      if (!this.running) return;
      const t = Math.min((now - start) / 1000, shot.duration || 5);
      this.applyTimeline(shot, t);
      this.renderer.sortDepth();
      this.onDebug(`shot=${shot.id}\ntime=${t.toFixed(2)} / ${shot.duration}s\nactors=${this.renderer.actors.size}`);
      if (now - start < durationMs) this.raf = requestAnimationFrame(loop);
      else { this.running = false; onDone(); }
    };
    this.raf = requestAnimationFrame(loop);
  }

  async playEpisode(story) {
    for (const shot of story.shots) {
      await new Promise(resolve => this.playShot(shot, resolve));
      await wait(120);
      if (!this.running && shot !== story.shots[story.shots.length - 1]) continue;
    }
  }

  applyTimeline(shot, t) {
    const baseCamera = shot.camera || { position: [0,0], zoom: 1 };
    this.renderer.setCamera(baseCamera);
    for (const cmd of shot.timeline || []) {
      const start = cmd.start ?? cmd.time ?? 0;
      const duration = cmd.duration ?? 1;
      const u = clamp((t - start) / duration, 0, 1);
      if (t < start || t > start + duration) {
        if (cmd.action === 'talk' && t > start + duration) this.resetTalk(cmd.actor);
        continue;
      }
      this.applyCommand(cmd, u, t, baseCamera);
    }
  }

  resetTalk(actor) {
    this.renderer.setPartAngle(actor, 'jaw', 0);
    this.renderer.setMouth(actor, 'smile');
  }

  applyCommand(cmd, u, t, baseCamera) {
    const ease = smooth(u);
    const rig = this.renderer.actors.get(cmd.actor);

    if (cmd.action === 'camera_move') {
      const from = cmd.from || baseCamera.position || [0,0];
      const to = cmd.to || from;
      const z0 = cmd.fromZoom || baseCamera.zoom || 1;
      const z1 = cmd.toZoom || cmd.zoom || z0;
      this.renderer.setCamera({ position: [lerp(from[0], to[0], ease), lerp(from[1], to[1], ease)], zoom: lerp(z0, z1, ease) });
      return;
    }

    if (!rig) return;

    if (cmd.action === 'enter') {
      const to = cmd.to || [rig.state.x, rig.state.y, rig.state.z];
      const from = cmd.from === 'left' ? [-360, to[1], to[2]] : cmd.from === 'right' ? [1500, to[1], to[2]] : cmd.from === 'bottom' ? [to[0], 850, to[2]] : cmd.from;
      if (Array.isArray(from)) this.renderer.setActorPosition(cmd.actor, lerp(from[0], to[0], ease), lerp(from[1], to[1], ease), lerp(from[2] ?? rig.state.z, to[2] ?? rig.state.z, ease));
      this.renderer.setOpacity(cmd.actor, lerp(0, rig.state.opacity || 1, ease));
    }

    if (cmd.action === 'walk') {
      const from = cmd.from || [rig.state.x, rig.state.y, rig.state.z];
      const to = cmd.to || from;
      this.renderer.setActorPosition(cmd.actor, lerp(from[0], to[0], ease), lerp(from[1], to[1], ease), lerp(from[2] ?? rig.state.z, to[2] ?? rig.state.z, ease));
      const step = Math.sin(t * 12) * 18;
      this.renderer.setPartAngle(cmd.actor, 'leftLeg', step);
      this.renderer.setPartAngle(cmd.actor, 'rightLeg', -step);
      this.renderer.setPartAngle(cmd.actor, 'leftArm', -step * 0.8);
      this.renderer.setPartAngle(cmd.actor, 'rightArm', step * 0.8);
      this.renderer.setPartAngle(cmd.actor, 'leftUpperArm', -step * 0.8);
      this.renderer.setPartAngle(cmd.actor, 'rightUpperArm', step * 0.8);
      this.renderer.setPartAngle(cmd.actor, 'tail', Math.sin(t * 6) * 7);
    }

    if (cmd.action === 'drive') {
      const from = cmd.from || [rig.state.x, rig.state.y, rig.state.z];
      const to = cmd.to || from;
      this.renderer.setActorPosition(cmd.actor, lerp(from[0], to[0], ease), lerp(from[1], to[1], ease), lerp(from[2] ?? rig.state.z, to[2] ?? rig.state.z, ease));
      const spin = t * 720;
      this.renderer.setPartAngle(cmd.actor, 'frontWheel', spin);
      this.renderer.setPartAngle(cmd.actor, 'rearWheel', spin);
      this.renderer.setPartAngle(cmd.actor, 'train', Math.sin(t * 5) * 5);
    }

    if (cmd.action === 'wave') {
      const part = cmd.part || (rig.parts.rightUpperArm ? 'rightUpperArm' : (rig.parts.rightArm ? 'rightArm' : 'head'));
      const base = cmd.baseAngle ?? -35;
      const wave = Math.sin(t * 14) * (cmd.amount ?? 30);
      this.renderer.setPartAngle(cmd.actor, part, base + wave);
      if (rig.parts.rightForearm) this.renderer.setPartAngle(cmd.actor, 'rightForearm', -20 + wave * 0.45);
    }

    if (cmd.action === 'gesture') {
      for (const [part, range] of Object.entries(cmd.parts || {})) {
        const from = Array.isArray(range) ? range[0] : 0;
        const to = Array.isArray(range) ? range[1] : Number(range);
        this.renderer.setPartAngle(cmd.actor, part, lerp(from, to, ease));
      }
    }

    if (cmd.action === 'talk') {
      this.renderer.setExpression(cmd.actor, cmd.expression || rig.state.expression || 'happy');
      const shapes = cmd.phonemes || ['smile','open','wide','o'];
      const shape = shapes[Math.floor(t * 8) % shapes.length];
      this.renderer.setMouth(cmd.actor, shape);
      const open = Math.max(0, Math.sin(t * 18)) * 18;
      this.renderer.setPartAngle(cmd.actor, 'jaw', open);
    }

    if (cmd.action === 'mouth') this.renderer.setMouth(cmd.actor, cmd.shape || 'smile');
    if (cmd.action === 'expression') this.renderer.setExpression(cmd.actor, cmd.expression);
    if (cmd.action === 'look') this.renderer.setPartAngle(cmd.actor, 'head', lerp(cmd.fromAngle || 0, cmd.toAngle || 0, ease));
    if (cmd.action === 'scale') this.renderer.setActorScale(cmd.actor, lerp(cmd.from ?? rig.state.scale, cmd.to ?? rig.state.scale, ease));

    if (cmd.action === 'exit') {
      const from = cmd.from || [rig.state.x, rig.state.y, rig.state.z];
      const to = cmd.to || (cmd.direction === 'right' ? [1500, from[1], from[2]] : [-350, from[1], from[2]]);
      this.renderer.setActorPosition(cmd.actor, lerp(from[0], to[0], ease), lerp(from[1], to[1], ease), lerp(from[2] ?? rig.state.z, to[2] ?? rig.state.z, ease));
      this.renderer.setOpacity(cmd.actor, lerp(1, 0.2, ease));
    }
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function smooth(t) { return t * t * (3 - 2 * t); }
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
