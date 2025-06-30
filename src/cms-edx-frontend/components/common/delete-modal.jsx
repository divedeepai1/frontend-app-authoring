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
      title={"Are you sure you want to delete"}
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
          >
            Cancel
          </button>
           <button className="ml-3 primary-button px-3 py-2 " onClick={onDeleteSubmit}>
                       
            Delete
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
};

export default DeleteModal;
