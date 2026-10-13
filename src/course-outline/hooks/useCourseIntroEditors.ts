import { useCallback, useEffect, useState } from 'react';
import {
  fetchCourseDashboardText,
  fetchCourseDescription,
  saveCourseDashboardText,
  saveCourseDescription,
} from '../utils/courseIntroApi';

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
    const fetchCourseDashboard = async () => {
      if (!courseId) {
        return;
      }
      try {
        const text = await fetchCourseDashboardText(courseId);
        setCourseDashboardText(text);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching course dashboard text:', error);
      }
    };
    fetchCourseDashboard();
  }, [courseId]);

  useEffect(() => {
    const fetchDescription = async () => {
      if (!courseId) {
        return;
      }
      try {
        const text = await fetchCourseDescription(courseId);
        setCourseDescriptionText(text);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching course description:', error);
      }
    };
    fetchDescription();
  }, [courseId]);

  const handleCourseDashboardSave = useCallback(async (content: string) => {
    if (!courseId) {
      return;
    }
    setIsSavingCourseDashboard(true);
    try {
      const ok = await saveCourseDashboardText(courseId, content);
      if (!ok) {
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
      const ok = await saveCourseDescription(courseId, content);
      if (!ok) {
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
