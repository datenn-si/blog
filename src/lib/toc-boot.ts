// Runs before first paint. When the page loads with the toc already scrolled
// fully out of view (for example a restored scroll position), the shell is
// hidden until the toc module takes over and floats it, so the open toc at
// its home position never flashes. Keep its sha256 in public/_headers.
export const tocBootScript = `(()=>{try{var o=new MutationObserver(()=>{var s=document.querySelector(".toc-shell");if(!s)return;o.disconnect();if(s.getBoundingClientRect().bottom<=0){s.classList.add("toc-boot-pending");s.dataset.bootFloat="1";}});o.observe(document.documentElement,{childList:true,subtree:true});addEventListener("DOMContentLoaded",()=>o.disconnect(),{once:true});}catch{}})();`;
