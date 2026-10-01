import PropTypes from 'prop-types';
import {
  ActionRow,
  AlertModal,
} from '@openedx/paragon';


const DeleteModal = ({
  loading,
  category,
  isOpen,
  close,
  onDeleteSubmit,
  title,
  description,
  variant,
  btnState="default",
  btnDefaultLabel,
  btnPendingLabel,
}) => {
  return (
    <AlertModal
      title={title}
      isOpen={isOpen}
      onClose={close}
      variant={variant}
      footerNode={(
        <ActionRow>
          <button
            className='secondary-button px-3 py-2'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              close();
            }}
            disabled={loading}
            style={loading ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            Cancel
          </button>
           <button 
            className="ml-3 primary-button px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onDeleteSubmit}
            disabled={loading}
          >
            {loading ? (btnPendingLabel || "Deleting...") : btnDefaultLabel}
           </button>
        </ActionRow>
      )}
    >
      <p>{description}</p>
    </AlertModal>
  );
};

DeleteModal.defaultProps = {
  category: '',
  title: '',
  description: '',
  variant: 'default',
  btnState: 'default',
  btnDefaultLabel: '',
  btnPendingLabel: '',
  loading: false,
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  category: PropTypes.string,
  onDeleteSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  variant: PropTypes.string,
  btnState: PropTypes.string,
  btnDefaultLabel: PropTypes.string,
  btnPendingLabel: PropTypes.string,
  loading: PropTypes.bool,
};

export default DeleteModal;
