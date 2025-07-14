import { Table } from "react-bootstrap";
import "./classes-table.css";

import editIcon from "../../assests/edit-icon.svg";
import viewIcon from "../../assests/view-icon.svg";
import deleteIcon from "../../assests/delete-icon.svg";
import messageIcon from "../../assests/message-icon.svg";
import { useState } from "react";
import { useNavigate } from "react-router";
import DeleteModal from "../common/delete-modal";
import { getConfig } from '@edx/frontend-platform';
import { fetchCsrfToken } from './../../../cms-csrftoken';



const ActivityFeed = ({ classes ,setClasses}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const navigate = useNavigate();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedClasses(classes.map((cls) => cls.id));
    } else {
      setSelectedClasses([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const isAllSelected = selectedClasses.length > 0 && selectedClasses.length === classes.length;

  
  const handleEdit = (e, cls) => {
    e.stopPropagation();
    sessionStorage.setItem("classId", cls.id);
    sessionStorage.setItem("classData", JSON.stringify(cls));
    navigate(`/manage-classes/${1}`);
    
  }

  const deleteClass = async () => {
      const token= await fetchCsrfToken();

      try {
        const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${selectedClass}/`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': token,    
          }
        });
    
        if (!response.ok) {
          throw new Error(`Failed to delete class: ${response.statusText}`);
        }
        setClasses(prevList => prevList.filter(cls => cls.id !== selectedClass));
        setIsOpen(!isOpen);
      } catch (error) {
        console.error('Error deleting :');
      }
    };
  
 


  return (
    <>
    
    <div>
      <div className="activity-header">
        <h2 className="text-white">My Classes</h2>
      </div>

      <Table bordered hover className="activity-table">
        <thead>
          <tr>
            <th style={{paddingLeft: "30px"}}>
              <div className="checkbox-wrapper">
                <label htmlFor={"header"} className="form-check-label">
                  <input
                    type="checkbox"
                    id={"header"}
                    name={"class-header"}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom">
                    {isAllSelected && (
                      <svg className="checkmark" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M20.285 6.709l-11.4 11.4-5.6-5.6L5.7 10.09l3.186 3.186 9.714-9.714z"
                        />
                      </svg>
                    )}
                  </span>
                </label>
              </div>
            </th>
            <th>Class Name</th>
            <th>Grade</th>
            <th>period</th>
            <th>No.of Students</th>
            <th>Assigned Courses</th>
            <th>Status</th>
            <th style={{textAlign:"center"}}>Action</th>
          </tr>
        </thead>
        <tbody>

          {classes ? classes.map((cls, index) => (
            <tr key={cls.id}>
              <td>
                <div className="checkbox-wrapper">
                  <label htmlFor={cls.id} className="form-check-label">
                    <input
                      type="checkbox"
                      id={cls.id}
                      name={cls.name}
                      checked={selectedClasses.includes(cls.id)}
                      onChange={() => handleSelectOne(cls.id)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom">
                      {selectedClasses.includes(cls.id) && (
                        <svg className="checkmark" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M20.285 6.709l-11.4 11.4-5.6-5.6L5.7 10.09l3.186 3.186 9.714-9.714z"
                          />
                        </svg>
                      )}
                    </span>
                  </label>
                </div>
              </td>
              <td>{cls.name}</td>
              <td>{cls.grade}</td>
              <td>{cls.period}</td>
              <td>{cls?.students?.length}</td>
              <td>{cls?.courses?.[0]?.display_name}</td>
              <td>
                {cls.status == "active" ? (
                  <button className="primary-button py-2 px-3">Active</button>
                ) : (
                  <button className="brown-button py-2 px-3">Paused</button>
                )}
              </td>
              <td>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <img src={editIcon} onClick={(e) =>handleEdit(e,cls)} alt="edit" />
                  <img src={viewIcon} onClick={()=>navigate("/classes/"+cls.id)} alt="view" />
                  <img src={deleteIcon} onClick={()=> {setIsOpen(true)
                                             setSelectedClass(cls.id)
                   }} alt="delete" />
                  <img src={messageIcon} alt="edit" />
                </div>
              </td>
            </tr>
          ))
          :
          <tr>
            <td colSpan="8" className="text-center">
            <h4 className="mt-2 mb-2 text-center">No Classes Found</h4>
            </td>
            </tr>
        }
          
        </tbody>
      </Table>
    </div>
    <DeleteModal category="component" title="Are you sure you want to delete" isOpen={isOpen} close={()=>setIsOpen(!isOpen)}  description={"class will be deleted from class list"} btnDefaultLabel={"Delete"} btnPendingLabel={"Deleting"} onDeleteSubmit={deleteClass}/>
    
    </>
  );
};

export default ActivityFeed;
