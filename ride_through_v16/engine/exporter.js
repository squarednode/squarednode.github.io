export async function exportSvgShotAsWebM(stage, playFn, filename = 'shot.webm') {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks = [];

  recorder.ondataavailable = event => {
    if (event.data && event.data.size) chunks.push(event.data);
  };

  const drawLoop = { active: true };
  const draw = () => {
    if (!drawLoop.active) return;
    const xml = new XMLSerializer().serializeToString(stage);
    const img = new Image();
    const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      requestAnimationFrame(draw);
    };
    img.src = url;
  };

  recorder.start();
  draw();
  await playFn();
  await wait(250);
  drawLoop.active = false;
  recorder.stop();

  await new Promise(resolve => recorder.onstop = resolve);
  const blob = new Blob(chunks, { type: 'video/webm' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
