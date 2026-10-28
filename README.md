# Aditya Anikode’s website

A personal portfolio, travel journal, and photography collection built with Jekyll and hosted on GitHub Pages at https://me.adityaanikode.com.

## Run locally

With Ruby and Bundler installed:

```sh
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000. Run `bundle exec jekyll build` for a production build in `_site/`.

## Edit content

- `index.html`: homepage.
- `Projects.md`: engineering projects; preserve section IDs used by homepage links.
- `Adventures.md`: searchable journal index, generated from `_posts/`.
- `_posts/YYYY-MM-DD-title.md`: journal entries with `layout: post` and a title in YAML front matter. Empty files without front matter are not published.
- `Photos_Dope.md`: photography gallery, linking to full resolution originals.
- `about.md`: biography and résumé link.
- `_layouts/` and `_includes/`: shared page structure, navigation, and metadata.
- `public/css/site.css`: responsive design, typography, and reduced-motion support.
- `public/js/site.js`: journal search; the complete index also works without JavaScript.
- `public/images/`: smaller display copies of photographs. Original images remain in `Pictures/`.

Existing page and post URLs and the `CNAME` domain are retained. GitHub Pages builds the Jekyll source when published through the repository’s configured deployment workflow. Local edits alone do not publish the site.
