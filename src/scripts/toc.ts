/** Sentinel is above the sticky line while the TOC is pinned. 1px keeps the edge from flickering. */
export function tocShouldStick(sentinelTop: number, stickyTop: number, currentlyStuck: boolean) {
  if (currentlyStuck) return sentinelTop <= stickyTop + 1;
  return sentinelTop <= stickyTop;
}

/** The list becomes a scroll container only while pinned and taller than the cap. */
export function tocShouldScroll(stuck: boolean, listHeight: number, innerCap: number) {
  return stuck && listHeight > innerCap + 1;
}

function initToc() {
  const shell = document.querySelector<HTMLDetailsElement>('.toc-shell');
  const prose = shell?.closest<HTMLElement>('.prose');
  const summary = shell?.querySelector<HTMLElement>('.toc-summary');
  const list = shell?.querySelector<HTMLElement>('.toc');
  if (!shell || !prose || !summary || !list) return;

  const sentinel = document.createElement('div');
  sentinel.className = 'toc-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.parentNode?.insertBefore(sentinel, shell);

  const spacer = document.createElement('div');
  spacer.className = 'toc-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  shell.parentNode?.insertBefore(spacer, shell.nextSibling);
  const next = spacer.nextElementSibling;
  const baseMargin = Number.parseFloat(getComputedStyle(shell).marginBottom) || 0;
  const nextMargin = next ? Number.parseFloat(getComputedStyle(next).marginTop) || 0 : 0;
  prose.style.setProperty('--toc-rest-spacer', `${Math.max(0, baseMargin - nextMargin)}px`);
  shell.style.marginBottom = '0';

  let listHeight = 0;

  const capHeight = () => {
    const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    const viewport = window.visualViewport?.height ?? window.innerHeight;
    return Math.min(24 * root, viewport * 0.45);
  };

  const measure = () => {
    if (shell.open) listHeight = list.scrollHeight;
    const border = shell.offsetHeight - shell.clientHeight;
    const full = shell.open
      ? summary.offsetHeight + listHeight + border
      : summary.offsetHeight + border;
    prose.style.setProperty('--toc-full-height', `${full}px`);
    prose.style.setProperty('--toc-list-height', `${listHeight}px`);
    prose.style.setProperty('--toc-sticky-height', `${Math.min(full, capHeight())}px`);
  };

  const updateStuck = () => {
    const stickyTop = Number.parseFloat(getComputedStyle(shell).top);
    const stuck = tocShouldStick(
      sentinel.getBoundingClientRect().top,
      stickyTop,
      shell.classList.contains('is-stuck'),
    );
    shell.classList.toggle('is-stuck', stuck);
    const border = shell.offsetHeight - shell.clientHeight;
    const innerCap = capHeight() - summary.offsetHeight - border;
    list.classList.toggle('is-scrollable', tocShouldScroll(stuck, listHeight, innerCap));
  };

  measure();
  updateStuck();

  shell.addEventListener('toggle', () => {
    shell.style.transition = 'none';
    list.style.transition = 'none';
    spacer.style.transition = 'none';
    measure();
    updateStuck();
    requestAnimationFrame(() => {
      shell.style.transition = '';
      list.style.transition = '';
      spacer.style.transition = '';
    });
  });

  window.addEventListener('scroll', updateStuck, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      measure();
      updateStuck();
    },
    { passive: true },
  );
  document.fonts?.ready.then(() => {
    measure();
    updateStuck();
  });

  const hash = location.hash.slice(1);
  if (hash) {
    document.getElementById(decodeURIComponent(hash))?.scrollIntoView();
    updateStuck();
  }
}

if (typeof document !== 'undefined') initToc();
