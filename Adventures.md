---
layout: page
title: The journal
eyebrow: Notes from elsewhere
description: Places I’ve been, things I’ve learned, and a few moments worth keeping.
wide: true
journal_map: true
---
<section class="journal-map-card fixed-journal-map" aria-labelledby="journal-map-heading" hidden>
  <div class="journal-map-header">
    <div><span class="eyebrow">The journey, mapped</span><h2 id="journal-map-heading">World map<span class="brand-dot">.</span></h2><p id="journal-map-description">Choose a highlighted country to explore the places I’ve been.</p></div>
    <button id="journal-map-reset" type="button" disabled><span aria-hidden="true">←</span> World map</button>
  </div>
  <p id="journal-map-view-note" class="fixed-map-view-note" hidden></p>
  <div class="fixed-map-layout" id="journal-map-layout">
    <div id="journal-map" class="fixed-map-canvas" data-countries-url="{{ '/public/data/countries.geojson' | relative_url }}" data-details-url="{{ '/public/data/countries' | relative_url }}" role="region" aria-label="Travel journal world map">
      <svg id="journal-map-svg" viewBox="0 0 1000 560" aria-labelledby="journal-map-svg-title"><title id="journal-map-svg-title">Visited countries. Select a highlighted country to explore its places.</title></svg>
      <div id="journal-map-tooltip" class="fixed-map-tooltip" role="tooltip" hidden></div>
    </div>
    <aside class="fixed-map-sidebar" aria-labelledby="journal-map-list-heading"><span class="eyebrow" id="journal-map-list-heading">Countries &amp; regions</span><div id="journal-map-destinations"></div></aside>
  </div>
  <div class="journal-map-footer"><span id="journal-map-summary" aria-live="polite"></span><a href="https://www.naturalearthdata.com/" class="fixed-map-credit">Map data: Natural Earth</a></div>
  <p id="journal-map-status" class="journal-map-status" role="status">Loading the world map…</p>
</section>
<script id="journal-map-data" type="application/json">
[{% assign mapped_first = true %}{% for post in site.posts %}{% assign mapped = site.data.journal_locations | where: 'post', post.path | first %}{% if mapped %}{% unless mapped_first %},{% endunless %}{"title":{{ post.title | jsonify }},"url":{{ post.url | relative_url | jsonify }},"country":{{ mapped.country | jsonify }},"countryName":{{ mapped.country_name | jsonify }},"places":{{ mapped.places | jsonify }}}{% assign mapped_first = false %}{% endif %}{% endfor %}]
</script>

<div class="journal-toolbar"><span>{{ site.posts | size }} entries & counting</span><label for="journal-search">Find an entry <input id="journal-search" type="search" placeholder="Search the journal…" autocomplete="off"></label></div>
<div class="entry-list">
{% for post in site.posts %}
{% assign mapped = site.data.journal_locations | where: 'post', post.path | first %}
<a class="entry-row" href="{{ post.url | relative_url }}" data-entry="{{ post.title | downcase | escape }} {{ mapped.country_name | downcase | escape }} {{ mapped.country | downcase | escape }}{% for place in mapped.places %} {{ place.name | downcase | escape }}{% endfor %}"><span class="entry-number">{% if forloop.index < 10 %}0{% endif %}{{ forloop.index }}</span><h2>{{ post.title }}</h2><time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: '%b %Y' }}</time><span aria-hidden="true">↗</span></a>
{% endfor %}
</div>
<p id="no-entries" role="status" hidden>No entries found. Try another place or topic.</p>
