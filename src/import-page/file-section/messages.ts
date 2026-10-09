import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.import.file-section.title',
    defaultMessage: 'Select Metadata Course file then upload a .tar.gz file to replace your course content',
  },
  fileChosen: {
    id: 'course-authoring.import.file-section.chosen-file',
    defaultMessage: 'File chosen: {fileName}',
  },
  metadataInstructions: {
    id: 'course-authoring.import.file-section.metadata.instructions',
    defaultMessage: 'If you exported metadata (course-export-metadata-*.json), upload it here so we can read the original course ID and lesson mapping.',
  },
  metadataLabel: {
    id: 'course-authoring.import.file-section.metadata.label',
    defaultMessage: 'Metadata JSON',
  },
  metadataFileChosen: {
    id: 'course-authoring.import.file-section.metadata.chosen',
    defaultMessage: 'Metadata loaded from {fileName}',
  },
  metadataLoaded: {
    id: 'course-authoring.import.file-section.metadata.loaded',
    defaultMessage: 'Metadata ready. Exported course ID: {courseId}',
  },
  metadataInvalidType: {
    id: 'course-authoring.import.file-section.metadata.invalid-type',
    defaultMessage: 'Please select a .json file.',
  },
  metadataInvalidContent: {
    id: 'course-authoring.import.file-section.metadata.invalid-content',
    defaultMessage: 'Could not read metadata file. Ensure it is the exported JSON.',
  },
});

export default messages;
