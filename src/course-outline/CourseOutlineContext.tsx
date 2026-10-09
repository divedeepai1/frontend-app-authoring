import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToggle } from '@openedx/paragon';
import { arrayMove } from '@dnd-kit/sortable';

import { SelectionState, type XBlock } from '@src/data/types';
import { useToggleWithValue } from '@src/hooks';
import { getBlockType } from '@src/generic/key-utils';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import { createRubric, createSubsection, createSection } from '@src/compugrade/api';
import { renumberSectionUnits } from '@src/compugrade/titleUtils';
import { useCourseAuthoringContext, type ModalState } from '@src/CourseAuthoringContext';
import {
  useCreateCourseBlock,
  useDeleteCourseItem,
  useDuplicateItem,
  useUpdateCourseBlockName,
} from './data/apiHooks';
import { getOutlineIndexData, getSectionsList } from './data/selectors';
import {
  fetchCourseOutlineIndexQuery,
  setSectionOrderListQuery,
  setSubsectionOrderListQuery,
  setUnitOrderListQuery,
} from './data/thunk';
import { deleteSection, deleteSubsection, deleteUnit } from './data/slice';

export type CourseOutlineContextData = {
  handleAddAndOpenUnit: ReturnType<typeof useCreateCourseBlock>;
  handleAddBlock: ReturnType<typeof useCreateCourseBlock>;
  currentSelection?: SelectionState;
  setCurrentSelection: React.Dispatch<React.SetStateAction<SelectionState | undefined>>;
  sections: XBlock[];
  restoreSectionList: () => void;
  setSections: React.Dispatch<React.SetStateAction<XBlock[]>>;
  isDuplicatingItem: boolean;
  isDeleteModalOpen: boolean;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  getHandleDeleteItemSubmit: (callback: () => void) => () => Promise<void>;
  handleDuplicateSectionSubmit: () => void;
  handleDuplicateSubsectionSubmit: () => void;
  handleDuplicateUnitSubmit: () => void;
  isPublishModalOpen: boolean;
  currentPublishModalData?: ModalState;
  openPublishModal: (value: ModalState) => void;
  closePublishModal: () => void;
  handleSectionDragAndDrop: (sectionListIds: string[]) => void;
  handleSubsectionDragAndDrop: (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
    restoreList?: () => void,
    postSuccessCallback?: () => void | Promise<void>,
  ) => void;
  handleUnitDragAndDrop: (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
    restoreList?: () => void,
    postSuccessCallback?: () => void | Promise<void>,
  ) => void;
  handleSubsectionDragAndDropWithRenumber: (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
    restoreList?: () => void,
  ) => void;
  handleUnitDragAndDropWithRenumber: (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
    restoreList?: () => void,
  ) => void;
  updateSectionOrderByIndex: (currentIndex: number, newIndex: number) => void;
  updateSubsectionOrderByIndex: (section: XBlock, moveDetails: any) => void;
  updateUnitOrderByIndex: (section: XBlock, moveDetails: any) => void;
};

/**
 * Course Outline Context.
 * Only available within the course outline page.
 *
 * Get this using `useCourseOutlineContext()`
 */
const CourseOutlineContext = createContext<CourseOutlineContextData | undefined>(undefined);

type CourseOutlineProviderProps = {
  children?: React.ReactNode;
};

export const CourseOutlineProvider = ({ children }: CourseOutlineProviderProps) => {
  const { courseId, openUnitPage } = useCourseAuthoringContext();
  const dispatch = useDispatch();
  const { courseStructure } = useSelector(getOutlineIndexData);
  const sectionsList = useSelector(getSectionsList);
  const [sections, setSections] = useState<XBlock[]>(sectionsList);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
  ] = useToggleWithValue<ModalState>();

  /**
   * This will hold the state of current item that is being operated on,
   * For example:
   *  - the details of container that is being edited.
   *  - the details of container of which see more dropdown is open.
   * It is mostly used in modals which should be soon be replaced with its equivalent in sidebar.
   */
  const [currentSelection, setCurrentSelection] = useState<SelectionState | undefined>();

  const restoreSectionList = () => {
    setSections(
      sectionsList.map((section) => {
        const { section: renumbered } = renumberSectionUnits(
          JSON.parse(JSON.stringify(section)),
        );
        return renumbered;
      }),
    );
  };

  useEffect(() => {
    dispatch(fetchCourseOutlineIndexQuery(courseId));
  }, [courseId]);

  useEffect(() => {
    // Keep lesson numbers aligned with current order instantly (cms autonumber UX).
    setSections(
      sectionsList.map((section) => {
        const { section: renumbered } = renumberSectionUnits(
          JSON.parse(JSON.stringify(section)),
        );
        return renumbered;
      }),
    );
  }, [sectionsList]);

  const renameMutation = useUpdateCourseBlockName(courseId);

  const handleAddAndOpenUnit = useCreateCourseBlock(
    courseId,
    async (locator, parentLocator, variables) => {
      // Ensure ascending unit number is applied (cms: "Unit {s}.{u} Unit")
      let displayName = variables?.displayName;
      if (!displayName) {
        const section = sections.find((s) => (
          s.childInfo?.children?.some((ss) => ss.id === parentLocator)
        ));
        const subIdx = section?.childInfo?.children?.findIndex((ss) => ss.id === parentLocator) ?? 0;
        const unitCount = section?.childInfo?.children?.[subIdx]?.childInfo?.children?.length ?? 0;
        // unit already created — count includes the new one, so use unitCount (1-based last index)
        const numberPrefix = `${subIdx + 1}.${Math.max(unitCount, 1)}`;
        displayName = `Unit ${numberPrefix} Unit`;
      }

      try {
        await createRubric({
          locator,
          courseId,
          subsectionId: parentLocator,
        });
      } catch (error) {
        // Keep unit creation successful even if Compugrade sync fails.
        // eslint-disable-next-line no-console
        console.error('Error creating Compugrade rubric:', error);
      }

      try {
        await renameMutation.mutateAsync({
          itemId: locator,
          displayName,
          sectionId: variables?.sectionId || sections.find((s) => (
            s.childInfo?.children?.some((ss) => ss.id === parentLocator)
          ))?.id,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error setting ascending unit title:', error);
      }

      await openUnitPage(locator);
    },
  );
  const handleAddBlock = useCreateCourseBlock(
    courseId,
    async (locator, parentLocator) => {
      const blockType = getBlockType(locator);
      try {
        if (blockType === 'chapter') {
          await createSection({
            title: COURSE_BLOCK_NAMES.chapter.name,
            locator,
            courseId,
          });
        } else if (blockType === 'sequential') {
          await createSubsection({
            title: COURSE_BLOCK_NAMES.sequential.name,
            locator,
            courseId,
            sectionId: parentLocator,
          });
        }
      } catch (error) {
        // Keep Studio create successful even if Compugrade sync fails.
        // eslint-disable-next-line no-console
        console.error('Error creating Compugrade section/subsection:', error);
      }
    },
  );

  const persistUnitRenames = async (saveOps: Array<{ unitId: string; sectionId: string; name: string }>) => {
    for (const { unitId, sectionId, name } of saveOps) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await renameMutation.mutateAsync({
          itemId: unitId,
          displayName: name,
          sectionId,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error persisting autonumber rename:', error);
      }
    }
  };

  const {
    mutate: duplicateItem,
    isPending: isDuplicatingItem,
  } = useDuplicateItem(courseId);

  // parentId is required by the API to know where to insert the duplicate.
  // sectionId/subsectionId are required to invalidate the correct React Query caches after duplication.
  const handleDuplicateSubmit = (parentId: string | undefined) => {
    if (currentSelection?.currentId && parentId) {
      duplicateItem({
        itemId: currentSelection.currentId,
        parentId,
        sectionId: currentSelection.sectionId,
        subsectionId: currentSelection.subsectionId,
      });
    }
  };

  const handleDuplicateSectionSubmit = () => handleDuplicateSubmit(courseStructure.id);
  const handleDuplicateSubsectionSubmit = () => handleDuplicateSubmit(currentSelection?.sectionId);
  const handleDuplicateUnitSubmit = () => handleDuplicateSubmit(currentSelection?.subsectionId);

  const handleSectionDragAndDrop = (sectionListIds: string[]) => {
    dispatch(setSectionOrderListQuery(courseId, sectionListIds, restoreSectionList));
  };

  const handleSubsectionDragAndDrop = (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
    restoreList?: () => void,
    postSuccessCallback?: () => void | Promise<void>,
  ) => {
    dispatch(setSubsectionOrderListQuery(
      sectionId,
      prevSectionId,
      subsectionListIds,
      restoreList || restoreSectionList,
      postSuccessCallback,
    ));
  };

  const handleUnitDragAndDrop = (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
    restoreList?: () => void,
    postSuccessCallback?: () => void | Promise<void>,
  ) => {
    dispatch(setUnitOrderListQuery(
      sectionId,
      subsectionId,
      prevSectionId,
      unitListIds,
      restoreList || restoreSectionList,
      postSuccessCallback,
    ));
  };

  /** DnD subsection drop: reorder + renumber lesson titles (cms parity). */
  const handleSubsectionDragAndDropWithRenumber = (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
    restoreList?: () => void,
  ) => {
    const sectionsCopy = JSON.parse(JSON.stringify(sections));
    const destSectionIdx = sectionsCopy.findIndex((s) => s.id === sectionId);
    if (destSectionIdx !== -1) {
      const destSection = sectionsCopy[destSectionIdx];
      const idToSubsection: Record<string, XBlock> = {};
      (destSection.childInfo?.children || []).forEach((ss) => {
        idToSubsection[ss.id] = ss;
      });
      destSection.childInfo.children = subsectionListIds
        .map((id) => idToSubsection[id])
        .filter(Boolean);
    }

    const saveOps: Array<{ unitId: string; sectionId: string; name: string }> = [];
    const renumberTarget = (targetSectionId: string) => {
      const idx = sectionsCopy.findIndex((s) => s.id === targetSectionId);
      if (idx === -1) {
        return;
      }
      const { section: renumbered, saveOps: ops } = renumberSectionUnits(sectionsCopy[idx]);
      sectionsCopy[idx] = renumbered;
      saveOps.push(...ops);
    };
    renumberTarget(sectionId);
    if (prevSectionId && prevSectionId !== sectionId) {
      renumberTarget(prevSectionId);
    }

    setSections(sectionsCopy);
    handleSubsectionDragAndDrop(
      sectionId,
      prevSectionId,
      subsectionListIds,
      restoreList,
      () => persistUnitRenames(saveOps),
    );
  };

  /** DnD unit drop: reorder + renumber lesson titles (cms parity). */
  const handleUnitDragAndDropWithRenumber = (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
    restoreList?: () => void,
  ) => {
    const sectionsCopy = JSON.parse(JSON.stringify(sections));
    const destSectionIdx = sectionsCopy.findIndex((s) => s.id === sectionId);
    if (destSectionIdx !== -1) {
      const destSection = sectionsCopy[destSectionIdx];
      const destSubIdx = (destSection.childInfo?.children || []).findIndex(
        (ss) => ss.id === subsectionId,
      );
      if (destSubIdx !== -1) {
        const subRef = destSection.childInfo.children[destSubIdx];
        const idToUnit: Record<string, XBlock> = {};
        (subRef.childInfo?.children || []).forEach((u) => {
          idToUnit[u.id] = u;
        });
        subRef.childInfo.children = unitListIds.map((id) => idToUnit[id]).filter(Boolean);
      }
    }

    const saveOps: Array<{ unitId: string; sectionId: string; name: string }> = [];
    const renumberTarget = (targetSectionId: string) => {
      const idx = sectionsCopy.findIndex((s) => s.id === targetSectionId);
      if (idx === -1) {
        return;
      }
      const { section: renumbered, saveOps: ops } = renumberSectionUnits(sectionsCopy[idx]);
      sectionsCopy[idx] = renumbered;
      saveOps.push(...ops);
    };
    renumberTarget(sectionId);
    if (prevSectionId && prevSectionId !== sectionId) {
      renumberTarget(prevSectionId);
    }

    setSections(sectionsCopy);
    handleUnitDragAndDrop(
      sectionId,
      prevSectionId,
      subsectionId,
      unitListIds,
      restoreList,
      () => persistUnitRenames(saveOps),
    );
  };

  /** Move section to new index */
  const updateSectionOrderByIndex = (currentIndex: number, newIndex: number) => {
    if (currentIndex === newIndex) {
      return;
    }
    setSections((prevSections) => {
      const newSections = arrayMove(prevSections, currentIndex, newIndex);
      handleSectionDragAndDrop(newSections.map((section) => section.id));
      return newSections;
    });
  };

  /** Uses details from move information and moves subsection */
  const updateSubsectionOrderByIndex = (section: XBlock, moveDetails) => {
    const { fn, args, sectionId } = moveDetails;
    if (!args) {
      return;
    }
    const [sectionsCopy, newSubsections] = fn(...args);
    if (newSubsections && sectionId) {
      const saveOps: Array<{ unitId: string; sectionId: string; name: string }> = [];
      const destIdx = sectionsCopy.findIndex((s) => s.id === section.id);
      if (destIdx !== -1) {
        const { section: renumbered, saveOps: ops } = renumberSectionUnits(sectionsCopy[destIdx]);
        sectionsCopy[destIdx] = renumbered;
        saveOps.push(...ops);
      }
      if (sectionId !== section.id) {
        const srcIdx = sectionsCopy.findIndex((s) => s.id === sectionId);
        if (srcIdx !== -1) {
          const { section: renumbered, saveOps: ops } = renumberSectionUnits(sectionsCopy[srcIdx]);
          sectionsCopy[srcIdx] = renumbered;
          saveOps.push(...ops);
        }
      }
      setSections(sectionsCopy);
      handleSubsectionDragAndDrop(
        sectionId,
        section.id,
        newSubsections.map((subsection) => subsection.id),
        restoreSectionList,
        () => persistUnitRenames(saveOps),
      );
    }
  };

  /** Uses details from move information and moves unit */
  const updateUnitOrderByIndex = (section: XBlock, moveDetails) => {
    const { fn, args, sectionId, subsectionId } = moveDetails;
    if (!args) {
      return;
    }
    const [sectionsCopy, newUnits] = fn(...args);
    if (newUnits && sectionId && subsectionId) {
      const saveOps: Array<{ unitId: string; sectionId: string; name: string }> = [];
      const renumberTarget = (targetSectionId: string) => {
        const idx = sectionsCopy.findIndex((s) => s.id === targetSectionId);
        if (idx === -1) {
          return;
        }
        const { section: renumbered, saveOps: ops } = renumberSectionUnits(sectionsCopy[idx]);
        sectionsCopy[idx] = renumbered;
        saveOps.push(...ops);
      };
      renumberTarget(section.id);
      if (sectionId && sectionId !== section.id) {
        renumberTarget(sectionId);
      }
      setSections(sectionsCopy);
      handleUnitDragAndDrop(
        sectionId,
        section.id,
        subsectionId,
        newUnits.map((unit) => unit.id),
        restoreSectionList,
        () => persistUnitRenames(saveOps),
      );
    }
  };

  const deleteMutation = useDeleteCourseItem();

  const getHandleDeleteItemSubmit = useCallback((callback: () => void) => async () => {
    // istanbul ignore if
    if (!currentSelection) {
      return;
    }
    const category = getBlockType(currentSelection.currentId);
    switch (category) {
      case COURSE_BLOCK_NAMES.chapter.id:
        await deleteMutation.mutateAsync(
          { itemId: currentSelection.currentId },
          { onSettled: () => dispatch(deleteSection({ itemId: currentSelection.currentId })) },
        );
        break;
      case COURSE_BLOCK_NAMES.sequential.id:
        await deleteMutation.mutateAsync(
          { itemId: currentSelection.currentId, sectionId: currentSelection.sectionId },
          {
            onSettled: () =>
              dispatch(deleteSubsection({
                itemId: currentSelection.currentId,
                sectionId: currentSelection.sectionId,
              })),
          },
        );
        break;
      case COURSE_BLOCK_NAMES.vertical.id:
        await deleteMutation.mutateAsync(
          {
            itemId: currentSelection.currentId,
            subsectionId: currentSelection.subsectionId,
            sectionId: currentSelection.sectionId,
          },
          {
            onSettled: () =>
              dispatch(deleteUnit({
                itemId: currentSelection.currentId,
                subsectionId: currentSelection.subsectionId,
                sectionId: currentSelection.sectionId,
              })),
          },
        );
        break;
      default:
        // istanbul ignore next
        throw new Error(`Unrecognized category ${category}`);
    }
    closeDeleteModal();
    callback();
  }, [deleteMutation, closeDeleteModal, currentSelection, dispatch]);

  const context = useMemo<CourseOutlineContextData>(() => ({
    handleAddBlock,
    handleAddAndOpenUnit,
    currentSelection,
    setCurrentSelection,
    sections,
    restoreSectionList,
    setSections,
    isDuplicatingItem,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    getHandleDeleteItemSubmit,
    handleDuplicateSectionSubmit,
    handleDuplicateSubsectionSubmit,
    handleDuplicateUnitSubmit,
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleUnitDragAndDrop,
    handleSubsectionDragAndDropWithRenumber,
    handleUnitDragAndDropWithRenumber,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
  }), [
    handleAddBlock,
    handleAddAndOpenUnit,
    currentSelection,
    setCurrentSelection,
    sections,
    restoreSectionList,
    setSections,
    isDuplicatingItem,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    getHandleDeleteItemSubmit,
    handleDuplicateSectionSubmit,
    handleDuplicateSubsectionSubmit,
    handleDuplicateUnitSubmit,
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleUnitDragAndDrop,
    handleSubsectionDragAndDropWithRenumber,
    handleUnitDragAndDropWithRenumber,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
  ]);

  return (
    <CourseOutlineContext.Provider value={context}>
      {children}
    </CourseOutlineContext.Provider>
  );
};

export function useCourseOutlineContext(): CourseOutlineContextData {
  const ctx = useContext(CourseOutlineContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useCourseOutlineContext() was used in a component without a <CourseOutlineProvider> ancestor.');
  }
  return ctx;
}
