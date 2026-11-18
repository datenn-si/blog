/** The TOC floats once its home position is fully out of view, and starts returning just before it comes back. */
export function tocShouldBeFloating(homeBottom: number, floating: boolean) {
  if (floating) return homeBottom <= -24;
  return homeBottom <= 0;
}

/** The list becomes a scroll container only while floating and taller than the cap. */
export function tocShouldScroll(floating: boolean, listHeight: number, innerCap: number) {
  return floating && listHeight > innerCap + 1;
}

function initToc() {
  const shell = document.querySelector<HTMLDetailsElement>('.toc-shell');
  const prose = shell?.closest<HTMLElement>('.prose');
  const summary = shell?.querySelector<HTMLElement>('.toc-summary');
  const list = shell?.querySelector<HTMLElement>('.toc');
  if (!shell || !prose || !summary || !list) return;

  const placeholder = document.createElement('div');
  placeholder.className = 'toc-placeholder';
  placeholder.setAttribute('aria-hidden', 'true');
  placeholder.hidden = true;
  shell.parentNode?.insertBefore(placeholder, shell);

  let listHeight = 0;
  let openHeight = 0;
  let closedHeight = 0;
  let floating = false;
  let justReturned = false;
  let exitTimer: number | undefined;
  let idleTimer: number | undefined;
  let placeholderHeight = 0;

  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const capHeight = () => {
    const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    const viewport = window.visualViewport?.height ?? window.innerHeight;
    return Math.min(24 * root, viewport * 0.45);
  };

  const measureListHeight = () => {
    if (shell.open) {
      listHeight = list.scrollHeight;
      return;
    }
    const clone = list.cloneNode(true) as HTMLElement;
    clone.setAttribute('aria-hidden', 'true');
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.width = `${shell.clientWidth}px`;
    prose.appendChild(clone);
    listHeight = clone.scrollHeight;
    clone.remove();
  };

  const measure = () => {
    measureListHeight();
    const border = shell.offsetHeight - shell.clientHeight;
    closedHeight = summary.offsetHeight + border;
    openHeight = closedHeight + listHeight;
    prose.style.setProperty('--toc-list-height', `${listHeight}px`);
  };

  const applyState = () => {
    const border = shell.offsetHeight - shell.clientHeight;
    const innerCap = capHeight() - summary.offsetHeight - border;
    list.classList.toggle('is-scrollable', tocShouldScroll(floating, listHeight, innerCap));
    const stateHeight = shell.open ? openHeight : closedHeight;
    const shellHeight = floating ? Math.min(stateHeight, capHeight()) : stateHeight;
    prose.style.setProperty('--toc-shell-height', `${shellHeight}px`);
    prose.style.setProperty('--toc-sticky-height', `${floating ? shellHeight : closedHeight}px`);
  };

  const positionFloating = () => {
    const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    const rect = placeholder.getBoundingClientRect();
    shell.style.left = `${rect.left + root}px`;
    shell.style.width = `${rect.width - 2 * root}px`;
  };

  const schedulePlaceholderSync = () => {
    if (idleTimer !== undefined) window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      idleTimer = undefined;
      if (!floating || exitTimer !== undefined) return;
      if (placeholderHeight === openHeight) return;
      placeholderHeight = openHeight;
      placeholder.style.height = `${openHeight}px`;
    }, 120);
  };

  const enterFloating = (instant: boolean) => {
    if (floating) return;
    shell.classList.remove('toc-boot-pending');
    floating = true;
    placeholderHeight = shell.offsetHeight;
    const rect = shell.getBoundingClientRect();
    shell.style.left = `${rect.left}px`;
    shell.style.width = `${rect.width}px`;
    placeholder.style.height = `${placeholderHeight}px`;
    placeholder.hidden = false;
    shell.classList.add('is-floating');
    if (shell.open) shell.open = false;
    measure();
    applyState();
    schedulePlaceholderSync();
    if (instant || reduceMotion()) {
      shell.classList.add('is-shown');
    } else {
      requestAnimationFrame(() => {
        if (floating) shell.classList.add('is-shown');
      });
    }
  };

  const finishExit = () => {
    exitTimer = undefined;
    floating = false;
    justReturned = true;
    if (!shell.open) shell.open = true;
    applyState();
    shell.style.transition = 'none';
    shell.classList.remove('is-floating');
    shell.style.left = '';
    shell.style.width = '';
    placeholder.hidden = true;
    placeholder.style.height = '';
    applyState();
    const growth = openHeight - placeholderHeight;
    placeholderHeight = 0;
    if (growth !== 0) window.scrollBy(0, growth);
    requestAnimationFrame(() => {
      shell.style.transition = '';
    });
  };

  const exitFloating = () => {
    if (!floating || exitTimer !== undefined) return;
    if (idleTimer !== undefined) window.clearTimeout(idleTimer);
    idleTimer = undefined;
    shell.classList.remove('is-shown');
    if (reduceMotion()) {
      finishExit();
      return;
    }
    exitTimer = window.setTimeout(finishExit, 150);
  };

  const cancelExit = () => {
    if (exitTimer !== undefined) window.clearTimeout(exitTimer);
    exitTimer = undefined;
    shell.classList.add('is-shown');
  };

  const homeBottom = () => (floating ? placeholder : shell).getBoundingClientRect().bottom;

  const updateFloat = () => {
    const bottom = homeBottom();
    if (exitTimer !== undefined) {
      if (bottom >= -4) {
        window.clearTimeout(exitTimer);
        finishExit();
      } else if (bottom <= -48) {
        cancelExit();
      }
      return;
    }
    if (floating) {
      if (!tocShouldBeFloating(bottom, true)) exitFloating();
      else schedulePlaceholderSync();
      return;
    }
    if (bottom > 0 || bottom <= -300) justReturned = false;
    if (!justReturned && tocShouldBeFloating(bottom, false)) enterFloating(false);
  };

  measure();
  applyState();
  if (shell.dataset.bootFloat === '1') {
    delete shell.dataset.bootFloat;
    if (homeBottom() <= 0) enterFloating(true);
    else shell.classList.remove('toc-boot-pending');
  } else if (homeBottom() <= 0) {
    enterFloating(true);
  }

  shell.addEventListener('toggle', () => {
    measure();
    applyState();
  });

  list.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('a')) return;
    if (!shell.open) return;
    shell.open = false;
    measure();
    applyState();
  });

  window.addEventListener('scroll', updateFloat, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      measure();
      if (floating) positionFloating();
      applyState();
      updateFloat();
    },
    { passive: true },
  );
  document.fonts?.ready.then(() => {
    measure();
    applyState();
  });

  const hash = location.hash.slice(1);
  if (hash) {
    document.getElementById(decodeURIComponent(hash))?.scrollIntoView();
    updateFloat();
  }
}

if (typeof document !== 'undefined') initToc();
