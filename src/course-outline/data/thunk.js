import { RequestStatus } from "../../data/constants";
import { updateClipboardData } from "../../generic/data/slice";
import { NOTIFICATION_MESSAGES } from "../../constants";
import { API_ERROR_TYPES, COURSE_BLOCK_NAMES } from "../constants";
import {
  hideProcessingNotification,
  showProcessingNotification,
} from "../../generic/processing-notification/data/slice";
import {
  getCourseBestPracticesChecklist,
  getCourseLaunchChecklist,
} from "../utils/getChecklistForStatusBar";
import {
  addNewCourseItem,
  deleteCourseItem,
  duplicateCourseItem,
  editItemDisplayName,
  enableCourseHighlightsEmails,
  getCourseBestPractices,
  getCourseLaunch,
  getCourseOutlineIndex,
  getCourseItem,
  publishCourseSection,
  configureCourseSection,
  configureCourseSubsection,
  configureCourseUnit,
  restartIndexingOnCourse,
  updateCourseSectionHighlights,
  setSectionOrderList,
  setVideoSharingOption,
  setCourseItemOrderList,
  pasteBlock,
  dismissNotification,
} from "./api";
import {
  addSection,
  addSubsection,
  fetchOutlineIndexSuccess,
  updateOutlineIndexLoadingStatus,
  updateReindexLoadingStatus,
  updateStatusBar,
  updateCourseActions,
  fetchStatusBarChecklistSuccess,
  fetchStatusBarSelPacedSuccess,
  updateSavingStatus,
  updateSectionList,
  updateFetchSectionLoadingStatus,
  deleteSection,
  deleteSubsection,
  deleteUnit,
  duplicateSection,
  reorderSectionList,
  setPasteFileNotices,
  updateCourseLaunchQueryStatus,
} from "./slice";
import { base_url } from "../../compugrade-constants";
import axios from "axios";
import { duplicateRubricData } from "../utils/duplicateRubricData";

const getErrorDetails = (error, dismissible = true) => {
  const errorInfo = { dismissible };
  if (error.response?.data) {
    const { data } = error.response;
    if (
      (typeof data === "string" && !data.includes("</html>")) ||
      typeof data === "object"
    ) {
      errorInfo.data = JSON.stringify(data);
    }
    errorInfo.status = error.response.status;
    errorInfo.type = API_ERROR_TYPES.serverError;
  } else if (error.request) {
    errorInfo.type = API_ERROR_TYPES.networkError;
  } else {
    errorInfo.type = API_ERROR_TYPES.unknown;
    errorInfo.data = error.message;
  }
  return errorInfo;
};

export function fetchCourseOutlineIndexQuery(courseId) {
  return async (dispatch) => {
    dispatch(
      updateOutlineIndexLoadingStatus({ status: RequestStatus.IN_PROGRESS })
    );

    try {
      const outlineIndex = await getCourseOutlineIndex(courseId);
      const {
        courseReleaseDate,
        courseStructure: {
          highlightsEnabledForMessaging,
          videoSharingEnabled,
          videoSharingOptions,
          actions,
        },
      } = outlineIndex;
      dispatch(fetchOutlineIndexSuccess(outlineIndex));
      dispatch(updateClipboardData(outlineIndex.initialUserClipboard));
      dispatch(
        updateStatusBar({
          courseReleaseDate,
          highlightsEnabledForMessaging,
          videoSharingOptions,
          videoSharingEnabled,
        })
      );
      dispatch(updateCourseActions(actions));

      dispatch(
        updateOutlineIndexLoadingStatus({ status: RequestStatus.SUCCESSFUL })
      );
    } catch (error) {
      dispatch(
        updateOutlineIndexLoadingStatus({
          status: RequestStatus.FAILED,
          errors: getErrorDetails(error, false),
        })
      );
    }
  };
}

export function fetchCourseLaunchQuery({
  courseId,
  gradedOnly = true,
  validateOras = true,
  all = true,
}) {
  return async (dispatch) => {
    dispatch(
      updateCourseLaunchQueryStatus({ status: RequestStatus.IN_PROGRESS })
    );
    try {
      const data = await getCourseLaunch({
        courseId,
        gradedOnly,
        validateOras,
        all,
      });
      dispatch(
        fetchStatusBarSelPacedSuccess({ isSelfPaced: data.isSelfPaced })
      );
      dispatch(fetchStatusBarChecklistSuccess(getCourseLaunchChecklist(data)));

      dispatch(
        updateCourseLaunchQueryStatus({ status: RequestStatus.SUCCESSFUL })
      );
    } catch (error) {
      dispatch(
        updateCourseLaunchQueryStatus({
          status: RequestStatus.FAILED,
          errors: getErrorDetails(error),
        })
      );
    }
  };
}

export function fetchCourseBestPracticesQuery({
  courseId,
  excludeGraded = true,
  all = true,
}) {
  return async (dispatch) => {
    try {
      const data = await getCourseBestPractices({
        courseId,
        excludeGraded,
        all,
      });
      dispatch(
        fetchStatusBarChecklistSuccess(getCourseBestPracticesChecklist(data))
      );

      return true;
    } catch (error) {
      return false;
    }
  };
}

export function enableCourseHighlightsEmailsQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await enableCourseHighlightsEmails(courseId);
      dispatch(fetchCourseOutlineIndexQuery(courseId));

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      dispatch(hideProcessingNotification());
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function setVideoSharingOptionQuery(courseId, option) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await setVideoSharingOption(courseId, option);
      dispatch(updateStatusBar({ videoSharingOptions: option }));

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      dispatch(hideProcessingNotification());
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      dispatch(hideProcessingNotification());
    }
  };
}

export function fetchCourseReindexQuery(courseId, reindexLink) {
  return async (dispatch) => {
    dispatch(updateReindexLoadingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      await restartIndexingOnCourse(reindexLink);
      dispatch(
        updateReindexLoadingStatus({ status: RequestStatus.SUCCESSFUL })
      );
    } catch (error) {
      dispatch(
        updateReindexLoadingStatus({
          status: RequestStatus.FAILED,
          errors: getErrorDetails(error),
        })
      );
    }
  };
}

export function fetchCourseSectionQuery(sectionIds, shouldScroll = false) {
  return async (dispatch) => {
    dispatch(
      updateFetchSectionLoadingStatus({ status: RequestStatus.IN_PROGRESS })
    );
    try {
      const sections = {};
      const results = await Promise.all(
        sectionIds.map((sectionId) => getCourseItem(sectionId))
      );
      results.forEach((data) => {
        // eslint-disable-next-line no-param-reassign
        data.shouldScroll = shouldScroll;
        sections[data.id] = data;
      });
      dispatch(updateSectionList(sections));
      dispatch(
        updateFetchSectionLoadingStatus({ status: RequestStatus.SUCCESSFUL })
      );
    } catch (error) {
      dispatch(
        updateFetchSectionLoadingStatus({
          status: RequestStatus.FAILED,
          errors: getErrorDetails(error),
        })
      );
    }
  };
}

export function updateCourseSectionHighlightsQuery(sectionId, highlights) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await updateCourseSectionHighlights(sectionId, highlights).then(
        async (result) => {
          if (result) {
            await dispatch(fetchCourseSectionQuery([sectionId]));
            dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
            dispatch(hideProcessingNotification());
          }
        }
      );
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function publishCourseItemQuery(itemId, sectionId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await publishCourseSection(itemId).then(async (result) => {
        if (result) {
          await dispatch(fetchCourseSectionQuery([sectionId]));
          dispatch(hideProcessingNotification());
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function configureCourseItemQuery(sectionId, configureFn) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await configureFn().then(async (result) => {
        if (result) {
          await dispatch(fetchCourseSectionQuery([sectionId]));
          dispatch(hideProcessingNotification());
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function configureCourseSectionQuery(
  sectionId,
  isVisibleToStaffOnly,
  startDatetime
) {
  return async (dispatch) => {
    dispatch(
      configureCourseItemQuery(sectionId, async () =>
        configureCourseSection(sectionId, isVisibleToStaffOnly, startDatetime)
      )
    );
  };
}

export function configureCourseSubsectionQuery(
  itemId,
  sectionId,
  isVisibleToStaffOnly,
  releaseDate,
  graderType,
  dueDate,
  isTimeLimited,
  isProctoredExam,
  isOnboardingExam,
  isPracticeExam,
  examReviewRules,
  defaultTimeLimitMin,
  hideAfterDue,
  showCorrectness,
  isPrereq,
  prereqUsageKey,
  prereqMinScore,
  prereqMinCompletion
) {
  return async (dispatch) => {
    dispatch(
      configureCourseItemQuery(sectionId, async () =>
        configureCourseSubsection(
          itemId,
          isVisibleToStaffOnly,
          releaseDate,
          graderType,
          dueDate,
          isTimeLimited,
          isProctoredExam,
          isOnboardingExam,
          isPracticeExam,
          examReviewRules,
          defaultTimeLimitMin,
          hideAfterDue,
          showCorrectness,
          isPrereq,
          prereqUsageKey,
          prereqMinScore,
          prereqMinCompletion
        )
      )
    );
  };
}

export function configureCourseUnitQuery(
  itemId,
  sectionId,
  isVisibleToStaffOnly,
  groupAccess,
  discussionEnabled
) {
  return async (dispatch) => {
    dispatch(
      configureCourseItemQuery(sectionId, async () =>
        configureCourseUnit(
          itemId,
          isVisibleToStaffOnly,
          groupAccess,
          discussionEnabled
        )
      )
    );
  };
}

export function editCourseItemQuery(itemId, sectionId, displayName,namePrefix) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await editItemDisplayName(itemId, displayName).then(async (result) => {
        if (result) {
          await dispatch(fetchCourseSectionQuery([sectionId]));
          dispatch(hideProcessingNotification());
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));

          const apiResponse = await fetch(
            base_url + `/api/openedx/${namePrefix == "subsection"? "update_subsection" : namePrefix == "section" ?"update_section":"update_rubric"}`,
            {
              method: "PATCH",
              headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                openedx_based_id: itemId,
                title: displayName,
              }),
            }
          );
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

/**
 * Generic function to delete course item, see below wrapper funcs for specific implementations.
 * @param {string} itemId
 * @param {() => {}} deleteItemFn
 * @returns {}
 */
function deleteCourseItemQuery(itemId, deleteItemFn,name) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));

    

    try {
      await deleteCourseItem(itemId);
      if(name =="subsection" || name=="unit" || name =="section"){
      const encodedUnitId = encodeURIComponent(itemId);

      const apiResponse = await fetch(
        base_url + `/api/openedx/${name =="unit" ? "delete_rubric" : name =="section"?"delete_section":"delete_subsection"}?${name=="unit" || name =="section"?"openedx_based_id" :"subsection_openedx_id"}=${encodedUnitId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        }
      );
    }

      dispatch(deleteItemFn());
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function deleteCourseSectionQuery(sectionId) {
  return async (dispatch) => {
    dispatch(
      deleteCourseItemQuery(sectionId, () =>
        deleteSection({ itemId: sectionId }),name="section"
      )
    );
  };
}

export function deleteCourseSubsectionQuery(subsectionId, sectionId) {
  return async (dispatch) => {
    dispatch(
      deleteCourseItemQuery(subsectionId, () =>
        deleteSubsection({ itemId: subsectionId, sectionId }),name="subsection"
      )
    );
  };
}

export function deleteCourseUnitQuery(unitId, subsectionId, sectionId) {
  return async (dispatch) => {
    dispatch(
      deleteCourseItemQuery(unitId, () =>
        deleteUnit({ itemId: unitId, subsectionId, sectionId }),name="unit"
      )
    );
  };
}

/**
 * Generic function to duplicate any course item. See wrapper functions below for specific implementations.
 * @param {string} itemId
 * @param {string} parentLocator
 * @param {(locator) => Promise<any>} duplicateFn
 * @returns {}
 */
function duplicateCourseItemQuery(itemId, parentLocator, duplicateFn) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.duplicating));

    try {
      await duplicateCourseItem(itemId, parentLocator).then(async (result) => {
        if (result) {
          await duplicateFn(result.locator);
          dispatch(hideProcessingNotification());
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function duplicateSectionQuery(sectionId, courseBlockId, courseId) {
  return async (dispatch) => {
    dispatch(
      duplicateCourseItemQuery(sectionId, courseBlockId, async (duplicatedSectionLocator) => {
        const duplicatedSection = await getCourseItem(duplicatedSectionLocator);
        // Page should scroll to newly duplicated item.
        duplicatedSection.shouldScroll = true;
        dispatch(duplicateSection({ id: sectionId, duplicatedItem: duplicatedSection }));
        
        // Create in integrated backend
        if (courseId) {
          try {
            // Remove "Duplicate of" from name if present
            let sectionTitle = duplicatedSection.displayName;
            sectionTitle = sectionTitle.replace(/^Duplicate of ['"]/i, '').replace(/['"]$/, '').trim();
            
            // Update name in Open edX if changed
            if (sectionTitle !== duplicatedSection.displayName) {
              await editItemDisplayName(duplicatedSectionLocator, sectionTitle);
            }
            
            const response = await fetch(base_url + "/api/openedx/create_section", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: sectionTitle,
                openedx_based_id: duplicatedSection.id,
                course_id: courseId,
              }),
            });
            if (!response.ok) {
              console.error("Error creating section in integrated backend:", await response.text());
            } else {
              if (sectionTitle !== duplicatedSection.displayName) {
                // Update title in integrated backend too
                await fetch(base_url + `/api/openedx/update_section`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    openedx_based_id: duplicatedSection.id,
                    title: sectionTitle,
                  }),
                });
              }
              
              // Wait for Open edX to finish duplicating all subsections and units
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Fetch the duplicated section with all children
              const duplicatedSectionWithChildren = await getCourseItem(duplicatedSectionLocator);
              const originalSection = await getCourseItem(sectionId);
              
              // Process all subsections and their units
              if (duplicatedSectionWithChildren?.childInfo?.children && originalSection?.childInfo?.children) {
                const duplicatedSubsections = duplicatedSectionWithChildren.childInfo.children;
                const originalSubsections = originalSection.childInfo.children;
                
                for (let subIdx = 0; subIdx < duplicatedSubsections.length; subIdx++) {
                  const duplicatedSubsection = duplicatedSubsections[subIdx];
                  const originalSubsection = originalSubsections[subIdx];
                  
                  if (!originalSubsection) continue;
                  
                  try {
                    // Remove "Duplicate of" from subsection name
                    let subsectionTitle = duplicatedSubsection.displayName;
                    subsectionTitle = subsectionTitle.replace(/^Duplicate of ['"]/i, '').replace(/['"]$/, '').trim();
                    
                    // Create subsection in integrated backend
                    const subsectionResponse = await fetch(base_url + "/api/openedx/create_subsection", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        title: subsectionTitle,
                        openedx_based_id: duplicatedSubsection.id,
                        course_id: courseId,
                        section_id: duplicatedSectionLocator,
                      }),
                    });
                    
                    if (subsectionResponse.ok && originalSubsection?.childInfo?.children) {
                      // Get the duplicated subsection with units
                      const duplicatedSubsectionWithUnits = await getCourseItem(duplicatedSubsection.id);
                      const originalUnits = originalSubsection.childInfo.children;
                      const duplicatedUnits = duplicatedSubsectionWithUnits?.childInfo?.children || [];
                      
                      // Process all units in this subsection
                      for (let unitIdx = 0; unitIdx < duplicatedUnits.length; unitIdx++) {
                        const duplicatedUnit = duplicatedUnits[unitIdx];
                        const originalUnit = originalUnits[unitIdx];
                        
                        if (!originalUnit) continue;
                        
                        try {
                          // Create rubric in integrated backend
                          const rubricResponse = await fetch(base_url + "/api/openedx/create_rubric", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              openedx_based_id: duplicatedUnit.id,
                              course_id: courseId,
                              user_id: 1,
                              subsection_id: duplicatedSubsection.id,
                            }),
                          });
                          
                          if (rubricResponse.ok) {
                            // Copy rubric data from original to new rubric
                            const duplicateResult = await duplicateRubricData(originalUnit.id, duplicatedUnit.id);
                            if (!duplicateResult.success) {
                              console.error("Error duplicating rubric data:", duplicateResult.error);
                            }
                          }
                        } catch (error) {
                          console.error("Error creating rubric for unit:", error);
                        }
                      }
                    }
                  } catch (error) {
                    console.error("Error creating subsection:", error);
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error creating section in integrated backend:", error);
          }
        }
      })
    );
  };
}

export function duplicateSubsectionQuery(subsectionId, sectionId, courseId) {
  return async (dispatch) => {
    dispatch(
      duplicateCourseItemQuery(subsectionId, sectionId, async (duplicatedSubsectionLocator) => {
        // Fetch the duplicated subsection data (Open edX already duplicates child units)
        const duplicatedSubsection = await getCourseItem(duplicatedSubsectionLocator);
        
        // Helper to extract parts from display name
        const extractParts = (titleValue) => {
          const match = (titleValue || '').match(/^(Unit|Chapter|Lesson)?\s*(\d+(?:\.\d+)?)?\s*(.*)/i);
          const typePart = match ? match[1] : '';
          const numberPart = match ? match[2] : '';
          // Remove "Duplicate of" prefix if present
          let stringPart = match ? match[3] : titleValue;
          stringPart = stringPart.replace(/^Duplicate of ['"]/i, '').replace(/['"]$/, '').trim();
          return { typePart, numberPart, stringPart };
        };
        
        // Create subsection in integrated backend
        if (courseId) {
          try {
            // Remove "Duplicate of" from subsection name if present
            let subsectionTitle = duplicatedSubsection.displayName;
            subsectionTitle = subsectionTitle.replace(/^Duplicate of ['"]/i, '').replace(/['"]$/, '').trim();
            
            const response = await fetch(base_url + "/api/openedx/create_subsection", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: subsectionTitle,
                openedx_based_id: duplicatedSubsection.id,
                course_id: courseId,
                section_id: sectionId,
              }),
            });
            if (!response.ok) {
              console.error("Error creating subsection in integrated backend:", await response.text());
            }
            
            // Wait a bit for Open edX to finish duplicating child units
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Fetch the duplicated subsection again to get all child units
            const duplicatedSubsectionWithChildren = await getCourseItem(duplicatedSubsectionLocator);
            
            // Create rubrics for all duplicated units and fix their names
            if (duplicatedSubsectionWithChildren?.childInfo?.children) {
              const units = duplicatedSubsectionWithChildren.childInfo.children;
              
              // Get original units for copying data
              const originalSubsection = await getCourseItem(subsectionId);
              const originalUnits = originalSubsection?.childInfo?.children || [];
              
              // First, create all rubrics in backend and copy data
              for (let idx = 0; idx < units.length; idx++) {
                const unit = units[idx];
                const originalUnit = originalUnits[idx];
                
                try {
                  // Create rubric in integrated backend
                  const rubricResponse = await fetch(base_url + "/api/openedx/create_rubric", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      openedx_based_id: unit.id,
                      course_id: courseId,
                      user_id: 1,
                      subsection_id: duplicatedSubsectionLocator,
                    }),
                  });
                  if (!rubricResponse.ok) {
                    console.error("Error creating rubric in integrated backend:", await rubricResponse.text());
                  } else if (originalUnit) {
                    // Copy rubric data from original to new rubric
                    const duplicateResult = await duplicateRubricData(originalUnit.id, unit.id);
                    if (!duplicateResult.success) {
                      console.error("Error duplicating rubric data:", duplicateResult.error);
                    }
                  }
                } catch (error) {
                  console.error("Error creating rubric:", error);
                }
              }
              
              // Then, renumber and rename all units to remove "Duplicate of" and fix numbering
              // Find subsection index in section to calculate proper numbering
              const section = await getCourseItem(sectionId);
              const subsectionIndex = (section?.childInfo?.children || []).findIndex(
                ss => ss.id === duplicatedSubsectionLocator
              );
              
              for (let idx = 0; idx < units.length; idx++) {
                const duplicatedUnit = units[idx];
                const originalUnit = originalUnits[idx];
                
                if (originalUnit) {
                  // Extract original name parts (without "Duplicate of")
                  const { typePart, stringPart } = extractParts(originalUnit.displayName);
                  const typeLabel = typePart || 'Lesson';
                  const newNumberPrefix = `${subsectionIndex + 1}.${idx + 1}`;
                  const newDisplayName = [typeLabel, newNumberPrefix, stringPart].filter(Boolean).join(' ');
                  
                  // Update unit name in Open edX to remove "Duplicate of" and fix numbering
                  if (newDisplayName !== duplicatedUnit.displayName) {
                    try {
                      await editItemDisplayName(duplicatedUnit.id, newDisplayName);
                      // Update in integrated backend
                      await fetch(base_url + `/api/openedx/update_rubric`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          openedx_based_id: duplicatedUnit.id,
                          title: newDisplayName,
                        }),
                      });
                    } catch (error) {
                      console.error("Error updating unit name:", error);
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error creating subsection in integrated backend:", error);
          }
        }
        
        // Refresh the section to show duplicated items with correct names
        await dispatch(fetchCourseSectionQuery([sectionId], true));
      })
    );
  };
}

export function duplicateUnitQuery(unitId, subsectionId, sectionId, courseId) {
  return async (dispatch) => {
    dispatch(
      duplicateCourseItemQuery(unitId, subsectionId, async (duplicatedUnitLocator) => {
        // Create rubric in integrated backend
        if (courseId) {
          try {
            const duplicatedUnit = await getCourseItem(duplicatedUnitLocator);
            const originalUnit = await getCourseItem(unitId);
            
            // Remove "Duplicate of" from name if present
            let unitTitle = duplicatedUnit.displayName;
            unitTitle = unitTitle.replace(/^Duplicate of ['"]/i, '').replace(/['"]$/, '').trim();
            
            // If name was changed, update it in Open edX
            if (unitTitle !== duplicatedUnit.displayName) {
              await editItemDisplayName(duplicatedUnitLocator, unitTitle);
            }
            
            const response = await fetch(base_url + "/api/openedx/create_rubric", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                openedx_based_id: duplicatedUnitLocator,
                course_id: courseId,
                user_id: 1,
                subsection_id: subsectionId,
              }),
            });
            if (!response.ok) {
              console.error("Error creating rubric in integrated backend:", await response.text());
            } else {
              if (unitTitle !== duplicatedUnit.displayName) {
                // Update title in integrated backend too
                await fetch(base_url + `/api/openedx/update_rubric`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    openedx_based_id: duplicatedUnitLocator,
                    title: unitTitle,
                  }),
                });
              }
              
              // Copy rubric data from original to new rubric
              const duplicateResult = await duplicateRubricData(unitId, duplicatedUnitLocator);
              if (!duplicateResult.success) {
                console.error("Error duplicating rubric data:", duplicateResult.error);
              }
            }
          } catch (error) {
            console.error("Error creating rubric in integrated backend:", error);
          }
        }
        
        // Refresh the section to show duplicated item
        await dispatch(fetchCourseSectionQuery([sectionId], true));
      })
    );
  };
}

/**
 * Generic function to add any course item. See wrapper functions below for specific implementations.
 * @param {string} parentLocator
 * @param {string} category
 * @param {string} displayName
 * @param {(data) => {}} addItemFn
 * @returns {}
 */
function addNewCourseItemQuery(
  parentLocator,
  category,
  displayName,
  addItemFn
) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await addNewCourseItem(parentLocator, category, displayName).then(
        async (result) => {
          if (result) {
            await addItemFn(result);
            dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
            dispatch(hideProcessingNotification());
          }
        }
      );
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function addNewSectionQuery(parentLocator,courseId) {
  return async (dispatch) => {
    dispatch(
      addNewCourseItemQuery(
        parentLocator,
        COURSE_BLOCK_NAMES.chapter.id,
        COURSE_BLOCK_NAMES.chapter.name,
        async (result) => {
          console.log(result);

          const data = await getCourseItem(result.locator);
          console.log("DATA", data);
          try {
            const response = await fetch(base_url + "/api/openedx/create_section", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: data.displayName,
                openedx_based_id: data.id,
                course_id: courseId,
              }),
            });
          
            if (!response.ok) {
              // Handle non-2xx responses
              const errorData = await response.json();
              console.error("Error in API call:", errorData);
            } else {
              const responseData = await response.json();
              console.log("API call successful:", responseData);
            }
          } catch (error) {
            // Handle network or other errors
            console.error("Error in API call:", error.message);
          }

          // Page should scroll to newly created section.
          data.shouldScroll = true;
          dispatch(addSection(data));
        }
      )
    );
  };
}

export function addNewSubsectionQuery(parentLocator, courseId) {
  return async (dispatch) => {
    dispatch(
      addNewCourseItemQuery(
        parentLocator,
        COURSE_BLOCK_NAMES.sequential.id,
        COURSE_BLOCK_NAMES.sequential.name,
        async (result) => {
          const data = await getCourseItem(result.locator);
          // Page should scroll to newly created subsection.
          data.shouldScroll = true;
          try {
            const response = await fetch(base_url + "/api/openedx/create_subsection", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: data.displayName,
                openedx_based_id: data.id,
                course_id: courseId,
                section_id:parentLocator,
              }),
            });
          
            if (!response.ok) {
              // Handle non-2xx responses
              const errorData = await response.json();
              console.error("Error in API call:", errorData);
            } else {
              const responseData = await response.json();
              console.log("API call successful:", responseData);
            }
          } catch (error) {
            // Handle network or other errors
            console.error("Error in API call:", error.message);
          }
          
          dispatch(addSubsection({ parentLocator, data }));
          console.log({
            title: data.displayName,
            openedx_based_id: data.id,
            course_id: courseId,
          });

          
        }
      )
    );
  };
}

export function addNewUnitQuery(parentLocator, courseId, prefix,id,callback) {
  
  return async (dispatch) => {
    dispatch(
      addNewCourseItemQuery(
        parentLocator,
        COURSE_BLOCK_NAMES.vertical.id,
        prefix+id+" "+COURSE_BLOCK_NAMES.vertical.name,
        async (result) => {
          const response = await fetch(
            base_url + '/api/openedx/create_rubric',
            {
              method: 'POST',
              headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                openedx_based_id: result.locator,
                course_id: courseId,
                user_id: 1,
                subsection_id:parentLocator
              }),
            }
          );
          return callback(result.locator)}
      )
    );
  };
}

function setBlockOrderListQuery(
  parentId,
  blockIds,
  apiFn,
  restoreCallback,
  successCallback
) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await apiFn(parentId, blockIds).then(async (result) => {
        if (result) {
          successCallback();
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
          dispatch(hideProcessingNotification());
        }
      });
    } catch (error) {
      restoreCallback();
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function setSectionOrderListQuery(
  courseId,
  sectionListIds,
  restoreCallback
) {
  return async (dispatch) => {
    dispatch(
      setBlockOrderListQuery(
        courseId,
        sectionListIds,
        setSectionOrderList,
        restoreCallback,
        () => dispatch(reorderSectionList(sectionListIds))
      )
    );
  };
}

export function setSubsectionOrderListQuery(
  sectionId,
  prevSectionId,
  subsectionListIds,
  restoreCallback,
  postSuccessCallback
) {
  return async (dispatch) => {
    dispatch(
      setBlockOrderListQuery(
        sectionId,
        subsectionListIds,
        setCourseItemOrderList,
        restoreCallback,
        async () => {
          const sectionIds = [sectionId];
          if (prevSectionId && prevSectionId !== sectionId) {
            sectionIds.push(prevSectionId);
          }
          await dispatch(fetchCourseSectionQuery(sectionIds));
          if (typeof postSuccessCallback === 'function') {
            postSuccessCallback();
          }
        }
      )
    );
  };
}

export function setUnitOrderListQuery(
  sectionId,
  subsectionId,
  prevSectionId,
  unitListIds,
  restoreCallback,
  postSuccessCallback
) {
  console.log("hello")
  return async (dispatch) => {
    dispatch(
      setBlockOrderListQuery(
        subsectionId,
        unitListIds,
        setCourseItemOrderList,
        restoreCallback,
        async () => {
          const sectionIds = [sectionId];
          if (prevSectionId && prevSectionId !== sectionId) {
            sectionIds.push(prevSectionId);
          }
          await dispatch(fetchCourseSectionQuery(sectionIds));
          if (typeof postSuccessCallback === 'function') {
            postSuccessCallback();
          }
        }
      )
    );
  };
}

export function pasteClipboardContent(parentLocator, sectionId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.pasting));

    try {
      await pasteBlock(parentLocator).then(async (result) => {
        if (result) {
          dispatch(fetchCourseSectionQuery([sectionId], true));
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
          dispatch(hideProcessingNotification());
          dispatch(setPasteFileNotices(result?.staticFileNotices));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function dismissNotificationQuery(url) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      await dismissNotification(url).then(async () => {
        dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      });
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}
