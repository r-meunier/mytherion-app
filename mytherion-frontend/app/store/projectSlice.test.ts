import projectReducer, {
  fetchProjects,
  fetchProject,
  createProject,
  updateProject,
  deleteProject,
} from './projectSlice';
import { configureStore } from '@reduxjs/toolkit';

// Mock the projectService
jest.mock('../services/projectService', () => ({
  projectService: {
    getProjects: jest.fn(),
    getProject: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  },
}));

import { projectService } from '../services/projectService';

describe('projectSlice', () => {
  const initialState = {
    projects: [],
    currentProject: null,
    stats: null,
    loading: false,
    error: null,
    pagination: {
      page: 0,
      size: 20,
      totalPages: 0,
      totalElements: 0,
    },
  };

  const mockProject = {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockPage = {
    content: [mockProject],
    pageable: {
      pageNumber: 0,
      pageSize: 20,
    },
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== Initial State Tests ====================

  it('should return the initial state', () => {
    expect(projectReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  // ==================== Fetch Projects Tests ====================

  describe('fetchProjects', () => {
    it('should set loading state on pending', () => {
      const action = { type: fetchProjects.pending.type };
      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set projects and pagination on fulfilled', () => {
      const action = {
        type: fetchProjects.fulfilled.type,
        payload: mockPage,
      };
      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.projects).toEqual(mockPage.content);
      expect(state.pagination.totalElements).toBe(1);
      expect(state.pagination.totalPages).toBe(1);
      expect(state.error).toBeNull();
    });

    it('should set error on rejected', () => {
      const errorMessage = 'Failed to fetch projects';
      const action = {
        type: fetchProjects.rejected.type,
        error: { message: errorMessage },
      };
      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  // ==================== Fetch Project Tests ====================

  describe('fetchProject', () => {
    it('should set loading state on pending', () => {
      const action = { type: fetchProject.pending.type };
      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set current project on fulfilled', () => {
      const action = {
        type: fetchProject.fulfilled.type,
        payload: mockProject,
      };
      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.currentProject).toEqual(mockProject);
      expect(state.error).toBeNull();
    });

    it('should set error on rejected', () => {
      const errorMessage = 'Project not found';
      const action = {
        type: fetchProject.rejected.type,
        error: { message: errorMessage },
      };
      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  // ==================== Create Project Tests ====================

  describe('createProject', () => {
    it('should set loading state on pending', () => {
      const action = { type: createProject.pending.type };
      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should add new project to list on fulfilled', () => {
      const action = {
        type: createProject.fulfilled.type,
        payload: mockProject,
      };
      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.projects).toContainEqual(mockProject);
      expect(state.error).toBeNull();
    });

    it('should set error on rejected', () => {
      const errorMessage = 'Failed to create project';
      const action = {
        type: createProject.rejected.type,
        error: { message: errorMessage },
      };
      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  // ==================== Update Project Tests ====================

  describe('updateProject', () => {
    const stateWithProject = {
      ...initialState,
      projects: [mockProject],
    };

    it('should set loading state on pending', () => {
      const action = { type: updateProject.pending.type };
      const state = projectReducer(stateWithProject, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update project in list on fulfilled', () => {
      const updatedProject = {
        ...mockProject,
        name: 'Updated Project',
      };
      const action = {
        type: updateProject.fulfilled.type,
        payload: updatedProject,
      };
      const state = projectReducer(stateWithProject, action);

      expect(state.loading).toBe(false);
      expect(state.projects[0].name).toBe('Updated Project');
      expect(state.error).toBeNull();
    });

    it('should set error on rejected', () => {
      const errorMessage = 'Failed to update project';
      const action = {
        type: updateProject.rejected.type,
        error: { message: errorMessage },
      };
      const state = projectReducer(stateWithProject, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  // ==================== Delete Project Tests ====================

  describe('deleteProject', () => {
    const stateWithProject = {
      ...initialState,
      projects: [mockProject],
    };

    it('should set loading state on pending', () => {
      const action = { type: deleteProject.pending.type };
      const state = projectReducer(stateWithProject, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should remove project from list on fulfilled', () => {
      const action = {
        type: deleteProject.fulfilled.type,
        meta: { arg: 1 },
      };
      const state = projectReducer(stateWithProject, action);

      expect(state.loading).toBe(false);
      expect(state.projects).toHaveLength(0);
      expect(state.error).toBeNull();
    });

    it('should set error on rejected', () => {
      const errorMessage = 'Failed to delete project';
      const action = {
        type: deleteProject.rejected.type,
        error: { message: errorMessage },
      };
      const state = projectReducer(stateWithProject, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  // ==================== Async Thunk Integration Tests ====================

  describe('async thunks', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          projects: projectReducer,
        },
      });
    });

    it('should handle successful project fetch', async () => {
      const mockProjectService = projectService as jest.Mocked<typeof projectService>;
      mockProjectService.getProjects.mockResolvedValue(mockPage);

      await store.dispatch(fetchProjects({}));

      const state = store.getState().projects;
      expect(state.projects).toEqual(mockPage.content);
      expect(state.pagination.totalElements).toBe(1);
      expect(state.error).toBeNull();
    });

    it('should handle failed project fetch', async () => {
      const mockProjectService = projectService as jest.Mocked<typeof projectService>;
      mockProjectService.getProjects.mockRejectedValue(new Error('Network error'));

      await store.dispatch(fetchProjects({}));

      const state = store.getState().projects;
      expect(state.projects).toEqual([]);
      expect(state.error).toBe('Network error');
    });

    it('should handle successful project creation', async () => {
      const mockProjectService = projectService as jest.Mocked<typeof projectService>;
      mockProjectService.createProject.mockResolvedValue(mockProject);

      await store.dispatch(
        createProject({
          name: 'Test Project',
          description: 'Test Description',
        })
      );

      const state = store.getState().projects;
      expect(state.projects).toContainEqual(mockProject);
      expect(state.error).toBeNull();
    });

    it('should handle successful project update', async () => {
      const mockProjectService = projectService as jest.Mocked<typeof projectService>;
      mockProjectService.updateProject.mockResolvedValue({
        ...mockProject,
        name: 'Updated',
      });

      // First add a project
      store.dispatch({
        type: createProject.fulfilled.type,
        payload: mockProject,
      });

      // Then update it
      await store.dispatch(
        updateProject({
          id: 1,
          data: { name: 'Updated' },
        })
      );

      const state = store.getState().projects;
      expect(state.projects[0].name).toBe('Updated');
    });

    it('should handle successful project deletion', async () => {
      const mockProjectService = projectService as jest.Mocked<typeof projectService>;
      mockProjectService.deleteProject.mockResolvedValue();

      // First add a project
      store.dispatch({
        type: createProject.fulfilled.type,
        payload: mockProject,
      });

      // Then delete it
      await store.dispatch(deleteProject(1));

      const state = store.getState().projects;
      expect(state.projects).toHaveLength(0);
    });
  });
});
