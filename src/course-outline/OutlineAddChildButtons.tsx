import {
  Button,
  Col,
  IconButton,
  Row,
  Stack,
} from '@openedx/paragon';
import { Add as IconAdd, Close } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ContainerType } from '@src/generic/key-utils';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseOutlineContext } from '@src/course-outline/CourseOutlineContext';
import { LoadingSpinner } from '@src/generic/Loading';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import messages from './messages';

/**
 * Placeholder component that is displayed when a user clicks the "Use content from library" button.
 * Shows a loading spinner when the component is selected and being added to the course.
 * Finally it is hidden once the add component operation is complete and the content is successfully
 * added to the course.
 * @param props.parentLocator The locator of the parent flow item to which the content will be added.
 */
const AddPlaceholder = ({ parentLocator }: { parentLocator?: string; }) => {
  const intl = useIntl();
  const { isCurrentFlowOn, currentFlow, stopCurrentFlow } = useOutlineSidebarContext();
  const {
    handleAddBlock,
    handleAddAndOpenUnit,
  } = useCourseOutlineContext();

  if (!isCurrentFlowOn || currentFlow?.parentLocator !== parentLocator) {
    return null;
  }

  const getTitle = () => {
    switch (currentFlow?.flowType) {
      case ContainerType.Section:
        return intl.formatMessage(messages.placeholderSectionText);
      case ContainerType.Subsection:
        return intl.formatMessage(messages.placeholderSubsectionText);
      case ContainerType.Unit:
        return intl.formatMessage(messages.placeholderUnitText);
      default:
        // istanbul ignore next: this should never happen
        throw new Error('Unknown flow type');
    }
  };

  return (
    <Row className="mx-0 py-3 px-4 border-dashed border-gray-500 shadow-lg rounded bg-white w-100">
      <Col className="py-3">
        <Stack direction="horizontal" gap={3}>
          {(handleAddAndOpenUnit.isPending || handleAddBlock.isPending) && <LoadingSpinner />}
          <h3 className="mb-0">{getTitle()}</h3>
          <IconButton
            src={Close}
            alt="Close"
            onClick={stopCurrentFlow}
            variant="dark"
            className="ml-auto"
          />
        </Stack>
      </Col>
    </Row>
  );
};

interface ChildButtonsProps {
  handleNewButtonClick?: () => void;
  onClickCard?: (e: React.MouseEvent) => void;
  childType: ContainerType;
  btnVariant?: string;
  btnClasses?: string;
  btnSize?: 'sm' | 'md' | 'lg' | 'inline';
  parentLocator: string;
  grandParentLocator?: string;
}

const OutlineAddChildButtons = ({
  handleNewButtonClick,
  onClickCard,
  childType,
  btnVariant = 'outline-primary',
  btnClasses = 'mt-4 border-gray-500 rounded-0',
  btnSize,
  parentLocator,
  grandParentLocator,
}: ChildButtonsProps) => {
  const intl = useIntl();
  const { courseUsageKey } = useCourseAuthoringContext();
  const {
    handleAddBlock,
    handleAddAndOpenUnit,
    sections,
  } = useCourseOutlineContext();
  const { openContainerInfoSidebar } = useOutlineSidebarContext();
  let messageMap = {
    newButton: messages.newUnitButton,
  };
  let onNewCreateContent: () => Promise<void>;

  // Based on the childType, determine the correct action and messages to display.
  switch (childType) {
    case ContainerType.Section:
      messageMap = {
        newButton: messages.newSectionButton,
      };
      onNewCreateContent = () =>
        handleAddBlock.mutateAsync({
          type: ContainerType.Chapter,
          parentLocator: courseUsageKey,
          displayName: COURSE_BLOCK_NAMES.chapter.name,
        }, {
          onSuccess: (data: { locator: string; }) => {
            openContainerInfoSidebar(data.locator, undefined, data.locator);
          },
        });
      break;
    case ContainerType.Subsection:
      messageMap = {
        newButton: messages.newSubsectionButton,
      };
      onNewCreateContent = () =>
        handleAddBlock.mutateAsync({
          type: ContainerType.Sequential,
          parentLocator,
          displayName: COURSE_BLOCK_NAMES.sequential.name,
          sectionId: parentLocator,
        }, {
          onSuccess: (data: { locator: string; }) => {
            openContainerInfoSidebar(data.locator, data.locator, parentLocator);
          },
        });
      break;
    case ContainerType.Unit:
      messageMap = {
        newButton: messages.newUnitButton,
      };
      onNewCreateContent = () => {
        // Match cms-edx-frontend: "Unit {subsectionIndex}.{unitIndex} Unit"
        const section = sections.find((s) => s.id === grandParentLocator);
        const subIdx = section?.childInfo?.children?.findIndex((ss) => ss.id === parentLocator) ?? 0;
        const unitCount = section?.childInfo?.children?.[subIdx]?.childInfo?.children?.length ?? 0;
        const numberPrefix = `${subIdx + 1}.${unitCount + 1}`;
        const displayName = `Unit ${numberPrefix} Unit`;
        return handleAddAndOpenUnit.mutateAsync({
          type: ContainerType.Vertical,
          parentLocator,
          displayName,
          sectionId: grandParentLocator,
          subsectionId: parentLocator,
        });
      };
      break;
    default:
      // istanbul ignore next: unreachable
      throw new Error(`Unrecognized block type ${childType}`);
  }

  return (
    <>
      <AddPlaceholder parentLocator={parentLocator} />
      <Stack direction="horizontal" gap={3} onClick={onClickCard} className="w-100">
        <Button
          className={`${btnClasses} w-100`}
          variant={btnVariant}
          iconBefore={IconAdd}
          size={btnSize}
          block
          onClick={handleNewButtonClick || onNewCreateContent}
        >
          {intl.formatMessage(messageMap.newButton)}
        </Button>
      </Stack>
    </>
  );
};

export default OutlineAddChildButtons;
