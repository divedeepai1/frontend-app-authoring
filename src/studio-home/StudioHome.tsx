import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Container,
  Icon,
  Layout,
  MailtoLink,
  Row,
} from '@openedx/paragon';
import { Add as AddIcon, Error, ManageAccounts, FolderOpen, Edit } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { StudioFooterSlot } from '@edx/frontend-component-footer';
import { useLocation, useNavigate } from 'react-router-dom';

import { useWaffleFlags } from '@src/data/apiHooks';
import RichTextEditorModal from '@src/compugrade/pages/MultiPartLessonBuilder/components/RichTextEditorModal';
import { base_url } from '@src/compugrade-constants';
import Loading from '../generic/Loading';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import Header from '../header';
import SubHeader from '../generic/sub-header/SubHeader';
import HomeSidebar from './home-sidebar';
import TabsSection from './tabs-section';
import OrganizationSection from './organization-section';
import VerifyEmailLayout from './verify-email-layout';
import CreateNewCourseForm from './create-new-course-form';
import messages from './messages';
import { useStudioHome } from './hooks';
import AlertMessage from '../generic/alert-message';
import AddResourceModal from './additional-resources/AddResourceModal';

const StudioHome = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [welcomeText, setWelcomeText] = useState('');
  const [isSavingWelcome, setIsSavingWelcome] = useState(false);

  const {
    isLoadingPage,
    isFailedLoadingPage,
    studioHomeData,
    isShowProcessing,
    anyQueryIsFailed,
    isShowEmailStaff,
    anyQueryIsPending,
    showNewCourseContainer,
    isShowOrganizationDropdown,
    hasAbilityToCreateNewCourse,
    isFiltered,
    setShowNewCourseContainer,
    librariesV1Enabled,
    librariesV2Enabled,
  } = useStudioHome();

  const waffleFlags = useWaffleFlags();
  const isAuthzEnabled = waffleFlags?.enableAuthzCourseAuthoring ?? false;
  const adminConsoleUrl = `${getConfig().ADMIN_CONSOLE_URL}/authz`;

  const v1LibraryTab = librariesV1Enabled && location?.pathname.split('/').pop() === 'libraries-v1';
  const showV2LibraryURL = librariesV2Enabled && !v1LibraryTab;

  const {
    userIsActive,
    studioShortName,
    studioRequestEmail,
    showNewLibraryButton,
    showNewLibraryV2Button,
  } = studioHomeData;

  useEffect(() => {
    const fetchWelcomeText = async () => {
      try {
        const response = await fetch(`${base_url}/api/course/home_intro_text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (response.ok) {
          const data = await response.json();
          setWelcomeText(data?.home_intro_text || '');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching welcome text:', error);
      }
    };
    fetchWelcomeText();
  }, []);

  const handleWelcomeSave = async (content) => {
    setIsSavingWelcome(true);
    try {
      await fetch(`${base_url}/api/course/home_intro_text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home_intro_text: content }),
      });
      setWelcomeText(content);
      setIsWelcomeModalOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving welcome text:', error);
    } finally {
      setIsSavingWelcome(false);
    }
  };

  const getHeaderButtons = useCallback(() => {
    const headerButtons: JSX.Element[] = [];

    if (isFailedLoadingPage || !userIsActive) {
      return headerButtons;
    }

    if (isShowEmailStaff) {
      headerButtons.push(
        <MailtoLink to={studioRequestEmail}>{intl.formatMessage(messages.emailStaffBtnText)}</MailtoLink>,
      );
    }

    if (isAuthzEnabled && getConfig().ADMIN_CONSOLE_URL) {
      headerButtons.push(
        <div className="border-right mr-3 pr-4 py-2">
          <Button
            as="a"
            href={adminConsoleUrl}
            variant="primary"
            iconBefore={ManageAccounts}
            size="sm"
            target="_blank"
          >
            {intl.formatMessage(messages.addRolesPermissionsBtnText)}
          </Button>
        </div>,
      );
    }

    headerButtons.push(
      <Button
        key="welcome-text"
        variant="outline-primary"
        iconBefore={Edit}
        size="sm"
        onClick={() => setIsWelcomeModalOpen(true)}
      >
        Welcome Text
      </Button>,
    );

    headerButtons.push(
      <Button
        key="add-resource"
        variant="outline-primary"
        iconBefore={FolderOpen}
        size="sm"
        onClick={() => setIsResourceModalOpen(true)}
      >
        Add resource
      </Button>,
    );

    if (hasAbilityToCreateNewCourse) {
      headerButtons.push(
        <Button
          key="new-course"
          variant="outline-primary"
          iconBefore={AddIcon}
          size="sm"
          disabled={showNewCourseContainer}
          onClick={() => setShowNewCourseContainer(true)}
        >
          {intl.formatMessage(messages.addNewCourseBtnText)}
        </Button>,
      );
    }

    if ((showNewLibraryButton && !showV2LibraryURL) || (showV2LibraryURL && showNewLibraryV2Button)) {
      const newLibraryClick = () => {
        if (showV2LibraryURL) {
          navigate('/library/create');
        } else {
          navigate('/libraries-v1/create');
        }
      };

      headerButtons.push(
        <Button
          key="new-library"
          variant="outline-primary"
          iconBefore={AddIcon}
          size="sm"
          onClick={newLibraryClick}
        >
          {intl.formatMessage(messages.addNewLibraryBtnText)}
        </Button>,
      );
    }

    return headerButtons;
  }, [
    location,
    userIsActive,
    isFailedLoadingPage,
    isAuthzEnabled,
    hasAbilityToCreateNewCourse,
    showNewCourseContainer,
    showNewLibraryButton,
    showV2LibraryURL,
    showNewLibraryV2Button,
    intl,
    navigate,
    setShowNewCourseContainer,
    studioRequestEmail,
    isShowEmailStaff,
    adminConsoleUrl,
  ]);

  const headerButtons = userIsActive ? getHeaderButtons() : [];
  if (isLoadingPage && !isFiltered) {
    return <Loading />;
  }

  const getMainBody = () => {
    if (isFailedLoadingPage) {
      return (
        <AlertMessage
          variant="danger"
          description={
            <Row className="m-0 align-items-center">
              <Icon src={Error} className="text-danger-500 mr-1" />
              <span>{intl.formatMessage(messages.homePageLoadFailedMessage)}</span>
            </Row>
          }
        />
      );
    }
    if (!userIsActive) {
      return <VerifyEmailLayout />;
    }
    return (
      <Layout
        lg={[{ span: 9 }, { span: 3 }]}
        md={[{ span: 9 }, { span: 3 }]}
        sm={[{ span: 9 }, { span: 3 }]}
        xs={[{ span: 9 }, { span: 3 }]}
        xl={[{ span: 9 }, { span: 3 }]}
      >
        <Layout.Element>
          <section>
            {showNewCourseContainer && (
              <CreateNewCourseForm handleOnClickCancel={() => setShowNewCourseContainer(false)} />
            )}
            {isShowOrganizationDropdown && <OrganizationSection />}
            <TabsSection
              showNewCourseContainer={showNewCourseContainer}
              onClickNewCourse={() => setShowNewCourseContainer(true)}
              isShowProcessing={Boolean(isShowProcessing) && !isFiltered}
              librariesV1Enabled={librariesV1Enabled}
              librariesV2Enabled={librariesV2Enabled}
            />
          </section>
        </Layout.Element>
        <Layout.Element>
          <HomeSidebar />
        </Layout.Element>
      </Layout>
    );
  };

  return (
    <>
      <Header isHiddenMainMenu />
      <Container size="xl" className="p-4 mt-3">
        <section className="mb-4">
          <article className="studio-home-sub-header">
            <section>
              <SubHeader
                title={intl.formatMessage(messages.headingTitle, { studioShortName: studioShortName || 'Studio' })}
                headerActions={headerButtons}
              />
            </section>
          </article>
          {getMainBody()}
        </section>
      </Container>
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={anyQueryIsFailed}
          isQueryPending={anyQueryIsPending}
        />
      </div>
      <StudioFooterSlot />
      <AddResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
      />
      <RichTextEditorModal
        open={isWelcomeModalOpen}
        title="Home Intro Text"
        initialValue={welcomeText}
        onSave={handleWelcomeSave}
        onClose={() => setIsWelcomeModalOpen(false)}
        saveLabel="Save"
        editorId="home-welcome-text-editor"
        isSaving={isSavingWelcome}
      />
    </>
  );
};

export default StudioHome;
