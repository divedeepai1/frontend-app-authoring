
import { Table, Container } from "react-bootstrap"
import { Edit, Trash2 } from "lucide-react"
import viewIcon from "../../assests/view-icon.svg";
import deleteIcon from "../../assests/delete-icon.svg";
import messageIcon from "../../assests/message-icon.svg";
import { useNavigate } from "react-router";


export default function StudentTable({students,setAddStudents, nextStep, prevStep , fromTeachers , selectedIds, handleDeleteStudents, handleSelectAllStudents, handleSelectStudents,classId}) {
  const navigate = useNavigate()
  

  return (
      <>
      {!fromTeachers && <button className="primary-button float-right px-3 py-2 mb-2 mt-4" onClick={(e)=>setAddStudents(true)}> Add More Students</button>}
      
      <Table bordered hover responsive="md" className="activity-table" style={{ borderRadius:"12px"}}>
        <thead className="table-light">
          <tr>
            {fromTeachers &&<th>
            <div className="checkbox-wrapper">
                <label htmlFor={"student-header"} className="form-check-label">
                  <input
                    type="checkbox"
                    id={"student-header"}
                    name={"student-header"}
                    checked={selectedIds.length === students.length}
                    onChange={handleSelectAllStudents}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom">
                    {selectedIds.length === students.length && (
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
            </th>}
            <th>User Name</th>
            <th>Fist Name</th>
            <th>Last Name</th>
            <th>Email Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              {fromTeachers &&<td>
              <div className="checkbox-wrapper">
                  <label htmlFor={student.id} className="form-check-label">
                    <input
                      type="checkbox"
                      id={student.id}
                      name={student.username}
                      checked={selectedIds.includes(student?.id)}
                      onChange={() => handleSelectStudents(student?.id)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom">
                      {selectedIds.includes(student?.id) && (
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
              
              </td>}
              <td>
                <span
                  style={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    color: "#000",
                  }}
                >
                  {student.username}
                </span>
              </td>
              <td>{student.first_name}</td>
              <td>{student.last_name}</td>
              <td>{student.email}</td>
              <td>
               {fromTeachers && <button
                  className="btn btn-link p-1 me-2"
                  onClick={() =>{ navigate(`/classes/${classId}/${student.id}`)
                  sessionStorage.setItem("student-name", student.first_name + " " + student.last_name)
               }
                }
                  style={{ border: "none", background: "none" }}
                >
                  <img src={viewIcon} alt="view" />
                </button>}
                <button
                  className="btn btn-link p-1 me-2"
                  onClick={() => fromTeachers && handleDeleteStudents(student.id)}
                  style={{ border: "none", background: "none" }}
                >
                  <img src={deleteIcon} alt="delete" />
                </button>
               {fromTeachers && <button
                  className="btn btn-link p-1"
                  // onClick={() => handleDelete(student.id)}
                  style={{ border: "none", background: "none" }}
                >
                  <img src={messageIcon} alt="message" />
                  
                </button>}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    
      {!fromTeachers &&<div className="d-flex mt-4 justify-content-between">
          <div className="d-flex">
            <button className="primary-button px-4 py-2" onClick={nextStep}>
              Next
            </button>
            <button
              className="secondary-button px-3  py-2 ml-3"
              onClick={prevStep}
            >
              Back
            </button>
          </div>
          <div className="ms-auto">
            <a href="#" className="primary-text">
              Save Information for Later
            </a>
          </div>
        </div>}
    </>
  )
}
