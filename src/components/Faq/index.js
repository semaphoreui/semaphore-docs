import React, {useEffect, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import {useMDXComponents} from '@mdx-js/react';
import styles from './styles.module.css';

const HEADING_TAGS = ['h2', 'h3', 'h4', 'h5', 'h6'];

/**
 * Collapsible FAQ, styled like the FAQ blocks on semaphoreui.com.
 *
 * Usage in any .md/.mdx page (registered globally, no import needed). Keep the
 * blank lines around the tags, or MDX reads the content as one paragraph:
 *
 *   ## FAQ {#faq}
 *
 *   <Faq>
 *
 *   ### Can I scale horizontally? {#can-i-scale-horizontally}
 *
 *   Yes. You can add Semaphore nodes behind the load balancer...
 *
 *   </Faq>
 *
 * The first heading inside <Faq> sets the question level. Every heading of that
 * level starts a question, and everything up to the next one is its answer.
 * Questions stay ordinary Markdown headings, so they keep their explicit ids,
 * appear in the table of contents, and are translated like any other heading.
 *
 * The first answer starts open, as on the website. Following a link to a
 * question's anchor opens its answer.
 */
export default function Faq({children}) {
  const components = useMDXComponents();
  const headingTypes = HEADING_TAGS.map((tag) => components[tag] ?? tag);

  const intro = [];
  const items = [];
  let questionType;

  React.Children.toArray(children).forEach((child) => {
    // MDX puts a "\n" string between block elements.
    if (typeof child === 'string' && child.trim() === '') {
      return;
    }
    const isQuestion =
      React.isValidElement(child) &&
      (questionType ? child.type === questionType : headingTypes.includes(child.type));
    if (isQuestion) {
      questionType = child.type;
      items.push({question: child, answer: []});
    } else if (items.length > 0) {
      items[items.length - 1].answer.push(child);
    } else {
      intro.push(child);
    }
  });

  return (
    <>
      {intro}
      <div className={styles.faq}>
        {items.map(({question, answer}, index) => (
          <FaqItem key={question.key} question={question} defaultOpen={index === 0}>
            {answer}
          </FaqItem>
        ))}
      </div>
    </>
  );
}

function FaqItem({question, defaultOpen, children}) {
  const {hash} = useLocation();
  const [open, setOpen] = useState(defaultOpen);
  const {id} = question.props;

  useEffect(() => {
    if (id && hash === `#${id}`) {
      setOpen(true);
    }
  }, [hash, id]);

  return (
    <details
      className={styles.item}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className={styles.question}>{question}</summary>
      <div className={styles.answer}>{children}</div>
    </details>
  );
}
