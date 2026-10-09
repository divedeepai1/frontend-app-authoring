import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
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
 * Unit header title.
 * Type + number are display-only; only the name (string part) is editable (cms Compugrade behavior).
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

  const { typePart, numberPart, stringPart } = extractParts(titleValue);
  const typeLabel = typePart || 'Unit';

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
    dispatch(updateQueryPendingStatus(true));
  }, [unitTitle]);

  return (
    <div className="unit-header-title d-flex align-items-center lead" data-testid="unit-header-title">
      <span className="small text-gray-700 mr-2 font-weight-bold">{typeLabel}</span>
      {numberPart && (
        <span className="small text-gray-700 mr-2">{numberPart}</span>
      )}
      {isTitleEditFormOpen ?
        (
          <Form.Group className="m-0" isInvalid={!stringPart.trim()}>
            <Form.Control
              ref={(e) => e && e.focus()}
              value={stringPart}
              name="displayName"
              onChange={(e) => {
                const parts = extractParts(titleValue);
                setTitleValue(buildDisplayName(
                  parts.typePart || 'Unit',
                  parts.numberPart,
                  e.target.value,
                ));
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
        (
          <span>{stringPart || unitTitle}</span>
        )}
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
