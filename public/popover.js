if (!CSS.supports('anchor-name:--a')) {
  document
    .querySelectorAll('div[id^="popover"]:not([data-initialized])')
    .forEach(function (e) {
      e.dataset.initialized = 'true';
      var id = e.id.replace('popover', '');
      var btn = document.querySelector('#popover' + id + 'Button');
      var wrap = e.parentElement;
      if (
        e instanceof HTMLDivElement &&
        btn instanceof HTMLButtonElement &&
        wrap
      ) {
        var pos = e.dataset.position || 'bottom';
        var update = function () {
          var r = wrap.getBoundingClientRect();
          var left = r.left + scrollX - 8;
          if (pos === 'top') {
            requestAnimationFrame(function () {
              var h = e.offsetHeight;
              e.style.top = r.top + scrollY - h - 8 + 'px';
              e.style.bottom = 'auto';
            });
          } else {
            e.style.top = r.top + r.height + scrollY + 8 + 'px';
          }
          e.style.left = left + 'px';
        };
        btn.addEventListener('click', update);
        addEventListener('resize', update);
        addEventListener('scroll', update, { passive: true });
      }
    });
}
