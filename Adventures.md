---
layout: page
title: Adventures!
---

<p class="message">
  Welcome to my travel log! Combining both my passion for photography and adventuring, here are some of my experiences that I would like to share with the world.
</p>

<div class="adventures-list">
  {% for post in site.posts %}
  <div class="adventure-item">
    <h2 class="adventure-title">
      <a href="{{ post.url }}">{{ post.title }}</a>
    </h2>
    <span class="adventure-date">{{ post.date | date: "%B %d, %Y" }}</span>
  </div>
  {% endfor %}
</div>

<style>
.adventures-list {
  margin-top: 2rem;
}

.adventure-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid #e5e5e5;
}

.adventure-item:last-child {
  border-bottom: none;
}

.adventure-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.adventure-title a {
  color: #202020;
  text-decoration: none;
  transition: color 0.2s ease;
}

.adventure-title a:hover {
  color: #268bd2;
}

.adventure-date {
  color: #999;
  font-size: 0.875rem;
}
</style>




