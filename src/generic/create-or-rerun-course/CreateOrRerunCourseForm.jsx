import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  Form,
  Button,
  Dropdown,
  ActionRow,
  StatefulButton,
  TransitionReplace,
} from '@openedx/paragon';
import { Info as InfoIcon } from '@openedx/paragon/icons';
import TypeaheadDropdown from '../../editors/sharedComponents/TypeaheadDropdown';

import AlertMessage from '../alert-message';
import { STATEFUL_BUTTON_STATES } from '../../constants';
import { RequestStatus, TOTAL_LENGTH_KEY } from '../../data/constants';
import { getSavingStatus } from '../data/selectors';
import { getStudioHomeData } from '../../studio-home/data/selectors';
import { updatePostErrors } from '../data/slice';
import { updateCreateOrRerunCourseQuery } from '../data/thunks';
import { useCreateOrRerunCourse } from './hooks';
import messages from './messages';
import { fetchCsrfToken } from '../../cms-csrftoken';
import { set } from 'lodash';
import { getConfig } from '@edx/frontend-platform';
import { base_url } from '../../compugrade-constants';


const CreateOrRerunCourseForm = ({
  edit,
  title,
  isCreateNewCourse,
  initialValues,
  onClickCancel,
}) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const savingStatus = useSelector(getSavingStatus);
  const { allowToCreateNewOrg } = useSelector(getStudioHomeData);
  const runFieldReference = useRef(null);
  const displayNameFieldReference = useRef(null);
  const [courseType, setCourseType] = useState("MS Word");
  const [loading, setLoading] = useState(false);

  const {
    intl,
    errors,
    values,
    postErrors,
    isFormFilled,
    isFormInvalid,
    organizations,
    showErrorBanner,
    dispatch,
    handleBlur,
    handleChange,
    hasErrorField,
    setFieldValue,
  } = useCreateOrRerunCourse(initialValues);

  const newCourseFields = [
    {
      label: intl.formatMessage(messages.courseDisplayNameLabel),
      helpText: intl.formatMessage(
        isCreateNewCourse
          ? messages.courseDisplayNameCreateHelpText
          : messages.courseDisplayNameRerunHelpText,
      ),
      name: 'displayName',
      value: values.displayName,
      placeholder: intl.formatMessage(messages.courseDisplayNamePlaceholder),
      disabled: false,
      ref: displayNameFieldReference,
    },
    {
      label: intl.formatMessage(messages.courseOrgLabel),
      helpText: isCreateNewCourse
        ? intl.formatMessage(messages.courseOrgCreateHelpText, {
          strong: <strong>{intl.formatMessage(messages.courseNoteOrgNameIsPartStrong)}</strong>,
        })
        : intl.formatMessage(messages.courseOrgRerunHelpText, {
          strong: (
            <>
              <br />
              <strong>
                {intl.formatMessage(messages.courseNoteNoSpaceAllowedStrong)}
              </strong>
            </>
          ),
        }),
      name: 'org',
      value: values.org,
      options: organizations,
      placeholder: intl.formatMessage(messages.courseOrgPlaceholder),
      disabled: false,
    },
    {
      label: intl.formatMessage(messages.courseNumberLabel),
      helpText: isCreateNewCourse
        ? intl.formatMessage(messages.courseNumberCreateHelpText, {
          strong: (
            <strong>
              {intl.formatMessage(messages.courseNotePartCourseURLRequireStrong)}
            </strong>
          ),
        })
        : intl.formatMessage(messages.courseNumberRerunHelpText),
      name: 'number',
      value: values.number,
      placeholder: intl.formatMessage(messages.courseNumberPlaceholder),
      disabled: !isCreateNewCourse,
    },
    {
      label: intl.formatMessage(messages.courseRunLabel),
      helpText: isCreateNewCourse
        ? intl.formatMessage(messages.courseRunCreateHelpText, {
          strong: (
            <strong>
              {intl.formatMessage(messages.courseNotePartCourseURLRequireStrong)}
            </strong>
          ),
        })
        : intl.formatMessage(messages.courseRunRerunHelpText, {
          strong: (
            <>
              <br />
              <strong>
                {intl.formatMessage(messages.courseNoteNoSpaceAllowedStrong)}
              </strong>
            </>
          ),
        }),
      name: 'run',
      value: values.run,
      placeholder: intl.formatMessage(messages.courseRunPlaceholder),
      disabled: false,
      ref: runFieldReference,
    },
  ];
  console.log('newCourseFields:', newCourseFields.map(f => f.name));
  const filteredCourseFields = edit
    ? newCourseFields.filter(field => ['displayName'].includes(field.name))
    : newCourseFields;

  const courseTypeField = {
    label: intl.formatMessage(messages.courseTypeLabel),
    helpText: messages.courseTypeCreateHelpText,
    name: 'type',
    value: courseType,
    placeholder: intl.formatMessage(messages.courseTypePlaceholder),
    disabled: false,
    options: [
      "MS Word", "MS Excel", "MS Powerpoint", "Google Docs", "Google Sheets", "Google Slides"
    ]
  };

  const errorMessage = errors[TOTAL_LENGTH_KEY] || postErrors?.errMsg;

  const createButtonState = {
    labels: {
      default: intl.formatMessage(isCreateNewCourse ? messages.createButton : messages.rerunCreateButton),
      pending: intl.formatMessage(isCreateNewCourse ? messages.creatingButton : messages.rerunningCreateButton),
    },
    disabledStates: [STATEFUL_BUTTON_STATES.pending],
  };

  const handleOnClickCreate = () => {
    const courseData = isCreateNewCourse ? values : { ...values, sourceCourseKey: courseId };
    dispatch(updateCreateOrRerunCourseQuery(courseData, courseType));
  };

  
   const handleOnClickEdit = async () => {
    const token= await fetchCsrfToken();
    setLoading(true);
    const data = JSON.stringify({
      display_name: values.displayName,
     
    });
    try {
      const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/courses/${courseId}/update/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': token,
        },
        body: data,
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to edit course: ${response.status} ${errorText}`);
      }
      setLoading(false);
      const response2 = await fetch(`${base_url}/api/course/update_course_name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_title:values.displayName,
          course_id:courseId
        }),
      });

      navigate("/home");
    } catch (error) {
      console.error('Error editing course:', error.message);
      setLoading(false);
      dispatch(updatePostErrors({ errMsg: error.message }));
    }
    
    };

  const handleOnClickCancel = () => {
    dispatch(updatePostErrors({}));
    onClickCancel();
  };

  const handleCustomBlurForDropdown = (e) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
    handleBlur(e);
  };

  const renderOrgField = (field) => (allowToCreateNewOrg ? (
    <TypeaheadDropdown
      readOnly={false}
      name={field.name}
      value={field.value}
      controlClassName={classNames({ 'is-invalid': hasErrorField(field.name) })}
      options={field.options}
      placeholder={field.placeholder}
      handleBlur={handleCustomBlurForDropdown}
      handleChange={(value) => setFieldValue(field.name, value)}
      noOptionsMessage={intl.formatMessage(messages.courseOrgNoOptions)}
      helpMessage=""
      errorMessage=""
      floatingLabel=""
    />
  ) : (
    <Dropdown className="mr-2">
      <Dropdown.Toggle id={`${field.name}-dropdown`} variant="outline-primary">
        {field.value || intl.formatMessage(messages.courseOrgNoOptions)}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {field.options?.map((value) => (
          <Dropdown.Item
            key={value}
            onClick={() => setFieldValue(field.name, value)}
          >
            {value}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  ));

  useEffect(() => {
    if (!isCreateNewCourse) {
      runFieldReference?.current?.focus();
    } else {
      displayNameFieldReference?.current?.focus();
    }
  }, []);

  return (
    <div className="create-or-rerun-course-form">
      <TransitionReplace>
        {(errors[TOTAL_LENGTH_KEY] || showErrorBanner) ? (
          <AlertMessage
            variant="danger"
            icon={InfoIcon}
            title={errorMessage}
            aria-hidden="true"
            aria-labelledby={intl.formatMessage(messages.alertErrorExistsAriaLabelledBy)}
            aria-describedby={intl.formatMessage(messages.alertErrorExistsAriaDescribedBy)}
          />
        ) : null}
      </TransitionReplace>
      <h3 className="mb-3">{title}</h3>
      <Form>
        {filteredCourseFields.map((field) => (
          <Form.Group
            className={classNames('form-group-custom', {
              'form-group-custom_isInvalid': hasErrorField(field.name),
            })}
            key={field.label}
          >
            <Form.Label>{field.label}</Form.Label>
            {field.name !== 'org' ? (
              <Form.Control
                value={field.value}
                placeholder={field.placeholder}
                name={field.name}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={hasErrorField(field.name)}
                disabled={field.disabled}
                ref={field?.ref}
              />
            ) : renderOrgField(field)}
            <Form.Text>{field.helpText}</Form.Text>
            {hasErrorField(field.name) && (
              <Form.Control.Feedback
                className="feedback-error"
                type="invalid"
                hasIcon={false}
              >
                {errors[field.name]}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        ))}
        {!edit && (
          <Form.Group
            className={classNames('form-group-custom', {
              'form-group-custom_isInvalid': hasErrorField(courseTypeField.name),
            })}
          >
            <Dropdown className="mr-2">
              <Form.Label>Course type</Form.Label>
              <Dropdown className="mr-2" style={{ backgroundColor: "white", width: "100%" }}>
                <Dropdown.Toggle id="type-dropdown" variant="outline-primary">
                  {courseTypeField.value || intl.formatMessage(messages.courseOrgNoOptions)}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {courseTypeField.options.map((value) => (
                    <Dropdown.Item key={value} onClick={() => setCourseType(value)}>
                      {value}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <Form.Text>{intl.formatMessage(courseTypeField.helpText)}</Form.Text>
            </Dropdown>
            {hasErrorField(courseTypeField.name) && (
              <Form.Control.Feedback
                className="feedback-error"
                type="invalid"
                hasIcon={false}
              >
                {errors[courseTypeField.name]}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        )}
        <ActionRow className="justify-content-start">
          <Button variant="outline-primary" onClick={handleOnClickCancel}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          {edit ? (
            <Button variant="primary" className="ml-3 " disabled={!values.displayName || loading} onClick={handleOnClickEdit}>
              {loading &&<span className="spinner-border mr-2"></span>}
              Edit Course
            </Button>
          ) : (
            <StatefulButton
              key="save-button"
              className="ml-3"
              onClick={handleOnClickCreate}
              disabled={!isFormFilled || isFormInvalid}
              state={
                savingStatus === RequestStatus.PENDING
                  ? STATEFUL_BUTTON_STATES.pending
                  : STATEFUL_BUTTON_STATES.default
              }
              {...createButtonState}
            />
          )}
        </ActionRow>
      </Form>
    </div>
  );
};

CreateOrRerunCourseForm.defaultProps = {
  title: '',
  isCreateNewCourse: false,
};

CreateOrRerunCourseForm.propTypes = {
  title: PropTypes.string,
  initialValues: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    org: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
    run: PropTypes.string.isRequired,
  }).isRequired,
  isCreateNewCourse: PropTypes.bool,
  onClickCancel: PropTypes.func.isRequired,
  edit: PropTypes.bool,
};

export default CreateOrRerunCourseForm;
