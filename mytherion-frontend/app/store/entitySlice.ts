import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { entityService, Page } from '../services/entityService';
import { Entity, CreateEntityRequest, UpdateEntityRequest, EntityType, EntityFilters } from '../types/entity';

interface EntityState {
  entities: Entity[];
  currentEntity: Entity | null;
  loading: boolean;
  error: string | null;
  filters: EntityFilters;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
}

const initialState: EntityState = {
  entities: [],
  currentEntity: null,
  loading: false,
  error: null,
  filters: {
    type: undefined,
    tags: [],
    search: '',
  },
  pagination: {
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  },
};

// Async thunks
export const fetchEntities = createAsyncThunk(
  'entities/fetchEntities',
  async ({ 
    projectId, 
    filters, 
    page = 0, 
    size = 20 
  }: { 
    projectId: number; 
    filters?: EntityFilters; 
    page?: number; 
    size?: number;
  }) => {
    const response = await entityService.getEntities(projectId, {
      type: filters?.type,
      tags: filters?.tags,
      search: filters?.search,
      page,
      size,
    });
    return response;
  }
);

export const fetchEntity = createAsyncThunk(
  'entities/fetchEntity',
  async (id: number) => {
    const response = await entityService.getEntity(id);
    return response;
  }
);

export const createEntity = createAsyncThunk(
  'entities/createEntity',
  async ({ projectId, data }: { projectId: number; data: CreateEntityRequest }) => {
    const response = await entityService.createEntity(projectId, data);
    return response;
  }
);

export const updateEntity = createAsyncThunk(
  'entities/updateEntity',
  async ({ id, data }: { id: number; data: UpdateEntityRequest }) => {
    const response = await entityService.updateEntity(id, data);
    return response;
  }
);

export const deleteEntity = createAsyncThunk(
  'entities/deleteEntity',
  async (id: number) => {
    await entityService.deleteEntity(id);
    return id;
  }
);

const entitySlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<EntityFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        type: undefined,
        tags: [],
        search: '',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentEntity: (state) => {
      state.currentEntity = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch entities
    builder
      .addCase(fetchEntities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntities.fulfilled, (state, action: PayloadAction<Page<Entity>>) => {
        state.loading = false;
        state.entities = action.payload.content;
        state.pagination = {
          page: action.payload.pageable.pageNumber,
          size: action.payload.pageable.pageSize,
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
        };
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entities';
      });

    // Fetch single entity
    builder
      .addCase(fetchEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntity.fulfilled, (state, action: PayloadAction<Entity>) => {
        state.loading = false;
        state.currentEntity = action.payload;
      })
      .addCase(fetchEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entity';
      });

    // Create entity
    builder
      .addCase(createEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEntity.fulfilled, (state, action: PayloadAction<Entity>) => {
        state.loading = false;
        state.entities.unshift(action.payload);
        state.currentEntity = action.payload;
      })
      .addCase(createEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create entity';
      });

    // Update entity
    builder
      .addCase(updateEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEntity.fulfilled, (state, action: PayloadAction<Entity>) => {
        state.loading = false;
        const index = state.entities.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.entities[index] = action.payload;
        }
        if (state.currentEntity?.id === action.payload.id) {
          state.currentEntity = action.payload;
        }
      })
      .addCase(updateEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update entity';
      });

    // Delete entity
    builder
      .addCase(deleteEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEntity.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.entities = state.entities.filter((e) => e.id !== action.payload);
        if (state.currentEntity?.id === action.payload) {
          state.currentEntity = null;
        }
      })
      .addCase(deleteEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete entity';
      });
  },
});

export const { setFilters, clearFilters, clearError, clearCurrentEntity } = entitySlice.actions;
export default entitySlice.reducer;
