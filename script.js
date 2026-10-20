const mediaInput = document.getElementById('mediaUrl');
const loadButton = document.getElementById('loadButton');
const clearButton = document.getElementById('clearButton');
const mediaContainer = document.getElementById('mediaContainer');
const statusEl = document.getElementById('status');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#fda4af' : '#a5b4fc';
}

function normalizeUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getFileName(url) {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.split('/').filter(Boolean).pop() || '';
    return pathname.toLowerCase();
  } catch {
    return '';
  }
}

function isYouTubeUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '').toLowerCase();
    return host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com';
  } catch {
    return false;
  }
}

function isVimeoUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '').toLowerCase();
    return host === 'vimeo.com';
  } catch {
    return false;
  }
}

function getYouTubeEmbedUrl(url) {
  try {
    const parsed = new URL(url);
    const videoId = parsed.searchParams.get('v');
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;

    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length && pathParts[0] !== 'shorts') {
      return `https://www.youtube.com/embed/${pathParts[0]}`;
    }
  } catch {
    return '';
  }

  return '';
}

function getVimeoEmbedUrl(url) {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const videoId = pathParts[0] || '';
    if (videoId) return `https://player.vimeo.com/video/${videoId}`;
  } catch {
    return '';
  }

  return '';
}

function detectMediaType(url) {
  const fileName = getFileName(url);

  if (isYouTubeUrl(url)) {
    return 'youtube';
  }

  if (isVimeoUrl(url)) {
    return 'vimeo';
  }

  if (/(?:mp4|m4v|webm|ogg|ogv|mov|mkv|avi)$/i.test(fileName)) {
    return 'video';
  }

  if (/(?:mp3|wav|flac|aac|m4a|oga|ogg)$/i.test(fileName)) {
    return 'audio';
  }

  if (/(?:png|jpe?g|gif|webp|svg|bmp|avif|ico)$/i.test(fileName)) {
    return 'image';
  }

  if (/(?:pdf|html?|aspx|php|jsp|xml|txt)$/i.test(fileName)) {
    return 'embed';
  }

  return 'embed';
}

function createPlayer(url, type) {
  mediaContainer.innerHTML = '';
  mediaContainer.classList.remove('empty');

  if (type === 'video') {
    const video = document.createElement('video');
    video.className = 'media video';
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    mediaContainer.appendChild(video);
    return;
  }

  if (type === 'audio') {
    const audio = document.createElement('audio');
    audio.className = 'media audio';
    audio.src = url;
    audio.controls = true;
    audio.autoplay = true;
    audio.preload = 'auto';
    mediaContainer.appendChild(audio);
    return;
  }

  if (type === 'image') {
    const img = document.createElement('img');
    img.className = 'media image';
    img.src = url;
    img.alt = 'Loaded media';
    mediaContainer.appendChild(img);
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.title = 'Embedded media';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'autoplay; fullscreen; picture-in-picture';
  iframe.src = url;
  mediaContainer.appendChild(iframe);
}

function loadMedia() {
  const raw = mediaInput.value;
  const normalized = normalizeUrl(raw);

  if (!normalized) {
    mediaContainer.innerHTML = '<div class="placeholder"><p>Please enter a link.</p></div>';
    mediaContainer.classList.add('empty');
    setStatus('No URL entered.', true);
    return;
  }

  let finalUrl = normalized;
  const type = detectMediaType(finalUrl);

  if (type === 'youtube') {
    finalUrl = getYouTubeEmbedUrl(finalUrl) || finalUrl;
  }

  if (type === 'vimeo') {
    finalUrl = getVimeoEmbedUrl(finalUrl) || finalUrl;
  }

  try {
    new URL(finalUrl);
  } catch {
    setStatus('That is not a valid URL.', true);
    return;
  }

  createPlayer(finalUrl, type);
  setStatus(`Loaded: ${type.toUpperCase()} preview`);
}

loadButton.addEventListener('click', loadMedia);
clearButton.addEventListener('click', () => {
  mediaInput.value = '';
  mediaContainer.innerHTML = '<div class="placeholder"><p>Paste a media URL and press Load media.</p></div>';
  mediaContainer.classList.add('empty');
  setStatus('Ready to play a media link.');
});

mediaInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loadMedia();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  loadMedia();
});

