# Page templates

Every documentation page belongs to exactly one type. Copy the matching template
before you start writing, keep its sections, and delete the instruction comments.

| Type | Answers | Title grammar | Template |
|---|---|---|---|
| Concept | What is this and why does it exist? | Noun phrase: `Task templates` | [concept.md](./concept.md) |
| Task | How do I do one specific thing? | Bare infinitive: `Create a template` | [task.md](./task.md) |
| Tutorial | Can you teach me, end to end? | Bare infinitive with a goal: `Run your first playbook` | [tutorial.md](./tutorial.md) |
| Reference | What are the exact values? | Qualifier + noun: `Template fields` | [reference.md](./reference.md) |
| Troubleshooting | Why did this fail and what do I do? | `Troubleshooting <feature>` | [troubleshooting.md](./troubleshooting.md) |
| Section landing | Where do I go from here? | Section name: `Admin Guide` | [section.md](./section.md) |

## Rules that apply to every type

- **One type per page.** A concept page does not contain numbered steps. A reference
  page does not contain procedures. A tutorial does not explain theory: it links to the
  concept page instead.
- **One H1**, matching the `title` in front matter. Do not skip heading levels.
- **Sentence case** in every heading. No gerunds (`Create a key`, not `Creating a key`):
  gerunds translate inconsistently and the docs ship in ten languages.
- **Explicit heading ids** (`## Create a key {#create-a-key}`) so deep links survive
  translation.
- **Front matter** with `title` and `description` is mandatory on every page.
- **Moving a page requires a redirect** in `redirects.js`, in the same commit.
- Cross-reference with `For more information, see [Page title](/path)`. Never
  `click here` and never a bare URL as link text.
- Keep "What's next" to five links at most.
