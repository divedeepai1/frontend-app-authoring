import { useIntl } from '@edx/frontend-platform/i18n';
import { InfoOutline, SchoolOutline } from '@openedx/paragon/icons';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';

import contentMessages from '@src/library-authoring/add-content/messages';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseOutlineContext } from '@src/course-outline/CourseOutlineContext';
import {
  Stack,
} from '@openedx/paragon';
import { getItemIcon } from '@src/generic/block-type-utils';
import {
  useCallback,
  useMemo,
} from 'react';
import { ContainerType, normalizeContainerType } from '@src/generic/key-utils';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import { BlockCardButton } from '@src/generic/sidebar/BlockCardButton';
import AlertMessage from '@src/generic/alert-message';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { useOutlineSidebarContext } from './OutlineSidebarContext';
import messages from './messages';

const CannotAddContentAlert = () => {
  const intl = useIntl();
  const { currentItemData } = useOutlineSidebarContext();
  return (
    <AlertMessage
      variant="info"
      description={intl.formatMessage(messages.cannotAddAlertMsg, {
        name: currentItemData?.displayName,
        category: normalizeContainerType(currentItemData?.category || ''),
      })}
      icon={InfoOutline}
    />
  );
};

type AddContentButtonProps = {
  name: string;
  blockType: ContainerType;
};

/** Add Content Button */
const AddContentButton = ({ name, blockType }: AddContentButtonProps) => {
  const { courseUsageKey } = useCourseAuthoringContext();
  const {
    handleAddBlock,
    handleAddAndOpenUnit,
    sections,
  } = useCourseOutlineContext();
  const {
    currentFlow,
    stopCurrentFlow,
    lastEditableSection,
    lastEditableSubsection,
    openContainerInfoSidebar,
  } = useOutlineSidebarContext();
  let sectionParentId = lastEditableSection?.id;
  let subsectionParentId = lastEditableSubsection?.data?.id;

  const addSection = (onSuccess?: (data: { locator: string; }) => void) => {
    handleAddBlock.mutate({
      type: ContainerType.Chapter,
      parentLocator: courseUsageKey,
      displayName: COURSE_BLOCK_NAMES.chapter.name,
    }, {
      onSuccess: (data: { locator: string; }) => {
        // istanbul ignore next
        if (onSuccess) {
          onSuccess(data);
        } else {
          openContainerInfoSidebar(data.locator, undefined, data.locator);
        }
      },
    });
  };

  const addSubsection = (sectionId: string, onSuccess?: (data: { locator: string; }) => void) => {
    handleAddBlock.mutate({
      type: ContainerType.Sequential,
      parentLocator: sectionId,
      displayName: COURSE_BLOCK_NAMES.sequential.name,
      sectionId,
    }, {
      onSuccess: (data: { locator: string; }) => {
        // istanbul ignore next
        if (onSuccess) {
          onSuccess(data);
        } else {
          openContainerInfoSidebar(data.locator, data.locator, sectionId);
        }
      },
    });
  };

  const addUnit = (subsectionId: string, sectionId?: string) => {
    // Match cms-edx-frontend unit autonumber naming: "Unit {s}.{u} Unit"
    const section = sections.find((s) => s.id === sectionId);
    const subIdx = section?.childInfo?.children?.findIndex((ss) => ss.id === subsectionId) ?? 0;
    const unitCount = section?.childInfo?.children?.[subIdx]?.childInfo?.children?.length ?? 0;
    const numberPrefix = `${subIdx + 1}.${unitCount + 1}`;
    handleAddAndOpenUnit.mutate({
      type: ContainerType.Vertical,
      parentLocator: subsectionId,
      displayName: `Unit ${numberPrefix} Unit`,
      sectionId,
      subsectionId,
    });
  };

  const onCreateContent = useCallback(async () => {
    switch (blockType) {
      case 'section':
        addSection();
        break;
      case 'subsection':
        sectionParentId = currentFlow?.parentLocator || sectionParentId;
        if (sectionParentId) {
          addSubsection(sectionParentId);
        } else {
          addSection(({ locator }) => addSubsection(locator));
        }
        break;
      case 'unit':
        sectionParentId = currentFlow?.grandParentLocator || lastEditableSubsection?.sectionId || sectionParentId;
        subsectionParentId = currentFlow?.parentLocator || subsectionParentId;
        if (subsectionParentId) {
          addUnit(subsectionParentId, sectionParentId);
        } else if (sectionParentId) {
          addSubsection(sectionParentId, ({ locator }) => addUnit(locator));
        } else {
          addSection(({ locator: sectionId }) => {
            addSubsection(sectionId, ({ locator: subsectionId }) => {
              addUnit(subsectionId, sectionId);
            });
          });
        }
        break;
      default:
        // istanbul ignore next: unreachable
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unrecognized block type ${blockType}`);
    }
    stopCurrentFlow();
  }, [
    blockType,
    courseUsageKey,
    handleAddBlock,
    handleAddAndOpenUnit,
    currentFlow,
    sectionParentId,
    subsectionParentId,
    lastEditableSubsection,
  ]);

  const disabled = handleAddBlock.isPending || handleAddAndOpenUnit.isPending;

  return (
    <BlockCardButton
      name={name}
      blockType={blockType}
      onClick={onCreateContent}
      disabled={disabled}
    />
  );
};

/** Add New Content Tab Section */
const AddNewContent = () => {
  const intl = useIntl();
  const { isCurrentFlowOn, currentFlow, currentItemData } = useOutlineSidebarContext();
  const btns = useCallback(() => {
    if (currentFlow?.flowType) {
      return (
        <AddContentButton
          name={intl.formatMessage(contentMessages[`${currentFlow.flowType}Button`])}
          blockType={currentFlow.flowType}
        />
      );
    }
    return (
      <>
        <AddContentButton
          name={intl.formatMessage(contentMessages.sectionButton)}
          blockType={ContainerType.Section}
        />
        <AddContentButton
          name={intl.formatMessage(contentMessages.subsectionButton)}
          blockType={ContainerType.Subsection}
        />
        <AddContentButton
          name={intl.formatMessage(contentMessages.unitButton)}
          blockType={ContainerType.Unit}
        />
      </>
    );
  }, [currentFlow, intl]);

  if (!isCurrentFlowOn && currentItemData && !currentItemData.actions.childAddable) {
    return <CannotAddContentAlert />;
  }

  return (
    <Stack gap={2}>
      {btns()}
    </Stack>
  );
};

/** Main Sidebar Component */
export const AddSidebar = () => {
  const intl = useIntl();
  const { courseDetails } = useCourseAuthoringContext();
  const {
    isCurrentFlowOn,
    currentFlow,
    currentItemData,
    clearSelection,
    stopCurrentFlow,
    selectedContainerState,
  } = useOutlineSidebarContext();
  const { data: flowData } = useCourseItemData(currentFlow?.parentLocator);
  const titleAndIcon = useMemo(() => {
    if (isCurrentFlowOn && currentFlow) {
      return { title: flowData?.displayName || '', icon: getItemIcon(flowData?.category || '') };
    }
    if (currentItemData) {
      return { title: currentItemData.displayName, icon: getItemIcon(currentItemData.category) };
    }
    return { title: courseDetails?.name || '', icon: SchoolOutline };
  }, [
    isCurrentFlowOn,
    flowData,
    currentFlow,
    intl,
    getItemIcon,
    currentItemData,
    courseDetails,
  ]);

  const handleBack = () => {
    clearSelection();
    stopCurrentFlow();
  };

  return (
    <div>
      <SidebarTitle
        title={titleAndIcon.title}
        icon={titleAndIcon.icon}
        onBackBtnClick={(selectedContainerState || isCurrentFlowOn) ? handleBack : undefined}
      />
      <SidebarContent>
        <SidebarSection>
          <AddNewContent />
        </SidebarSection>
      </SidebarContent>
    </div>
  );
};
