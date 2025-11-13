import React from 'react';
import { DocSearch } from '@docsearch/react';
import '@docsearch/css';

export default function SearchBar() {
  return (
    <DocSearch
      appId="B71NA6DNHD"
      indexName="docs_semaphoreui_com_b71na6dnhd_pages"
      apiKey="bb1dabaeb79b08523ab98c9723afad04"
    />
  );
}
