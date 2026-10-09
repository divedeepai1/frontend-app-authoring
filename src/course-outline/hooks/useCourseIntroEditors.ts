import { useCallback, useEffect, useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { fetchCsrfToken } from '@src/cms-csrftoken';

/**
 * Shared Compugrade course description / dashboard text fetch+save (cms Studio myplugin APIs).
 */
export const useCourseIntroEditors = (courseId?: string) => {
  const [isCourseDashboardModalOpen, setIsCourseDashboardModalOpen] = useState(false);
  const [isCourseDescriptionModalOpen, setIsCourseDescriptionModalOpen] = useState(false);
  const [courseDashboardText, setCourseDashboardText] = useState('');
  const [courseDescriptionText, setCourseDescriptionText] = useState('');
  const [isSavingCourseDashboard, setIsSavingCourseDashboard] = useState(false);
  const [isSavingCourseDescription, setIsSavingCourseDescription] = useState(false);

  useEffect(() => {
    const fetchCourseDashboardText = async () => {
      if (!courseId) {
        return;
      }
      try {
        const token = await fetchCsrfToken();
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/myplugin/courses/${encodeURIComponent(courseId)}/intro-text/`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': token,
            },
          },
        );
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setCourseDashboardText(
          data?.course_intro_text
          || data?.intro_text
          || data?.courseIntroText
          || '',
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching course dashboard text:', error);
      }
    };
    fetchCourseDashboardText();
  }, [courseId]);

  useEffect(() => {
    const fetchCourseDescription = async () => {
      if (!courseId) {
        return;
      }
      try {
        const token = await fetchCsrfToken();
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/myplugin/courses/${encodeURIComponent(courseId)}/description/`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': token,
            },
          },
        );
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setCourseDescriptionText(
          data?.description
          || data?.course_description
          || data?.courseDescription
          || '',
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching course description:', error);
      }
    };
    fetchCourseDescription();
  }, [courseId]);

  const handleCourseDashboardSave = useCallback(async (content: string) => {
    if (!courseId) {
      return;
    }
    setIsSavingCourseDashboard(true);
    try {
      const token = await fetchCsrfToken();
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/courses/${encodeURIComponent(courseId)}/update-intro-text/`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': token,
          },
          body: JSON.stringify({ course_intro_text: content }),
        },
      );
      if (!response.ok) {
        return;
      }
      setCourseDashboardText(content);
      setIsCourseDashboardModalOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving course dashboard text:', error);
    } finally {
      setIsSavingCourseDashboard(false);
    }
  }, [courseId]);

  const handleCourseDescriptionSave = useCallback(async (content: string) => {
    if (!courseId) {
      return;
    }
    setIsSavingCourseDescription(true);
    try {
      const token = await fetchCsrfToken();
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/courses/${encodeURIComponent(courseId)}/update-description/`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': token,
          },
          body: JSON.stringify({ course_description: content }),
        },
      );
      if (!response.ok) {
        return;
      }
      setCourseDescriptionText(content);
      setIsCourseDescriptionModalOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving course description:', error);
    } finally {
      setIsSavingCourseDescription(false);
    }
  }, [courseId]);

  return {
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
  };
};
