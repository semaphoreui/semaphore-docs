import React, {useEffect, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import {translate} from '@docusaurus/Translate';
import {createPortal} from 'react-dom';

export default function Root({children}) {
  const {pathname} = useLocation();
  const [image, setImage] = useState(null);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    setImage(null);
    const selector = '.theme-doc-markdown img';
    const originals = new Map();
    const prepareImages = () => {
      document.querySelectorAll(selector).forEach((img) => {
        if (originals.has(img) || img.closest('a, button') || img.src.includes('img.shields.io/')) {
          return;
        }
        originals.set(img, {
          role: img.getAttribute('role'),
          tabindex: img.getAttribute('tabindex'),
          'aria-haspopup': img.getAttribute('aria-haspopup'),
        });
        img.classList.add('doc-image-viewer-trigger');
        img.setAttribute('role', 'button');
        img.setAttribute('tabindex', '0');
        img.setAttribute('aria-haspopup', 'dialog');
      });
    };
    const openImage = (event) => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || !originals.has(img)) return;
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      triggerRef.current = img;
      setImage({src: img.currentSrc || img.src, alt: img.alt});
    };
    prepareImages();
    const observer = new MutationObserver(prepareImages);
    observer.observe(document.body, {childList: true, subtree: true});
    document.addEventListener('click', openImage);
    document.addEventListener('keydown', openImage);
    return () => {
      observer.disconnect();
      document.removeEventListener('click', openImage);
      document.removeEventListener('keydown', openImage);
      originals.forEach((attributes, img) => {
        img.classList.remove('doc-image-viewer-trigger');
        Object.entries(attributes).forEach(([name, value]) => {
          if (value === null) img.removeAttribute(name);
          else img.setAttribute(name, value);
        });
      });
    };
  }, [pathname]);

  useEffect(() => {
    if (!image) return undefined;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (triggerRef.current?.isConnected) triggerRef.current.focus({preventScroll: true});
    };
  }, [image]);

  return (
    <>
      {children}
      {image && createPortal(
        <dialog
          ref={dialogRef}
          className="doc-image-viewer"
          aria-label={translate({id: 'imageViewer.title', message: 'Image preview'})}
          onCancel={() => setImage(null)}
          onClose={() => setImage(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setImage(null);
          }}>
          <button
            type="button"
            className="doc-image-viewer__close"
            aria-label={translate({id: 'imageViewer.close', message: 'Close image preview'})}
            onClick={() => setImage(null)}
            autoFocus>
            <span aria-hidden="true">×</span>
          </button>
          <img className="doc-image-viewer__image" src={image.src} alt={image.alt} />
        </dialog>,
        document.body,
      )}
    </>
  );
}
