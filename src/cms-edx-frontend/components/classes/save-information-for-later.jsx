import { useNavigate } from "react-router"

const SaveInformationForLater = () => {
  const navigate = useNavigate()

  const handleClick = (e) => {
    e.preventDefault()
    navigate("/classes")
  }

  return (
    <div>
      <a href="/classes" className="tp-muted-link" onClick={handleClick}>
        Save information for later
      </a>
    </div>
  )
}

export default SaveInformationForLater
