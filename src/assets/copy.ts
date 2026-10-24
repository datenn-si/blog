const copyableElms = document.querySelectorAll('[data-copy]') as NodeListOf<HTMLElement>;
copyableElms.forEach((elm) => {
  elm.addEventListener('click', () => {
    const textToCopy = elm.textContent;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        if ('showingMessage' in elm.dataset) return;
        elm.dataset.showingMessage = '';
        const toast = document.createElement('div');
        toast.setAttribute(
          'class',
          'fixed w-max with-icon bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-gray-100 px-4 py-2 rounded shadow-lg transition-opacity duration-300 opacity-0',
        );
        toast.innerHTML = `<span class="icon-[mdi--check-circle-outline] text-base"></span>コピーしました`;
        if (!toast) return;
        document.body.appendChild(toast);
        toast.classList.remove('opacity-0');
        setTimeout(() => {
          toast.classList.add('opacity-0');
          setTimeout(() => {
            toast.remove();
            delete elm.dataset.showingMessage;
          }, 300);
        }, 2000);
      },
      (err) => {
        console.error('コピーに失敗しました:', err);
      },
    );
  });
});
