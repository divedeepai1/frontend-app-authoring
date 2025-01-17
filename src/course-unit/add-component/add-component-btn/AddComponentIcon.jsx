import PropTypes from "prop-types";
import { Icon } from "@openedx/paragon";
import { EditNote as EditNoteIcon } from "@openedx/paragon/icons";

import overviewIcon from "../../../compugrade-assets/overview.png"
import skillsIcon from "../../../compugrade-assets/skills.png"
import toolsIcon from "../../../compugrade-assets/tools.png"
import {
  COMPONENT_TYPES,
  COMPONENT_TYPE_ICON_MAP,
} from "../../../generic/block-type-utils/constants";

const customTypeIcons = {
  overview: overviewIcon,
  skills: skillsIcon,
  tools: toolsIcon
};

const AddComponentIcon = ({ type }) => {
  if (customTypeIcons[type]) {
    return <img src={customTypeIcons[type]} alt={type} style={{width:'20px'}}/>;
  }

  const icon = COMPONENT_TYPE_ICON_MAP[type] || EditNoteIcon;
  return <Icon src={icon} screenReaderText={type} />;
};

AddComponentIcon.propTypes = {
  type: PropTypes.oneOf([
    ...Object.values(COMPONENT_TYPES),
    "overview",
    "skills",
    "tools",
  ]).isRequired,
};

export default AddComponentIcon;
