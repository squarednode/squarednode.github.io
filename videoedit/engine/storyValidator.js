import { getAssetManifest } from './assetFactory.js';

export function validateStory(story, assetLibrary = []) {
  const checks = [];
  const assetIds = new Set(assetLibrary.map(asset => asset.id));

  if (!story || typeof story !== 'object') {
    return { summary: summarize([issue('error', 'story-json', 'Story is not a JSON object', 'story', '')]), checks: [issue('error', 'story-json', 'Story is not a JSON object', 'story', '')] };
  }

  if (!story.id) checks.push(issue('warning', 'story-id', 'Story is missing id', 'story', 'Add a stable episode id.'));
  if (!Array.isArray(story.shots) || !story.shots.length) checks.push(issue('error', 'shots', 'Story has no shots', story.id || 'story', 'Add at least one shot.'));

  for (const shot of story.shots || []) {
    const shotId = shot.id || '(unnamed shot)';
    if (!shot.id) checks.push(issue('error', 'shot-id', 'Shot is missing id', story.id || 'story', JSON.stringify(shot.title || '')));
    if (!Number.isFinite(Number(shot.duration)) || Number(shot.duration) <= 0) checks.push(issue('error', 'shot-duration', 'Shot duration must be a positive number', shotId, String(shot.duration)));
    if (!shot.environment || typeof shot.environment !== 'object') checks.push(issue('warning', 'environment', 'Shot is missing environment object', shotId, 'Use environment.asset and optional color overrides.'));
    if (shot.environment?.asset) {
      const env = getAssetManifest(shot.environment.asset);
      if (!env) checks.push(issue('error', 'environment-asset', 'Environment asset not found', `${shotId}.environment`, shot.environment.asset));
      else if (env.type !== 'environment') checks.push(issue('warning', 'environment-type', 'Environment asset is not category environment', `${shotId}.environment`, `${shot.environment.asset} is ${env.type}`));
    }

    const actors = Array.isArray(shot.actors) ? shot.actors : [];
    if (!Array.isArray(shot.actors)) checks.push(issue('error', 'actors', 'Shot actors must be an array', shotId, ''));
    const actorIds = new Set();
    const actorAssets = new Map();
    for (const actor of actors) {
      const label = `${shotId}.${actor.id || '(unnamed actor)'}`;
      if (!actor.id) checks.push(issue('error', 'actor-id', 'Actor is missing id', shotId, JSON.stringify(actor)));
      if (actor.id && actorIds.has(actor.id)) checks.push(issue('error', 'duplicate-actor', 'Duplicate actor id in shot', label, 'Actor ids must be unique per shot.'));
      if (actor.id) actorIds.add(actor.id);
      if (!actor.asset) checks.push(issue('error', 'actor-asset', 'Actor is missing asset id', label, ''));
      if (actor.asset && !assetIds.has(actor.asset)) checks.push(issue('error', 'missing-asset', 'Actor references unknown asset', label, actor.asset));
      const manifest = actor.asset ? getAssetManifest(actor.asset) : null;
      if (actor.id && manifest) actorAssets.set(actor.id, manifest);
      if (!isPosition(actor.position)) checks.push(issue('error', 'bad-position', 'Actor position must be [x, y, z]', label, JSON.stringify(actor.position)));
      if (actor.expression && manifest?.expressions && !hasExpression(manifest, actor.expression)) checks.push(issue('warning', 'bad-expression', 'Actor expression is not declared on asset', label, actor.expression));
    }

    for (const cmd of shot.timeline || []) {
      const label = `${shotId}.timeline.${cmd.actor || '(no actor)'}.${cmd.action || '(no action)'}`;
      const start = Number(cmd.start ?? cmd.time ?? 0);
      const duration = Number(cmd.duration ?? 1);
      if (!cmd.action) checks.push(issue('error', 'timeline-action', 'Timeline command missing action', label, JSON.stringify(cmd)));
      if (cmd.action !== 'camera_move') {
        if (!cmd.actor) checks.push(issue('error', 'timeline-actor', 'Timeline command missing actor', label, JSON.stringify(cmd)));
        if (cmd.actor && !actorIds.has(cmd.actor)) checks.push(issue('error', 'bad-actor-ref', 'Timeline references unknown actor', label, cmd.actor));
      }
      if (!Number.isFinite(start) || start < 0) checks.push(issue('error', 'bad-start', 'Timeline start/time must be a nonnegative number', label, String(cmd.start ?? cmd.time)));
      if (!Number.isFinite(duration) || duration <= 0) checks.push(issue('error', 'bad-command-duration', 'Timeline duration must be positive', label, String(cmd.duration)));
      if (Number.isFinite(Number(shot.duration)) && start + duration > Number(shot.duration) + 0.001) checks.push(issue('warning', 'timeline-overrun', 'Timeline command runs beyond shot duration', label, `ends at ${round(start + duration)}s, shot is ${shot.duration}s`));
      const manifest = actorAssets.get(cmd.actor);
      if (manifest && cmd.action && !supportsMotion(manifest, cmd.action)) checks.push(issue('warning', 'unsupported-motion', 'Motion is not listed as supported by asset', label, `${manifest.id} motions: ${(manifest.motions || []).join(', ')}`));
      if (cmd.expression && manifest?.expressions && !hasExpression(manifest, cmd.expression)) checks.push(issue('warning', 'timeline-expression', 'Timeline expression is not declared on asset', label, cmd.expression));
      if (cmd.action === 'gesture' && cmd.parts && manifest) {
        const rig = new Set(manifest.rig || []);
        for (const part of Object.keys(cmd.parts)) {
          if (!rig.has(part) && !((manifest.parts || []).some(p => p.name === part))) checks.push(issue('warning', 'gesture-part', 'Gesture references unknown rig part', `${label}.${part}`, manifest.id));
        }
      }
    }
  }

  return { summary: summarize(checks), checks };
}

function supportsMotion(manifest, action) {
  if (action === 'camera_move') return true;
  const motions = manifest.motions || [];
  return motions.includes(action) || (action === 'gesture' && motions.includes('gesture'));
}

function hasExpression(manifest, expression) {
  const expressions = manifest.expressions;
  if (Array.isArray(expressions)) return expressions.includes(expression);
  return expressions && Object.prototype.hasOwnProperty.call(expressions, expression);
}

function isPosition(pos) {
  return Array.isArray(pos) && pos.length >= 2 && pos.length <= 3 && pos.every(value => Number.isFinite(Number(value)));
}

function issue(level, code, message, target, detail) {
  return { level, code, message, target, detail };
}

function summarize(checks) {
  const counts = { pass: 0, info: 0, warning: 0, error: 0 };
  for (const check of checks) counts[check.level] = (counts[check.level] || 0) + 1;
  if (!checks.length) counts.pass = 1;
  return counts;
}

function round(value) { return Math.round(value * 100) / 100; }
