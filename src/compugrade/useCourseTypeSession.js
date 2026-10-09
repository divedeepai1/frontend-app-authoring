import { useEffect } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { fetchCsrfToken } from '@src/cms-csrftoken';

const normalizeCourseType = (courseType) => {
  if (courseType === 'ms_powerpoint' || courseType === 'google_slides') {
    return 'powerpoint';
  }
  if (courseType === 'ms_excel' || courseType === 'google_sheets') {
    return 'excel';
  }
  if (courseType === 'ms_word' || courseType === 'google_docs') {
    return 'ms-word';
  }
  return courseType;
};

/**
 * Fetches `/myplugin/courses/` and stores courseType/courseTitle in sessionStorage.
 * Matches cms-edx-frontend CourseOutline + CourseUnit behavior.
 */
export function useCourseTypeSession(courseId) {
  useEffect(() => {
    if (!courseId) {
      return undefined;
    }

    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 1000;
    let retryTimer;

    const fetchCourseType = async () => {
      try {
        const token = await fetchCsrfToken();
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/myplugin/courses/`,
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
          throw new Error(`Request failed with status ${response.status}`);
        }

        const courses = await response.json();
        const currentCourse = (Array.isArray(courses) ? courses : []).find(
          (course) => course.id === courseId,
        );

        if (currentCourse?.course_type) {
          const courseType = normalizeCourseType(currentCourse.course_type);
          sessionStorage.setItem('courseTitle', currentCourse.display_name || '');
          sessionStorage.setItem('courseType', courseType);
          return;
        }

        retryCount += 1;
        if (retryCount < MAX_RETRIES && isMounted) {
          retryTimer = setTimeout(fetchCourseType, RETRY_DELAY);
        } else if (isMounted) {
          sessionStorage.setItem('courseType', 'ms-word');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching course type:', error);
        retryCount += 1;
        if (retryCount < MAX_RETRIES && isMounted) {
          retryTimer = setTimeout(fetchCourseType, RETRY_DELAY);
        } else if (isMounted) {
          sessionStorage.setItem('courseType', 'ms-word');
        }
      }
    };

    fetchCourseType();

    return () => {
      isMounted = false;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [courseId]);
}
