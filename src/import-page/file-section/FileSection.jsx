import React, { useState } from 'react';
import {
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Dropzone } from '@openedx/paragon';

import { IMPORT_STAGES } from '../data/constants';
import {
  getCurrentStage, getError, getFileName, getImportTriggered,
} from '../data/selectors';
import messages from './messages';
import { handleProcessUpload } from '../data/thunks';
import { updateExportedLessonMetadata } from '../data/slice';

const FileSection = ({ intl, courseId }) => {
  const dispatch = useDispatch();
  const importTriggered = useSelector(getImportTriggered);
  const currentStage = useSelector(getCurrentStage);
  const fileName = useSelector(getFileName);
  const { hasError } = useSelector(getError);
  const isShowedDropzone = !importTriggered || currentStage === IMPORT_STAGES.SUCCESS || hasError;
  const [metadataFileName, setMetadataFileName] = useState(null);
  const [metadataMessage, setMetadataMessage] = useState(null);

  const handleMetadataUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      setMetadataMessage({ type: 'error', text: intl.formatMessage(messages.metadataInvalidType) });
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.courseId) {
        throw new Error('Missing courseId in metadata file');
      }

      dispatch(updateExportedLessonMetadata(data));

      setMetadataFileName(file.name);
      setMetadataMessage({
        type: 'success',
        text: intl.formatMessage(messages.metadataLoaded, { courseId: data.courseId }),
      });
    } catch (error) {
      setMetadataMessage({
        type: 'error',
        text: intl.formatMessage(messages.metadataInvalidContent),
      });
    } finally {
      // Reset input so the same file can be re-selected if needed
      event.target.value = '';
    }
  };

  return (
    <Card>
      <Card.Header
        className="h3 px-3 text-black"
        title={intl.formatMessage(messages.headingTitle)}
        subtitle={fileName && intl.formatMessage(messages.fileChosen, { fileName })}
      />
      <Card.Section className="px-3 pt-2 pb-4">
        <div className="mb-4">
          <p className="small mb-2">
            {intl.formatMessage(messages.metadataInstructions)}
          </p>
          <label className="form-label mb-1" htmlFor="metadata-upload">
            {intl.formatMessage(messages.metadataLabel)}
          </label>
          <input
            id="metadata-upload"
            type="file"
            accept=".json,application/json"
            className="form-control"
            onChange={handleMetadataUpload}
          />
          {metadataFileName && (
            <p className="small text-muted mt-2">
              {intl.formatMessage(messages.metadataFileChosen, { fileName: metadataFileName })}
            </p>
          )}
          {metadataMessage && (
            <p className={`small mt-2 ${metadataMessage.type === 'error' ? 'text-danger' : 'text-success'}`}>
              {metadataMessage.text}
            </p>
          )}
        </div>
        {isShowedDropzone && metadataMessage?.type === 'success' && (
          <Dropzone
            onProcessUpload={
              ({ fileData, requestConfig, handleError }) => dispatch(handleProcessUpload(
                courseId,
                fileData,
                requestConfig,
                handleError,
              ))
            }
            accept={{ 'application/gzip': ['.tar.gz'] }}
            data-testid="dropzone"
          />
        )}
      </Card.Section>
    </Card>
  );
};

FileSection.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(FileSection);
