import { useNavigate } from "react-router";

const SaveInformationForLater = () => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    navigate("/classes");
  };

  return (
    <div className="ms-auto">
      <a href="#" className="primary-text" onClick={handleClick}>
        Save Information for Later
      </a>
    </div>
  );
};

export default SaveInformationForLater;


