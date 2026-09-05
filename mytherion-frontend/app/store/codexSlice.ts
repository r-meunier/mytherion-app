import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { codexService, Page } from '../services/codexService';
import { CodexEntry, CreateEntryRequest, UpdateEntryRequest, EntryType, EntryFilters } from '../types/codex';

interface EntityState {
  entries: CodexEntry[];
  currentEntity: CodexEntry | null;
  loading: boolean;
  error: string | null;
  filters: EntryFilters;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
}

const initialState: EntityState = {
  entries: [],
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
  'entries/fetchEntities',
  async ({ 
    projectId, 
    filters, 
    page = 0, 
    size = 20 
  }: { 
    projectId: string; 
    filters?: EntryFilters; 
    page?: number; 
    size?: number;
  }) => {
    const response = await codexService.getEntities(projectId, {
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
  'entries/fetchEntity',
  async ({ projectId, id }: { projectId: string; id: string }) => {
    const response = await codexService.getEntity(projectId, id);
    return response;
  }
);

export const createEntity = createAsyncThunk(
  'entries/createEntity',
  async ({ projectId, data }: { projectId: string; data: CreateEntryRequest }) => {
    const response = await codexService.createEntity(projectId, data);
    return response;
  }
);

export const updateEntity = createAsyncThunk(
  'entries/updateEntity',
  async ({ projectId, id, data }: { projectId: string; id: string; data: UpdateEntryRequest }) => {
    const response = await codexService.updateEntity(projectId, id, data);
    return response;
  }
);

export const deleteEntity = createAsyncThunk(
  'entries/deleteEntity',
  async ({ projectId, id }: { projectId: string; id: string }) => {
    await codexService.deleteEntity(projectId, id);
    return id;
  }
);

const codexSlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<EntryFilters>) => {
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
    // Fetch entries
    builder
      .addCase(fetchEntities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntities.fulfilled, (state, action: PayloadAction<Page<CodexEntry>>) => {
        state.loading = false;
        state.entries = action.payload.content;
        state.pagination = {
          page: action.payload.pageable.pageNumber,
          size: action.payload.pageable.pageSize,
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
        };
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entries';
      });

    // Fetch single entry
    builder
      .addCase(fetchEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntity.fulfilled, (state, action: PayloadAction<CodexEntry>) => {
        state.loading = false;
        state.currentEntity = action.payload;
        const index = state.entries.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        } else {
          state.entries.unshift(action.payload);
        }
      })
      .addCase(fetchEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entry';
      });

    // Create entry
    builder
      .addCase(createEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEntity.fulfilled, (state, action: PayloadAction<CodexEntry>) => {
        state.loading = false;
        state.entries.unshift(action.payload);
        state.currentEntity = action.payload;
      })
      .addCase(createEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create entry';
      });

    // Update entry
    builder
      .addCase(updateEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEntity.fulfilled, (state, action: PayloadAction<CodexEntry>) => {
        state.loading = false;
        const index = state.entries.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        if (state.currentEntity?.id === action.payload.id) {
          state.currentEntity = action.payload;
        }
      })
      .addCase(updateEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update entry';
      });

    // Delete entry
    builder
      .addCase(deleteEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEntity.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.entries = state.entries.filter((e) => e.id !== action.payload);
        if (state.currentEntity?.id === action.payload) {
          state.currentEntity = null;
        }
      })
      .addCase(deleteEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete entry';
      });
  },
});

export const { setFilters, clearFilters, clearError, clearCurrentEntity } = codexSlice.actions;
export default codexSlice.reducer;
