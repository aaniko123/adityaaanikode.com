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
{% assign country_names = site.data.journal_locations | map: 'country_name' | uniq | sort %}
{% assign group_names = country_names | join: '|' | append: '|Notes & reflections' | split: '|' %}
<div class="journal-groups">
{% for country in group_names %}
{% assign entry_count = 0 %}
{% capture country_entries %}
{% for post in site.posts %}
{% assign mapped = site.data.journal_locations | where: 'post', post.path | first %}
{% assign entry_country = mapped.country_name | default: 'Notes & reflections' %}
{% if entry_country == country %}
{% assign entry_count = entry_count | plus: 1 %}
<a class="entry-row" href="{{ post.url | relative_url }}" data-entry="{{ post.title | downcase | escape }} {{ entry_country | downcase | escape }} {{ mapped.country | downcase | escape }}{% for place in mapped.places %} {{ place.name | downcase | escape }}{% endfor %}"><span class="entry-number">{% if entry_count < 10 %}0{% endif %}{{ entry_count }}</span><h3>{{ post.title }}</h3><time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: '%b %Y' }}</time><span aria-hidden="true" class="link-arrow">↗</span></a>
{% endif %}
{% endfor %}
{% endcapture %}
{% if entry_count > 0 %}
<section class="journal-country" aria-labelledby="journal-country-{{ forloop.index }}" data-journal-group>
  <div class="journal-country-heading"><h2 id="journal-country-{{ forloop.index }}">{{ country }}</h2><span>{{ entry_count }} {% if entry_count == 1 %}entry{% else %}entries{% endif %}</span></div>
  <div class="entry-list">{{ country_entries }}</div>
</section>
{% endif %}
{% endfor %}
</div>
<p id="no-entries" role="status" hidden>No entries found. Try another place or topic.</p>
