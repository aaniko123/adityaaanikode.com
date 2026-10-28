(async () => {
  const canvas = document.querySelector('#journal-map');
  const data = document.querySelector('#journal-map-data');
  if (!canvas || !data) return;

  const entries = JSON.parse(data.textContent);
  const places = entries.flatMap(entry => entry.places.map(place => ({
    ...place, country: entry.country, title: entry.title, url: entry.url
  })));
  if (!places.length) return;

  const card = document.querySelector('.journal-map-card');
  const svg = document.querySelector('#journal-map-svg');
  const heading = document.querySelector('#journal-map-heading');
  const description = document.querySelector('#journal-map-description');
  const destinations = document.querySelector('#journal-map-destinations');
  const listHeading = document.querySelector('#journal-map-list-heading');
  const summary = document.querySelector('#journal-map-summary');
  const status = document.querySelector('#journal-map-status');
  const reset = document.querySelector('#journal-map-reset');
  const search = document.querySelector('#journal-search');
  const tooltip = document.querySelector('#journal-map-tooltip');
  const names = Object.fromEntries(entries.filter(entry => entry.countryName).map(entry => [entry.country, entry.countryName]));
  const NS = 'http://www.w3.org/2000/svg';
  let width = 1000;
  const height = 560;
  let selected = null;

  const countryDetails = new Map();
  const pendingDetails = new Map();
  const failedDetails = new Set();
  const viewNote = document.querySelector('#journal-map-view-note');
  let filtered = places;
  card.hidden = false;

  let features;
  try {
    const response = await fetch(canvas.dataset.countriesUrl);
    if (!response.ok) throw new Error('Country outlines unavailable');
    features = (await response.json()).features;
  } catch {
    document.querySelector('#journal-map-layout').hidden = true;
    status.textContent = 'The map could not load. You can still explore every entry in the journal below.';
    return;
  }
  status.hidden = true;

  function node(tag, attributes = {}, text) {
    const element = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function polygons(feature) {
    return feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  }
  function mercator([longitude, latitude]) {
    const radians = Math.PI / 180;
    const clamped = Math.max(-80, Math.min(84, latitude));
    return [longitude * radians, -Math.log(Math.tan(Math.PI / 4 + clamped * radians / 2))];
  }
  function projection(feature, bounds, frame = { x: 0, y: 0, width, height }, padding) {
    const points = bounds ? bounds.map(mercator) : feature ? polygons(feature).flat(2).map(mercator) : [[-180, -58], [180, 84]].map(mercator);
    let west = Infinity, east = -Infinity, north = Infinity, south = -Infinity;
    points.forEach(([x, y]) => { west = Math.min(west, x); east = Math.max(east, x); north = Math.min(north, y); south = Math.max(south, y); });
    padding ??= feature || bounds ? 32 : 18;
    const scale = Math.min((frame.width - padding * 2) / (east - west), (frame.height - padding * 2) / (south - north));
    const project = coordinates => {
      const [x, y] = mercator(coordinates);
      return [frame.x + frame.width / 2 + (x - (west + east) / 2) * scale,
        frame.y + frame.height / 2 + (y - (north + south) / 2) * scale];
    };
    project.scale = scale;
    return project;
  }
  function shape(feature, project, bounds) {
    return polygons(feature).filter(polygon => {
      if (!bounds) return true;
      let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
      polygon[0].forEach(([x, y]) => { west = Math.min(west, x); east = Math.max(east, x); south = Math.min(south, y); north = Math.max(north, y); });
      return west <= bounds[1][0] && east >= bounds[0][0] && south <= bounds[1][1] && north >= bounds[0][1];
    }).map(polygon => polygon.map(ring => ring.map((coordinates, index) => {
      const [x, y] = project(coordinates);
      return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join('') + 'Z').join('')).join('');
  }
  function hideTooltip() { tooltip.hidden = true; }
  function showTooltip(title, detail, element, event) {
    tooltip.replaceChildren();
    const name = document.createElement('strong');
    const caption = document.createElement('span');
    name.textContent = title;
    caption.textContent = detail;
    tooltip.append(name, caption);
    tooltip.hidden = false;
    const bounds = canvas.getBoundingClientRect();
    const anchor = element.getBoundingClientRect();
    const x = event?.clientX ?? anchor.x + anchor.width / 2;
    const y = event?.clientY ?? anchor.y;
    tooltip.style.left = `${Math.max(10, Math.min(x - bounds.x - tooltip.offsetWidth / 2, bounds.width - tooltip.offsetWidth - 10))}px`;
    const above = y - bounds.y - tooltip.offsetHeight - 14;
    tooltip.style.top = `${Math.max(10, Math.min(above > 10 ? above : y - bounds.y + 20, bounds.height - tooltip.offsetHeight - 10))}px`;
  }
  function attachTooltip(element, title, detail) {
    element.addEventListener('pointerenter', event => showTooltip(title, detail, element, event));
    element.addEventListener('pointerleave', hideTooltip);
    element.addEventListener('focus', () => showTooltip(title, detail, element));
    element.addEventListener('blur', hideTooltip);
  }
  function countryName(code) {
    return names[code] || features.find(feature => feature.properties.code === code)?.properties.name || code;
  }
  function chooseCountry(code, keyboard = false) {
    selected = code;

    render();
    if (keyboard) reset.focus({ preventScroll: true });
  }
  function countryButtons(codes) {
    codes.sort((a, b) => countryName(a).localeCompare(countryName(b))).forEach(code => {
      const count = filtered.filter(place => place.country === code).length;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fixed-map-country-button';
      button.dataset.country = code;
      const name = document.createElement('span');
      const total = document.createElement('span');
      name.textContent = countryName(code);
      total.textContent = `${count} ${count === 1 ? 'place' : 'places'} ↗`;
      button.append(name, total);
      button.addEventListener('click', event => chooseCountry(code, event.detail === 0));
      destinations.append(button);
    });
  }
  function renderWorld() {
    const project = projection();
    const countries = [...new Set(filtered.map(place => place.country))];
    const group = node('g', { class: 'fixed-world-countries' });
    features.forEach(feature => {
      const code = feature.properties.code;
      const visited = countries.includes(code);
      const path = node('path', {
        d: shape(feature, project), 'fill-rule': 'evenodd',
        class: `fixed-country${visited ? ' is-visited' : ''}`, 'data-country': code
      });
      if (visited) {
        const count = filtered.filter(place => place.country === code).length;
        const name = countryName(code);
        path.setAttribute('tabindex', '0');
        path.setAttribute('role', 'button');
        path.setAttribute('aria-label', `Explore ${name}, ${count} visited places`);
        path.addEventListener('click', () => chooseCountry(code));
        path.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            chooseCountry(code, true);
          }
        });
        attachTooltip(path, name, `${count} ${count === 1 ? 'place' : 'places'} — select to explore`);
      }
      group.append(path);
    });
    svg.append(group);
    const dots = node('g', { class: 'fixed-world-places', 'aria-hidden': 'true' });
    filtered.forEach(place => {
      const [cx, cy] = project([place.coordinates[1], place.coordinates[0]]);
      dots.append(node('circle', { cx, cy, r: 2.7 }));
    });
    svg.append(dots);
    [[-140, -5, 'PACIFIC OCEAN'], [-32, 15, 'ATLANTIC OCEAN'], [80, -28, 'INDIAN OCEAN']].forEach(([lng, lat, name]) => {
      const [x, y] = project([lng, lat]);
      svg.append(node('text', { x, y, class: 'fixed-ocean-label', 'text-anchor': 'middle', 'aria-hidden': 'true' }, name));
    });
    heading.textContent = 'World map.';
    description.textContent = 'Choose a highlighted country to explore the places I’ve been.';
    listHeading.textContent = 'Countries & regions';
    countryButtons(countries);
    if (!countries.length) {
      const empty = document.createElement('p');
      empty.className = 'fixed-map-empty';
      empty.textContent = 'No mapped places match your search.';
      destinations.append(empty);
    }
    const journals = new Set(filtered.map(place => place.url)).size;
    summary.textContent = `${countries.length} countries & regions · ${filtered.length} places · ${journals} journal entries`;
  }
  // Separate adjacent city markers while keeping a small dot at each true location.
  function markerPositions(points, pinRadius) {
    const pending = new Set(points.map((_, index) => index));
    const result = points.map(point => [...point]);
    while (pending.size) {
      const group = [pending.values().next().value];
      pending.delete(group[0]);
      for (let index = 0; index < group.length; index++) {
        for (const other of pending) {
          if (Math.hypot(points[group[index]][0] - points[other][0], points[group[index]][1] - points[other][1]) < pinRadius * 2 + 12) {
            group.push(other);
            pending.delete(other);
          }
        }
      }
      if (group.length < 2) continue;
      const center = group.reduce((sum, index) => [sum[0] + points[index][0] / group.length, sum[1] + points[index][1] / group.length], [0, 0]);
      const radius = Math.max(pinRadius * 2 + 9, group.length * 13);
      group.forEach((index, order) => {
        const angle = -Math.PI / 2 + order * 2 * Math.PI / group.length;
        result[index] = [Math.max(pinRadius + 10, Math.min(width - pinRadius - 10, center[0] + Math.cos(angle) * radius)), Math.max(pinRadius + 10, Math.min(height - pinRadius - 10, center[1] + Math.sin(angle) * radius))];
      });
    }
    return result;
  }
  function loadCountryDetails(code) {
    if (countryDetails.has(code) || pendingDetails.has(code) || failedDetails.has(code)) return;
    const request = fetch(`${canvas.dataset.detailsUrl}/${encodeURIComponent(code)}.json`)
      .then(response => { if (!response.ok) throw new Error('Country detail unavailable'); return response.json(); })
      .then(detail => { countryDetails.set(code, detail); if (selected === code) render(); })
      .catch(() => { failedDetails.add(code); if (selected === code) render(); })
      .finally(() => pendingDetails.delete(code));
    pendingDetails.set(code, request);
  }
  function geographicBounds(feature) {
    let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
    polygons(feature).forEach(polygon => polygon[0].forEach(([x, y]) => {
      west = Math.min(west, x); east = Math.max(east, x);
      south = Math.min(south, y); north = Math.max(north, y);
    }));
    return [[west, south], [east, north]];
  }
  function inBounds(coordinates, bounds) {
    return coordinates[0] >= bounds[0][0] && coordinates[0] <= bounds[1][0]
      && coordinates[1] >= bounds[0][1] && coordinates[1] <= bounds[1][1];
  }
  function drawCountryLand(feature, detail, project, bounds) {
    const d = shape(feature, project, bounds);
    svg.append(node('path', { d, class: 'fixed-country-detail', 'fill-rule': 'evenodd', 'data-country': selected }));
    if (!detail) return;
    const defs = node('defs');
    const clip = node('clipPath', { id: 'country-detail-clip' });
    clip.append(node('path', { d, 'clip-rule': 'evenodd' }));
    defs.append(clip); svg.append(defs);
    const regions = node('g', { class: 'fixed-region-boundaries', 'clip-path': 'url(#country-detail-clip)', 'aria-hidden': 'true' });
    detail.regions.forEach(region => {
      const outline = shape(region, project, bounds);
      if (outline) regions.append(node('path', { d: outline, 'data-region': region.properties.name,
        class: `fixed-region-outline${region.properties.visited ? ' is-visited' : ''}`, 'fill-rule': 'evenodd' }));
    });
    svg.append(regions);
  }
  function drawMapLabels(detail, project, bounds, countryPlaces, positions, pinRadius) {
    if (!detail) return;
    const scale = width / canvas.clientWidth;
    const occupied = positions.map(([x, y]) => ({ x: x - pinRadius - 4, y: y - pinRadius - 4, width: pinRadius * 2 + 8, height: pinRadius * 2 + 8 }));
    const labels = node('g', { class: 'fixed-geographic-labels', 'aria-hidden': 'true' });
    function label(text, x, y, className, fontSize, offset = 7) {
      const textWidth = text.length * fontSize * .55 + 8;
      const textHeight = fontSize + 7;
      const candidates = [[x + offset, y - textHeight / 2], [x - offset - textWidth, y - textHeight / 2],
        [x - textWidth / 2, y - offset - textHeight], [x - textWidth / 2, y + offset],
        [x + offset, y - offset - textHeight], [x - offset - textWidth, y + offset]];
      for (const [left, top] of candidates) {
        const r = { x: left, y: top, width: textWidth, height: textHeight };
        if (left < 12 || top < 12 || left + textWidth > width - 12 || top + textHeight > height - 35) continue;
        if (occupied.some(other => r.x < other.x + other.width && r.x + r.width > other.x && r.y < other.y + other.height && r.y + r.height > other.y)) continue;
        occupied.push(r);
        labels.append(node('text', { x: left + 4, y: top + fontSize + 1, class: className, style: `font-size:${fontSize}px` }, text));
        return true;
      }
      return false;
    }
    countryPlaces.forEach((place, index) => {
      label(place.name.split(',')[0], positions[index][0], positions[index][1], 'fixed-visited-label', 12 * scale, pinRadius + 6);
    });
    const normalized = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
    const visitedNames = new Set(countryPlaces.map(place => normalized(place.name.split(',')[0])));
    let cityCount = 0;
    const cities = node('g', { class: 'fixed-city-points', 'aria-hidden': 'true' });
    for (const city of detail.cities) {
      if (cityCount >= (canvas.clientWidth < 500 ? 5 : 9)) break;
      if (!inBounds(city.coordinates, bounds) || visitedNames.has(normalized(city.name))) continue;
      const [x, y] = project(city.coordinates);
      if (label(city.name, x, y, city.capital ? 'fixed-city-label is-capital' : 'fixed-city-label', 11 * scale, 5 * scale)) {
        cities.append(node('circle', { cx: x, cy: y, r: (city.capital ? 2.7 : 1.8) * scale }));
        cityCount++;
      }
    }
    let regionCount = 0;
    const regions = [...detail.regions].sort((a, b) => Number(b.properties.visited) - Number(a.properties.visited));
    for (const region of regions) {
      if (regionCount >= (canvas.clientWidth < 500 ? 5 : 11)) break;
      const coordinates = region.properties.label;
      if (!inBounds(coordinates, bounds)) continue;
      const [x, y] = project(coordinates);
      if (label(region.properties.name, x, y, 'fixed-region-label', 10.5 * scale, 2 * scale)) regionCount++;
    }
    svg.insertBefore(cities, svg.querySelector('.fixed-country-pins'));
    svg.append(labels);
  }
  function drawInsets(detail) {
    if (!detail?.insets.length) return;
    const compact = width < 650;
    const insetWidth = compact ? 135 : 185;
    const insetHeight = compact ? 95 : 125;
    detail.insets.forEach((inset, index) => {
      const right = inset.position.includes('right');
      const top = inset.position.includes('top');
      const x = right ? width - insetWidth - 18 : 18 + index * (insetWidth + 10);
      const y = top ? 28 : height - insetHeight - 24;
      const frame = { x: x + 7, y: y + 23, width: insetWidth - 14, height: insetHeight - 29 };
      const project = projection(null, inset.bounds, frame, 2);
      const group = node('g', { class: 'fixed-map-inset', 'aria-hidden': 'true', 'data-inset': inset.name });
      const defs = node('defs');
      const clip = node('clipPath', { id: `country-inset-${index}` });
      clip.append(node('rect', { x: frame.x, y: frame.y, width: frame.width, height: frame.height }));
      defs.append(clip);
      group.append(defs, node('rect', { x, y, width: insetWidth, height: insetHeight, rx: 4 }));
      group.append(node('text', { x: x + 9, y: y + 16, style: `font-size:${Math.max(9, 9 * width / canvas.clientWidth)}px` }, inset.name));
      group.append(node('path', { d: shape(detail.country, project, inset.bounds), 'fill-rule': 'evenodd', 'clip-path': `url(#country-inset-${index})` }));
      svg.append(group);
    });
  }
  function drawScale(project, bounds, detail) {
    if (!detail) return;
    const latitude = (bounds[0][1] + bounds[1][1]) / 2 * Math.PI / 180;
    const unitsPerKm = project.scale / (6371 * Math.cos(latitude));
    const options = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    const distance = options.filter(km => km * unitsPerKm < 115).at(-1) || 1;
    const length = distance * unitsPerKm;
    const left = detail.insets.some(inset => inset.position === 'bottom-right');
    const x = left ? 24 : width - length - 24, y = height - 17;
    const group = node('g', { class: 'fixed-map-scale', 'aria-hidden': 'true' });
    group.append(node('path', { d: `M${x},${y - 5}v5h${length}v-5` }));
    group.append(node('text', { x: x + length / 2, y: y - 9, 'text-anchor': 'middle', style: `font-size:${Math.max(9, 9 * width / canvas.clientWidth)}px` }, `${distance} km`));
    svg.append(group);
  }

  function renderCountry() {
    const detail = countryDetails.get(selected);
    const feature = detail?.country || features.find(item => item.properties.code === selected);
    if (!feature) { selected = null; renderWorld(); return; }
    const countryPlaces = filtered.filter(place => place.country === selected);
    const bounds = detail ? detail.bounds : geographicBounds(feature);
    const project = projection(feature, bounds);
    drawCountryLand(feature, detail, project, bounds);
    if (!detail) {
      loadCountryDetails(selected);
      status.hidden = false;
      status.textContent = failedDetails.has(selected) ? 'Detailed geography could not load. The overview and journal links remain available.' : 'Loading the detailed country map…';
    } else {
      status.hidden = true;
    }
    canvas.dataset.resolution = detail ? 'detailed' : 'overview';
    viewNote.textContent = detail?.note || '';
    const points = countryPlaces.map(place => project([place.coordinates[1], place.coordinates[0]]));
    const pinRadius = Math.max(17, Math.min(65, 20 * width / canvas.clientWidth));
    const positions = markerPositions(points, pinRadius);
    const connectors = node('g', { class: 'fixed-pin-connectors', 'aria-hidden': 'true' });
    const pins = node('g', { class: 'fixed-country-pins' });
    countryPlaces.forEach((place, index) => {
      const [x, y] = positions[index];
      const [actualX, actualY] = points[index];
      if (Math.hypot(x - actualX, y - actualY) > 2) {
        connectors.append(node('line', { x1: actualX, y1: actualY, x2: x, y2: y }));
        connectors.append(node('circle', { cx: actualX, cy: actualY, r: 3 }));
      }
      const pin = node('a', { href: place.url, tabindex: '0', class: 'fixed-place-pin', 'data-place': place.name, 'aria-label': `Read ${place.title}: ${place.name}`, transform: `translate(${x},${y})` });
      pin.append(node('circle', { r: pinRadius }));
      pin.append(node('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'aria-hidden': 'true', style: `font-size:${pinRadius * .7}px` }, index + 1));
      attachTooltip(pin, place.name, place.title);
      pins.append(pin);

      const link = document.createElement('a');
      link.className = 'fixed-map-place-link';
      link.href = place.url;
      const number = document.createElement('span');
      number.className = 'fixed-map-place-number';
      number.textContent = String(index + 1).padStart(2, '0');
      const detail = document.createElement('span');
      const name = document.createElement('strong');
      const journal = document.createElement('small');
      name.textContent = place.name;
      journal.textContent = place.title;
      detail.append(name, journal);
      link.append(number, detail);
      ['pointerenter', 'focus'].forEach(type => link.addEventListener(type, () => pin.classList.add('is-active')));
      ['pointerleave', 'blur'].forEach(type => link.addEventListener(type, () => pin.classList.remove('is-active')));
      destinations.append(link);
    });
    svg.append(connectors, pins);
    drawMapLabels(detail, project, bounds, countryPlaces, positions, pinRadius);
    drawInsets(detail);
    drawScale(project, bounds, detail);
    const name = countryName(selected);
    heading.textContent = `${name}.`;
    description.textContent = 'Explore the regions and cities. Select a numbered place to open its journal.';
    listHeading.textContent = 'Visited places';
    const journals = new Set(countryPlaces.map(place => place.url)).size;
    summary.textContent = `${countryPlaces.length} ${countryPlaces.length === 1 ? 'place' : 'places'} · ${journals} ${journals === 1 ? 'journal entry' : 'journal entries'} in ${name}`;
  }
  function render() {
    canvas.dataset.view = selected || 'world';
    width = selected ? Math.max(320, height * canvas.clientWidth / canvas.clientHeight) : 1000;
    viewNote.hidden = !selected;
    if (!selected) { status.hidden = true; canvas.dataset.resolution = 'world'; }
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    hideTooltip();
    destinations.replaceChildren();
    svg.replaceChildren(node('title', { id: 'journal-map-svg-title' }, selected ? `Visited places in ${countryName(selected)}. Select a numbered place to open its journal.` : 'Visited countries. Select a highlighted country to explore its places.'));
    canvas.dataset.view = selected || 'world';
    canvas.setAttribute('aria-label', selected ? `Travel journal map of ${countryName(selected)}` : 'Travel journal world map');
    reset.disabled = !selected;
    if (selected) renderCountry(); else renderWorld();
  }
  search?.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    filtered = places.filter(place => `${place.title} ${place.name} ${countryName(place.country)} ${place.country}`.toLocaleLowerCase().includes(query));
    const countries = [...new Set(filtered.map(place => place.country))];
    selected = query && countries.length === 1 ? countries[0] : null;

    render();
  });
  reset.addEventListener('click', event => {
    const previous = selected;
    if (search?.value) {
      search.value = '';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
    selected = null;

    render();
    if (event.detail === 0) svg.querySelector(`[data-country="${previous}"]`)?.focus();
  });
  // The responsive SVG scales the fixed view without changing its selected country.
  render();
  let previousWidth = canvas.clientWidth;
  let previousHeight = canvas.clientHeight;
  new ResizeObserver(() => {
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    if (Math.abs(nextWidth - previousWidth) > 1 || Math.abs(nextHeight - previousHeight) > 1) {
      previousWidth = nextWidth;
      previousHeight = nextHeight;
      if (selected) render();
    }
  }).observe(canvas);
})();
