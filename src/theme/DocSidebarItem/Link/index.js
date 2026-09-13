import React from 'react';
import DocSidebarItemLink from '@theme-original/DocSidebarItem/Link';
import FeatureState from '@site/src/components/FeatureState';
import styles from './styles.module.css';

export default function DocSidebarItemLinkWithEdition(props) {
  const {item} = props;
  const edition = item.customProps?.edition;

  if (!edition) {
    return <DocSidebarItemLink {...props} />;
  }

  return (
    <DocSidebarItemLink
      {...props}
      item={{
        ...item,
        label: (
          <span className={styles.label}>
            <span>{item.label}</span>
            <FeatureState edition={edition} inline compact />
          </span>
        ),
      }}
    />
  );
}
