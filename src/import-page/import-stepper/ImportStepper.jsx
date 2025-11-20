import React, { useEffect, useRef, useState } from 'react';
import {
  FormattedDate,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import { RequestStatus } from '../../data/constants';
import CourseStepper from '../../generic/course-stepper';
import { IMPORT_STAGES } from '../data/constants';
import { fetchImportStatus } from '../data/thunks';
import {
  getCurrentStage, getError, getFileName, getLoadingStatus, getProgress, getSavingStatus, getSuccessDate, getExportedLessonMetadata,
} from '../data/selectors';
import messages from './messages';
import { getCourseOutlineIndex } from '../../course-outline/data/api';
import { processImportedCourse } from '../utils/processImportedCourse';

const ImportStepper = ({ intl, courseId }) => {
  const currentStage = useSelector(getCurrentStage);
  const fileName = useSelector(getFileName);
  const { hasError, message: errorMessage } = useSelector(getError);
  const progress = useSelector(getProgress);
  const dispatch = useDispatch();
  const loadingStatus = useSelector(getLoadingStatus);
  const savingStatus = useSelector(getSavingStatus);
  const successDate = useSelector(getSuccessDate);
  const exportedLessonMetadata = useSelector(getExportedLessonMetadata);
  const isStopFetching = currentStage === IMPORT_STAGES.SUCCESS
    || loadingStatus === RequestStatus.FAILED
    || savingStatus === RequestStatus.FAILED
    || hasError;
  const formattedErrorMessage = hasError ? errorMessage || intl.formatMessage(messages.defaultErrorMessage) : '';
  
  // Store original course structure and track if processing has been done
  const originalCourseStructureRef = useRef(null);
  const processingStartedRef = useRef(false);
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle | in_progress | done | failed

  // Fetch and store original course structure when import starts
  useEffect(() => {
    if (fileName && !originalCourseStructureRef.current && !processingStartedRef.current) {
      getCourseOutlineIndex(courseId)
        .then((outlineIndex) => {
          if (outlineIndex && outlineIndex.courseStructure) {
            originalCourseStructureRef.current = outlineIndex.courseStructure;
          }
        })
        .catch((error) => {
          console.warn('Failed to fetch original course structure:', error);
        });
    }
  }, [fileName, courseId]);

  // Process imported course when import succeeds
  useEffect(() => {
    // Check if we should process the imported course
    const shouldProcess = currentStage === IMPORT_STAGES.SUCCESS && !processingStartedRef.current && courseId;

    if (shouldProcess) {
      processingStartedRef.current = true;
      setProcessingStatus('in_progress');

      const timeoutId = setTimeout(async () => {
        try {
          const importedOutline = await getCourseOutlineIndex(courseId);

          if (importedOutline && importedOutline.courseStructure) {
            const courseBlockId = importedOutline.courseStructure.id;

            const result = await processImportedCourse(
              courseId,
              courseBlockId,
              originalCourseStructureRef.current,
              exportedLessonMetadata
            );

            if (result.success) {
              setProcessingStatus('done');
            } else {
              setProcessingStatus('failed');
            }
          } else {
            setProcessingStatus('failed');
            processingStartedRef.current = false; // Reset to allow retry
          }
        } catch (error) {
          setProcessingStatus('failed');
          processingStartedRef.current = false; // Reset to allow retry
        }
      }, 2000); // Wait 2 seconds for Open edX to complete import processing

      // Cleanup function to clear timeout if component unmounts
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [currentStage, courseId, fileName, exportedLessonMetadata]);

  useEffect(() => {
    const id = setInterval(() => {
      if (isStopFetching) {
        clearInterval(id);
      } else if (fileName) {
        dispatch(fetchImportStatus(courseId, fileName));
      }
    }, 3000);
    return () => clearInterval(id);
  });

  let successTitle = intl.formatMessage(messages.stepperSuccessTitle);
  const localizedSuccessDate = successDate ? (
    <FormattedDate
      value={successDate}
      year="2-digit"
      month="2-digit"
      day="2-digit"
      hour="numeric"
      minute="numeric"
    />
  ) : null;
  if (localizedSuccessDate && currentStage === IMPORT_STAGES.SUCCESS) {
    const successWithDate = (
      <>
        {successTitle} ({localizedSuccessDate})
      </>
    );
    successTitle = successWithDate;
  }

  const handleRedirectCourseOutline = () => window.location.replace(`${getConfig().STUDIO_BASE_URL}/course/${courseId}`);

  const steps = [
    {
      title: intl.formatMessage(messages.stepperUploadingTitle),
      description: intl.formatMessage(messages.stepperUploadingDescription),
      key: IMPORT_STAGES.UPLOADING,
    }, {
      title: intl.formatMessage(messages.stepperUnpackingTitle),
      description: intl.formatMessage(messages.stepperUnpackingDescription),
      key: IMPORT_STAGES.UNPACKING,
    }, {
      title: intl.formatMessage(messages.stepperVerifyingTitle),
      description: intl.formatMessage(messages.stepperVerifyingDescription),
      key: IMPORT_STAGES.VERIFYING,
    }, {
      title: intl.formatMessage(messages.stepperUpdatingTitle),
      description: intl.formatMessage(messages.stepperUpdatingDescription),
      key: IMPORT_STAGES.UPDATING,
    }, {
      title: successTitle,
      description: intl.formatMessage(messages.stepperSuccessDescription),
      key: IMPORT_STAGES.SUCCESS,
    },
  ];

  return (
    <section>
      <h3 className="mt-4">{intl.formatMessage(messages.stepperHeaderTitle)}</h3>
      <CourseStepper
        courseId={courseId}
        percent={currentStage === IMPORT_STAGES.UPLOADING ? progress : null}
        steps={steps}
        activeKey={processingStatus === 'done' ? currentStage : Math.min(currentStage, IMPORT_STAGES.UPDATING)}
        hasError={hasError || processingStatus === 'failed'}
        errorMessage={formattedErrorMessage}
      />
      {currentStage === IMPORT_STAGES.SUCCESS && processingStatus === 'done' && (
        <Button className="ml-5.5 mt-n2.5" onClick={handleRedirectCourseOutline}>{intl.formatMessage(messages.viewOutlineButton)}</Button>
      )}
    </section>
  );
};

ImportStepper.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(ImportStepper);
