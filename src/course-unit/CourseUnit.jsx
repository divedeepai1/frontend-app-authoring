import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Layout, Stack } from "@openedx/paragon";
import { getConfig } from "@edx/frontend-platform";
import { useIntl, injectIntl } from "@edx/frontend-platform/i18n";
import { Warning as WarningIcon } from "@openedx/paragon/icons";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import DraggableList from "../editors/sharedComponents/DraggableList";
import { getProcessingNotification } from "../generic/processing-notification/data/selectors";
import SubHeader from "../generic/sub-header/SubHeader";
import { RequestStatus } from "../data/constants";
import getPageHeadTitle from "../generic/utils";
import AlertMessage from "../generic/alert-message";
import { PasteComponent } from "../generic/clipboard";
import ProcessingNotification from "../generic/processing-notification";
import { SavingErrorAlert } from "../generic/saving-error-alert";
import ConnectionErrorAlert from "../generic/ConnectionErrorAlert";
import Loading from "../generic/Loading";
import AddComponent from "./add-component/AddComponent";
import CourseXBlock from "./course-xblock/CourseXBlock";
import HeaderTitle from "./header-title/HeaderTitle";
import Breadcrumbs from "./breadcrumbs/Breadcrumbs";
import HeaderNavigations from "./header-navigations/HeaderNavigations";
import Sequence from "./course-sequence";
import Sidebar from "./sidebar";
import { useCourseUnit } from "./hooks";
import messages from "./messages";
import PublishControls from "./sidebar/PublishControls";
import LocationInfo from "./sidebar/LocationInfo";
import TagsSidebarControls from "../content-tags-drawer/tags-sidebar-controls";
import { PasteNotificationAlert } from "./clipboard";
import Attempts from "./sidebar/Attempts";
import AccessCode from "./sidebar/AccessCode";
import DueDate from "./sidebar/DueDate";
import { base_url } from "../compugrade-constants";
import InstructionXBlock from "../compugrade/components/InstructionXBlock.jsx";
import Timer from "./sidebar/Timer";
import { fetchCsrfToken } from "../cms-csrftoken";


const CourseUnit = ({ courseId }) => {
  const { blockId } = useParams();
  const intl = useIntl();
  const navigate = useNavigate();
  const {
    isLoading,
    sequenceId,
    unitTitle,
    errorMessage,
    sequenceStatus,
    savingStatus,
    isTitleEditFormOpen,
    staticFileNotices,
    currentlyVisibleToStudents,
    unitXBlockActions,
    sharedClipboardData,
    showPasteXBlock,
    showPasteUnit,
    handleTitleEditSubmit,
    headerNavigationsActions,
    handleTitleEdit,
    handleCreateNewCourseXBlock,
    handleConfigureSubmit,
    courseVerticalChildren,
    handleXBlockDragAndDrop,
    canPasteComponent,
  } = useCourseUnit({ courseId, blockId });

  const initialXBlocksData = useMemo(
    () => courseVerticalChildren.children ?? [],
    [courseVerticalChildren.children]
  );
  const [unitXBlocks, setUnitXBlocks] = useState(initialXBlocksData);

  const [unitData, setUnitData] = useState(null);
  

  const handleCreateCompugradeXBlock = (type) => {

    if(true){
      sessionStorage.setItem("unitTitle", unitTitle);
     if(type=="text"){
      sessionStorage.setItem("unitData", JSON.stringify(unitData));
     }
     if(type=="preview"){
      sessionStorage.setItem("unitData", JSON.stringify(unitData)); 
     }
     if(type =="skills")
     {
      
      sessionStorage.setItem("skills_used", JSON.stringify(unitData?.skills_used));
     }
     if(type == "engine"){
      
      sessionStorage.setItem("skills_used", JSON.stringify(unitData?.skills_used));
     }
     if(type=="new-lesson"){
      sessionStorage.setItem("new", "false");
     }
     if(type=="new"){
      sessionStorage.setItem("new", "true");  
     }
     navigate(`/course/${courseId}/block/${blockId}/${sequenceId}/${type=="text"?"engine":type=="new"? "new-lesson":type}`);
    }
  };

  useEffect(() => {
    sessionStorage.removeItem("unitData");
    sessionStorage.setItem("new", "false");
    sessionStorage.setItem("skills_used", JSON.stringify(unitData?.skills_used));
    
    const fetchData = async () => {
      try {
        const encodedBlockId = encodeURIComponent(blockId); 
        const response = await fetch(
          `${base_url}/api/openedx/get_rubric?openedx_based_id=${encodedBlockId}`,
          {
            method: "POST", 
            headers: {
              "Content-Type": "application/json", 
            },
            body: JSON.stringify({ name: "Hello" }), 
          }
        );

        const result = await response.json();
        setUnitData(result); 
      } catch (err) {
        
        console.log(err);
      }
    };

   

    blockId && fetchData();
    
  }, [blockId, courseId]);

  useEffect(() => {
    document.title = getPageHeadTitle("", unitTitle);
  }, [unitTitle]);

  useEffect(() => {
    const fetchCourseType = async () => {
      const token = await fetchCsrfToken();
      try {
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/myplugin/courses/`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": token,
            },
          }
        );

        if (response.ok) {
          const courses = await response.json();
          // Filter course by courseId
          const currentCourse = courses.find(course => course.id == courseId);
          
          if (currentCourse && currentCourse.course_type) {
            sessionStorage.setItem('courseTitle', currentCourse?.display_name);
            let sessionCourseType = currentCourse.course_type;
            
            // Handle different course type formats
            if (sessionCourseType === 'ms_powerpoint' || sessionCourseType === 'google_slides') {
              sessionCourseType = 'powerpoint';
            } else if (sessionCourseType === 'ms_excel' || sessionCourseType === 'google_sheets') {
              sessionCourseType = 'excel';
            } else if (sessionCourseType === 'ms_word' || sessionCourseType === 'google_docs') {
              sessionCourseType = 'ms-word';
            }
            
            sessionStorage.setItem('courseType', sessionCourseType);
            console.log('Course type set to:', sessionCourseType);
          } else {
            // Default fallback
            sessionStorage.setItem('courseType', 'ms-word');
            console.log('Course not found, defaulting to ms-word');
          }
        } else {
          console.error('Failed to fetch course information:', response.status);
          // Default fallback
          sessionStorage.setItem('courseType', 'ms-word');
        }
      } catch (err) {
        console.error('Error fetching course type:', err);
        // Default fallback
        sessionStorage.setItem('courseType', 'ms-word');
      }
    };
    fetchCourseType();
  }, []);



  useEffect(() => {
    setUnitXBlocks(courseVerticalChildren.children);
  }, [courseVerticalChildren.children]);

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  if (isLoading) {
    return <Loading />;
  }

  if (sequenceStatus === RequestStatus.FAILED) {
    return (
      <Container size="xl" className="course-unit px-4 mt-4">
        <ConnectionErrorAlert />
      </Container>
    );
  }

  const finalizeXBlockOrder = () => (newXBlocks) => {
    handleXBlockDragAndDrop(
      newXBlocks.map((xBlock) => xBlock.id),
      () => {
        setUnitXBlocks(initialXBlocksData);
      }
    );
  };



  const match = unitTitle.match(/^(Unit|Chapter|Lesson|Part)?\s*(\d+(?:\.\d+)?)?\s*(.*)/i), 
  numberPart = match ? match[2] : "", 
  typePart = match ? match[1] : "", 
  stringPart = match ? match[3] : unitTitle;


  

  
  

  return (
    <>
      <Container size="xl" className="course-unit px-4">
        <section className="course-unit-container mb-4 mt-5">
          <SubHeader
            hideBorder
            title={
              <HeaderTitle
                unitTitle={unitTitle}
                isTitleEditFormOpen={isTitleEditFormOpen}
                handleTitleEdit={handleTitleEdit}
                handleTitleEditSubmit={handleTitleEditSubmit}
                handleConfigureSubmit={handleConfigureSubmit}
              />
            }
            breadcrumbs={<Breadcrumbs  />}
            headerActions={
              <HeaderNavigations
                headerNavigationsActions={headerNavigationsActions}
              />
            }
          />
          <Sequence
            courseId={courseId}
            sequenceId={sequenceId}
            unitId={blockId}
            numberPart={numberPart}
            handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
            showPasteUnit={showPasteUnit}
          />
          <Layout
            lg={[{ span: 8 }, { span: 4 }]}
            md={[{ span: 8 }, { span: 4 }]}
            sm={[{ span: 8 }, { span: 3 }]}
            xs={[{ span: 9 }, { span: 3 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              {currentlyVisibleToStudents && (
                <AlertMessage
                  className="course-unit__alert"
                  title={intl.formatMessage(messages.alertUnpublishedVersion)}
                  variant="warning"
                  icon={WarningIcon}
                />
              )}
              {staticFileNotices && (
                <PasteNotificationAlert
                  staticFileNotices={staticFileNotices}
                  courseId={courseId}
                />
              )}
              <Stack className="mb-4 course-unit__xblocks">
                <DraggableList
                  itemList={unitXBlocks}
                  setState={setUnitXBlocks}
                  updateOrder={finalizeXBlockOrder}
                >
                  <SortableContext
                    id="root"
                    items={unitXBlocks}
                    strategy={verticalListSortingStrategy}
                  >
                    {unitXBlocks.map(
                      ({
                        name,
                        id,
                        blockType: type,
                        shouldScroll,
                        userPartitionInfo,
                        validationMessages,
                      }) => (
                        <CourseXBlock
                          id={id}
                          key={id}
                          title={name}
                          type={type}
                          blockId={blockId}
                          validationMessages={validationMessages}
                          shouldScroll={shouldScroll}
                          handleConfigureSubmit={handleConfigureSubmit}
                          unitXBlockActions={unitXBlockActions}
                          data-testid="course-xblock"
                          userPartitionInfo={userPartitionInfo}
                        />
                      )
                    )}
                   {unitData?.description	 && <InstructionXBlock title={"Overview"}  data={unitData.description	} type={"overview"} handleEdit={handleCreateCompugradeXBlock}/>}
                   {unitData?.tools && <InstructionXBlock title={"Tools and Terms"} data={unitData.tools} type={"tools"} handleEdit={handleCreateCompugradeXBlock}/>}
                   {unitData?.skills_used?.length > 0 && <InstructionXBlock title={"Skills"}  data={unitData?.skills_used?.map(item => item.customer_facing_name).join(", ")} type={"skills"} handleEdit={handleCreateCompugradeXBlock}/>}
                   {unitData?.text && <InstructionXBlock title={"CWE Preview"} data={""}  type={"text"} handleEdit={handleCreateCompugradeXBlock}/>}
                   {unitData?.items?.length > 0 && <InstructionXBlock title={"Addin Preview"} data={""} preview={true} type={"preview"} handleEdit={handleCreateCompugradeXBlock}/> }
                   {unitData?.rubric && <InstructionXBlock title={"MultiPart Lesson"} data={""}  type={"new-lesson"} handleEdit={handleCreateCompugradeXBlock}/> }


                  </SortableContext>
                </DraggableList>
              </Stack>
              <AddComponent
                blockId={blockId}
                handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
                handleCreateCompugradeXBlock={handleCreateCompugradeXBlock}
              />
              {showPasteXBlock && canPasteComponent && (
                <PasteComponent
                  clipboardData={sharedClipboardData}
                  onClick={handleCreateNewCourseXBlock}
                  text={intl.formatMessage(messages.pasteButtonText)}
                />
              )}
            </Layout.Element>
            <Layout.Element>
              <Stack gap={3}>
                <Sidebar data-testid="course-unit-sidebar">
                  <PublishControls blockId={blockId} />
                </Sidebar>
                {getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === "true" && (
                  <Sidebar className="tags-sidebar">
                    <TagsSidebarControls />
                  </Sidebar>
                )}
                {unitData && (
                  <Sidebar data-testid="course-unit-attempts-sidebar">
                    <Attempts
                      attempts={unitData.num_of_attempts}
                      blockId={blockId}
                    />
                  </Sidebar>
                )}
                 {unitData && (
                  <Sidebar data-testid="course-unit-attempts-sidebar">
                    <Timer
                      attempts={unitData?.time_allowed}
                      blockId={blockId}
                    />
                  </Sidebar>
                )}
                {unitData && (
                  <Sidebar data-testid="course-unit-access-code-sidebar">
                    <AccessCode accessCode={unitData.access_id} />
                  </Sidebar>
                )}
                {unitData && (
                  <Sidebar data-testid="course-unit-access-code-sidebar">
                    <DueDate date={unitData.due_date} blockId={blockId} />
                  </Sidebar>
                )}
                <Sidebar data-testid="course-unit-location-sidebar">
                  <LocationInfo />
                </Sidebar>
              </Stack>
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <div className="alert-toast">
        <ProcessingNotification
          isShow={isShowProcessingNotification}
          title={processingNotificationTitle}
        />
        <SavingErrorAlert
          savingStatus={savingStatus}
          errorMessage={errorMessage}
        />
      </div>
    </>
  );
};

CourseUnit.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(CourseUnit);
