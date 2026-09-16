import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useIntl } from "@edx/frontend-platform/i18n";
import { Form, IconButton, useToggle } from "@openedx/paragon";
import {
  EditOutline as EditIcon,
  Settings as SettingsIcon,
} from "@openedx/paragon/icons";
import { Dropdown, Icon } from "@openedx/paragon";
import {
  ArrowDropDown as ArrowDropDownIcon,
  ChevronRight as ChevronRightIcon,
} from "@openedx/paragon/icons";

import ConfigureModal from "../../generic/configure-modal/ConfigureModal";
import { getCourseUnitData } from "../data/selectors";
import { updateQueryPendingStatus } from "../data/slice";
import messages from "./messages";

const HeaderTitle = ({
  unitTitle,
  isTitleEditFormOpen,
  handleTitleEdit,
  handleTitleEditSubmit,
  handleConfigureSubmit,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [titleValue, setTitleValue] = useState(unitTitle);
  const currentItemData = useSelector(getCourseUnitData);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] =
    useToggle(false);
  const { selectedPartitionIndex, selectedGroupsLabel } =
    currentItemData.userPartitionInfo;

  function extractParts(nextTitle) {
    const match = nextTitle.match(
      /^(Unit|Chapter|Lesson|Assessment|Part)?\s*(\d+(?:\.\d+)?)?\s*(.*)/i
    );
  
    const typePart = match ? match[1] : "";
    const numberPart = match ? match[2] : "";
    const stringPart = match ? match[3] : nextTitle;
  
    return { numberPart, typePart, stringPart };
  }

  const [selectedItem, setSelectedItem] = useState(extractParts(unitTitle).typePart || "Unit");
  const options = ["Unit", "Chapter", "Lesson", "Assessment"];

  useEffect(() => {
    setTitleValue(unitTitle);
    setSelectedItem(extractParts(unitTitle).typePart || "Unit");
    dispatch(updateQueryPendingStatus(true));
  }, [unitTitle]);

  const onConfigureSubmit = (...arg) => {
    handleConfigureSubmit(currentItemData.id, ...arg, closeConfigureModal);
  };

  const getVisibilityMessage = () => {
    let message;

    if (
      selectedPartitionIndex !== -1 &&
      !Number.isNaN(selectedPartitionIndex) &&
      selectedGroupsLabel
    ) {
      message = intl.formatMessage(messages.definedVisibilityMessage, {
        selectedGroupsLabel,
      });
    } else if (currentItemData.hasPartitionGroupComponents) {
      message = intl.formatMessage(messages.commonVisibilityMessage);
    }

    return message ? (
      <p className="header-title__visibility-message mb-0">{message}</p>
    ) : null;
  };

  const handleTypeChange = (item) => {
    const { numberPart, stringPart } = extractParts(titleValue);
    const formattedTitle = [item, numberPart, stringPart]
      .filter(Boolean)
      .join(" ");
    handleTitleEditSubmit(formattedTitle);
    setSelectedItem(item);
  };

  return (
    <>
      <div
        className="d-flex align-items-center lead"
        data-testid="unit-header-title"
      >
        <li className="d-flex mr-3">
          <Dropdown>
            <Dropdown.Toggle
              id="breadcrumbs-dropdown-section"
              className="py-2 bg-transparent text-primary"
            >
              <span className="small text-gray-700 px-1">{selectedItem}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {options.map((item, index) => (
                <Dropdown.Item
                  key={index}
                  onClick={() => handleTypeChange(item)}
                  data-testid="breadcrumbs-section-dropdown-item"
                >
                  {item}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </li>
        {isTitleEditFormOpen ? (
          <Form.Group className="m-0" isInvalid={!extractParts(titleValue).stringPart.trim()}>
            <Form.Control
              ref={(e) => e && e.focus()}
              value={extractParts(titleValue).stringPart}
              name="displayName"
              onChange={(e) => {
                const { numberPart, typePart } = extractParts(titleValue);
                setTitleValue(
                  [typePart,numberPart, e.target.value]
                    .filter(Boolean)
                    .join(" ")
                );
              }}
              aria-label={intl.formatMessage(messages.ariaLabelButtonEdit)}
              onBlur={() => {
                if (!extractParts(titleValue).stringPart.trim()) return;
                handleTitleEditSubmit(titleValue);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!extractParts(titleValue).stringPart.trim()) return;
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
        ) : (
          unitTitle
        )}
        <IconButton
          alt={intl.formatMessage(messages.altButtonEdit)}
          className="ml-1 flex-shrink-0"
          iconAs={EditIcon}
          onClick={handleTitleEdit}
        />
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
        />
      </div>
      {getVisibilityMessage()}
    </>
  );
};

HeaderTitle.propTypes = {
  unitTitle: PropTypes.string.isRequired,
  isTitleEditFormOpen: PropTypes.bool.isRequired,
  handleTitleEdit: PropTypes.func.isRequired,
  handleTitleEditSubmit: PropTypes.func.isRequired,
  handleConfigureSubmit: PropTypes.func.isRequired,
};

export default HeaderTitle;
