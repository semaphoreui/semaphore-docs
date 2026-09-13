import React from 'react';
import Link from '@docusaurus/Link';
import {features, editionLabels} from '@site/src/data/editions';

/**
 * Renders the feature registry from src/data/editions.js as a table.
 * The Editions page uses it, so the page can never disagree with the badges.
 */
export default function EditionsTable() {
  const order = {pro: 0, enterprise: 1, community: 2};
  const rows = [...features].sort(
    (a, b) => order[a.edition] - order[b.edition] || a.name.localeCompare(b.name),
  );

  return (
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Minimum edition</th>
          <th>Since</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((f) => (
          <tr key={f.key}>
            <td>{f.doc ? <Link to={f.doc}>{f.name}</Link> : f.name}</td>
            <td>{editionLabels[f.edition]}</td>
            <td>{f.since ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
