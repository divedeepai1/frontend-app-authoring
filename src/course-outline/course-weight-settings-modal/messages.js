import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.course-outline.course-weight-settings-modal.title',
    defaultMessage: 'Configure course weight settings',
  },
  description: {
    id: 'course-authoring.course-outline.course-weight-settings-modal.description',
    defaultMessage: 'Set default assessment and lesson weights for this course. Total is always 100.',
  },
  assessmentWeightLabel: {
    id: 'course-authoring.course-outline.course-weight-settings-modal.assessment-weight.label',
    defaultMessage: 'Assessment weight',
  },
  lessonWeightLabel: {
    id: 'course-authoring.course-outline.course-weight-settings-modal.lesson-weight.label',
    defaultMessage: 'Lesson weight',
  },
  validationMessage: {
    id: 'course-authoring.course-outline.course-weight-settings-modal.validation',
    defaultMessage: 'Please enter a value between 0 and 100.',
  },
  cancelButton: {
    id: 'course-authoring.course-outline.course-weight-settings-modal.button.cancel',
    defaultMessage: 'Cancel',
  },
  saveButton: {
    id: 'course-authoring.course-outline.course-weight-settings-modal.button.save',
    defaultMessage: 'Save',
  },
  openButton: {
    id: 'course-authoring.course-outline.course-weight-settings-modal.button.open',
    defaultMessage: 'Weight settings',
  },
});

export default messages;
