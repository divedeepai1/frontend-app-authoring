import moment from 'moment/moment';
import {
  FormattedDate,
  FormattedMessage,
  useIntl,
} from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import {
  Button,
  Form,
  Hyperlink,
  Stack,
  useToggle,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';

import { ContentTagsDrawerSheet } from '@src/content-tags-drawer';
import TagCount from '@src/generic/tag-count';
import { useContentTagsCount } from '@src/generic/data/apiHooks';
import { VIDEO_SHARING_OPTIONS } from '@src/course-outline/constants';
import { getVideoSharingOptionText } from '@src/course-outline/utils';
import { useHelpUrls } from '@src/help-urls/hooks';
import type { CourseOutlineStatusBar } from '@src/course-outline/data/types';

import messages from './messages';
import './StatusBar.scss';

export interface StatusBarProps {
  courseId: string;
  isLoading: boolean;
  statusBarData: CourseOutlineStatusBar;
  openEnableHighlightsModal: () => void;
  handleVideoSharingOptionChange: (value: string) => void;
}

const StatusBarCard = ({
  title,
  children,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) => (
  <div className={`small-card p-3${wide ? ' small-card--wide' : ''}`}>
    <h6 className="small-card__title mb-2">{title}</h6>
    <div className="small-card__body d-flex align-items-center">
      {children}
    </div>
  </div>
);

export const StatusBar = ({
  statusBarData,
  isLoading,
  courseId,
  openEnableHighlightsModal,
  handleVideoSharingOptionChange,
}: StatusBarProps) => {
  const intl = useIntl();
  const {
    courseReleaseDate,
    highlightsEnabledForMessaging,
    checklist,
    isSelfPaced,
    videoSharingEnabled,
    videoSharingOptions,
  } = statusBarData;

  const {
    completedCourseLaunchChecks,
    completedCourseBestPracticesChecks,
    totalCourseLaunchChecks,
    totalCourseBestPracticesChecks,
  } = checklist;

  const courseReleaseDateObj = moment.utc(courseReleaseDate, 'MMM DD, YYYY [at] HH:mm UTC', true);
  const checkListTitle = `${completedCourseLaunchChecks + completedCourseBestPracticesChecks}/${totalCourseLaunchChecks + totalCourseBestPracticesChecks}`;

  const {
    contentHighlights: contentHighlightsUrl,
    socialSharing: socialSharingUrl,
  } = useHelpUrls(['contentHighlights', 'socialSharing']);

  const { data: courseTagCount } = useContentTagsCount(courseId);
  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Stack
        direction="horizontal"
        gap={3}
        className="outline-status-bar flex-wrap"
        data-testid="outline-status-bar"
      >
        <StatusBarCard title={intl.formatMessage(messages.startDateTitle)}>
          <Link
            className="small"
            to={`/course/${courseId}/settings/details/#schedule`}
          >
            {courseReleaseDateObj.isValid() ? (
              <FormattedDate
                value={courseReleaseDateObj.toISOString()}
                year="numeric"
                month="short"
                day="2-digit"
                hour="numeric"
                minute="numeric"
              />
            ) : courseReleaseDate}
          </Link>
        </StatusBarCard>

        <StatusBarCard title={intl.formatMessage(messages.pacingTypeTitle)}>
          <span className="small text-gray-700">
            {isSelfPaced
              ? intl.formatMessage(messages.pacingTypeSelfPaced)
              : intl.formatMessage(messages.pacingTypeInstructorPaced)}
          </span>
        </StatusBarCard>

        <StatusBarCard title={intl.formatMessage(messages.checklistTitle)}>
          <Link className="small" to={`/course/${courseId}/checklists`}>
            {checkListTitle}{' '}
            <FormattedMessage {...messages.checklistCompleted} />
          </Link>
        </StatusBarCard>

        <StatusBarCard title={intl.formatMessage(messages.highlightEmailsTitle)} wide>
          <div className="d-flex align-items-center flex-wrap">
            {highlightsEnabledForMessaging ? (
              <span data-testid="highlights-enabled-span" className="small">
                {intl.formatMessage(messages.highlightEmailsEnabled)}
              </span>
            ) : (
              <Button
                data-testid="highlights-enable-button"
                size="sm"
                onClick={openEnableHighlightsModal}
              >
                {intl.formatMessage(messages.highlightEmailsButton)}
              </Button>
            )}
            <Hyperlink
              className="small ml-2"
              destination={contentHighlightsUrl}
              target="_blank"
              showLaunchIcon={false}
            >
              {intl.formatMessage(messages.highlightEmailsLink)}
            </Hyperlink>
          </div>
        </StatusBarCard>

        {getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && (
          <StatusBarCard title={intl.formatMessage(messages.courseTagsTitle)}>
            <div className="d-flex align-items-center">
              <TagCount count={courseTagCount || 0} />
              <button
                type="button"
                className="btn btn-link small ml-2 p-0"
                onClick={openManageTagsDrawer}
              >
                {intl.formatMessage(messages.courseManageTagsLink)}
              </button>
            </div>
          </StatusBarCard>
        )}

        {videoSharingEnabled && (
          <StatusBarCard title={intl.formatMessage(messages.videoSharingTitle)} wide>
            <div className="d-flex align-items-center flex-wrap">
              <Form.Control
                as="select"
                size="sm"
                defaultValue={videoSharingOptions}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => (
                  handleVideoSharingOptionChange(e.target.value)
                )}
              >
                {Object.values(VIDEO_SHARING_OPTIONS).map((option) => (
                  <option key={option} value={option}>
                    {getVideoSharingOptionText(option, messages, intl)}
                  </option>
                ))}
              </Form.Control>
              <Hyperlink
                className="small ml-2"
                destination={socialSharingUrl}
                target="_blank"
                showLaunchIcon={false}
              >
                {intl.formatMessage(messages.videoSharingLink)}
              </Hyperlink>
            </div>
          </StatusBarCard>
        )}
      </Stack>

      <ContentTagsDrawerSheet
        id={courseId}
        onClose={() => closeManageTagsDrawer()}
        showSheet={isManageTagsDrawerOpen}
      />
    </>
  );
};
