import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import AddComponentIcon from './AddComponentIcon';

const AddComponentButton = ({ disabled, border,background,boxshadow,type, displayName, onClick,icon }) => {
  const intl = useIntl();
  const highlightTypes = ["engine", "text", "skills", "tools", "overview","new"];

  return (
    <Button
    
    style={{
      border: highlightTypes.includes(type) && border,
      background: highlightTypes.includes(type) && background,
      boxShadow: highlightTypes.includes(type) && boxshadow,
    }}
      variant="outline-primary"
      className="add-component-button flex-column rounded-sm"
      onClick={disabled ? undefined : onClick}
    >
      {icon ? <img src={icon} /> :<AddComponentIcon type={type} />}
      <span className="sr-only">{intl.formatMessage(messages.buttonText)}</span>
      <span className="small mt-2">{displayName}</span>
    </Button>
  );
};

AddComponentButton.propTypes = {
  type: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default AddComponentButton;
