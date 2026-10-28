const search = document.querySelector('#journal-search');
if (search) {
  const entries = [...document.querySelectorAll('[data-entry]')];
  const empty = document.querySelector('#no-entries');
  const groups = [...document.querySelectorAll('[data-journal-group]')];
  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    entries.forEach(entry => {
      entry.hidden = !entry.dataset.entry.includes(query);
      if (!entry.hidden) visible++;
    });
    groups.forEach(group => {
      group.hidden = ![...group.querySelectorAll('[data-entry]')].some(entry => !entry.hidden);
    });
    empty.hidden = visible > 0;
  });
}


// Keep photography browsing on the gallery page. Links still work without JavaScript.
const photoLinks = [...document.querySelectorAll('.photo-grid a')];
if (photoLinks.length) {
  const viewer = document.createElement('dialog');
  viewer.className = 'photo-viewer';
  viewer.setAttribute('aria-labelledby', 'photo-viewer-caption');
  viewer.innerHTML = `
    <div class="photo-viewer-panel">
      <header class="photo-viewer-toolbar">
        <span class="eyebrow">Through my lens</span>
        <button class="photo-viewer-close" type="button" aria-label="Close photo" autofocus>Close <span aria-hidden="true">×</span></button>
      </header>
      <div class="photo-viewer-stage"><img class="photo-viewer-image" alt=""></div>
      <footer class="photo-viewer-footer">
        <p id="photo-viewer-caption" aria-live="polite"></p>
        <div class="photo-viewer-controls">
          <button type="button" data-photo-step="-1" aria-label="Previous photo">←</button>
          <span class="photo-viewer-count"></span>
          <button type="button" data-photo-step="1" aria-label="Next photo">→</button>
        </div>
      </footer>
    </div>`;
  document.body.append(viewer);

  const viewerImage = viewer.querySelector('.photo-viewer-image');
  const caption = viewer.querySelector('#photo-viewer-caption');
  const count = viewer.querySelector('.photo-viewer-count');
  let currentPhoto = 0;
  let opener;

  function showPhoto(index) {
    currentPhoto = (index + photoLinks.length) % photoLinks.length;
    const thumbnail = photoLinks[currentPhoto].querySelector('img');
    viewerImage.src = thumbnail.currentSrc || thumbnail.src;
    viewerImage.alt = thumbnail.alt;
    caption.textContent = thumbnail.alt;
    count.textContent = `${currentPhoto + 1} / ${photoLinks.length}`;
  }

  photoLinks.forEach((link, index) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      opener = link;
      showPhoto(index);
      viewer.showModal();
      document.body.classList.add('photo-viewer-open');
    });
  });

  viewer.querySelector('.photo-viewer-close').addEventListener('click', () => viewer.close());
  viewer.querySelectorAll('[data-photo-step]').forEach(button => {
    button.addEventListener('click', () => showPhoto(currentPhoto + Number(button.dataset.photoStep)));
  });
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(currentPhoto + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  viewer.addEventListener('click', event => {
    if (event.target === viewer) viewer.close();
  });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('photo-viewer-open');
    opener?.focus({ preventScroll: true });
  });
}
