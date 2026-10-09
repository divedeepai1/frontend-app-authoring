import { VIDEO_SHARING_OPTIONS } from '@src/course-outline/constants';
import { CourseOutlineStatusBar } from '@src/course-outline/data/types';
import { initializeMocks, render, screen } from '@src/testUtils';
import { StatusBar, StatusBarProps } from './StatusBar';
import messages from './messages';

const courseId = 'course-v1:123';
const isLoading = false;

const statusBarData: CourseOutlineStatusBar = {
  courseReleaseDate: 'Feb 05, 2013 at 05:00 UTC',
  isSelfPaced: true,
  endDate: '2013-04-09T00:00:00Z',
  checklist: {
    totalCourseLaunchChecks: 5,
    completedCourseLaunchChecks: 1,
    totalCourseBestPracticesChecks: 4,
    completedCourseBestPracticesChecks: 1,
  },
  highlightsEnabledForMessaging: false,
  videoSharingEnabled: false,
  videoSharingOptions: VIDEO_SHARING_OPTIONS.allOn,
};

jest.mock('@src/generic/data/apiHooks', () => ({
  useContentTagsCount: () => ({ data: 0, isLoading: false }),
}));

jest.mock('@src/content-tags-drawer', () => ({
  ContentTagsDrawerSheet: () => null,
}));

const mockOpenEnableHighlightsModal = jest.fn();
const mockHandleVideoSharingOptionChange = jest.fn();

const renderComponent = (props?: Partial<StatusBarProps>) =>
  render(
    <StatusBar
      courseId={courseId}
      isLoading={isLoading}
      statusBarData={statusBarData}
      openEnableHighlightsModal={mockOpenEnableHighlightsModal}
      handleVideoSharingOptionChange={mockHandleVideoSharingOptionChange}
      {...props}
    />,
  );

describe('<StatusBar />', () => {
  beforeEach(() => {
    initializeMocks({
      config: {
        ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      },
    });
  });

  it('renders StatusBar cards correctly', async () => {
    renderComponent();

    expect(await screen.findByTestId('outline-status-bar')).toBeInTheDocument();
    expect(screen.getByText(messages.startDateTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.pacingTypeTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.checklistTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.highlightEmailsTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.courseTagsTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.pacingTypeSelfPaced.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(/2\/9/)).toBeInTheDocument();
    expect(screen.getByText(messages.checklistCompleted.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText('Upcoming')).not.toBeInTheDocument();
    expect(screen.queryByText('Unpublished Changes')).not.toBeInTheDocument();
    expect(screen.queryByText('Video Sharing:')).not.toBeInTheDocument();
  });

  it('renders set date link if date is not set', async () => {
    renderComponent({
      statusBarData: {
        ...statusBarData,
        courseReleaseDate: 'Set Date',
      },
    });
    expect(await screen.findByText('Set Date')).toBeInTheDocument();
  });

  it('not render component when isLoading is true', async () => {
    renderComponent({ isLoading: true });

    expect(await screen.findByTestId('redux-provider')).toBeEmptyDOMElement();
  });

  it('calls openEnableHighlightsModal when the button is clicked', async () => {
    renderComponent();

    const button = await screen.findByRole('button', { name: 'Enable now' });
    expect(button).toBeInTheDocument();

    button.click();
    expect(mockOpenEnableHighlightsModal).toHaveBeenCalled();
  });

  it('shows a message when email highlights are enabled', async () => {
    renderComponent({
      statusBarData: {
        ...statusBarData,
        highlightsEnabledForMessaging: true,
      },
    });
    expect(await screen.findByText(messages.highlightEmailsEnabled.defaultMessage)).toBeInTheDocument();
  });

  it('does render video sharing dropdown if enabled', async () => {
    renderComponent({
      statusBarData: {
        ...statusBarData,
        videoSharingEnabled: true,
      },
    });

    expect(await screen.findByText('Video Sharing:')).toBeInTheDocument();
  });

  it('renders instructor-paced when not self paced', async () => {
    renderComponent({
      statusBarData: {
        ...statusBarData,
        isSelfPaced: false,
      },
    });
    expect(await screen.findByText(messages.pacingTypeInstructorPaced.defaultMessage)).toBeInTheDocument();
  });
});
