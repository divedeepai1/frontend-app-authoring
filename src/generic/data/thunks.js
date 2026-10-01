import { RequestStatus } from '../../data/constants';
import {
  fetchOrganizations,
  updatePostErrors,
  updateLoadingStatuses,
  updateRedirectUrlObj,
  updateCourseRerunData,
  updateSavingStatus,
} from './slice';
import {
  createOrRerunCourse,
  getOrganizations,
  getCourseRerun,
} from './api';
import { createExternalCourse } from '../../compugrade/api';

export function fetchOrganizationsQuery() {
  return async (dispatch) => {
    try {
      const organizations = await getOrganizations();
      dispatch(fetchOrganizations(organizations));
      dispatch(updateLoadingStatuses({ organizationLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch {
      dispatch(updateLoadingStatuses({ organizationLoadingStatus: RequestStatus.FAILED }));
    }
  };
}

export function fetchCourseRerunQuery(courseId) {
  return async (dispatch) => {
    try {
      const courseRerun = await getCourseRerun(courseId);
      dispatch(updateCourseRerunData(courseRerun));
      dispatch(updateLoadingStatuses({ courseRerunLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch {
      dispatch(updateLoadingStatuses({ courseRerunLoadingStatus: RequestStatus.FAILED }));
    }
  };
}

export function updateCreateOrRerunCourseQuery(courseData, isRerun = false, courseType) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      const response = await createOrRerunCourse(courseData);
      if (isRerun) {
        dispatch(updateRedirectUrlObj({ url: '/home' }));
      } else {
        dispatch(updateRedirectUrlObj('url' in response ? response : {}));
      }
      dispatch(updatePostErrors('errMsg' in response ? response : {}));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));

      if (courseType && response.courseKey) {
        try {
          await createExternalCourse(courseData, courseType, response.courseKey);
        } catch (error) {
          // Keep Studio course creation successful even if Compugrade sync fails.
          // eslint-disable-next-line no-console
          console.error('Error creating Compugrade course:', error);
        }
      }

      return true;
    } catch {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}
