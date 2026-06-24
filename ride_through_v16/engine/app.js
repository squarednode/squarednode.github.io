import { Renderer } from './renderer.js';
import { TimelinePlayer } from './timeline.js';
import { exportSvgShotAsWebM } from './exporter.js';

const stage = document.getElementById('stage');
const status = document.getElementById('status');
const debug = document.getElementById('debug');
const storyText = document.getElementById('storyText');
const shotSelect = document.getElementById('shotSelect');
const assetList = document.getElementById('assetList');
const assetDetails = document.getElementById('assetDetails');

const renderer = new Renderer(stage);
const player = new TimelinePlayer(renderer, text => debug.textContent = text);
let story;

async function init() {
  const res = await fetch('../stories/episode_001.json');
  story = await res.json();
  storyText.value = JSON.stringify(story, null, 2);
  populateShots();
  populateAssets();
  renderer.buildShot(story.shots[0]);
  status.textContent = 'Ready - V16 full engine';
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
    item.innerHTML = `<strong>${asset.label}</strong><span>${asset.type} / ${asset.id}</span>`;
    item.addEventListener('click', () => {
      assetDetails.textContent = JSON.stringify(asset, null, 2);
    });
    assetList.appendChild(item);
  }
  assetDetails.textContent = JSON.stringify(renderer.getAssetLibrary()[0], null, 2);
}

function currentShot() {
  return story.shots.find(s => s.id === shotSelect.value) || story.shots[0];
}

function reloadStory() {
  story = JSON.parse(storyText.value);
  populateShots();
  renderer.buildShot(currentShot());
}

document.getElementById('playShot').addEventListener('click', () => player.playShot(currentShot()));
document.getElementById('playEpisode').addEventListener('click', () => player.playEpisode(story));
document.getElementById('stop').addEventListener('click', () => player.stop());
document.getElementById('reloadStory').addEventListener('click', () => {
  try { reloadStory(); status.textContent = 'Story reloaded'; }
  catch (err) { status.textContent = 'JSON error'; debug.textContent = String(err); }
});

document.getElementById('copyShotTemplate').addEventListener('click', async () => {
  const template = {
    id: 'shot_new',
    title: 'New shot template',
    duration: 6,
    environment: { asset: 'park_entry_day' },
    camera: { type: '2.5d', position: [0, 0], zoom: 1 },
    actors: [{ id: 'guest1', asset: 'human_guest_basic', position: [480, 245, 4], scale: 0.9, expression: 'happy', wardrobe: { shirtColor: '#2f80ed', pantsColor: '#25324a', hatColor: '#ffd34d' } }],
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
