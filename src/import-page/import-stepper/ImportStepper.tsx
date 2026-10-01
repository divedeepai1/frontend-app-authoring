import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useEffect, useRef } from 'react';

import CourseStepper from '@src/generic/course-stepper';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import { IMPORT_STAGES } from '../data/constants';
import messages from './messages';
import { useCourseImportContext } from '../CourseImportContext';
import { processImportedCourse } from '../utils/processImportedCourse';

const ImportStepper = () => {
  const intl = useIntl();
  const processedRef = useRef(false);

  const { courseId } = useCourseAuthoringContext();
  const {
    progress,
    currentStage,
    formattedErrorMessage,
    anyRequestFailed,
    successDate,
    exportedLessonMetadata,
    courseBlockId,
  } = useCourseImportContext();

  useEffect(() => {
    const runPostImport = async () => {
      if (currentStage !== IMPORT_STAGES.SUCCESS || processedRef.current || !courseBlockId) {
        return;
      }
      processedRef.current = true;
      try {
        await processImportedCourse(
          courseId,
          courseBlockId,
          null,
          exportedLessonMetadata,
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error processing imported Compugrade lessons:', error);
      }
    };
    runPostImport();
  }, [currentStage, courseId, courseBlockId, exportedLessonMetadata]);

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

  return (
    <section>
      <h3 className="mt-4">{intl.formatMessage(messages.stepperHeaderTitle)}</h3>
      <CourseStepper
        percent={currentStage === IMPORT_STAGES.UPLOADING ? progress : undefined}
        steps={steps}
        activeKey={currentStage}
        hasError={anyRequestFailed}
        errorMessage={formattedErrorMessage}
      />
      {currentStage === IMPORT_STAGES.SUCCESS && (
        <Button className="ml-5.5 mt-n2.5" onClick={handleRedirectCourseOutline}>
          {intl.formatMessage(messages.viewOutlineButton)}
        </Button>
      )}
    </section>
  );
};

export default ImportStepper;
