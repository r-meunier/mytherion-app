import type { Crumb } from '@/app/components/ui/Breadcrumbs';
import routes from './routes';

/**
 * Start of every breadcrumb trail inside a project: Projects › {project}. Pages append their own
 * crumbs; the last one is the current page (docs/style-guide.md §3).
 */
export function projectTrail(projectId: string, projectName?: string, ...rest: Crumb[]): Crumb[] {
  return [
    { label: 'Projects', href: routes.home() },
    { label: projectName ?? 'Project', href: routes.project(projectId).root },
    ...rest,
  ];
}
