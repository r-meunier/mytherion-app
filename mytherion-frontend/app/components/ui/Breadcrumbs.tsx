import Link from 'next/link';

export interface Crumb {
  label: string;
  /** Omit on the last crumb: it is the current page. */
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

/**
 * The trail above every page title inside a project (docs/style-guide.md §3). It replaces the old
 * "Back to …" links, and it always takes one line, so titles sit at the same height on every page.
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="h-5 mb-3 min-w-0">
      <ol className="flex items-center gap-1.5 text-xs font-semibold text-white/40 min-w-0">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5 min-w-0">
              {index > 0 && (
                <span className="material-symbols-outlined text-[14px] text-white/20" aria-hidden="true">
                  chevron_right
                </span>
              )}
              {item.href && !last ? (
                <Link href={item.href} className="truncate hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={`truncate ${last ? 'text-white/70' : ''}`}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
