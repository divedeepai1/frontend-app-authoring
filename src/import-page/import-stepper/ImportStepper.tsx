import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useEffect, useRef, useState } from 'react';

import CourseStepper from '@src/generic/course-stepper';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { getCourseOutlineIndex } from '@src/course-outline/data/api';

import { IMPORT_STAGES } from '../data/constants';
import messages from './messages';
import { useCourseImportContext } from '../CourseImportContext';
import { processImportedCourse } from '../utils/processImportedCourse';

type ProcessingStatus = 'idle' | 'in_progress' | 'done' | 'failed';

const ImportStepper = () => {
  const intl = useIntl();
  const originalCourseStructureRef = useRef<any>(null);
  const processingStartedRef = useRef(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');

  const { courseId } = useCourseAuthoringContext();
  const {
    progress,
    currentStage,
    formattedErrorMessage,
    anyRequestFailed,
    successDate,
    exportedLessonMetadata,
    fileName,
  } = useCourseImportContext();

  // Capture original outline when import upload starts (cms parity)
  useEffect(() => {
    if (fileName && !originalCourseStructureRef.current && !processingStartedRef.current) {
      getCourseOutlineIndex(courseId)
        .then((outlineIndex) => {
          if (outlineIndex?.courseStructure) {
            originalCourseStructureRef.current = outlineIndex.courseStructure;
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.warn('Failed to fetch original course structure:', error);
        });
    }
  }, [fileName, courseId]);

  // Run Compugrade post-import only after Studio import SUCCESS; gate View Outline on this
  useEffect(() => {
    const shouldProcess = currentStage === IMPORT_STAGES.SUCCESS
      && !processingStartedRef.current
      && courseId;

    if (!shouldProcess) {
      return undefined;
    }

    processingStartedRef.current = true;
    setProcessingStatus('in_progress');

    const timeoutId = setTimeout(async () => {
      try {
        // Fresh outline after Open edX finishes import processing
        const importedOutline = await getCourseOutlineIndex(courseId);
        if (!importedOutline?.courseStructure) {
          setProcessingStatus('failed');
          processingStartedRef.current = false;
          return;
        }

        const courseBlockId = importedOutline.courseStructure.id;
        const result = await processImportedCourse(
          courseId,
          courseBlockId,
          originalCourseStructureRef.current,
          exportedLessonMetadata,
        );

        setProcessingStatus(result?.success ? 'done' : 'failed');
        if (!result?.success) {
          processingStartedRef.current = false;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error processing imported Compugrade lessons:', error);
        setProcessingStatus('failed');
        processingStartedRef.current = false;
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [currentStage, courseId, fileName, exportedLessonMetadata]);

  const handleRedirectCourseOutline = () =>
    window.location.replace(`${getConfig().STUDIO_BASE_URL}/course/${courseId}`);

  const successTitle = intl.formatMessage(messages.stepperSuccessTitle);
  let successTitleComponent;
  const localizedSuccessDate = successDate ?
    (
      <FormattedDate
        value={successDate}
        year="2-digit"
        month="2-digit"
        day="2-digit"
        hour="numeric"
        minute="numeric"
      />
    ) :
    null;
  if (localizedSuccessDate && currentStage === IMPORT_STAGES.SUCCESS) {
    successTitleComponent = (
      <>
        {successTitle} ({localizedSuccessDate})
      </>
    );
  }

  const steps = [
    {
      title: intl.formatMessage(messages.stepperUploadingTitle),
      description: intl.formatMessage(messages.stepperUploadingDescription),
      key: IMPORT_STAGES.UPLOADING,
    },
    {
      title: intl.formatMessage(messages.stepperUnpackingTitle),
      description: intl.formatMessage(messages.stepperUnpackingDescription),
      key: IMPORT_STAGES.UNPACKING,
    },
    {
      title: intl.formatMessage(messages.stepperVerifyingTitle),
      description: intl.formatMessage(messages.stepperVerifyingDescription),
      key: IMPORT_STAGES.VERIFYING,
    },
    {
      title: intl.formatMessage(messages.stepperUpdatingTitle),
      description: intl.formatMessage(messages.stepperUpdatingDescription),
      key: IMPORT_STAGES.UPDATING,
    },
    {
      title: successTitle,
      description: intl.formatMessage(messages.stepperSuccessDescription),
      key: IMPORT_STAGES.SUCCESS,
      titleComponent: successTitleComponent,
    },
  ];

  // Stay on UPDATING until Compugrade post-import finishes (cms parity)
  const activeKey = processingStatus === 'done'
    ? currentStage
    : Math.min(currentStage, IMPORT_STAGES.UPDATING);

  return (
    <section>
      <h3 className="mt-4">{intl.formatMessage(messages.stepperHeaderTitle)}</h3>
      <CourseStepper
        percent={currentStage === IMPORT_STAGES.UPLOADING ? progress : undefined}
        steps={steps}
        activeKey={activeKey}
        hasError={anyRequestFailed || processingStatus === 'failed'}
        errorMessage={formattedErrorMessage}
      />
      {currentStage === IMPORT_STAGES.SUCCESS && processingStatus === 'done' && (
        <Button className="ml-5.5 mt-n2.5" onClick={handleRedirectCourseOutline}>
          {intl.formatMessage(messages.viewOutlineButton)}
        </Button>
      )}
    </section>
  );
};

export default ImportStepper;
