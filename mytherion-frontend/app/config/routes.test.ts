import routes from './routes';
import apiRoutes from './apiRoutes';

describe('Frontend UI routes manifest', () => {
  it('generates root application routes correctly', () => {
    expect(routes.home()).toBe('/');
    expect(routes.login()).toBe('/login');
    expect(routes.register()).toBe('/register');
    expect(routes.verifyEmail()).toBe('/verify-email');
    expect(routes.forgotPhrase()).toBe('/forgot-phrase');
    expect(routes.archive()).toBe('/archive');
    expect(routes.admin.root()).toBe('/admin');
    expect(routes.admin.users()).toBe('/admin/users');
    expect(routes.projects()).toBe('/projects');
  });

  it('generates project scoped routes correctly', () => {
    const projectRoutes = routes.project('proj-123');

    expect(projectRoutes.root).toBe('/projects/proj-123');
    expect(projectRoutes.codex.index()).toBe('/projects/proj-123/codex');
    expect(projectRoutes.codex.new()).toBe('/projects/proj-123/codex/new');
    expect(projectRoutes.codex.detail('entry-456')).toBe('/projects/proj-123/codex/entry-456');
    expect(projectRoutes.codex.edit('entry-456')).toBe('/projects/proj-123/codex/entry-456/edit');
    expect(projectRoutes.planner).toBe('/projects/proj-123/planner');
    expect(projectRoutes.manuscript).toBe('/projects/proj-123/manuscript');
    expect(projectRoutes.timeline).toBe('/projects/proj-123/timeline');
    expect(projectRoutes.settings).toBe('/projects/proj-123/settings');
  });

  it('generates codex search and filter query parameters correctly', () => {
    const projectRoutes = routes.project('proj-123');

    expect(projectRoutes.codex.index({ search: 'Elvhenan' }))
      .toBe('/projects/proj-123/codex?search=Elvhenan');

    expect(projectRoutes.codex.index({ type: 'CHARACTER' }))
      .toBe('/projects/proj-123/codex?type=CHARACTER');

    expect(projectRoutes.codex.index({ search: 'Mage', type: 'CHARACTER' }))
      .toBe('/projects/proj-123/codex?search=Mage&type=CHARACTER');

    expect(projectRoutes.codex.index({ search: '   ' }))
      .toBe('/projects/proj-123/codex');
  });
});

describe('Backend API apiRoutes manifest', () => {
  it('generates auth API endpoints', () => {
    expect(apiRoutes.auth.login).toBe('/api/auth/login');
    expect(apiRoutes.auth.register).toBe('/api/auth/register');
    expect(apiRoutes.auth.logout).toBe('/api/auth/logout');
    expect(apiRoutes.auth.me).toBe('/api/auth/me');
    expect(apiRoutes.auth.verifyEmail).toBe('/api/auth/verify-email');
    expect(apiRoutes.auth.resendVerification).toBe('/api/auth/resend-verification');
    expect(apiRoutes.health).toBe('/api/health');
  });

  it('generates project and entry API endpoints with dynamic IDs', () => {
    expect(apiRoutes.projects.list).toBe('/api/projects');
    expect(apiRoutes.projects.detail('proj-1')).toBe('/api/projects/proj-1');
    expect(apiRoutes.projects.stats('proj-1')).toBe('/api/projects/proj-1/stats');

    expect(apiRoutes.entries.list('proj-1')).toBe('/api/projects/proj-1/entries');
    expect(apiRoutes.entries.create('proj-1')).toBe('/api/projects/proj-1/entries');
    expect(apiRoutes.entries.detail('proj-1', 'ent-2')).toBe('/api/projects/proj-1/entries/ent-2');
    expect(apiRoutes.entries.thumbnail('proj-1', 'ent-2')).toBe('/api/projects/proj-1/entries/ent-2/thumbnail');
  });

  it('generates dashboard and storage endpoints', () => {
    expect(apiRoutes.dashboard.stats).toBe('/api/dashboard/stats');
    expect(apiRoutes.dashboard.projectStats('proj-1')).toBe('/api/projects/proj-1/dashboard/stats');
    expect(apiRoutes.storage.file('avatar.png')).toBe('/api/storage/avatar.png');
  });
});
