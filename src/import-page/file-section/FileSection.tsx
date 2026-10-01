import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Card, Dropzone } from '@openedx/paragon';

import { IMPORT_STAGES } from '../data/constants';
import messages from './messages';
import { useCourseImportContext } from '../CourseImportContext';

const FileSection = () => {
  const intl = useIntl();
  const [metadataFileName, setMetadataFileName] = useState<string | null>(null);
  const [metadataMessage, setMetadataMessage] = useState<{ type: string; text: string; } | null>(null);

  const {
    importTriggered,
    currentStage,
    fileName,
    anyRequestFailed,
    handleOnProcessUpload,
    setExportedLessonMetadata,
  } = useCourseImportContext();

  const isShowedDropzone = !importTriggered || currentStage === IMPORT_STAGES.SUCCESS || anyRequestFailed;

  const handleMetadataUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.name.endsWith('.json')) {
      setMetadataMessage({ type: 'error', text: intl.formatMessage(messages.metadataInvalidType) });
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.courseId) {
        throw new Error('Missing courseId in metadata file');
      }
      setExportedLessonMetadata(data);
      setMetadataFileName(file.name);
      setMetadataMessage({
        type: 'success',
        text: intl.formatMessage(messages.metadataLoaded, { courseId: data.courseId }),
      });
    } catch {
      setMetadataMessage({
        type: 'error',
        text: intl.formatMessage(messages.metadataInvalidContent),
      });
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
        <div className="mb-3">
          <p className="small text-muted mb-2">
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
            <p className="small mt-2 mb-0">
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
            onProcessUpload={handleOnProcessUpload}
            accept={{ 'application/x-tar.gz': ['.tar.gz'] }}
            data-testid="dropzone"
            style={{ height: '200px' }}
          />
        )}
        {isShowedDropzone && metadataMessage?.type !== 'success' && (
          <Dropzone
            onProcessUpload={handleOnProcessUpload}
            accept={{ 'application/x-tar.gz': ['.tar.gz'] }}
            data-testid="dropzone"
            style={{ height: '200px' }}
          />
        )}
      </Card.Section>
    </Card>
  );
};

export default FileSection;
