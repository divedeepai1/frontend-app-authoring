import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useIntl } from "@edx/frontend-platform/i18n";
import { useToggle } from "@openedx/paragon";

import { getCourseSectionVertical } from "../data/selectors";
import { COMPONENT_TYPES } from "../../generic/block-type-utils/constants";
import ComponentModalView from "./add-component-modals/ComponentModalView";
import AddComponentButton from "./add-component-btn";
import messages from "./messages";
import writer from "../../cms-edx-frontend/assests/writer.svg";
import overwiew from "../../cms-edx-frontend/assests/overview.svg";
import skills from "../../cms-edx-frontend/assests/skills.svg";
import text from "../../cms-edx-frontend/assests/text.svg";
import tools from "../../cms-edx-frontend/assests/text.svg";

const AddComponent = ({
  blockId,
  handleCreateNewCourseXBlock,
  handleCreateCompugradeXBlock,
}) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const [isOpenAdvanced, openAdvanced, closeAdvanced] = useToggle(false);
  const [isOpenHtml, openHtml, closeHtml] = useToggle(false);
  const [isOpenOpenAssessment, openOpenAssessment, closeOpenAssessment] =
    useToggle(false);
  const { componentTemplates } = useSelector(getCourseSectionVertical);

  const handleCreateNewXBlock = (type, moduleName) => {
    switch (type) {
      case COMPONENT_TYPES.discussion:
      case COMPONENT_TYPES.dragAndDrop:
        handleCreateNewCourseXBlock({ type, parentLocator: blockId });
        break;
      case COMPONENT_TYPES.problem:
      case COMPONENT_TYPES.video:
        handleCreateNewCourseXBlock(
          { type, parentLocator: blockId },
          ({ courseKey, locator }) => {
            navigate(`/course/${courseKey}/editor/${type}/${locator}`);
          }
        );
        break;
      // TODO: The library functional will be a bit different of current legacy (CMS)
      //  behaviour and this ticket is on hold (blocked by other development team).
      case COMPONENT_TYPES.library:
        handleCreateNewCourseXBlock({
          type,
          category: "library_content",
          parentLocator: blockId,
        });
        break;
      case COMPONENT_TYPES.advanced:
        handleCreateNewCourseXBlock({
          type: moduleName,
          category: moduleName,
          parentLocator: blockId,
        });
        break;
      case COMPONENT_TYPES.openassessment:
        handleCreateNewCourseXBlock({
          boilerplate: moduleName,
          category: type,
          parentLocator: blockId,
        });
        break;
      case COMPONENT_TYPES.html:
        handleCreateNewCourseXBlock(
          {
            type,
            boilerplate: moduleName,
            parentLocator: blockId,
          },
          ({ courseKey, locator }) => {
            navigate(`/course/${courseKey}/editor/html/${locator}/${blockId}`);
          }
        );
        break;
      default:
    }
  };

  if (!Object.keys(componentTemplates).length) {
    return null;
  }

  return (
    <div className="py-4">
      <h5 className="h3 mb-4 text-center">
        {intl.formatMessage(messages.title)}
      </h5>
      <ul className="new-component-type list-unstyled m-0 d-flex flex-wrap justify-content-center">
        <li>
          <AddComponentButton
            onClick={() => handleCreateCompugradeXBlock("overview")}
            displayName={"Overview"}
            icon={overwiew}
            type={"overview"}
            border="1px solid #F3B17A"
            background="rgba(243, 177, 122, 0.50)"
            box-shadow=" 0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
          />
        </li>
        <li>
          <AddComponentButton
            onClick={() => handleCreateCompugradeXBlock("skills")}
            displayName={"Skills"}
            border="1px solid #B878BE"
            background="rgba(184, 120, 190, 0.50)"
            boxshadow="0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
            icon={skills}
            type={"skills"}
          />
        </li>
        <li>
          <AddComponentButton
            onClick={() => handleCreateCompugradeXBlock("tools")}
            displayName={"Tools and Terms"}
            type={"tools"}
            border="1px solid #E2CA12"
            background="#F8FFBA"
            box-shadow="0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
          />
        </li>
        <li>
          <AddComponentButton
            onClick={() => handleCreateCompugradeXBlock("text")}
            displayName={"Document Text"}
            border="1px solid #FF5959"
            icon={text}
            background="rgba(255, 89, 89, 0.30)"
            boxshadow="0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
            type={"text"}
          />
        </li>
        <li>
          <AddComponentButton
            border="1px solid #285491"
            background="rgba(79, 179, 223, 0.30)"
            boxshadow="0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
            onClick={() => handleCreateCompugradeXBlock("engine")}
            icon={writer}
            displayName={"Compugrade Writer Engine"}
            type={"engine"}
          />
        </li>
        {componentTemplates.map((component) => {
          const { type, displayName } = component;
          let modalParams;

          if (!component.templates.length) {
            return null;
          }

          switch (type) {
            case COMPONENT_TYPES.advanced:
              modalParams = {
                open: openAdvanced,
                close: closeAdvanced,
                isOpen: isOpenAdvanced,
              };
              break;
            case COMPONENT_TYPES.html:
              modalParams = {
                open: openHtml,
                close: closeHtml,
                isOpen: isOpenHtml,
              };
              break;
            case COMPONENT_TYPES.openassessment:
              modalParams = {
                open: openOpenAssessment,
                close: closeOpenAssessment,
                isOpen: isOpenOpenAssessment,
              };
              break;
            default:
              return (
                <li key={type}>
                  <AddComponentButton
                    onClick={() => handleCreateNewXBlock(type)}
                    displayName={displayName}
                    type={type}
                  />
                </li>
              );
          }

          return (
            <ComponentModalView
              key={type}
              component={component}
              handleCreateNewXBlock={handleCreateNewXBlock}
              modalParams={modalParams}
            />
          );
        })}
      </ul>
    </div>
  );
};

AddComponent.propTypes = {
  blockId: PropTypes.string.isRequired,
  handleCreateNewCourseXBlock: PropTypes.func.isRequired,
};

export default AddComponent;
