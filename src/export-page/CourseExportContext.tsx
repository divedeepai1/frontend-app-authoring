import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import moment from 'moment';
import Cookies from 'universal-cookie';
import { getConfig } from '@edx/frontend-platform';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ensureCourseTypeInSession,
  getAppNameFromSession,
} from '@src/compugrade/utils/rubricQaTransfer';
import { useExportStatus, useInvalidateExportStatus, useStartCourseExporting } from './data/apiHooks';
import { EXPORT_STAGES, LAST_EXPORT_COOKIE_NAME } from './data/constants';
import messages from './messages';
import { setExportCookie } from './utils';
import { exportLessonDataMapping } from './utils/exportLessonData';
import { getCourseOutlineIndex } from '../course-outline/data/api';

export type CourseExportContextData = {
  currentStage: number;
  exportTriggered: boolean;
  fetchExportErrorMessage?: string;
  errorUnitUrl?: string;
  anyRequestInProgress: boolean;
  anyRequestFailed: boolean;
  isLoadingDenied: boolean;
  successDate?: number;
  handleStartExportingCourse: () => void;
  downloadPath?: string;
  isExportingMetadata: boolean;
  exportProgress: { current: number; total: number; };
  downloadFailed: boolean;
  handleManualJsonDownload: () => void;
};

/**
 * Course Export Context.
 * Always available when we're in the context of the Course Export Page.
 *
 * Get this using `useCourseExportContext()`
 */
const CourseExportContext = createContext<CourseExportContextData | undefined>(undefined);

type CourseExportProviderProps = {
  children?: React.ReactNode;
};

async function downloadExportJson(exportMeta: object, courseId: string) {
  const safeCourseId = courseId.replace(/[^a-zA-Z0-9-_]/g, '_');
  const fileName = `course-export-metadata-${safeCourseId}.json`;

  let jsonString: string | null = null;
  let stringifyAttempts = 0;
  const maxStringifyAttempts = 3;

  while (stringifyAttempts < maxStringifyAttempts && !jsonString) {
    try {
      if (stringifyAttempts === 0) {
        jsonString = JSON.stringify(exportMeta, null, 2);
      } else if (stringifyAttempts === 1) {
        jsonString = JSON.stringify(exportMeta);
      } else {
        const seen = new WeakSet();
        jsonString = JSON.stringify(exportMeta, (_key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          return value;
        });
      }
      break;
    } catch (stringifyError) {
      stringifyAttempts += 1;
      if (stringifyAttempts >= maxStringifyAttempts) {
        throw new Error(
          `Failed to stringify export data after ${maxStringifyAttempts} attempts: ${
            (stringifyError as Error).message
          }`,
        );
      }
    }
  }

  if (!jsonString) {
    throw new Error('Failed to stringify export data');
  }

  let blob: Blob;
  try {
    blob = new Blob([jsonString], { type: 'application/json' });
  } catch {
    const encoder = new TextEncoder();
    blob = new Blob([encoder.encode(jsonString)], { type: 'application/json' });
  }

  if (!blob || blob.size === 0) {
    throw new Error('Failed to create export JSON blob');
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    try {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // non-critical cleanup
    }
  }, 500);

  return { blob, fileName };
}

export const CourseExportProvider = ({ children }: CourseExportProviderProps) => {
  const intl = useIntl();
  const { courseId, courseDetails } = useCourseAuthoringContext();
  const cookies = new Cookies();

  const [isStopFetching, setStopFetching] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);
  const [successDate, setSuccessDate] = useState<number>();
  const [isExportingMetadata, setIsExportingMetadata] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const [downloadFailed, setDownloadFailed] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);

  const reset = () => {
    setStopFetching(false);
    setExportTriggered(false);
    setSuccessDate(undefined);
    setIsExportingMetadata(false);
    setExportProgress({ current: 0, total: 0 });
    setDownloadFailed(false);
    setDownloadBlob(null);
    setDownloadFileName(null);
  };

  const {
    data: exportStatus,
    isPending: isPendingExportStatus,
    isError: isErrorExportStatus,
    failureReason: exportStatusError,
  } = useExportStatus(courseId, isStopFetching, exportTriggered);
  const exportMutation = useStartCourseExporting(courseId);
  const invalidateExportStatus = useInvalidateExportStatus(courseId);

  const currentStage = exportStatus?.exportStatus ?? 0;
  const anyRequestInProgress = exportMutation.isPending
    || isPendingExportStatus
    || isExportingMetadata;
  const anyRequestFailed = exportMutation.isError || isErrorExportStatus;
  const isLoadingDenied = exportStatusError?.response?.status === 403;

  let fetchExportErrorMessage: string | undefined;
  let errorUnitUrl;
  if (exportStatus?.exportError) {
    fetchExportErrorMessage = exportStatus.exportError.rawErrorMsg ?? intl.formatMessage(messages.unknownError);
    errorUnitUrl = exportStatus.exportError.editUnitUrl;
  }

  let downloadPath;
  if (exportStatus?.exportOutput) {
    downloadPath = exportStatus.exportOutput;
    if (downloadPath.startsWith('/')) {
      downloadPath = `${getConfig().STUDIO_BASE_URL}${downloadPath}`;
    }
  }

  // On mount, restore export state from the cookie set by a previous session,
  // so the stepper remains visible if the user navigates away and comes back.
  useEffect(() => {
    const cookieData = cookies.get(LAST_EXPORT_COOKIE_NAME);
    if (cookieData) {
      setExportTriggered(true);
      setSuccessDate(cookieData.date);
    }
  }, []);

  // Stop fetching the export status once the process has reached a terminal state:
  // successful completion, a network/request failure, or an application-level export error.
  useEffect(() => {
    if (currentStage === EXPORT_STAGES.SUCCESS || anyRequestFailed || fetchExportErrorMessage) {
      setStopFetching(true);
    }
  }, [currentStage, anyRequestFailed, fetchExportErrorMessage]);

  const handleManualJsonDownload = useCallback(() => {
    if (!downloadBlob || !downloadFileName) {
      return;
    }
    try {
      const url = window.URL.createObjectURL(downloadBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch {
          // non-critical
        }
        setDownloadFailed(false);
        setDownloadBlob(null);
        setDownloadFileName(null);
      }, 100);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Manual JSON download failed:', error);
      // eslint-disable-next-line no-alert
      alert(`Download failed: ${(error as Error).message}`);
    }
  }, [downloadBlob, downloadFileName]);

  const handleStartExportingCourse = useCallback(async () => {
    reset();
    invalidateExportStatus();
    setExportTriggered(true);
    setIsExportingMetadata(true);
    setExportProgress({ current: 0, total: 0 });

    try {
      // Preload course type so QA export works even without prior outline visit
      await ensureCourseTypeInSession(courseId);
      const appName = getAppNameFromSession();

      const outlineIndex = await getCourseOutlineIndex(courseId);
      if (!outlineIndex?.courseStructure?.id) {
        throw new Error('Could not load course outline for export');
      }

      const courseBlockId = outlineIndex.courseStructure.id;
      const courseDisplayName = outlineIndex.courseStructure.displayName
        || courseDetails?.name
        || 'Course Export';

      // Full course Compugrade metadata — JSON download is source of truth (not sessionStorage)
      const lessonResult = await exportLessonDataMapping(courseId, courseBlockId, {
        skipSessionStorage: true,
        appName,
        onProgress: (current, total) => {
          setExportProgress({ current, total });
        },
      });

      if (!lessonResult?.success || !lessonResult.exportData) {
        throw new Error(lessonResult?.error || 'Compugrade lesson export failed');
      }

      // Import expects top-level courseId / lessonDataMapping — not the wrapper
      const exportMeta = {
        ...lessonResult.exportData,
        courseDisplayName,
      };

      try {
        await downloadExportJson(exportMeta, courseId);
        setDownloadFailed(false);
        setDownloadBlob(null);
        setDownloadFileName(null);
      } catch (downloadError) {
        // Keep blob for manual retry; still continue to Studio export after alert
        // eslint-disable-next-line no-console
        console.error('Auto-download failed, storing blob for manual download:', downloadError);
        try {
          const safeCourseId = courseId.replace(/[^a-zA-Z0-9-_]/g, '_');
          const fallbackBlob = new Blob(
            [JSON.stringify(exportMeta)],
            { type: 'application/json' },
          );
          setDownloadBlob(fallbackBlob);
          setDownloadFileName(`course-export-metadata-${safeCourseId}.json`);
          setDownloadFailed(true);
        } catch {
          throw downloadError;
        }
      }

      // Only start Studio .tar.gz export after Compugrade JSON is ready (cms parity)
      await exportMutation.mutateAsync();
      const momentDate = moment().valueOf();
      setExportCookie(momentDate);
      setSuccessDate(momentDate);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Export error:', error);
      // eslint-disable-next-line no-alert
      alert(`Export failed: ${(error as Error).message}`);
      setExportTriggered(false);
    } finally {
      setIsExportingMetadata(false);
    }
  }, [courseId, courseDetails?.name, exportMutation, invalidateExportStatus]);

  const context = useMemo<CourseExportContextData>(() => ({
    currentStage,
    exportTriggered,
    fetchExportErrorMessage,
    errorUnitUrl,
    anyRequestFailed,
    isLoadingDenied,
    anyRequestInProgress,
    successDate,
    handleStartExportingCourse,
    downloadPath,
    isExportingMetadata,
    exportProgress,
    downloadFailed,
    handleManualJsonDownload,
  }), [
    currentStage,
    exportTriggered,
    fetchExportErrorMessage,
    errorUnitUrl,
    anyRequestFailed,
    isLoadingDenied,
    anyRequestInProgress,
    successDate,
    handleStartExportingCourse,
    downloadPath,
    isExportingMetadata,
    exportProgress,
    downloadFailed,
    handleManualJsonDownload,
  ]);

  return (
    <CourseExportContext.Provider value={context}>
      {children}
    </CourseExportContext.Provider>
  );
};

export function useCourseExportContext(): CourseExportContextData {
  const ctx = useContext(CourseExportContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useCourseExportContext() was used in a component without a <CourseExportProvider> ancestor.');
  }
  return ctx;
}
