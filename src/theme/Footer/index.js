import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useAlternatePageUtils} from '@docusaurus/theme-common/internal';
import LinkItem from '@theme/Footer/LinkItem';
import footerStrings from '@site/src/data/footerStrings';

// Mirrors the footer of the main website (SiteFooter component there): a brand
// column, link groups stacked in columns on desktop and folded into accordions
// on mobile, and a language selector next to the copyright.

// Desktop columns as indexes into the link groups of themeConfig.footer.links
// (the brand column excluded). The config order is the mobile accordion order.
const DESKTOP_COLUMNS = [[0, 2], [1, 3], [4], [5]];

// Same breakpoint as the mobile navbar and the footer styles in custom.css.
const MOBILE_QUERY = '(max-width: 996px)';

function Chevron({up}) {
  return (
    <svg
      className="footer__chevron"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d={up ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
    </svg>
  );
}

function Globe() {
  return (
    <svg
      className="footer__langGlobe"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// A titled list of links. The heading shows on desktop; on mobile the button
// takes its place and folds the list.
function Group({group, order}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={clsx('footer__group', open && 'footer__group--open')} style={{order}}>
      <h4 className="footer__groupTitle">{group.title}</h4>
      <button
        type="button"
        className="footer__groupHeader"
        aria-expanded={open}
        onClick={() => setOpen(!open)}>
        <span>{group.title}</span>
        <Chevron />
      </button>
      <div className="footer__groupLinks">
        {group.items.map((item, i) => (
          <LinkItem key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

// Upward popup on desktop, bottom sheet on mobile.
function LanguageSelector() {
  const {
    i18n: {currentLocale, locales, localeConfigs},
  } = useDocusaurusContext();
  const alternatePageUtils = useAlternatePageUtils();
  const {search, hash} = useLocation();
  // null, 'popup' or 'sheet'
  const [open, setOpen] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(null);
    const onClick = (event) => {
      if (open === 'popup' && !wrapperRef.current?.contains(event.target)) close();
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    if (open === 'sheet') document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (locales.length < 2) return null;

  const strings = footerStrings[currentLocale] ?? footerStrings.en;
  const currentLabel = localeConfigs[currentLocale].label;
  const items = locales.map((locale) => ({
    locale,
    label: localeConfigs[locale].label,
    lang: localeConfigs[locale].htmlLang,
    // preserve ?search#hash suffix on locale switches
    href: `${alternatePageUtils.createUrl({locale, fullyQualified: false})}${search}${hash}`,
  }));

  return (
    <>
      <div className="footer__langWrapper" ref={wrapperRef}>
        <button
          type="button"
          className="footer__langBtn"
          aria-expanded={open !== null}
          aria-label={`${strings.selectLanguage}: ${currentLabel}`}
          onClick={() => setOpen(window.matchMedia(MOBILE_QUERY).matches ? 'sheet' : 'popup')}>
          <Globe />
          <span>{currentLabel}</span>
          <Chevron up />
        </button>
        <div className={clsx('footer__langPopup', open === 'popup' && 'footer__langPopup--open')}>
          <div className="footer__langList">
            {items
              .filter((item) => item.locale !== currentLocale)
              .map((item) => (
                <a key={item.locale} className="footer__langOption" href={item.href} lang={item.lang}>
                  {item.label}
                </a>
              ))}
          </div>
          <button type="button" className="footer__langActiveRow" aria-expanded="true" onClick={() => setOpen(null)}>
            <Globe />
            <span>{currentLabel}</span>
            <Chevron />
          </button>
        </div>
      </div>
      <div
        className={clsx('footer__sheetBackdrop', open === 'sheet' && 'footer__sheetBackdrop--open')}
        onClick={() => setOpen(null)}
      />
      <div
        className={clsx('footer__sheet', open === 'sheet' && 'footer__sheet--open')}
        role="dialog"
        aria-modal="true"
        aria-label={strings.selectLanguage}>
        <div className="footer__sheetHandle" />
        <div className="footer__sheetHeader">
          <h3 className="footer__sheetTitle">{strings.selectLanguage}</h3>
          <button type="button" className="footer__sheetClose" aria-label="Close" onClick={() => setOpen(null)}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="footer__sheetList">
          {items.map((item) => (
            <a
              key={item.locale}
              className={clsx('footer__sheetOption', item.locale === currentLocale && 'footer__sheetOption--active')}
              href={item.href}
              lang={item.lang}>
              <span>{item.label}</span>
              {item.locale === currentLocale && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

function Footer() {
  const {footer} = useThemeConfig();
  if (!footer) {
    return null;
  }
  const {copyright, links = [], style} = footer;
  const [brand, ...groups] = links;
  // Groups the layout does not know about get a column of their own.
  const placed = new Set(DESKTOP_COLUMNS.flat());
  const columns = [
    ...DESKTOP_COLUMNS.map((column) => column.filter((i) => i < groups.length)),
    ...groups.map((_, i) => i).filter((i) => !placed.has(i)).map((i) => [i]),
  ].filter((column) => column.length > 0);

  return (
    <footer className={clsx('footer', {'footer--dark': style === 'dark'})}>
      <div className="container container-fluid">
        <div className="footer__main">
          {brand?.items[0]?.html && (
            <div
              className="footer__brandCol"
              // Developer provided the HTML, so assume it's safe.
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{__html: brand.items[0].html}}
            />
          )}
          {columns.map((column, i) => (
            <div key={i} className="footer__navCol">
              {column.map((index) => (
                <Group key={index} group={groups[index]} order={index + 1} />
              ))}
            </div>
          ))}
        </div>
        <div className="footer__bottom">
          {copyright && (
            <div
              className="footer__copyright"
              // Developer provided the HTML, so assume it's safe.
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{__html: copyright}}
            />
          )}
          <LanguageSelector />
        </div>
      </div>
    </footer>
  );
}

export default React.memo(Footer);
