const giscusOrigin = 'https://giscus.app';

const giscusConfig: Record<string, string> = {
  src: `${giscusOrigin}/client.js`,
  'data-repo': 'datenn-si/posts',
  'data-repo-id': 'R_kgDOVVXMxA',
  'data-category': 'Announcements',
  'data-category-id': 'DIC_kwDOVVXMxM4DJgXP',
  'data-mapping': 'pathname',
  'data-strict': '1',
  'data-reactions-enabled': '1',
  'data-emit-metadata': '0',
  'data-input-position': 'top',
  'data-lang': 'ja',
  'data-loading': 'lazy',
  crossorigin: 'anonymous',
  async: '',
};

export function giscusTheme(isDark: boolean): 'light' | 'dark' {
  return isDark ? 'dark' : 'light';
}

export function sendGiscusTheme(iframe: HTMLIFrameElement | null, theme: string): boolean {
  if (!iframe?.contentWindow) return false;
  try {
    // about:blank while loading="lazy" is still same-origin. The widget is cross-origin.
    if (iframe.contentDocument) return false;
  } catch {
    // Cross-origin access means the widget document is loaded.
  }
  try {
    iframe.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, giscusOrigin);
  } catch {
    // postMessage throws while the lazy frame has not navigated to giscus.app.
    return false;
  }
  return true;
}

export function initComments(root: ParentNode = document): void {
  const host = root.querySelector<HTMLElement>('#giscus-comments');
  if (!host || host.querySelector('script')) return;

  let ready = false;
  let synced: string | null = null;
  const sync = () => {
    // The widget ignores setConfig until it has posted once. Sending earlier is lost.
    if (!ready) return;
    const theme = giscusTheme(document.documentElement.classList.contains('dark'));
    if (synced === theme) return;
    const iframe = host.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (sendGiscusTheme(iframe, theme)) synced = theme;
  };

  const script = document.createElement('script');
  for (const [key, value] of Object.entries(giscusConfig)) script.setAttribute(key, value);
  script.async = true;
  script.setAttribute(
    'data-theme',
    giscusTheme(document.documentElement.classList.contains('dark')),
  );
  host.appendChild(script);

  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  window.addEventListener('message', (event) => {
    if (event.origin !== giscusOrigin) return;
    const data: unknown = event.data;
    if (!(typeof data === 'object' && data && 'giscus' in data)) return;
    ready = true;
    sync();
  });
}
