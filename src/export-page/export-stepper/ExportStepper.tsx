import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';

import CourseStepper from '@src/generic/course-stepper';

import { EXPORT_STAGES } from '../data/constants';
import messages from './messages';
import { useCourseExportContext } from '../CourseExportContext';

const ExportStepper = () => {
  const intl = useIntl();
  const {
    currentStage,
    successDate,
    fetchExportErrorMessage,
    downloadPath,
    isExportingMetadata,
    exportProgress,
  } = useCourseExportContext();

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

  if (localizedSuccessDate && currentStage === EXPORT_STAGES.SUCCESS) {
    successTitleComponent = (
      <>
        {successTitle} ({localizedSuccessDate})
      </>
    );
  }

  const preparingTitle = isExportingMetadata
    ? `Exporting rubric data (${exportProgress.current}/${exportProgress.total})`
    : intl.formatMessage(messages.stepperPreparingTitle);

  const steps = [
    {
      title: preparingTitle,
      description: intl.formatMessage(messages.stepperPreparingDescription),
      key: EXPORT_STAGES.PREPARING,
    },
    {
      title: intl.formatMessage(messages.stepperExportingTitle),
      description: intl.formatMessage(messages.stepperExportingDescription),
      key: EXPORT_STAGES.EXPORTING,
    },
    {
      title: intl.formatMessage(messages.stepperCompressingTitle),
      description: intl.formatMessage(messages.stepperCompressingDescription),
      key: EXPORT_STAGES.COMPRESSING,
    },
    {
      title: successTitle,
      description: intl.formatMessage(messages.stepperSuccessDescription),
      key: EXPORT_STAGES.SUCCESS,
      titleComponent: successTitleComponent,
    },
  ];

  return (
    <div>
      <h3 className="mt-4">{intl.formatMessage(messages.stepperHeaderTitle)}</h3>
      <CourseStepper
        steps={steps}
        activeKey={currentStage}
        errorMessage={fetchExportErrorMessage}
        hasError={!!fetchExportErrorMessage}
      />
      {downloadPath && currentStage === EXPORT_STAGES.SUCCESS && !isExportingMetadata && (
        <Button className="ml-5.5 mt-n2.5" href={downloadPath} download>
          {intl.formatMessage(messages.downloadCourseButtonTitle)}
        </Button>
      )}
    </div>
  );
};

export default ExportStepper;
