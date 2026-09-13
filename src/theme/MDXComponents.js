import MDXComponents from '@theme-original/MDXComponents';
import FeatureState, {Pro, Enterprise} from '@site/src/components/FeatureState';

/**
 * Components available in every .md and .mdx page without an import.
 *
 * Adding them here instead of importing per page matters: the documentation is
 * translated into ten locales, and an import line in a page must be repeated in
 * every translated copy.
 */
export default {
  ...MDXComponents,
  FeatureState,
  Pro,
  Enterprise,
};
