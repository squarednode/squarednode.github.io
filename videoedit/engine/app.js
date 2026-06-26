import { Renderer } from './renderer.js';
import { TimelinePlayer } from './timeline.js';
import { exportSvgShotAsWebM } from './exporter.js';
import { loadAssetPacks } from './assetPackLoader.js';
import { registerAssetPacks } from './assetFactory.js';
import { validateAssetPacks, collectRenderedAssetDiagnostics, makeAssetTestShot } from './assetValidator.js';
import { validateStory } from './storyValidator.js';

const stage = document.getElementById('stage');
const status = document.getElementById('status');
const debug = document.getElementById('debug');
const storyText = document.getElementById('storyText');
const shotSelect = document.getElementById('shotSelect');
const assetList = document.getElementById('assetList');
const assetDetails = document.getElementById('assetDetails');
const validationSummary = document.getElementById('validationSummary');
const validationReport = document.getElementById('validationReport');
const partTestSelect = document.getElementById('partTestSelect');
const storyValidationSummary = document.getElementById('storyValidationSummary');
const storyValidationReport = document.getElementById('storyValidationReport');

const renderer = new Renderer(stage);
const player = new TimelinePlayer(renderer, text => debug.textContent = text);
let story;
let assetPackReport = { loaded: [], errors: [] };
let selectedAsset = null;
let validation = null;

async function init() {
  assetPackReport = await loadAssetPacks();
  registerAssetPacks(assetPackReport.loaded);
  const res = await fetch('../stories/episode_001.json', { cache: 'no-cache' });
  story = await res.json();
  storyText.value = JSON.stringify(story, null, 2);
  populateShots();
  populateAssets();
  runValidation(false);
  runStoryValidation();
  renderer.buildShot(story.shots[0]);
  const packCount = assetPackReport.loaded.length;
  const errCount = assetPackReport.errors.length;
  status.textContent = `Ready - V20 foundation lock + story validation engine (${packCount} packs${errCount ? ', ' + errCount + ' load issue(s)' : ''})`;
  if (errCount) debug.textContent = JSON.stringify(assetPackReport.errors, null, 2);
}

function populateShots() {
  shotSelect.replaceChildren();
  for (const shot of story.shots) {
    const option = document.createElement('option');
    option.value = shot.id;
    option.textContent = `${shot.id} - ${shot.title || 'Untitled'}`;
    shotSelect.appendChild(option);
  }
}

function populateAssets() {
  assetList.replaceChildren();
  for (const asset of renderer.getAssetLibrary()) {
    const item = document.createElement('button');
    item.className = 'asset-card';
    item.innerHTML = `<strong>${asset.label}</strong><span>${asset.category || asset.type} / ${asset.subcategory || '-'}<br>${asset.id}<br>${asset.source || 'core'}${asset.packId ? ' / ' + asset.packId : ''}</span>`;
    item.addEventListener('click', () => {
      selectedAsset = asset;
      assetDetails.textContent = JSON.stringify(asset, null, 2);
      populatePartTests(asset);
    });
    assetList.appendChild(item);
  }
  selectedAsset = renderer.getAssetLibrary()[0] || null;
  assetDetails.textContent = JSON.stringify(selectedAsset, null, 2);
  populatePartTests(selectedAsset);
}


function populatePartTests(asset) {
  partTestSelect.replaceChildren();
  const any = document.createElement('option');
  any.value = '';
  any.textContent = 'Auto test / default motion';
  partTestSelect.appendChild(any);
  const parts = Array.isArray(asset?.parts) ? asset.parts : [];
  for (const part of parts) {
    const option = document.createElement('option');
    option.value = part.name;
    option.textContent = `${part.name}${part.file ? ' - ' + part.file : ''}`;
    partTestSelect.appendChild(option);
  }
}

function runValidation(includeRendered = true) {
  validation = validateAssetPacks(assetPackReport, renderer.getAssetLibrary());
  const summary = validation.summary;
  validationSummary.textContent = `${summary.assetCount} external assets checked | ${summary.error} errors | ${summary.warning} warnings | ${summary.info} info`;
  const checks = [...validation.checks];
  if (includeRendered && renderer.actors.has('asset_test')) {
    checks.push(...collectRenderedAssetDiagnostics(renderer, 'asset_test'));
  }
  renderValidationChecks(checks);
}


function runStoryValidation() {
  let parsed = story;
  try {
    parsed = JSON.parse(storyText.value);
  } catch (err) {
    storyValidationSummary.textContent = 'Story JSON parse error';
    renderChecks(storyValidationReport, [{ level: 'error', message: 'Story JSON cannot be parsed', target: 'storyText', detail: String(err) }]);
    return;
  }
  const report = validateStory(parsed, renderer.getAssetLibrary());
  const s = report.summary;
  storyValidationSummary.textContent = `${s.error || 0} errors | ${s.warning || 0} warnings | ${s.info || 0} info`;
  renderChecks(storyValidationReport, report.checks);
}

function renderValidationChecks(checks) {
  renderChecks(validationReport, checks);
}

function renderChecks(container, checks) {
  const ordered = [...checks].sort((a, b) => severityRank(a.level) - severityRank(b.level));
  container.replaceChildren();
  for (const check of ordered.slice(0, 220)) {
    const row = document.createElement('div');
    row.className = `validation-row ${check.level}`;
    row.innerHTML = `<strong>${String(check.level || 'info').toUpperCase()}</strong><span>${check.message}</span><code>${check.target || ''}</code><em>${check.detail || ''}</em>`;
    container.appendChild(row);
  }
  if (!ordered.length) {
    const row = document.createElement('div');
    row.className = 'validation-row pass';
    row.textContent = 'No validation issues found.';
    container.appendChild(row);
  }
}

function severityRank(level) {
  return { error: 0, warning: 1, info: 2, pass: 3 }[level] ?? 4;
}

function testSelectedAsset() {
  if (!selectedAsset) return;
  const partName = partTestSelect.value || null;
  const shot = makeAssetTestShot(selectedAsset, partName);
  player.stop();
  renderer.buildShot(shot);
  runValidation(true);
  status.textContent = `Testing ${selectedAsset.id}${partName ? ' / ' + partName : ''}`;
}

function currentShot() {
  return story.shots.find(s => s.id === shotSelect.value) || story.shots[0];
}

function reloadStory() {
  story = JSON.parse(storyText.value);
  populateShots();
  renderer.buildShot(currentShot());
  runStoryValidation();
}

document.getElementById('playShot').addEventListener('click', () => player.playShot(currentShot()));
document.getElementById('runValidation').addEventListener('click', () => { runValidation(true); status.textContent = 'Asset validation complete'; });
document.getElementById('runStoryValidation').addEventListener('click', () => { runStoryValidation(); status.textContent = 'Story validation complete'; });
document.getElementById('testAsset').addEventListener('click', testSelectedAsset);
document.getElementById('playAssetTest').addEventListener('click', () => { if (!selectedAsset) return; const shot = makeAssetTestShot(selectedAsset, partTestSelect.value || null); player.playShot(shot); status.textContent = `Playing asset test: ${selectedAsset.id}`; });
document.getElementById('playEpisode').addEventListener('click', () => player.playEpisode(story));
document.getElementById('stop').addEventListener('click', () => player.stop());
document.getElementById('reloadStory').addEventListener('click', () => {
  try { reloadStory(); status.textContent = 'Story reloaded'; }
  catch (err) { status.textContent = 'JSON error'; debug.textContent = String(err); }
});

document.getElementById('copyShotTemplate').addEventListener('click', async () => {
  const template = {
    id: 'shot_new',
    title: 'New V20 validated shot template',
    duration: 6,
    environment: { asset: 'park_path_day' },
    camera: { type: '2.5d', position: [0, 0], zoom: 1 },
    actors: [{ id: 'guest1', asset: 'human_guest_basic', position: [480, 245, 4], scale: 0.9, expression: 'happy', wardrobe: { shirtColor: '#2f80ed', pantsColor: '#25324a', hatColor: '#ffd34d' } }, { id: 'prop1', asset: 'prop_popcorn_bucket', position: [700, 360, 5], scale: 0.45 }],
    timeline: [{ start: 0.5, duration: 2, actor: 'guest1', action: 'wave' }]
  };
  await navigator.clipboard.writeText(JSON.stringify(template, null, 2));
  status.textContent = 'Shot template copied';
});

document.getElementById('exportShot').addEventListener('click', async () => {
  const shot = currentShot();
  status.textContent = `Exporting ${shot.id}...`;
  await exportSvgShotAsWebM(stage, () => new Promise(resolve => player.playShot(shot, resolve)), `${shot.id}.webm`);
  status.textContent = 'Ready';
});

document.getElementById('exportAll').addEventListener('click', async () => {
  status.textContent = 'Exporting all shots one by one...';
  for (const shot of story.shots) {
    shotSelect.value = shot.id;
    await exportSvgShotAsWebM(stage, () => new Promise(resolve => player.playShot(shot, resolve)), `${story.id}_${shot.id}.webm`);
    await new Promise(resolve => setTimeout(resolve, 350));
  }
  status.textContent = 'All exports started/downloaded';
});

shotSelect.addEventListener('change', () => renderer.buildShot(currentShot()));

init().catch(err => {
  status.textContent = 'Failed to load';
  debug.textContent = String(err);
});
