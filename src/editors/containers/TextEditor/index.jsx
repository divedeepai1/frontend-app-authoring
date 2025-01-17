import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Button, Spinner, Toast } from "@openedx/paragon";
import { injectIntl, intlShape } from "@edx/frontend-platform/i18n";

import { getConfig } from "@edx/frontend-platform";
import { actions, selectors } from "../../data/redux";
import { RequestKeys } from "../../data/constants/requests";

import EditorContainer from "../EditorContainer";
import RawEditor from "../../sharedComponents/RawEditor";
import * as hooks from "./hooks";
import messages from "./messages";
import TinyMceWidget from "../../sharedComponents/TinyMceWidget";
import {
  prepareEditorRef,
  replaceStaticWithAsset,
} from "../../sharedComponents/TinyMceWidget/hooks";
import InstructionsPreview from "../../../compugrade/components/InstructionsPreview";
import { base_url } from "../../../compugrade-constants";
import { useParams } from "react-router";

const TextEditor = ({
  onClose,
  returnFunction,
  // redux
  showRawEditor,
  blockValue,
  blockId,
  blockFailed,
  initializeEditor,
  blockFinished,
  learningContextId,
  images,
  isLibrary,
  // inject
  intl,
}) => {
  const { editorRef, refReady, setEditorRef } = prepareEditorRef();
  const initialContent = blockValue ? blockValue.data.data : "";
  const newContent = replaceStaticWithAsset({
    initialContent,
    learningContextId,
  });
  const editorContent = newContent || initialContent;

  const { unitId } = useParams();
  const encodedBlockId = encodeURIComponent(unitId); // Encode the block ID
  const [lessonData, setLessonData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a state variable for triggering useEffect


  const fetchData = async () => {
    try {
      const response = await fetch(
        `${base_url}/api/openedx/get_all_edx_rubric_items?openedx_based_id=${encodedBlockId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: "Hello" }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setLessonData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handlePreview = async () => {
    const editorText = editorRef.current.getContent({ format: "text" });
    const stringArray = editorText
      .split("\n")
      .filter((str) => str.trim() !== "");
    setLessonData(null);
    try {
      const response = await fetch(
        `${base_url}/api/openedx/create_rubric_item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rubric_openedx_based_id: unitId,
            natural_text: stringArray,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setRefreshKey(prev => prev + 1); // Increment instead of toggle
    } catch (err) {
      console.error(err);
    }
  };

  let staticRootUrl;
  if (isLibrary) {
    staticRootUrl = `${
      getConfig().STUDIO_BASE_URL
    }/library_assets/blocks/${blockId}/`;
  }

  if (!refReady) {
    return null;
  }


  const selectEditor = () => {
    if (showRawEditor) {
      return <RawEditor editorRef={editorRef} content={blockValue} />;
    }
    return (
      <div style={{ display: "flex", gap: "15px" }}>
        <div style={{ width: "70%" }}>
          <TinyMceWidget
            editorType="text"
            editorRef={editorRef}
            editorContentHtml={editorContent}
            setEditorRef={setEditorRef}
            minHeight={500}
            height="100%"
            initializeEditor={initializeEditor}
            {...{
              images,
              isLibrary,
              learningContextId,
              staticRootUrl,
            }}
          />
          <div className="d-flex mt-3">
            <Button variant="primary" onClick={handlePreview}>
              AI Generate
            </Button>
          </div>
        </div>
        <div style={{ width: "30%", overflowY:"auto" }}>
          <InstructionsPreview lessonData={lessonData} refreshData={fetchData} // Pass fetch function instead of refresh state
 />
        </div>
      </div>
    );
  };

  return (
    <EditorContainer
      getContent={hooks.getContent({ editorRef, showRawEditor })}
      isDirty={hooks.isDirty({ editorRef, showRawEditor })}
      onClose={onClose}
      returnFunction={returnFunction}
    >
      <div className="editor-body h-75 overflow-auto">
        <Toast show={blockFailed} onClose={hooks.nullMethod}>
          {intl.formatMessage(messages.couldNotLoadTextContext)}
        </Toast>

        {!blockFinished ? (
          <div className="text-center p-6">
            <Spinner
              animation="border"
              className="m-3"
              screenreadertext={intl.formatMessage(
                messages.spinnerScreenReaderText
              )}
            />
          </div>
        ) : (
          selectEditor()
        )}
      </div>
    </EditorContainer>
  );
};
TextEditor.defaultProps = {
  blockValue: null,
  blockFinished: null,
  returnFunction: null,
};
TextEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
  returnFunction: PropTypes.func,
  // redux
  blockValue: PropTypes.shape({
    data: PropTypes.shape({ data: PropTypes.string }),
  }),
  blockId: PropTypes.string,
  blockFailed: PropTypes.bool.isRequired,
  initializeEditor: PropTypes.func.isRequired,
  showRawEditor: PropTypes.bool.isRequired,
  blockFinished: PropTypes.bool,
  learningContextId: PropTypes.string, // This should be required but is NULL when the store is in initial state :/
  images: PropTypes.shape({}).isRequired,
  isLibrary: PropTypes.bool.isRequired,
  // inject
  intl: intlShape.isRequired,
};

export const mapStateToProps = (state) => ({
  blockValue: selectors.app.blockValue(state),
  blockFailed: selectors.requests.isFailed(state, {
    requestKey: RequestKeys.fetchBlock,
  }),
  blockId: selectors.app.blockId(state),
  showRawEditor: selectors.app.showRawEditor(state),
  blockFinished: selectors.requests.isFinished(state, {
    requestKey: RequestKeys.fetchBlock,
  }),
  learningContextId: selectors.app.learningContextId(state),
  images: selectors.app.images(state),
  isLibrary: selectors.app.isLibrary(state),
});

export const mapDispatchToProps = {
  initializeEditor: actions.app.initializeEditor,
};

export const TextEditorInternal = TextEditor; // For testing only
export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(TextEditor)
);
