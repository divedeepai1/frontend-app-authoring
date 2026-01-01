import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Container, Layout, Button, Card,
} from '@openedx/paragon';
import { ArrowCircleDown as ArrowCircleDownIcon } from '@openedx/paragon/icons';
import Cookies from 'universal-cookie';
import { getConfig } from '@edx/frontend-platform';
import { Helmet } from 'react-helmet';

import InternetConnectionAlert from '../generic/internet-connection-alert';
import SubHeader from '../generic/sub-header/SubHeader';
import { RequestStatus } from '../data/constants';
import { useModel } from '../generic/model-store';
import messages from './messages';
import ExportSidebar from './export-sidebar/ExportSidebar';
import {
  getCurrentStage, getError, getExportTriggered, getLoadingStatus, getSavingStatus,
} from './data/selectors';
import { startExportingCourse } from './data/thunks';
import { EXPORT_STAGES, LAST_EXPORT_COOKIE_NAME } from './data/constants';
import { updateExportTriggered, updateSavingStatus, updateSuccessDate } from './data/slice';
import ExportModalError from './export-modal-error/ExportModalError';
import ExportFooter from './export-footer/ExportFooter';
import ExportStepper from './export-stepper/ExportStepper';
import { exportLessonDataMapping } from './utils/exportLessonData';
import { getCourseOutlineIndex } from '../course-outline/data/api';


const CourseExportPage = ({ intl, courseId }) => {
  const dispatch = useDispatch();
  const exportTriggered = useSelector(getExportTriggered);
  const courseDetails = useModel('courseDetails', courseId);
  const currentStage = useSelector(getCurrentStage);
  const { msg: errorMessage } = useSelector(getError);
  const loadingStatus = useSelector(getLoadingStatus);
  const savingStatus = useSelector(getSavingStatus);
  const cookies = new Cookies();
  const [isExportingMetadata, setIsExportingMetadata] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState({ current: 0, total: 0 });
  const [exportedMetadata, setExportedMetadata] = React.useState(null);
  const [downloadFailed, setDownloadFailed] = React.useState(false);
  const [downloadBlob, setDownloadBlob] = React.useState(null);
  const [downloadFileName, setDownloadFileName] = React.useState(null);
  const isShowExportButton = !exportTriggered || errorMessage || currentStage === EXPORT_STAGES.SUCCESS;
  const anyRequestFailed = savingStatus === RequestStatus.FAILED || loadingStatus === RequestStatus.FAILED;
  const anyRequestInProgress = savingStatus === RequestStatus.PENDING || loadingStatus === RequestStatus.IN_PROGRESS;

  useEffect(() => {
    const cookieData = cookies.get(LAST_EXPORT_COOKIE_NAME);
    if (cookieData) {
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      dispatch(updateSuccessDate(cookieData.date));
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>
          {intl.formatMessage(messages.pageTitle, {
            headingTitle: intl.formatMessage(messages.headingTitle),
            courseName: courseDetails?.name,
            siteName: process.env.SITE_NAME,
          })}
        </title>
      </Helmet>
      <Container size="xl" className="mt-4 px-4 export">
        <section className="setting-items mb-4">
          <Layout
            lg={[{ span: 9 }, { span: 3 }]}
            md={[{ span: 9 }, { span: 3 }]}
            sm={[{ span: 9 }, { span: 3 }]}
            xs={[{ span: 9 }, { span: 3 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              <article>
                <SubHeader
                  title={intl.formatMessage(messages.headingTitle)}
                  subtitle={intl.formatMessage(messages.headingSubtitle)}
                />
                <p className="small">{intl.formatMessage(messages.description1, { studioShortName: getConfig().STUDIO_SHORT_NAME })}</p>
                <p className="small">{intl.formatMessage(messages.description2)}</p>
                <Card>
                  <Card.Header
                    className="h3 px-3 text-black mb-4"
                    title={intl.formatMessage(messages.titleUnderButton)}
                  />
                  {isShowExportButton && (
                    <Card.Section className="px-3 py-1">
                      <Button
                        size="lg"
                        block
                        className="mb-4"
                        disabled={isExportingMetadata}
                        onClick={async () => {
                          setIsExportingMetadata(true);
                          setExportProgress({ current: 0, total: 0 });
                          dispatch(updateExportTriggered(true));
                          try {
                            const outlineIndex = await getCourseOutlineIndex(courseId);
                            if (outlineIndex && outlineIndex.courseStructure) {
                              const courseBlockId = outlineIndex.courseStructure.id;
                              const courseDisplayName = outlineIndex.courseStructure.displayName || courseDetails?.name || 'Course Export';
                              const lessonResult = await exportLessonDataMapping(courseId, courseBlockId, { 
                                skipSessionStorage: false,
                                onProgress: (current, total) => {
                                  setExportProgress({ current, total });
                                }
                              });
                              if (lessonResult?.success && lessonResult.exportData) {
                                const exportMeta = {
                                  ...lessonResult.exportData,
                                  courseDisplayName,
                                };
                                setExportedMetadata(exportMeta);
                                
                                // CRITICAL: Download the JSON file - this MUST work regardless of sessionStorage
                                // This works for infinite number of rubrics as long as browser memory allows
                                const safeCourseId = courseId.replace(/[^a-zA-Z0-9-_]/g, '_');
                                
                                // Initialize variables for error handling
                                let jsonString = null;
                                let fileSizeMB = 0;
                                let blob = null;
                                
                                try {
                                  // Stringify with multiple fallback strategies for very large files
                                  let stringifyAttempts = 0;
                                  const maxStringifyAttempts = 3;
                                  
                                  while (stringifyAttempts < maxStringifyAttempts && !jsonString) {
                                    try {
                                      if (stringifyAttempts === 0) {
                                        // First attempt: pretty print
                                        jsonString = JSON.stringify(exportMeta, null, 2);
                                      } else if (stringifyAttempts === 1) {
                                        // Second attempt: compact (no pretty print)
                                        jsonString = JSON.stringify(exportMeta);
                                      } else {
                                        // Third attempt: with replacer to handle circular refs
                                        const seen = new WeakSet();
                                        jsonString = JSON.stringify(exportMeta, (key, value) => {
                                          if (typeof value === 'object' && value !== null) {
                                            if (seen.has(value)) {
                                              return '[Circular]';
                                            }
                                            seen.add(value);
                                          }
                                          return value;
                                        });
                                      }
                                      break; // Success, exit loop
                                    } catch (stringifyError) {
                                      stringifyAttempts++;
                                      if (stringifyAttempts >= maxStringifyAttempts) {
                                        throw new Error(`Failed to stringify export data after ${maxStringifyAttempts} attempts. This may indicate the file is extremely large or contains circular references. Error: ${stringifyError.message}`);
                                      }
                                      console.warn(`Stringify attempt ${stringifyAttempts} failed, trying alternative method:`, stringifyError);
                                    }
                                  }
                                  
                                  if (!jsonString) {
                                    throw new Error('Failed to stringify export data - all attempts failed');
                                  }
                                  
                                  // Check file size and log
                                  fileSizeMB = new Blob([jsonString]).size / (1024 * 1024);
                                  console.log(`Export file size: ${fileSizeMB.toFixed(2)}MB`);
                                  
                                  if (fileSizeMB > 100) {
                                    console.warn(`File size is very large: ${fileSizeMB.toFixed(2)}MB. Download may take longer.`);
                                  }
                                  
                                  // Create blob with multiple fallback strategies
                                  try {
                                    // First attempt: standard blob creation
                                    blob = new Blob([jsonString], { type: 'application/json' });
                                  } catch (blobError) {
                                    // Fallback: try with Uint8Array for very large files
                                    try {
                                      console.log('Standard blob creation failed, trying Uint8Array encoding...');
                                      const encoder = new TextEncoder();
                                      const data = encoder.encode(jsonString);
                                      blob = new Blob([data], { type: 'application/json' });
                                    } catch (uint8Error) {
                                      // Last resort: try chunked approach for extremely large files
                                      try {
                                        console.log('Uint8Array encoding failed, trying chunked blob creation...');
                                        const chunkSize = 1024 * 1024; // 1MB chunks
                                        const chunks = [];
                                        for (let i = 0; i < jsonString.length; i += chunkSize) {
                                          chunks.push(jsonString.slice(i, i + chunkSize));
                                        }
                                        blob = new Blob(chunks, { type: 'application/json' });
                                      } catch (chunkError) {
                                        const sizeInfo = fileSizeMB > 0 ? `File size: ${fileSizeMB.toFixed(2)}MB. ` : '';
                                        throw new Error(`Failed to create file blob after all attempts. ${sizeInfo}This may exceed browser memory limits. Error: ${chunkError.message}`);
                                      }
                                    }
                                  }
                                  
                                  // Verify blob was created successfully
                                  if (!blob || blob.size === 0) {
                                    throw new Error('Failed to create file blob - blob is empty');
                                  }
                                  
                                  // Download the file - this MUST succeed
                                  await new Promise((resolve, reject) => {
                                    try {
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `course-export-metadata-${safeCourseId}.json`;
                                      link.style.display = 'none';
                                      
                                      document.body.appendChild(link);
                                      
                                      // Multiple download trigger strategies
                                      const triggerDownload = () => {
                                        try {
                                          link.click();
                                        } catch (clickError) {
                                          console.warn('Click error, trying alternative method:', clickError);
                                          // Fallback: dispatch mouse event
                                          const event = new MouseEvent('click', {
                                            view: window,
                                            bubbles: true,
                                            cancelable: true,
                                          });
                                          link.dispatchEvent(event);
                                        }
                                      };
                                      
                                      // Try immediate click
                                      triggerDownload();
                                      
                                      // Also try with delay as fallback
                                      setTimeout(() => {
                                        try {
                                          // Clean up after giving browser time to start download
                                          setTimeout(() => {
                                            try {
                                              document.body.removeChild(link);
                                              window.URL.revokeObjectURL(url);
                                            } catch (cleanupError) {
                                              console.warn('Cleanup error (non-critical):', cleanupError);
                                            }
                                            resolve();
                                          }, 500); // Longer delay for large files
                                        } catch (error) {
                                          // Still resolve - download may have started
                                          resolve();
                                        }
                                      }, 200);
                                    } catch (error) {
                                      reject(error);
                                    }
                                  });
                                  
                                  console.log('JSON file download initiated successfully');
                                  // Clear any previous download failure state on success
                                  setDownloadFailed(false);
                                  setDownloadBlob(null);
                                  setDownloadFileName(null);
                                } catch (downloadError) {
                                  // Auto-download failed - store blob for manual download
                                  console.error('Auto-download failed, storing blob for manual download:', downloadError);
                                  setDownloadBlob(blob);
                                  setDownloadFileName(`course-export-metadata-${safeCourseId}.json`);
                                  setDownloadFailed(true);
                                  // Don't throw - allow export to continue, user can download manually
                                  console.warn('Automatic download failed, but export data is ready. Use the download button to download manually.');
                                }
                              } else {
                                const errorMsg = lessonResult?.error || 'Export failed';
                                throw new Error(errorMsg);
                              }
                            }
                          } catch (error) {
                            console.error('Export error:', error);
                            alert(`Export failed: ${error.message}`);
                            setIsExportingMetadata(false);
                            return;
                          }
                          // Only start the course export after JSON download is complete
                          dispatch(startExportingCourse(courseId));
                          setIsExportingMetadata(false);
                        }}
                        iconBefore={ArrowCircleDownIcon}
                      >
                        {isExportingMetadata 
                          ? (exportProgress.total > 0 
                              ? `Exporting  data (${exportProgress.current}/${exportProgress.total})...` 
                              : 'Preparing export...')
                          : intl.formatMessage(messages.buttonTitle)}
                      </Button>
                    </Card.Section>
                  )}
                </Card>
                {downloadFailed && downloadBlob && downloadFileName && (
                  <Card className="mt-3 border-warning">
                    <Card.Section className="px-3 py-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div className="mb-2 mb-md-0" style={{ flex: '1 1 auto', minWidth: '200px' }}>
                          <h5 className="mb-1 text-warning">Export Ready - Manual Download Required</h5>
                          <p className="small text-muted mb-0">
                            Automatic download failed, but your export data is ready. Click the button below to download the JSON file manually.
                          </p>
                        </div>
                        <div className="ml-md-3">
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={() => {
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
                                    // Clear the download state after successful manual download
                                    setDownloadFailed(false);
                                    setDownloadBlob(null);
                                    setDownloadFileName(null);
                                    // Show success message
                                    alert('Download started successfully!');
                                  } catch (cleanupError) {
                                    console.warn('Cleanup error (non-critical):', cleanupError);
                                  }
                                }, 100);
                              } catch (error) {
                                console.error('Manual download failed:', error);
                                alert(`Download failed: ${error.message}. Please try again or contact support.`);
                              }
                            }}
                            iconBefore={ArrowCircleDownIcon}
                          >
                            Download JSON File
                          </Button>
                        </div>
                      </div>
                    </Card.Section>
                  </Card>
                )}
                {exportTriggered && <ExportStepper courseId={courseId} isExportingMetadata={isExportingMetadata} exportProgress={exportProgress} />}
                <ExportFooter />
              </article>
            </Layout.Element>
            <Layout.Element>
              <ExportSidebar courseId={courseId} />
            </Layout.Element>
          </Layout>
        </section>
        <ExportModalError courseId={courseId} />
      </Container>
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={anyRequestFailed}
          isQueryPending={anyRequestInProgress}
          onInternetConnectionFailed={() => null}
        />
      </div>
    </>
  );
};

CourseExportPage.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

CourseExportPage.defaultProps = {};

export default injectIntl(CourseExportPage);
