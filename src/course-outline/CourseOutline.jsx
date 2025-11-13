// @ts-check
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Layout,
  Row,
  TransitionReplace,
  Toast,
  IconButtonToggle,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import {
  Add as IconAdd,
  CheckCircle as CheckCircleIcon,
} from '@openedx/paragon/icons';

import { useSelector } from 'react-redux';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useLocation } from 'react-router-dom';

import { LoadingSpinner } from '../generic/Loading';
import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import { RequestStatus } from '../data/constants';
import SubHeader from '../generic/sub-header/SubHeader';
import ProcessingNotification from '../generic/processing-notification';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import DeleteModal from '../generic/delete-modal/DeleteModal';
import ConfigureModal from '../generic/configure-modal/ConfigureModal';
import AlertMessage from '../generic/alert-message';
import getPageHeadTitle from '../generic/utils';
import { getCurrentItem, getProctoredExamsFlag } from './data/selectors';
import { COURSE_BLOCK_NAMES } from './constants';
import HeaderNavigations from './header-navigations/HeaderNavigations';
import OutlineSideBar from './outline-sidebar/OutlineSidebar';
import StatusBar from './status-bar/StatusBar';
import EnableHighlightsModal from './enable-highlights-modal/EnableHighlightsModal';
import SectionCard from './section-card/SectionCard';
import SubsectionCard from './subsection-card/SubsectionCard';
import UnitCard from './unit-card/UnitCard';
import HighlightsModal from './highlights-modal/HighlightsModal';
import EmptyPlaceholder from './empty-placeholder/EmptyPlaceholder';
import PublishModal from './publish-modal/PublishModal';
import PageAlerts from './page-alerts/PageAlerts';
import DraggableList from '../generic/drag-helper/DraggableList';
import {
  canMoveSection,
  possibleUnitMoves,
  possibleSubsectionMoves,
} from '../generic/drag-helper/utils';
import { useCourseOutline } from './hooks';
import messages from './messages';
import { getTagsExportFile } from './data/api';
import { base_url } from '../compugrade-constants';
import { ChevronsLeftRightEllipsis } from 'lucide-react';
import TableView from './TableView';



const CourseOutline = ({ courseId }) => {
  const intl = useIntl();
  const location = useLocation();

  const {
    courseName,
    savingStatus,
    statusBarData,
    courseActions,
    sectionsList,
    isCustomRelativeDatesActive,
    isLoading,
    isReIndexShow,
    showSuccessAlert,
    isSectionsExpanded,
    isEnableHighlightsModalOpen,
    isInternetConnectionAlertFailed,
    isDisabledReindexButton,
    isHighlightsModalOpen,
    isPublishModalOpen,
    isConfigureModalOpen,
    isDeleteModalOpen,
    closeHighlightsModal,
    closePublishModal,
    handleConfigureModalClose,
    closeDeleteModal,
    openPublishModal,
    openConfigureModal,
    openDeleteModal,
    headerNavigationsActions,
    openEnableHighlightsModal,
    closeEnableHighlightsModal,
    handleEnableHighlightsSubmit,
    handleInternetConnectionFailed,
    handleOpenHighlightsModal,
    handleHighlightsFormSubmit,
    handleConfigureItemSubmit,
    handlePublishItemSubmit,
    handleEditSubmit,
    handleDeleteItemSubmit,
    handleDuplicateSectionSubmit,
    handleDuplicateSubsectionSubmit,
    handleDuplicateUnitSubmit,
    handleNewSectionSubmit,
    handleNewSubsectionSubmit,
    handleNewUnitSubmit,
    getUnitUrl,
    handleVideoSharingOptionChange,
    handleCopyToClipboardClick,
    handlePasteClipboardClick,
    notificationDismissUrl,
    discussionsSettings,
    discussionsIncontextFeedbackUrl,
    discussionsIncontextLearnmoreUrl,
    deprecatedBlocksInfo,
    proctoringErrors,
    mfeProctoredExamSettingsUrl,
    handleDismissNotification,
    advanceSettingsUrl,
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleUnitDragAndDrop,
    errors,
  } = useCourseOutline({ courseId });

  // Use `setToastMessage` to show the toast.
  const [toastMessage, setToastMessage] = useState(/** @type{null|string} */ (null));
  const [skills,setSkills]=useState([])
  const [viewMode, setViewMode] = useState("list")

  // Extract fetch function so it can be called independently
  const fetchRubricSkills = React.useCallback(async () => {
    if (!courseId) return;
    const encodedCourseId = encodeURIComponent(courseId);
    try {
      const response = await fetch(
        `${base_url}/api/openedx/get_skills_for_all_course_rubrics?course_id=${encodedCourseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setSkills(data);
    } catch (err) {
      console.error(err);
    }
  }, [courseId]);

  // Wrap handleDuplicateSectionSubmit to refetch skills after completion
  const handleDuplicateSectionSubmitWithSkills = React.useCallback(() => {
    // Call the original duplication handler
    handleDuplicateSectionSubmit();
    // Wait for section duplication to complete (includes subsections and units)
    // Based on thunk code, it waits 1000ms + processing time, so we wait a bit longer
    setTimeout(() => {
      fetchRubricSkills();
    }, 2000);
  }, [handleDuplicateSectionSubmit, fetchRubricSkills]);

  useEffect(() => {
    fetchRubricSkills();

    // Wait for the course data to load before exporting tags.
    if (courseId && courseName && location.hash === '#export-tags') {
      setToastMessage(intl.formatMessage(messages.exportTagsCreatingToastMessage));
      getTagsExportFile(courseId, courseName).then(() => {
        setToastMessage(intl.formatMessage(messages.exportTagsSuccessToastMessage));
      }).catch(() => {
        setToastMessage(intl.formatMessage(messages.exportTagsErrorToastMessage));
      });

      // Delete `#export-tags` from location
      window.location.href = '#';
    }
  }, [location, courseId, courseName, fetchRubricSkills]);

  const [sections, setSections] = useState(sectionsList);

  // Refetch skills when sectionsList or local sections change (e.g., after duplication)
  // Track section IDs and unit count to detect any duplication
  // Create separate hashes for sectionsList and local sections to catch changes in either
  const structureHashFromList = React.useMemo(() => {
    if (sectionsList.length === 0) return '';
    const sectionIds = sectionsList.map(s => s.id).join(',');
    const totalUnitCount = sectionsList.reduce((count, section) => {
      return count + (section.childInfo?.children || []).reduce((subCount, subsection) => {
        return subCount + (subsection.childInfo?.children || []).length;
      }, 0);
    }, 0);
    return `${sectionIds}-${totalUnitCount}`;
  }, [sectionsList]);

  const structureHashFromLocal = React.useMemo(() => {
    if (sections.length === 0) return '';
    const sectionIds = sections.map(s => s.id).join(',');
    const totalUnitCount = sections.reduce((count, section) => {
      return count + (section.childInfo?.children || []).reduce((subCount, subsection) => {
        return subCount + (subsection.childInfo?.children || []).length;
      }, 0);
    }, 0);
    return `${sectionIds}-${totalUnitCount}`;
  }, [sections]);

  // Use a ref to track previous hashes and only fetch when they actually change
  const prevHashRef = React.useRef({ list: '', local: '' });
  
  useEffect(() => {
    const hasChanged = 
      (structureHashFromList && structureHashFromList !== prevHashRef.current.list) ||
      (structureHashFromLocal && structureHashFromLocal !== prevHashRef.current.local);
    
    if (courseId && hasChanged) {
      prevHashRef.current = { 
        list: structureHashFromList || prevHashRef.current.list,
        local: structureHashFromLocal || prevHashRef.current.local
      };
      // Add a delay to ensure backend has finished processing duplication
      // Longer delay for section duplication as it may take more time
      const timeoutId = setTimeout(() => {
        fetchRubricSkills();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [structureHashFromList, structureHashFromLocal, courseId, fetchRubricSkills]);

  const restoreSectionList = () => {
    setSections(() => [...sectionsList]);
  };

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  const currentItemData = useSelector(getCurrentItem);
  const deleteCategory = COURSE_BLOCK_NAMES[currentItemData.category]?.name.toLowerCase();

  const enableProctoredExams = useSelector(getProctoredExamsFlag);

  /**
   * Move section to new index
   * @param {any} currentIndex
   * @param {any} newIndex
   */
  const updateSectionOrderByIndex = (currentIndex, newIndex) => {
    if (currentIndex === newIndex) {
      return;
    }
    setSections((prevSections) => {
      const newSections = arrayMove(prevSections, currentIndex, newIndex);
      handleSectionDragAndDrop(newSections.map(section => section.id));
      return newSections;
    });
  };

  /**
   * Uses details from move information and moves subsection
   * @param {any} section
   * @param {any} moveDetails
   * @returns {void}
   */
  const updateSubsectionOrderByIndex = (section, moveDetails) => {
    
    const { fn, args, sectionId } = moveDetails;
    if (!args) {
      return;
    }
    const [sectionsCopy, newSubsections] = fn(...args);
    if (newSubsections && sectionId) {
      // After subsection move, renumber unit titles within all subsections
      // of both destination and source sections so numbering stays consistent.
      const extractParts = (titleValue) => {
        const match = titleValue.match(/^(Unit|Chapter|Lesson)?\s*(\d+(?:\.\d+)?)?\s*(.*)/i);
        const typePart = match ? match[1] : '';
        const numberPart = match ? match[2] : '';
        const stringPart = match ? match[3] : titleValue;
        return { typePart, numberPart, stringPart };
      };

      const renumberSectionUnits = (sectionRef) => {
        if (!sectionRef?.childInfo?.children) return sectionRef;
        const updatedSubsections = sectionRef.childInfo.children.map((subRef, sIdx) => {
          const units = subRef?.childInfo?.children || [];
          const updatedUnits = units.map((unitItem, uIdx) => {
            const { typePart, stringPart } = extractParts(unitItem.displayName || '');
            const typeLabel = typePart || 'Lesson';
            const newNumberPrefix = `${sIdx + 1}.${uIdx + 1}`;
            const newDisplayName = [typeLabel, newNumberPrefix, stringPart].filter(Boolean).join(' ');
            if (newDisplayName !== unitItem.displayName) {
              handleEditSubmit(unitItem.id, sectionRef.id, newDisplayName, 'unit');
            }
            return { ...unitItem, displayName: newDisplayName };
          });
          return { ...subRef, childInfo: { ...subRef.childInfo, children: updatedUnits } };
        });
        return { ...sectionRef, childInfo: { ...sectionRef.childInfo, children: updatedSubsections } };
      };

      const destSectionIndex = sectionsCopy.findIndex(s => s.id === section.id);
      if (destSectionIndex !== -1) {
        sectionsCopy[destSectionIndex] = renumberSectionUnits(sectionsCopy[destSectionIndex]);
      }
      if (sectionId !== section.id) {
        const srcSectionIndex = sectionsCopy.findIndex(s => s.id === sectionId);
        if (srcSectionIndex !== -1) {
          sectionsCopy[srcSectionIndex] = renumberSectionUnits(sectionsCopy[srcSectionIndex]);
        }
      }

      setSections(sectionsCopy);
      handleSubsectionDragAndDrop(
        sectionId,
        section.id,
        newSubsections.map(subsection => subsection.id),
        restoreSectionList,
      );
    }
  };

  /**
   * Uses details from move information and moves unit
   * @param {any} section
   * @param {any} moveDetails
   * @returns {void}
   */
  const updateUnitOrderByIndex = (section, moveDetails) => {
  
    const {
      fn, args, sectionId, subsectionId,
    } = moveDetails;
    if (!args) {
      return;
    }
    const [sectionsCopy, newUnits] = fn(...args);
    if (newUnits && sectionId && subsectionId) {
      // After drag-and-drop, also update unit display names to reflect new order
      // so views relying on displayName (e.g., Table View) stay consistent.
      const extractParts = (titleValue) => {
        const match = titleValue.match(/^(Unit|Chapter|Lesson)?\s*(\d+(?:\.\d+)?)?\s*(.*)/i);
        const typePart = match ? match[1] : '';
        const numberPart = match ? match[2] : '';
        const stringPart = match ? match[3] : titleValue;
        return { typePart, numberPart, stringPart };
      };

      const saveOps = [];
      const renumberSection = (targetSectionId) => {
        const idx = sectionsCopy.findIndex(s => s.id === targetSectionId);
        if (idx === -1) return;
        const sectionRef = sectionsCopy[idx];
        const updatedSubsections = (sectionRef.childInfo.children || []).map((subRef, sIdx) => {
          const updatedUnits = (subRef.childInfo?.children || []).map((unitItem, uIdx) => {
            const { typePart, stringPart } = extractParts(unitItem.displayName || '');
            const typeLabel = typePart || 'Lesson';
            const newNumberPrefix = `${sIdx + 1}.${uIdx + 1}`;
            const newDisplayName = [typeLabel, newNumberPrefix, stringPart].filter(Boolean).join(' ');
            if (newDisplayName && newDisplayName !== unitItem.displayName) {
              saveOps.push({ unitId: unitItem.id, sectionId: targetSectionId, name: newDisplayName });
            }
            return { ...unitItem, displayName: newDisplayName };
          });
          return { ...subRef, childInfo: { ...subRef.childInfo, children: updatedUnits } };
        });
        sectionsCopy[idx] = { ...sectionRef, childInfo: { ...sectionRef.childInfo, children: updatedSubsections } };
      };

      // Renumber destination
      renumberSection(section.id);
      // If moving across sections, renumber source as well
      if (sectionId && sectionId !== section.id) {
        renumberSection(sectionId);
      }
      setSections(sectionsCopy);
      handleUnitDragAndDrop(
        sectionId,
        section.id,
        subsectionId,
        newUnits.map(unit => unit.id),
        restoreSectionList,
        async () => {
          // Persist AFTER backend order saved and sections refetched, sequentially
          for (const { unitId, sectionId: sId, name } of saveOps) {
            // eslint-disable-next-line no-await-in-loop
            await handleEditSubmit(unitId, sId, name, 'unit');
          }
        }
      );
      
    }
  };

  // Ensure drag handle (free DnD) path also renumbers and saves after backend reorder
  const handleUnitDragAndDropWithRenumber = (
    sectionId,
    prevSectionId,
    subsectionId,
    unitListIds,
    restoreList,
  ) => {
    const extractParts = (titleValue) => {
      const match = titleValue.match(/^(Unit|Chapter|Lesson)?\s*(\d+(?:\.\d+)?)?\s*(.*)/i);
      const typePart = match ? match[1] : '';
      const numberPart = match ? match[2] : '';
      const stringPart = match ? match[3] : titleValue;
      return { typePart, numberPart, stringPart };
    };

    // Build a local copy reflecting the dropped order for the specific subsection
    const sectionsCopy = JSON.parse(JSON.stringify(sections));
    const destSectionIdx = sectionsCopy.findIndex(s => s.id === sectionId);
    if (destSectionIdx !== -1) {
      const destSection = sectionsCopy[destSectionIdx];
      const destSubIdx = destSection.childInfo.children.findIndex(ss => ss.id === subsectionId);
      if (destSubIdx !== -1) {
        const subRef = destSection.childInfo.children[destSubIdx];
        const idToUnit = {};
        (subRef.childInfo.children || []).forEach(u => { idToUnit[u.id] = u; });
        const reordered = unitListIds.map(id => idToUnit[id]).filter(Boolean);
        subRef.childInfo.children = reordered;
      }
    }

    const saveOps = [];
    const renumberSection = (targetSectionId) => {
      const idx = sectionsCopy.findIndex(s => s.id === targetSectionId);
      if (idx === -1) return;
      const sectionRef = sectionsCopy[idx];
      const updatedSubsections = (sectionRef.childInfo.children || []).map((subRef, sIdx) => {
        const updatedUnits = (subRef.childInfo?.children || []).map((unitItem, uIdx) => {
          const { typePart, stringPart } = extractParts(unitItem.displayName || '');
          const typeLabel = typePart || 'Lesson';
          const newNumberPrefix = `${sIdx + 1}.${uIdx + 1}`;
          const newDisplayName = [typeLabel, newNumberPrefix, stringPart].filter(Boolean).join(' ');
          if (newDisplayName && newDisplayName !== unitItem.displayName) {
            saveOps.push({ unitId: unitItem.id, sectionId: targetSectionId, name: newDisplayName });
          }
          return { ...unitItem, displayName: newDisplayName };
        });
        return { ...subRef, childInfo: { ...subRef.childInfo, children: updatedUnits } };
      });
      sectionsCopy[idx] = { ...sectionRef, childInfo: { ...sectionRef.childInfo, children: updatedSubsections } };
    };

    renumberSection(sectionId);
    if (prevSectionId && prevSectionId !== sectionId) {
      renumberSection(prevSectionId);
    }

    // Optimistically update UI
    setSections(sectionsCopy);

    handleUnitDragAndDrop(
      sectionId,
      prevSectionId,
      subsectionId,
      unitListIds,
      restoreList,
      async () => {
        for (const { unitId, sectionId: sId, name } of saveOps) {
          // eslint-disable-next-line no-await-in-loop
          await handleEditSubmit(unitId, sId, name, 'unit');
        }
      },
    );
  };

  useEffect(() => {
    setSections(sectionsList);
  }, [sectionsList]);

  if (isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  return (
    <>
      <Helmet>
        <title>{getPageHeadTitle(courseName, intl.formatMessage(messages.headingTitle))}</title>
      </Helmet>
      <Container size="xl" className="px-4">
        <section className="course-outline-container mb-4 mt-5">
          <PageAlerts
            courseId={courseId}
            notificationDismissUrl={notificationDismissUrl}
            handleDismissNotification={handleDismissNotification}
            discussionsSettings={discussionsSettings}
            discussionsIncontextFeedbackUrl={discussionsIncontextFeedbackUrl}
            discussionsIncontextLearnmoreUrl={discussionsIncontextLearnmoreUrl}
            deprecatedBlocksInfo={deprecatedBlocksInfo}
            proctoringErrors={proctoringErrors}
            mfeProctoredExamSettingsUrl={mfeProctoredExamSettingsUrl}
            advanceSettingsUrl={advanceSettingsUrl}
            savingStatus={savingStatus}
            errors={errors}
          />
          <TransitionReplace>
            {showSuccessAlert ? (
              <AlertMessage
                key={intl.formatMessage(messages.alertSuccessAriaLabelledby)}
                show={showSuccessAlert}
                variant="success"
                icon={CheckCircleIcon}
                title={intl.formatMessage(messages.alertSuccessTitle)}
                description={intl.formatMessage(messages.alertSuccessDescription)}
                aria-hidden="true"
                aria-labelledby={intl.formatMessage(messages.alertSuccessAriaLabelledby)}
                aria-describedby={intl.formatMessage(messages.alertSuccessAriaDescribedby)}
              />
            ) : null}
          </TransitionReplace>
          <SubHeader
            title={intl.formatMessage(messages.headingTitle)}
            // subtitle={intl.formatMessage(messages.headingSubtitle)}
            headerActions={(
              <HeaderNavigations
                isReIndexShow={isReIndexShow}
                isSectionsExpanded={isSectionsExpanded}
                headerNavigationsActions={headerNavigationsActions}
                isDisabledReindexButton={isDisabledReindexButton}
                hasSections={Boolean(sectionsList.length)}
                courseActions={courseActions}
                errors={errors}
              />
            )}
          />
          <Layout
            lg={[{ span: 12},{ span: 3 } ]}
            md={[{ span: 12 }, { span: 3 }]}
            sm={[{ span: 12 }, { span: 12 }]}
            xs={[{ span: 12 }, { span: 12 }]}
            xl={[{ span: 12 }, { span: 3 }]}
          >
            <Layout.Element>
              <article>
                <div>
                  <section className="course-outline-section">
                    <StatusBar
                      courseId={courseId}
                      isLoading={isLoading}
                      statusBarData={statusBarData}
                      openEnableHighlightsModal={openEnableHighlightsModal}
                      handleVideoSharingOptionChange={handleVideoSharingOptionChange}
                    />
                    {!errors?.outlineIndexApi && (
                      <div className="pt-4">
                         <div className="d-flex justify-content-end mb-3" style={{gap:"4px"}}>
        <button
          className={viewMode === "list" ? "primary-button px-3 py-2" : "secondary-button px-3 py-2"}
          onClick={() => setViewMode("list")}
        >
          <IconButtonToggle className="me-2" />
          List View
        </button>
        <button
          className={viewMode === "table" ? "primary-button px-3 py-2" : "secondary-button px-3 py-2"}
          onClick={() => setViewMode("table")}
        >
          <IconButtonToggle className="me-2" />
          Table View
        </button>
      </div>
                        {sections.length ? (
                        viewMode === "list" ?  <>
                            <DraggableList
                              items={sections}
                              setSections={setSections}
                              restoreSectionList={restoreSectionList}
                              handleSectionDragAndDrop={handleSectionDragAndDrop}
                              handleSubsectionDragAndDrop={handleSubsectionDragAndDrop}
                              handleUnitDragAndDrop={handleUnitDragAndDropWithRenumber}
                            >
                              <SortableContext
                                id="root"
                                items={sections}
                                strategy={verticalListSortingStrategy}
                              >
                                {sections.map((section, sectionIndex) => (
                                  <SectionCard
                                    key={section.id}
                                    section={section}
                                    index={sectionIndex}
                                    canMoveItem={canMoveSection(sections)}
                                    isSelfPaced={statusBarData.isSelfPaced}
                                    isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                                    savingStatus={savingStatus}
                                    onOpenHighlightsModal={handleOpenHighlightsModal}
                                    onOpenPublishModal={openPublishModal}
                                    onOpenConfigureModal={openConfigureModal}
                                    onOpenDeleteModal={openDeleteModal}
                                    onEditSectionSubmit={handleEditSubmit}
                                    onDuplicateSubmit={handleDuplicateSectionSubmitWithSkills}
                                    isSectionsExpanded={isSectionsExpanded}
                                    onNewSubsectionSubmit={handleNewSubsectionSubmit}
                                    onOrderChange={updateSectionOrderByIndex}
                                  >
                                    <SortableContext
                                      id={section.id}
                                      items={section.childInfo.children}
                                      strategy={verticalListSortingStrategy}
                                    >
                                      {section.childInfo.children.map((subsection, subsectionIndex) => (
                                        <SubsectionCard
                                          key={subsection.id}
                                          section={section}
                                          subsection={subsection}
                                          index={subsectionIndex}
                                          getPossibleMoves={possibleSubsectionMoves(
                                            [...sections],
                                            sectionIndex,
                                            section,
                                            section.childInfo.children,
                                          )}
                                          isSelfPaced={statusBarData.isSelfPaced}
                                          isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                                          savingStatus={savingStatus}
                                          onOpenPublishModal={openPublishModal}
                                          onOpenDeleteModal={openDeleteModal}
                                          onEditSubmit={handleEditSubmit}
                                          onDuplicateSubmit={handleDuplicateSubsectionSubmit}
                                          onOpenConfigureModal={openConfigureModal}
                                          onNewUnitSubmit={handleNewUnitSubmit}
                                          onOrderChange={updateSubsectionOrderByIndex}
                                          onPasteClick={handlePasteClipboardClick}
                                        >
                                          <SortableContext
                                            id={subsection.id}
                                            items={subsection.childInfo.children}
                                            strategy={verticalListSortingStrategy}
                                          >
                                            {subsection.childInfo.children.map((unit, unitIndex) => (
                                              <UnitCard
                                                key={unit.id}
                                                skills={skills}
                                                unit={unit}
                                                fromUnitCard={true}
                                                subsection={subsection}
                                                section={section}
                                                isSelfPaced={statusBarData.isSelfPaced}
                                                isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                                                index={unitIndex}
                                                
                                                subsectionIndex={subsectionIndex}
                                                getPossibleMoves={possibleUnitMoves(
                                                  [...sections],
                                                  sectionIndex,
                                                  subsectionIndex,
                                                  section,
                                                  subsection,
                                                  subsection.childInfo.children,
                                                  unitIndex,
                                                  unit,
                                                )}
                                                savingStatus={savingStatus}
                                                onOpenPublishModal={openPublishModal}
                                                onOpenConfigureModal={openConfigureModal}
                                                onOpenDeleteModal={openDeleteModal}
                                                onEditSubmit={handleEditSubmit}
                                                onDuplicateSubmit={handleDuplicateUnitSubmit}
                                                getTitleLink={getUnitUrl}
                                                onOrderChange={updateUnitOrderByIndex}
                                                onCopyToClipboardClick={handleCopyToClipboardClick}
                                                discussionsSettings={discussionsSettings}
                                              />
                                            ))}
                                          </SortableContext>
                                        </SubsectionCard>
                                      ))}
                                    </SortableContext>
                                  </SectionCard>
                                ))}
                              </SortableContext>
                            </DraggableList>
                            {courseActions.childAddable && (
                              <Button
                                data-testid="new-section-button"
                                className="mt-4"
                                variant="outline-primary"
                                onClick={handleNewSectionSubmit}
                                iconBefore={IconAdd}
                                block
                              >
                                {intl.formatMessage(messages.newSectionButton)}
                              </Button>
                            )}
                          </> :
                           <TableView
                           courseId={courseId}
                           skills={skills}
                           sections={sections}
                         
                         />
                        ) : (
                          <EmptyPlaceholder
                            onCreateNewSection={handleNewSectionSubmit}
                            childAddable={courseActions.childAddable}
                          />
                        )}
                      </div>
                    )}
                  </section>
                </div>
              </article>
            </Layout.Element>
            {/* <Layout.Element>
              <OutlineSideBar courseId={courseId} />
            </Layout.Element> */}
          </Layout>
          <EnableHighlightsModal
            isOpen={isEnableHighlightsModalOpen}
            close={closeEnableHighlightsModal}
            onEnableHighlightsSubmit={handleEnableHighlightsSubmit}
          />
        </section>
        <HighlightsModal
          isOpen={isHighlightsModalOpen}
          onClose={closeHighlightsModal}
          onSubmit={handleHighlightsFormSubmit}
        />
        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={closePublishModal}
          onPublishSubmit={handlePublishItemSubmit}
        />
        <ConfigureModal
          isOpen={isConfigureModalOpen}
          onClose={handleConfigureModalClose}
          onConfigureSubmit={handleConfigureItemSubmit}
          currentItemData={currentItemData}
          enableProctoredExams={enableProctoredExams}
          isSelfPaced={statusBarData.isSelfPaced}
        />
        <DeleteModal
          category={deleteCategory}
          isOpen={isDeleteModalOpen}
          close={closeDeleteModal}
          onDeleteSubmit={handleDeleteItemSubmit}
        />
      </Container>
      <div className="alert-toast">
        <ProcessingNotification
          isShow={isShowProcessingNotification}
          title={processingNotificationTitle}
        />
        <InternetConnectionAlert
          isFailed={isInternetConnectionAlertFailed}
          isQueryPending={savingStatus === RequestStatus.PENDING}
          onInternetConnectionFailed={handleInternetConnectionFailed}
        />
      </div>
      {toastMessage && (
        <Toast
          show
          onClose={/* istanbul ignore next */ () => setToastMessage(null)}
          data-testid="taxonomy-toast"
        >
          {toastMessage}
        </Toast>
      )}
    </>
  );
};

CourseOutline.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseOutline;
