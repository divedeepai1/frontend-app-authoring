import React from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Hyperlink,
  Dropdown,
  IconButton,
  ActionRow,
} from '@openedx/paragon';
import { MoreHoriz } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Link } from 'react-router-dom';

import { COURSE_CREATOR_STATES } from '../../constants';
import { getStudioHomeData } from '../data/selectors';
import messages from '../messages';
import { trimSlashes } from './utils';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import { fetchCsrfToken } from '../../cms-csrftoken';
import { updatePostErrors } from 'generic/data/slice';
import { base_url } from '../../compugrade-constants';





interface BaseProps {
  displayName: string;
  org: string;
  number: string;
  run?: string;
  lmsLink?: string | null;
  rerunLink?: string | null;
  courseKey?: string;
  isLibraries?: boolean;
  isPaginated?: boolean;
}
type Props = BaseProps & (
  /** If we should open this course/library in this MFE, this is the path to the edit page, e.g. '/course/foo' */
  { path: string, url?: never } |
  /**
   * If we might be redirecting to the legacy Studio view, this is the URL to redirect to.
   * URLs starting with '/' are assumed to be relative to the legacy Studio root.
   */
  { url: string, path?: never }
);

/**
 * A card on the Studio home page that represents a Course or a Library
 */
const CardItem: React.FC<Props> = ({
  displayName,
  lmsLink = '',
  rerunLink = '',
  org,
  number,
  run = '',
  isLibraries = false,
  courseKey = '',
  isPaginated = false,
  path,
  url,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  // const {setShowNewCourseContainer} = useStudioHome();
  function getEdxJwtFromCookies() {
    const name = "edx-jwt-cookie-header-payload=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
  
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name)) {
        return cookie.substring(name.length);
      }
    }
    return null;
  }

  const deleteCourse = async () => {
    const encodedCourseId=encodeURIComponent(courseKey)

    const token= await fetchCsrfToken();
    try {
      const response = await fetch(`${base_url}/api/course/delete_course?course_id=${encodedCourseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json', 
        }
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete course: ${response.statusText}`);
      }

  
    } catch (error) {
      console.error('Error deleting course:');
    }
    try {
      const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/courses/${courseKey}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': token,    
        }
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete course: ${response.statusText}`);
      }
  
      setLoading(false)
      setIsOpen(!isOpen);
      window.location.reload();
  
    } catch (error) {
      setLoading(false);
      console.error('Error deleting course:');
    }
  };

  const intl = useIntl();
  const {
    allowCourseReruns,
    courseCreatorStatus,
    rerunCreatorStatus,
    deleteCourseStatus,
    editCourseStatus,
  } = useSelector(getStudioHomeData);
  const destinationUrl: string = path ?? new URL(url, getConfig().STUDIO_BASE_URL).toString();
  const subtitle = isLibraries ? `${org} / ${number}` : `${org} / ${number} / ${run}`;
  const readOnlyItem = !(lmsLink || rerunLink || url || path);
  const showActions = !(readOnlyItem || isLibraries);
  const isShowRerunLink = allowCourseReruns
    && rerunCreatorStatus
    && courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const hasDisplayName = (displayName ?? '').trim().length ? displayName : courseKey;

  return (
    <Card className="card-item">
      <Card.Header
        size="sm"
        title={!readOnlyItem ? (
          <Link
            className="card-item-title"
            to={destinationUrl}
          >
            {hasDisplayName}
          </Link>
        ) : (
          <span className="card-item-title">{displayName}</span>
        )}
        subtitle={subtitle}
        actions={showActions && (
          isPaginated ? (
            <Dropdown>
              <Dropdown.Toggle
                as={IconButton}
                iconAs={MoreHoriz}
                variant="primary"
                data-testid="toggle-dropdown"
              />
              <Dropdown.Menu>
                {isShowRerunLink && (
                  <Dropdown.Item href={trimSlashes(rerunLink ?? '')}>
                    {messages.btnReRunText.defaultMessage}
                   
                 </Dropdown.Item>
                )}
                  <Dropdown.Item href={lmsLink}>
                  {intl.formatMessage(messages.viewLiveBtnText)}
                </Dropdown.Item>
                <Dropdown.Item href={`course_edit/${courseKey ?? ''}`}>
                <span> Edit Course</span> 
                </Dropdown.Item>
                <Dropdown.Item>
                 <span onClick={()=>setIsOpen(true)}> Delete Course</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <ActionRow>
              {isShowRerunLink && (
                <Hyperlink
                  className="small"
                  destination={trimSlashes(rerunLink ?? '')}
                  key={`action-row-rerunLink-${courseKey}`}
                >
                  {intl.formatMessage(messages.btnReRunText)}
                </Hyperlink>
              )}
              <Hyperlink
                className="small ml-3"
                destination={lmsLink ?? ''}
                key={`action-row-lmsLink-${courseKey}`}
              >
                {intl.formatMessage(messages.viewLiveBtnText)}
              </Hyperlink>
              <Dropdown.Item href={`course_edit/${courseKey ?? ''}`}>
                  Edit Course
                </Dropdown.Item>
               
                <Dropdown.Item>
                 <span onClick={()=>setIsOpen(true)}> Delete Course</span>
                 
                </Dropdown.Item>
                
            </ActionRow>
          )
        )}
      />
       <DeleteModal loading={loading}  category="component" title="Are you sure you want to delete" isOpen={isOpen} close={()=>setIsOpen(!isOpen)}  description={"course will be deleted from course list"} btnDefaultLabel={"Delete"} btnPendingLabel={"Deleting"} onDeleteSubmit={deleteCourse}/>
    </Card>
  );
};

export default CardItem;
