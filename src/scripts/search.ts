import type { PagefindModal } from '@pagefind/component-ui';

const mobileSearchMenu = window.matchMedia('(max-width: 640px)');

function resetMenuLayout(menu: HTMLElement): void {
  menu.style.left = '';
  menu.style.width = '';
  menu.style.minWidth = '';
  menu.style.maxWidth = '';
  menu.style.transform = '';
}

// Pagefind sizes the menu to the viewport and centers it on the trigger.
function placeMobileMenu(menu: HTMLElement, dialog: HTMLElement): void {
  resetMenuLayout(menu);
  if (!mobileSearchMenu.matches) return;

  const body = dialog.querySelector('pagefind-modal-body');
  const bodyStyle = body ? getComputedStyle(body) : null;
  const padLeft = bodyStyle ? parseFloat(bodyStyle.paddingLeft) : 16;
  const padRight = bodyStyle ? parseFloat(bodyStyle.paddingRight) : 16;
  const bounds = dialog.getBoundingClientRect();
  const limitLeft = bounds.left + padLeft;
  const limitRight = bounds.right - padRight;
  const available = Math.max(0, limitRight - limitLeft);

  menu.style.transform = 'none';
  menu.style.left = '0px';
  menu.style.width = 'max-content';
  menu.style.minWidth = `${Math.min(180, available)}px`;
  menu.style.maxWidth = `${available}px`;

  const box = menu.getBoundingClientRect();
  let shift = 0;
  if (box.left < limitLeft) shift = limitLeft - box.left;
  else if (box.right > limitRight) shift = limitRight - box.right;
  if (shift !== 0) menu.style.left = `${shift}px`;
}

function fitSearchMenu(modal: HTMLElement): void {
  const dialog = modal.querySelector<HTMLDialogElement>('dialog');
  if (!dialog) return;
  const menus = dialog.querySelectorAll<HTMLElement>('.pf-dropdown-menu');
  const menu = dialog.querySelector<HTMLElement>('.pf-dropdown-menu:not([hidden])');
  dialog.style.minHeight = '';
  for (const item of menus) resetMenuLayout(item);
  if (!menu) return;
  placeMobileMenu(menu, dialog);

  const menuBottom = menu.getBoundingClientRect().bottom;
  const footer = dialog.querySelector<HTMLElement>('pagefind-modal-footer');
  const footerVisible = !!footer && getComputedStyle(footer).display !== 'none';
  const limit = footerVisible
    ? footer.getBoundingClientRect().top
    : dialog.getBoundingClientRect().bottom;
  const overflow = menuBottom - limit + 8;
  if (overflow <= 0) return;

  const next = dialog.getBoundingClientRect().height + overflow;
  dialog.style.minHeight = `${Math.min(next, window.innerHeight * 0.8)}px`;
}

export function initSearch(): void {
  const button = document.querySelector<HTMLButtonElement>('#search-button');
  const modal = document.querySelector<PagefindModal>('pagefind-modal');
  if (!button || !modal) return;

  const dialog = modal.querySelector('dialog');
  if (dialog?.id) button.setAttribute('aria-controls', dialog.id);

  button.addEventListener('click', () => {
    modal.open();
  });
  dialog?.addEventListener('close', () => {
    button.focus();
  });

  let frame = 0;
  const scheduleFit = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => fitSearchMenu(modal));
  };
  modal.addEventListener('click', scheduleFit);
  mobileSearchMenu.addEventListener('change', scheduleFit);
  new MutationObserver(scheduleFit).observe(modal, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['hidden', 'class'],
  });
}
