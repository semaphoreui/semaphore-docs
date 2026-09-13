import React from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import {editionLabels, getFeature} from '@site/src/data/editions';
import styles from './styles.module.css';

/**
 * Edition badge.
 *
 * Usage in any .md/.mdx page (registered globally, no import needed):
 *
 *   ## Workflows <Pro />
 *   ## High availability <Enterprise />
 *   ## Custom roles <FeatureState feature="extended-rbac" />
 *   ## Something new <FeatureState edition="pro" since="2.16" />
 *
 * Prefer the `feature` form: it reads the edition and the version from
 * src/data/editions.js, so the marker cannot drift from the registry.
 */
export default function FeatureState({feature, edition, since}) {
  const entry = feature ? getFeature(feature) : undefined;

  if (feature && !entry) {
    throw new Error(
      `<FeatureState feature="${feature}" /> refers to an unknown feature. ` +
        'Add it to src/data/editions.js or fix the key.',
    );
  }

  const resolvedEdition = entry?.edition ?? edition;
  const resolvedSince = since ?? entry?.since;

  if (!resolvedEdition) {
    throw new Error(
      '<FeatureState /> needs either a `feature` key or an `edition` prop.',
    );
  }

  const label = editionLabels[resolvedEdition];

  if (!label) {
    throw new Error(
      `<FeatureState edition="${resolvedEdition}" /> is not a known edition. ` +
        'Use community, pro, or enterprise.',
    );
  }

  const title = resolvedSince
    ? `Requires Semaphore ${label}, available since ${resolvedSince}`
    : `Requires Semaphore ${label}`;

  return (
    <Link
      to="/editions"
      className={`${styles.badge} ${styles[resolvedEdition]}`}
      title={title}>
      {label}
      {resolvedSince && (
        <span className={styles.since}>
          <Translate
            id="theme.featureState.since"
            description="Version suffix on an edition badge"
            values={{version: resolvedSince}}>
            {'since {version}'}
          </Translate>
        </span>
      )}
    </Link>
  );
}

export function Pro(props) {
  return <FeatureState edition="pro" {...props} />;
}

export function Enterprise(props) {
  return <FeatureState edition="enterprise" {...props} />;
}
