
import { Table, Container } from "react-bootstrap"
import { Edit, Trash2 } from "lucide-react"
import viewIcon from "../../assests/view-icon.svg";
import deleteIcon from "../../assests/delete-icon.svg";
import messageIcon from "../../assests/message-icon.svg";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../../cms-csrftoken";


export default function StudentTable({students,setAddStudents, nextStep, prevStep , fromTeachers , selectedIds, handleDeleteStudents, handleSelectAllStudents, handleSelectStudents,classId}) {
  const navigate = useNavigate()
  const [unreadByEmail, setUnreadByEmail] = useState({});
  
  useEffect(() => {
    let cancelled = false;
    const loadStatuses = async () => {
      try {
        const token = await fetchCsrfToken();
        const emails = Array.from(new Set((students || []).map(s => s.email).filter(Boolean)));
        const results = await Promise.all(emails.map(async (email) => {
          try {
            const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/chat/unread-status/?email=${encodeURIComponent(email)}`, {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": token,
              },
            });
            if (!res.ok) throw new Error("status failed");
            const data = await res.json();
            return [email, !!data?.is_unread];
          } catch (_) {
            return [email, false];
          }
        }));
        if (!cancelled) {
          const map = {};
          results.forEach(([email, flag]) => { map[email] = flag; });
          setUnreadByEmail(map);
        }
      } catch (_) {}
    }
    if (fromTeachers) loadStatuses();
    return () => { cancelled = true; }
  }, [students, fromTeachers])

  
  const handleMessageClick = (student) => {
    navigate("/classes/chat", {
      state: {
        email: student.email,
        name: student.username || `${student.first_name} ${student.last_name}` || student.email,
      }
    });
  };

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
                  sessionStorage.setItem("student-name", student.username)
                  sessionStorage.setItem("student-email", student.email)
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
               {fromTeachers && (
                 <button
                   className="btn btn-link p-1"
                   onClick={() => {
                     setUnreadByEmail((prev) => ({ ...prev, [student.email]: false }));
                     handleMessageClick(student)
                   }}
                   style={{ border: "none", background: "none" }}
                 >
                   <div style={{ position: 'relative', display: 'inline-block' }}>
                     <img src={messageIcon} alt="message" />
                     {unreadByEmail[student.email] && (
                       <span style={{
                         position: 'absolute',
                         top: -2,
                         right: -2,
                         width: 8,
                         height: 8,
                         backgroundColor: '#16A34A',
                         borderRadius: '50%'
                       }} />
                     )}
                   </div>
                 </button>
               )}
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
