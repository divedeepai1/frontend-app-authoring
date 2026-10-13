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
import { downloadExportMetadataJson, valueToJsonBlob } from './utils/chunkedJsonBlob';
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

                                // Chunked Blob download — avoids one giant JSON.stringify
                                try {
                                  await downloadExportMetadataJson(exportMeta, courseId);
                                  setDownloadFailed(false);
                                  setDownloadBlob(null);
                                  setDownloadFileName(null);
                                } catch (downloadError) {
                                  console.error('Auto-download failed, storing blob for manual download:', downloadError);
                                  try {
                                    const safeCourseId = courseId.replace(/[^a-zA-Z0-9-_]/g, '_');
                                    const fallbackBlob = await valueToJsonBlob(exportMeta);
                                    setDownloadBlob(fallbackBlob);
                                    setDownloadFileName(`course-export-metadata-${safeCourseId}.json`);
                                    setDownloadFailed(true);
                                  } catch {
                                    throw downloadError;
                                  }
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
