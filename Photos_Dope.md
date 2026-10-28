---
layout: page
title: Through my lens
eyebrow: Photography
photography_handle: "@photos_dope"
description: A few frames from the places that made me pause.
wide: true
---
<div class="photo-grid">
{% assign photos = 'iceland.jpg|Iceland,iceland-coast.jpg|Along the Icelandic coast,horses.jpg|Horses in Iceland,horses-together.jpg|A quiet moment in Iceland,kyoto.jpg|Kyoto Japan,spaceport.jpg|Spaceport America' | split: ',' %}
{% for photo in photos %}{% assign parts = photo | split: '|' %}
<figure><a href="{{ '/Pictures/' | relative_url }}{% case forloop.index %}{% when 1 %}Iceland1.jpg{% when 2 %}Iceland2.jpg{% when 3 %}HorsesInIceland.jpg{% when 4 %}HorsesInIcelandKissing.jpg{% when 5 %}Kyoto.jpg{% when 6 %}spaceport.jpg{% endcase %}" aria-label="Enlarge photo: {{ parts[1] }}"><img src="{{ '/public/images/' | relative_url }}{{ parts[0] }}" alt="{{ parts[1] }}" loading="lazy" width="1200" height="800"></a><figcaption><span>{{ parts[1] }}</span><span>0{{ forloop.index }} <span class="link-arrow" aria-hidden="true">↗</span></span></figcaption></figure>
{% endfor %}
</div>
