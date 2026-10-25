import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

const article = document.querySelector<HTMLElement>('.prose');
let openingPointerType = 'mouse';

function openImage(image: HTMLImageElement, pointerType: string) {
  if (!image.currentSrc || !image.naturalWidth || !image.naturalHeight) return;

  const lightbox = new PhotoSwipe({
    dataSource: [
      {
        src: image.currentSrc,
        msrc: image.currentSrc,
        element: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        alt: image.alt,
      },
    ],
    index: 0,
    arrowPrev: false,
    arrowNext: false,
    loop: false,
    counter: false,
    showHideAnimationType: 'zoom',
    closeTitle: 'Close (Esc)',
    zoomTitle: 'Zoom in/out',
    bgOpacity: 1,
    maxWidthToAnimate: 8000,
    returnFocus: false,
  });

  lightbox.on('destroy', () => image.focus({ preventScroll: true }));

  const setInputMode = (currentPointerType: string) => {
    lightbox.element?.classList.toggle('pswp--touch-input', currentPointerType === 'touch');
  };

  lightbox.on('uiRegister', () => {
    if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) return;

    lightbox.ui?.registerElement({
      name: 'fullscreen',
      order: 19,
      isButton: true,
      title: 'Toggle fullscreen',
      html: {
        isCustomSVG: true,
        size: 32,
        inner:
          '<path class="pswp__fullscreen-icon-enter" id="pswp__icn-fullscreen" transform="translate(4 4)" d="M5 5h5v2H7v3H5zm9 0h5v5h-2V7h-3zm3 9h2v5h-5v-2h3zm-7 3v2H5v-5h2v3z"/><path class="pswp__fullscreen-icon-exit" id="pswp__icn-fullscreen-exit" transform="translate(4 4)" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>',
        outlineID: 'pswp__icn-fullscreen',
      },
      onInit: (element, pswp) => {
        const outline = element.querySelector<SVGUseElement>('.pswp__icn-shadow');
        const updateState = () => {
          const isFullscreen = document.fullscreenElement === pswp.element;
          const outlineHref = isFullscreen ? '#pswp__icn-fullscreen-exit' : '#pswp__icn-fullscreen';

          element.setAttribute('aria-pressed', String(isFullscreen));
          outline?.setAttribute('href', outlineHref);
          outline?.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', outlineHref);
        };

        document.addEventListener('fullscreenchange', updateState);
        pswp.on('destroy', () => document.removeEventListener('fullscreenchange', updateState));
        updateState();
      },
      onClick: (_event, _element, pswp) => {
        if (document.fullscreenElement === pswp.element) {
          void document.exitFullscreen();
        } else if (pswp.element?.requestFullscreen) {
          void pswp.element.requestFullscreen();
        }
      },
    });
  });

  lightbox.on('afterInit', () => setInputMode(pointerType));
  lightbox.on('pointerDown', ({ originalEvent }) => setInputMode(originalEvent.pointerType));
  lightbox.on('pointerMove', ({ originalEvent }) => setInputMode(originalEvent.pointerType));
  lightbox.init();
}

article?.addEventListener('pointerdown', (event) => {
  openingPointerType = event.pointerType;
});

article?.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
  if (image.closest('a')) return;

  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', image.alt ? `${image.alt}を拡大表示` : '画像を拡大表示');
});

article?.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLImageElement) || event.target.closest('a')) return;

  event.preventDefault();
  openImage(event.target, openingPointerType);
});

article?.addEventListener('keydown', (event) => {
  if (
    !(event.target instanceof HTMLImageElement) ||
    event.target.closest('a') ||
    (event.key !== 'Enter' && event.key !== ' ')
  ) {
    return;
  }

  event.preventDefault();
  openImage(event.target, 'mouse');
});
