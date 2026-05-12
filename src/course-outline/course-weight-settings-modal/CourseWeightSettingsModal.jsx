import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Button,
  ActionRow,
  Form,
} from '@openedx/paragon';

import { base_url } from '../../compugrade-constants';
import messages from './messages';

const clampWeight = (value) => Math.min(100, Math.max(0, value));

const parseWeight = (value) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
};

const sanitizeWeightInput = (value) => {
  if (value === '') {
    return '';
  }
  // Allow only digits and a single decimal point.
  const sanitized = value.replace(/[^0-9.]/g, '');
  const firstDotIndex = sanitized.indexOf('.');
  const normalized = firstDotIndex === -1
    ? sanitized
    : `${sanitized.slice(0, firstDotIndex + 1)}${sanitized.slice(firstDotIndex + 1).replace(/\./g, '')}`;
  const parsed = parseWeight(normalized);
  if (parsed === null) {
    return '';
  }
  return clampWeight(parsed).toString();
};

const CourseWeightSettingsModal = ({
  isOpen,
  courseId,
  onClose,
  onFetch,
  onSave,
  onSaveSuccess,
  modalTitle,
  modalDescription,
}) => {
  const intl = useIntl();
  const [assessmentWeight, setAssessmentWeight] = useState('');
  const [lessonWeight, setLessonWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasTouched, setHasTouched] = useState(false);

  useEffect(() => {
    const fetchWeightSettings = async () => {
      if (!isOpen || !courseId) {
        return;
      }

      setIsLoading(true);
      setHasTouched(false);
      try {
        let fetchedAssessment = null;
        let fetchedLesson = null;

        if (onFetch) {
          const fetchedData = await onFetch({ courseId });
          fetchedAssessment = parseWeight(fetchedData?.assessmentWeight);
          fetchedLesson = parseWeight(fetchedData?.lessonWeight);
        } else {
          const params = new URLSearchParams({ course_id: courseId });
          const response = await fetch(
            `${base_url}/api/grading/get_weight_settings?${params.toString()}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );

          if (!response.ok) {
            throw new Error('Failed to fetch weight settings');
          }

          const data = await response.json();
          fetchedAssessment = parseWeight(data?.assessment_weight);
          fetchedLesson = parseWeight(data?.lesson_weight);
        }

        const normalizedAssessment = clampWeight(fetchedAssessment ?? 0);
        const normalizedLesson = fetchedLesson !== null
          ? clampWeight(fetchedLesson)
          : 100 - normalizedAssessment;

        setAssessmentWeight(normalizedAssessment.toString());
        setLessonWeight(normalizedLesson.toString());
      } catch (error) {
        setAssessmentWeight('50');
        setLessonWeight('50');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeightSettings();
  }, [isOpen, courseId, onFetch]);

  const parsedAssessment = parseWeight(assessmentWeight);
  const parsedLesson = parseWeight(lessonWeight);

  const isAssessmentValid = parsedAssessment !== null && parsedAssessment >= 0 && parsedAssessment <= 100;
  const isLessonValid = parsedLesson !== null && parsedLesson >= 0 && parsedLesson <= 100;
  const canSave = isAssessmentValid && isLessonValid && !isLoading && !isSaving;

  const showAssessmentError = hasTouched && !isAssessmentValid;
  const showLessonError = hasTouched && !isLessonValid;

  const isDirty = useMemo(() => {
    if (parsedAssessment === null || parsedLesson === null) {
      return false;
    }
    return parsedAssessment + parsedLesson === 100;
  }, [parsedAssessment, parsedLesson]);

  const handleAssessmentChange = (event) => {
    const nextValue = sanitizeWeightInput(event.target.value);
    setAssessmentWeight(nextValue);

    const parsed = parseWeight(nextValue);
    if (parsed === null) {
      setLessonWeight('');
      return;
    }

    const clamped = clampWeight(parsed);
    const balancedLesson = 100 - clamped;
    setLessonWeight(balancedLesson.toString());
  };

  const handleLessonChange = (event) => {
    const nextValue = sanitizeWeightInput(event.target.value);
    setLessonWeight(nextValue);

    const parsed = parseWeight(nextValue);
    if (parsed === null) {
      setAssessmentWeight('');
      return;
    }

    const clamped = clampWeight(parsed);
    const balancedAssessment = 100 - clamped;
    setAssessmentWeight(balancedAssessment.toString());
  };

  const handleSave = async () => {
    setHasTouched(true);
    if (!canSave || !isDirty || !courseId) {
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave({
          courseId,
          assessmentWeight: parsedAssessment,
        });
      } else {
        const response = await fetch(
          `${base_url}/api/grading/save_course_default_weight_settings`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              course_id: courseId,
              assessment_weight: parsedAssessment,
            }),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to save course weight settings');
        }
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
      onClose();
    } catch (error) {
      setHasTouched(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={false}
      title={modalTitle || intl.formatMessage(messages.title)}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>{modalTitle || intl.formatMessage(messages.title)}</ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p className="small mb-3">{modalDescription || intl.formatMessage(messages.description)}</p>
        <Form.Group className="mb-3">
          <Form.Control
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={assessmentWeight}
            onChange={handleAssessmentChange}
            onKeyDown={(event) => {
              if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+') {
                event.preventDefault();
              }
            }}
            floatingLabel={intl.formatMessage(messages.assessmentWeightLabel)}
            isInvalid={showAssessmentError}
            disabled={isLoading || isSaving}
          />
          {showAssessmentError && (
            <Form.Control.Feedback type="invalid">
              {intl.formatMessage(messages.validationMessage)}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group>
          <Form.Control
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={lessonWeight}
            onChange={handleLessonChange}
            onKeyDown={(event) => {
              if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+') {
                event.preventDefault();
              }
            }}
            floatingLabel={intl.formatMessage(messages.lessonWeightLabel)}
            isInvalid={showLessonError}
            disabled={isLoading || isSaving}
          />
          {showLessonError && (
            <Form.Control.Feedback type="invalid">
              {intl.formatMessage(messages.validationMessage)}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </ModalDialog.Body>
      <ModalDialog.Footer className="pt-1">
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary" disabled={isSaving}>
            {intl.formatMessage(messages.cancelButton)}
          </ModalDialog.CloseButton>
          <Button onClick={handleSave} disabled={!canSave || !isDirty}>
            {intl.formatMessage(messages.saveButton)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

CourseWeightSettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onFetch: PropTypes.func,
  onSave: PropTypes.func,
  onSaveSuccess: PropTypes.func,
  modalTitle: PropTypes.string,
  modalDescription: PropTypes.string,
};

CourseWeightSettingsModal.defaultProps = {
  onFetch: null,
  onSave: null,
  onSaveSuccess: null,
  modalTitle: '',
  modalDescription: '',
};

export default CourseWeightSettingsModal;
