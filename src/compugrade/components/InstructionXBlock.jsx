import {
  ActionRow,
  Card,
  Dropdown,
  Icon,
  IconButton,
  useToggle,
} from "@openedx/paragon";
import {
  EditOutline as EditIcon,
  MoreVert as MoveVertIcon,
} from "@openedx/paragon/icons";
import DeleteModal from "../../generic/delete-modal/DeleteModal.jsx";
import "./components.css"
const InstructionXBlock = ({ title, data, handleEdit, type }) => {
  return (
    <div className={"course-unit__xblock instruction-xblock"}>
      <Card
        category="xblock"
        componentStyle={{ marginBottom: 0 }}
        style={{ padding: "16px 24px", paddingTop: 0 }}
      >
        <Card.Header
          title={title}
          actions={
            <ActionRow className="mr-2" style={{padding: "0px !important"}}>
              <IconButton
                // alt={intl.formatMessage(messages.blockAltButtonEdit)}
                iconAs={EditIcon}
                onClick={()=>handleEdit(type)}
              />
              <Dropdown>
                <Dropdown.Toggle
                  // id={id}
                  as={IconButton}
                  src={MoveVertIcon}
                  // alt={intl.formatMessage(messages.blockActionsDropdownAlt)}
                  iconAs={Icon}
                />
                <Dropdown.Menu>
                  <Dropdown.Item>Copy to clipboard</Dropdown.Item>
                  <Dropdown.Item
                  // onClick={openDeleteModal}
                  >
                    Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <DeleteModal
                category="component"
                // isOpen={isDeleteModalOpen}
                // close={closeDeleteModal}
                // onDeleteSubmit={onDeleteSubmit}
              />
              {/* <ConfigureModal
                isXBlockComponent
                isOpen={isConfigureModalOpen}
                onClose={closeConfigureModal}
                onConfigureSubmit={onConfigureSubmit}
                currentItemData={currentItemData}
              /> */}
            </ActionRow>
          }
        />
        <Card.Section>
          <div
            className="w-100 bg-gray-100 p-1"
            style={{ height: 200 }}
            dangerouslySetInnerHTML={{ __html: data }}
          ></div>
        </Card.Section>
      </Card>
    </div>
  );
};

export default InstructionXBlock;
