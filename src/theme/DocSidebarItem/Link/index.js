import React from 'react';
import DocSidebarItemLink from '@theme-original/DocSidebarItem/Link';
import FeatureState from '@site/src/components/FeatureState';

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
          <span>
            {item.label}
            <FeatureState edition={edition} inline />
          </span>
        ),
      }}
    />
  );
}
