import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Button,
  ActionRow,
  Form,
} from '@openedx/paragon';

import messages from './messages';
import { useCourseWeightSettings } from './useCourseWeightSettings';

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
  const w = useCourseWeightSettings({
    isOpen,
    courseId,
    onFetch,
    onSave,
    onSaveSuccess,
    onClose,
  });

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
            value={w.assessmentWeight}
            onChange={w.handleAssessmentChange}
            onKeyDown={(event) => {
              if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+') {
                event.preventDefault();
              }
            }}
            floatingLabel={intl.formatMessage(messages.assessmentWeightLabel)}
            isInvalid={w.showAssessmentError}
            disabled={w.isLoading || w.isSaving}
          />
          {w.showAssessmentError && (
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
            value={w.lessonWeight}
            onChange={w.handleLessonChange}
            onKeyDown={(event) => {
              if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+') {
                event.preventDefault();
              }
            }}
            floatingLabel={intl.formatMessage(messages.lessonWeightLabel)}
            isInvalid={w.showLessonError}
            disabled={w.isLoading || w.isSaving}
          />
          {w.showLessonError && (
            <Form.Control.Feedback type="invalid">
              {intl.formatMessage(messages.validationMessage)}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </ModalDialog.Body>
      <ModalDialog.Footer className="pt-1">
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary" disabled={w.isSaving}>
            {intl.formatMessage(messages.cancelButton)}
          </ModalDialog.CloseButton>
          <Button onClick={w.handleSave} disabled={!w.canSave || !w.isDirty || w.isLoading || w.isSaving}>
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
