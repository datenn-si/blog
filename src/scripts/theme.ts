import { isDarkTheme, themeMode, themeStorageKey, type ThemeMode } from '@/lib/theme-boot';

export function initTheme(): void {
  const root = document.querySelector<HTMLElement>('.theme')!;
  const button = root.querySelector<HTMLButtonElement>('.theme-button')!;
  const menu = root.querySelector<HTMLElement>('.theme-menu')!;
  const backdrop = root.querySelector<HTMLElement>('.theme-backdrop')!;
  if (!root || !button || !menu || !backdrop) return;

  const options = [...menu.querySelectorAll<HTMLButtonElement>('[data-theme-value]')];
  const media = matchMedia('(prefers-color-scheme: dark)');

  function storedTheme(): string | null {
    try {
      return localStorage.getItem(themeStorageKey);
    } catch {
      return null;
    }
  }

  function apply(mode: ThemeMode, persist: boolean): void {
    document.documentElement.dataset.theme = mode;
    document.documentElement.classList.toggle('dark', isDarkTheme(mode, media.matches));
    for (const option of options) {
      option.setAttribute('aria-checked', String(option.dataset.themeValue === mode));
    }
    if (!persist) return;
    try {
      localStorage.setItem(themeStorageKey, mode);
    } catch {
      // Storage can be blocked. The choice still applies on this page.
    }
  }

  function open(): void {
    menu.hidden = false;
    backdrop.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    options.find((option) => option.getAttribute('aria-checked') === 'true')?.focus();
  }

  function close(restoreFocus: boolean): void {
    menu.hidden = true;
    backdrop.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (restoreFocus) button.focus();
  }

  button.addEventListener('click', () => {
    if (menu.hidden) open();
    else close(false);
  });
  backdrop.addEventListener('click', () => close(true));

  for (const option of options) {
    option.addEventListener('click', () => {
      apply(themeMode(option.dataset.themeValue ?? null), true);
      close(true);
    });
  }

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape' || menu.hidden) return;
      event.preventDefault();
      event.stopPropagation();
      close(true);
    },
    true,
  );

  media.addEventListener('change', () => {
    if (document.documentElement.dataset.theme === 'auto') apply('auto', false);
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== themeStorageKey) return;
    apply(themeMode(event.newValue), false);
  });

  apply(themeMode(document.documentElement.dataset.theme ?? storedTheme()), false);
}
