import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Card, Dropzone } from '@openedx/paragon';

import { IMPORT_STAGES } from '../data/constants';
import { prepareExportMetadataForImport } from '../utils/parseExportMetadataFile';
import messages from './messages';
import { useCourseImportContext } from '../CourseImportContext';

const FileSection = () => {
  const intl = useIntl();
  const [metadataFileName, setMetadataFileName] = useState<string | null>(null);
  const [metadataMessage, setMetadataMessage] = useState<{ type: string; text: string; } | null>(null);
  const [isPreparingMetadata, setIsPreparingMetadata] = useState(false);

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
    setIsPreparingMetadata(true);
    setMetadataMessage({
      type: 'info',
      text: file.size > 24 * 1024 * 1024
        ? 'Preparing large metadata file (memory-safe)…'
        : 'Reading metadata file…',
    });
    try {
      // Small files: full object in memory. Large files: unit-by-unit IndexedDB (exact data).
      const prepared = await prepareExportMetadataForImport(file, {
        onProgress: (done) => {
          setMetadataMessage({
            type: 'info',
            text: `Preparing large metadata… ${done} unit(s) indexed`,
          });
        },
      });
      setExportedLessonMetadata(prepared);
      setMetadataFileName(file.name);
      setMetadataMessage({
        type: 'success',
        text: intl.formatMessage(messages.metadataLoaded, { courseId: prepared.courseId }),
      });
    } catch {
      setExportedLessonMetadata(undefined);
      setMetadataMessage({
        type: 'error',
        text: intl.formatMessage(messages.metadataInvalidContent),
      });
    } finally {
      setIsPreparingMetadata(false);
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
            disabled={isPreparingMetadata}
          />
          {metadataFileName && (
            <p className="small mt-2 mb-0">
              {intl.formatMessage(messages.metadataFileChosen, { fileName: metadataFileName })}
            </p>
          )}
          {metadataMessage && (
            <p
              className={`small mt-2 ${
                metadataMessage.type === 'error'
                  ? 'text-danger'
                  : metadataMessage.type === 'info'
                    ? 'text-muted'
                    : 'text-success'
              }`}
            >
              {metadataMessage.text}
            </p>
          )}
        </div>
        {isShowedDropzone && metadataMessage?.type === 'success' && !isPreparingMetadata && (
          <Dropzone
            onProcessUpload={handleOnProcessUpload}
            accept={{ 'application/gzip': ['.tar.gz'] }}
            data-testid="dropzone"
            style={{ height: '200px' }}
          />
        )}
      </Card.Section>
    </Card>
  );
};

export default FileSection;
