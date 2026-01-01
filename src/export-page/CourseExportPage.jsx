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
                                
                                // Use a more robust download method for large files
                                try {
                                  const safeCourseId = courseId.replace(/[^a-zA-Z0-9-_]/g, '_');
                                  
                                  // Stringify with error handling for circular references
                                  let jsonString;
                                  try {
                                    jsonString = JSON.stringify(exportMeta, null, 2);
                                  } catch (stringifyError) {
                                    // If stringify fails, try without pretty printing
                                    try {
                                      jsonString = JSON.stringify(exportMeta);
                                    } catch (secondStringifyError) {
                                      throw new Error(`Failed to stringify export data. This may indicate the file is too large or contains circular references. Error: ${stringifyError.message}`);
                                    }
                                  }
                                  
                                  // Check file size and warn if very large
                                  const fileSizeMB = new Blob([jsonString]).size / (1024 * 1024);
                                  const WARNING_SIZE_MB = 100; // Warn if > 100MB
                                  const MAX_RECOMMENDED_SIZE_MB = 500; // Hard limit recommendation
                                  
                                  if (fileSizeMB > MAX_RECOMMENDED_SIZE_MB) {
                                    console.warn(`File size is very large: ${fileSizeMB.toFixed(2)}MB. Download may fail due to browser memory limits.`);
                                  }
                                  
                                  // Create blob with proper error handling
                                  let blob;
                                  try {
                                    blob = new Blob([jsonString], { type: 'application/json' });
                                  } catch (blobError) {
                                    // Fallback: try with Uint8Array for very large files
                                    try {
                                      const encoder = new TextEncoder();
                                      const data = encoder.encode(jsonString);
                                      blob = new Blob([data], { type: 'application/json' });
                                    } catch (uint8Error) {
                                      throw new Error(`Failed to create file blob. File size: ${fileSizeMB.toFixed(2)}MB. This may exceed browser memory limits. Error: ${blobError.message}`);
                                    }
                                  }
                                  
                                  // Verify blob was created successfully
                                  if (!blob || blob.size === 0) {
                                    throw new Error('Failed to create file blob - blob is empty');
                                  }
                                  
                                  // Log file size for debugging
                                  console.log(`Export file size: ${(blob.size / (1024 * 1024)).toFixed(2)}MB`);
                                  
                                  // Use a promise-based approach for better reliability
                                  await new Promise((resolve, reject) => {
                                    try {
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `course-export-metadata-${safeCourseId}.json`;
                                      link.style.display = 'none';
                                      
                                      document.body.appendChild(link);
                                      
                                      // Trigger download and clean up
                                      // Use multiple strategies to ensure download starts
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
                                      
                                      // Try immediate click first
                                      triggerDownload();
                                      
                                      // Also try with a small delay as fallback
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
                                          }, 300);
                                        } catch (error) {
                                          // Still resolve - download may have started
                                          resolve();
                                        }
                                      }, 100);
                                    } catch (error) {
                                      reject(error);
                                    }
                                  });
                                } catch (downloadError) {
                                  console.error('Error downloading JSON file:', downloadError);
                                  // Data is already saved to sessionStorage, so user can still access it
                                  alert(`Export completed but automatic download failed. The data has been saved and you can export it manually. Error: ${downloadError.message}`);
                                }
                              } else {
                                throw new Error(lessonResult?.error || 'Export failed');
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
