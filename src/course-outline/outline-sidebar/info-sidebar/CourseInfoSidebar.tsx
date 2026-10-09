import {
  Button,
  Stack,
} from '@openedx/paragon';
import { Edit as EditIcon, SchoolOutline } from '@openedx/paragon/icons';

import { SidebarContent, SidebarTitle } from '@src/generic/sidebar';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseDetails } from '@src/course-outline/data/apiHooks';
import RichTextEditorModal from '@src/compugrade/pages/MultiPartLessonBuilder/components/RichTextEditorModal';
import { useCourseIntroEditors } from '@src/course-outline/hooks/useCourseIntroEditors';

export const CourseInfoSidebar = () => {
  const { courseId } = useCourseAuthoringContext();
  const { data: courseDetails } = useCourseDetails(courseId);
  const {
    isCourseDashboardModalOpen,
    setIsCourseDashboardModalOpen,
    isCourseDescriptionModalOpen,
    setIsCourseDescriptionModalOpen,
    courseDashboardText,
    courseDescriptionText,
    isSavingCourseDashboard,
    isSavingCourseDescription,
    handleCourseDashboardSave,
    handleCourseDescriptionSave,
  } = useCourseIntroEditors(courseId);

  return (
    <>
      <SidebarTitle
        title={courseDetails?.title || ''}
        icon={SchoolOutline}
      />
      <SidebarContent>
        <Stack direction="horizontal" gap={2} className="mt-3 w-100">
          <Button
            variant="outline-primary"
            iconBefore={EditIcon}
            size="sm"
            className="flex-fill"
            onClick={() => setIsCourseDescriptionModalOpen(true)}
          >
            Course Description
          </Button>
          <Button
            variant="outline-primary"
            iconBefore={EditIcon}
            size="sm"
            className="flex-fill"
            onClick={() => setIsCourseDashboardModalOpen(true)}
          >
            Course Dashboard Text
          </Button>
        </Stack>
      </SidebarContent>
      <RichTextEditorModal
        open={isCourseDashboardModalOpen}
        title="Course Dashboard Text"
        initialValue={courseDashboardText}
        onSave={handleCourseDashboardSave}
        onClose={() => setIsCourseDashboardModalOpen(false)}
        saveLabel="Save"
        fromCourseOutline
        editorId="sidebar-course-dashboard-text-editor"
        isSaving={isSavingCourseDashboard}
      />
      <RichTextEditorModal
        open={isCourseDescriptionModalOpen}
        title="Course Description"
        initialValue={courseDescriptionText}
        onSave={handleCourseDescriptionSave}
        onClose={() => setIsCourseDescriptionModalOpen(false)}
        saveLabel="Save"
        fromCourseOutline
        editorId="sidebar-course-description-text-editor"
        isSaving={isSavingCourseDescription}
      />
    </>
  );
};
