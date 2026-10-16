'use strict';
const viewer = document.querySelector('#screenshot-viewer');
const viewerImage = document.querySelector('#viewer-image');
const originalImage = document.querySelector('#original-image');
let previousOverflow = '';
document.querySelectorAll('[data-screenshot]').forEach(link => {
  link.addEventListener('click', event => {
    if (!viewer.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const image = link.querySelector('img');
    viewerImage.src = link.href;
    viewerImage.alt = image.alt;
    originalImage.href = link.href;
    document.querySelector('#viewer-description').textContent = image.alt;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    viewer.showModal();
    document.querySelector('.viewer-image-wrap').scrollTo(0, 0);
  });
});
document.querySelector('#close-viewer').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => {
  if (event.target !== viewer) return;
  const rect = viewer.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
});
viewer.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
