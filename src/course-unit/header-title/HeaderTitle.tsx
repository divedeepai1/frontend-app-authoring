import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dropdown,
  Form,
  IconButton,
  useToggle,
} from '@openedx/paragon';
import {
  EditOutline as EditIcon,
  Settings as SettingsIcon,
} from '@openedx/paragon/icons';

import ConfigureModal from '@src/generic/configure-modal/ConfigureModal';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ConfigureUnitData } from '@src/course-outline/data/types';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { messageTypes, PUBLISH_TYPES } from '@src/course-unit/constants';
import { useConfigureUnitWithPageUpdates } from '@src/course-unit/data/apiHooks';
import {
  buildDisplayName,
  extractParts,
  TITLE_TYPE_OPTIONS,
} from '@src/compugrade/titleUtils';
import { getCourseUnitData } from '../data/selectors';
import { updateQueryPendingStatus } from '../data/slice';
import messages from './messages';
import { isUnitPageNewDesignEnabled } from '../utils';

type HeaderTitleProps = {
  unitTitle: string;
  isTitleEditFormOpen: boolean;
  handleTitleEdit: () => void;
  handleTitleEditSubmit: (title: string) => void;
};

/**
 * Unit header title with lesson-type dropdown.
 * Edit keeps type + number; only the string part is editable (cms Compugrade behavior).
 */
const HeaderTitle = ({
  unitTitle,
  isTitleEditFormOpen,
  handleTitleEdit,
  handleTitleEditSubmit,
}: HeaderTitleProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [titleValue, setTitleValue] = useState(unitTitle);
  const currentItemData = useSelector(getCourseUnitData);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const [selectedItem, setSelectedItem] = useState(
    extractParts(unitTitle).typePart || 'Unit',
  );

  const isXBlockComponent = [
    COURSE_BLOCK_NAMES.libraryContent.id,
    COURSE_BLOCK_NAMES.splitTest.id,
    COURSE_BLOCK_NAMES.component.id,
  ].includes(currentItemData.category);

  const configureFn = useConfigureUnitWithPageUpdates();
  const { sendMessageToIframe } = useIframe();
  const onConfigureSubmit = (variables: Omit<ConfigureUnitData, 'unitId'>) => {
    configureFn.mutate({
      ...variables,
      type: PUBLISH_TYPES.republish,
      unitId: currentItemData.id,
    }, {
      onSuccess: () =>
        sendMessageToIframe(
          messageTypes.completeManageXBlockAccess,
          { locator: currentItemData.id },
        ),
      onSettled: () => closeConfigureModal(),
    });
  };

  useEffect(() => {
    setTitleValue(unitTitle);
    setSelectedItem(extractParts(unitTitle).typePart || 'Unit');
    dispatch(updateQueryPendingStatus(true));
  }, [unitTitle]);

  const handleTypeChange = (item: string) => {
    const { numberPart, stringPart } = extractParts(titleValue);
    const formattedTitle = buildDisplayName(item, numberPart, stringPart);
    handleTitleEditSubmit(formattedTitle);
    setSelectedItem(item);
  };

  return (
    <div className="unit-header-title d-flex align-items-center lead" data-testid="unit-header-title">
      <li className="d-flex mr-3 list-unstyled">
        <Dropdown>
          <Dropdown.Toggle
            id="unit-lesson-type-dropdown"
            className="py-2 bg-transparent text-primary"
          >
            <span className="small text-gray-700 px-1">{selectedItem}</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {TITLE_TYPE_OPTIONS.map((item) => (
              <Dropdown.Item
                key={item}
                onClick={() => handleTypeChange(item)}
                data-testid="unit-lesson-type-dropdown-item"
              >
                {item}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </li>
      {isTitleEditFormOpen ?
        (
          <Form.Group className="m-0" isInvalid={!extractParts(titleValue).stringPart.trim()}>
            <Form.Control
              ref={(e) => e && e.focus()}
              value={extractParts(titleValue).stringPart}
              name="displayName"
              onChange={(e) => {
                const { numberPart, typePart } = extractParts(titleValue);
                setTitleValue(buildDisplayName(typePart, numberPart, e.target.value));
              }}
              aria-label={intl.formatMessage(messages.ariaLabelButtonEdit)}
              onBlur={() => {
                if (!extractParts(titleValue).stringPart.trim()) {
                  return;
                }
                handleTitleEditSubmit(titleValue);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (!extractParts(titleValue).stringPart.trim()) {
                    return;
                  }
                  handleTitleEditSubmit(titleValue);
                }
              }}
            />
            {!extractParts(titleValue).stringPart.trim() && (
              <Form.Control.Feedback type="invalid">
                This field is required.
              </Form.Control.Feedback>
            )}
          </Form.Group>
        ) :
        unitTitle}
      <IconButton
        alt={intl.formatMessage(messages.altButtonEdit)}
        className="ml-1 flex-shrink-0 edit-button"
        iconAs={EditIcon}
        onClick={handleTitleEdit}
      />
      {!isUnitPageNewDesignEnabled() && (
        <>
          <IconButton
            alt={intl.formatMessage(messages.altButtonSettings)}
            className="flex-shrink-0"
            iconAs={SettingsIcon}
            onClick={openConfigureModal}
          />
          <ConfigureModal
            isOpen={isConfigureModalOpen}
            onClose={closeConfigureModal}
            onConfigureSubmit={onConfigureSubmit}
            currentItemData={currentItemData}
            isSelfPaced={false}
            isXBlockComponent={isXBlockComponent}
          />
        </>
      )}
    </div>
  );
};

export default HeaderTitle;
