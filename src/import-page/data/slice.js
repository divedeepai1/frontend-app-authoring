/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStage: 0,
  error: { hasError: false, message: '' },
  progress: 0,
  importTriggered: false,
  fileName: null,
  loadingStatus: '',
  savingStatus: '',
  successDate: null,
  exportedLessonMetadata: null, // Store JSON metadata directly in Redux (no sessionStorage needed)
};

const slice = createSlice({
  name: 'importPage',
  initialState,
  reducers: {
    updateCurrentStage: (state, { payload }) => {
      if (payload >= state.currentStage) {
        state.currentStage = payload;
      }
    },
    updateError: (state, { payload }) => {
      state.error = { ...state.error, ...payload };
    },
    updateProgress: (state, { payload }) => {
      state.progress = payload;
    },
    updateImportTriggered: (state, { payload }) => {
      state.importTriggered = payload;
    },
    updateFileName: (state, { payload }) => {
      state.fileName = payload;
    },
    reset: (state) => {
      // Preserve exportedLessonMetadata across resets so it's available during import processing
      const preservedMetadata = state.exportedLessonMetadata;
      return {
        ...initialState,
        exportedLessonMetadata: preservedMetadata,
      };
    },
    updateLoadingStatus: (state, { payload }) => {
      state.loadingStatus = payload;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload;
    },
    updateSuccessDate: (state, { payload }) => {
      state.successDate = payload;
    },
    updateExportedLessonMetadata: (state, { payload }) => {
      state.exportedLessonMetadata = payload;
    },
  },
});

export const {
  updateCurrentStage,
  updateError,
  updateProgress,
  updateImportTriggered,
  updateFileName,
  reset,
  updateLoadingStatus,
  updateSavingStatus,
  updateSuccessDate,
  updateExportedLessonMetadata,
} = slice.actions;

export const {
  reducer,
} = slice;
