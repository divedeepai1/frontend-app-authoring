import PropTypes from 'prop-types';
import { Badge, Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import AddComponentIcon from './AddComponentIcon';

const COMPUGRADE_TYPES = ['engine', 'text', 'skills', 'tools', 'overview', 'new'];

const AddComponentButton = ({
  type,
  displayName,
  onClick,
  beta,
  disabled = false,
  border,
  background,
  boxshadow,
  icon,
}) => {
  const intl = useIntl();
  const isCompugrade = COMPUGRADE_TYPES.includes(type);

  // Keep full Compugrade colors when "disabled" — do not use native disabled (dims opacity).
  // Block interaction manually instead.
  return (
    <Button
      style={isCompugrade ? {
        border,
        background,
        boxShadow: boxshadow,
        opacity: 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        pointerEvents: disabled ? 'none' : 'auto',
      } : undefined}
      variant="outline-primary"
      className="add-component-button flex-column rounded-sm"
      onClick={disabled ? (e) => { e.preventDefault(); e.stopPropagation(); } : onClick}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
    >
      {icon ? <img src={icon} alt="" /> : <AddComponentIcon type={type} />}
      <span className="sr-only">{intl.formatMessage(messages.buttonText)}</span>
      <span className="small mt-2">{displayName}</span>
      {beta && <Badge className="pb-1 mt-1" variant="primary">Beta</Badge>}
    </Button>
  );
};

AddComponentButton.defaultProps = {
  beta: false,
  disabled: false,
  border: undefined,
  background: undefined,
  boxshadow: undefined,
  icon: undefined,
};

AddComponentButton.propTypes = {
  type: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  beta: PropTypes.bool,
  disabled: PropTypes.bool,
  border: PropTypes.string,
  background: PropTypes.string,
  boxshadow: PropTypes.string,
  icon: PropTypes.string,
};

export default AddComponentButton;
