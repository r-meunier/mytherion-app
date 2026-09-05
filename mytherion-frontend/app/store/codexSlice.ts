import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { codexService, Page } from '../services/codexService';
import { CodexEntry, CreateEntryRequest, UpdateEntryRequest, EntryFilters } from '../types/codex';

interface EntryState {
  entries: CodexEntry[];
  currentEntry: CodexEntry | null;
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

const initialState: EntryState = {
  entries: [],
  currentEntry: null,
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
export const fetchEntries = createAsyncThunk(
  'entries/fetchEntries',
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
    const response = await codexService.getEntries(projectId, {
      type: filters?.type,
      tags: filters?.tags,
      search: filters?.search,
      page,
      size,
    });
    return response;
  }
);

export const fetchEntry = createAsyncThunk(
  'entries/fetchEntry',
  async ({ projectId, id }: { projectId: string; id: string }) => {
    const response = await codexService.getEntry(projectId, id);
    return response;
  }
);

export const createEntry = createAsyncThunk(
  'entries/createEntry',
  async ({ projectId, data }: { projectId: string; data: CreateEntryRequest }) => {
    const response = await codexService.createEntry(projectId, data);
    return response;
  }
);

export const updateEntry = createAsyncThunk(
  'entries/updateEntry',
  async ({ projectId, id, data }: { projectId: string; id: string; data: UpdateEntryRequest }) => {
    const response = await codexService.updateEntry(projectId, id, data);
    return response;
  }
);

export const deleteEntry = createAsyncThunk(
  'entries/deleteEntry',
  async ({ projectId, id }: { projectId: string; id: string }) => {
    await codexService.deleteEntry(projectId, id);
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
    clearCurrentEntry: (state) => {
      state.currentEntry = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch entries
    builder
      .addCase(fetchEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntries.fulfilled, (state, action: PayloadAction<Page<CodexEntry>>) => {
        state.loading = false;
        state.entries = action.payload.content;
        state.pagination = {
          page: action.payload.pageable.pageNumber,
          size: action.payload.pageable.pageSize,
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
        };
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entries';
      });

    // Fetch single entry
    builder
      .addCase(fetchEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntry.fulfilled, (state, action: PayloadAction<CodexEntry>) => {
        state.loading = false;
        state.currentEntry = action.payload;
        const index = state.entries.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        } else {
          state.entries.unshift(action.payload);
        }
      })
      .addCase(fetchEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entry';
      });

    // Create entry
    builder
      .addCase(createEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEntry.fulfilled, (state, action: PayloadAction<CodexEntry>) => {
        state.loading = false;
        state.entries.unshift(action.payload);
        state.currentEntry = action.payload;
      })
      .addCase(createEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create entry';
      });

    // Update entry
    builder
      .addCase(updateEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEntry.fulfilled, (state, action: PayloadAction<CodexEntry>) => {
        state.loading = false;
        const index = state.entries.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        if (state.currentEntry?.id === action.payload.id) {
          state.currentEntry = action.payload;
        }
      })
      .addCase(updateEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update entry';
      });

    // Delete entry
    builder
      .addCase(deleteEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEntry.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.entries = state.entries.filter((e) => e.id !== action.payload);
        if (state.currentEntry?.id === action.payload) {
          state.currentEntry = null;
        }
      })
      .addCase(deleteEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete entry';
      });
  },
});

export const { setFilters, clearFilters, clearError, clearCurrentEntry } = codexSlice.actions;
export default codexSlice.reducer;
