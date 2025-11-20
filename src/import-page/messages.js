import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pageTitle: {
    id: 'course-authoring.import.page.title',
    defaultMessage: '{headingTitle} | {courseName} | {siteName}',
  },
  headingTitle: {
    id: 'course-authoring.import.heading.title',
    defaultMessage: 'Course import',
  },
  headingSubtitle: {
    id: 'course-authoring.import.heading.subtitle',
    defaultMessage: 'Tools',
  },
  description1: {
    id: 'course-authoring.import.description1',
    defaultMessage: 'Be sure you want to import a course before continuing. The contents of the imported course will replace the contents of the existing course. You cannot undo a course import.',
  },
  description2: {
    id: 'course-authoring.import.description2',
    defaultMessage: 'The course that you import must be having files, a .json file (metadata) and in a .tar.gz file (that is, a .tar file compressed with GNU Zip). This .tar.gz file must contain a course.xml file. It may also contain other files.',
  },
  description3: {
    id: 'course-authoring.import.description3',
    defaultMessage: 'The import process has five stages. During the first two stages, you must stay on this page. You can leave this page after the unpacking stage has completed. We recommend, however, that you don\'t make important changes to your course until the import operation has completed.',
  },
});

export default messages;
