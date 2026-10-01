const svg = (body, fill = false) =>
  `<svg viewBox="0 0 24 24" fill="${fill ? "currentColor" : "none"}" stroke="${fill ? "none" : "currentColor"}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  email: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>'),
  github: svg('<path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.4 6.8-5.2 6.8-9.7C22 6.6 17.5 2 12 2Z"/>', true),
  scholar: svg('<path d="M12 3 1.5 9 12 15l8.6-4.9V17h1.9V9L12 3Z"/><path d="M5.5 12.6v3.6C7 18 9.4 19 12 19s5-1 6.5-2.8v-3.6L12 16.4l-6.5-3.8Z"/>', true),
  orcid: svg('<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M8.6 9.9v7" stroke="#07080c" stroke-width="1.9"/><circle cx="8.6" cy="7.2" r="1.1" fill="#07080c" stroke="none"/><path d="M11.4 9.9v7h2.4a3.5 3.5 0 0 0 0-7h-2.4Z" stroke="#07080c" stroke-width="1.7"/>'),
  ads: svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/><circle cx="5" cy="4.5" r="1.6" fill="currentColor"/><path d="M3 9.5a9 9 0 0 1 3.5-5.8" opacity=".7"/>'),
  arrow: svg('<path d="M7 17 17 7M8 7h9v9"/>'),
  right: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  play: svg('<path d="M7 4.5v15l12.5-7.5L7 4.5Z"/>', true),
  pause: svg('<rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/>', true),
  chevron: svg('<path d="m6 9 6 6 6-6"/>'),
  grid: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/>'),
  rings: svg('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6.5" stroke-dasharray="2 2.5"/><circle cx="12" cy="12" r="10" stroke-dasharray="2 2.5"/>'),
  link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  doc: svg('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'),
  download: svg('<path d="M12 4v11M7 10.5 12 15.5l5-5M5 20h14"/>'),
  step: svg('<path d="M6 5v14M10 12l9-7v14z"/>'),
};
