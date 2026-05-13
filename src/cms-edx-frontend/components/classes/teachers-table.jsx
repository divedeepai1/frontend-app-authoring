
import { Table, Container } from "react-bootstrap"
// import { useNavigate } from "react-router";
// import { useEffect, useState } from "react";
// import { getConfig } from "@edx/frontend-platform";
// import { fetchCsrfToken } from "../../../cms-csrftoken";
import deleteIcon from "../../assests/delete-icon.svg";
// import messageIcon from "../../assests/message-icon.svg";


export default function TeachersTable({teachers,selectedEmails, handleDeleteTeachers, handleSelectAllTeachers, handleSelectTeachers}) {
  // const [unreadByEmail, setUnreadByEmail] = useState({});
  
  // useEffect(() => {
  //   let cancelled = false;
  //   const loadStatuses = async () => {
  //     try {
  //       const token = await fetchCsrfToken();
  //       const uniqueEmails = Array.from(new Set((teachers || []).map(t => t.email).filter(Boolean)));
  //       const results = await Promise.all(uniqueEmails.map(async (email) => {
  //         try {
  //           const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/chat/unread-status/?email=${email}`, {
  //             method: "GET",
  //             credentials: "include",
  //             headers: {
  //               "Content-Type": "application/json",
  //               "X-CSRFToken": token,
  //             },
  //           });
  //           if (!res.ok) throw new Error("status failed");
  //           const data = await res.json();
  //           return [email, !!data?.is_unread];
  //         } catch (_) {
  //           return [email, false];
  //         }
  //       }));
  //       if (!cancelled) {
  //         const map = {};
  //         results.forEach(([email, flag]) => { map[email] = flag; });
  //         setUnreadByEmail(map);
  //       }
  //     } catch (_) {}
  //   }
  //   loadStatuses();
  //   return () => { cancelled = true; }
  // }, [teachers]);
  
  // const handleMessageClick = (teacher) => {
  //   setUnreadByEmail((prev) => ({ ...prev, [teacher.email]: false }));
  //   navigate("/classes/chat", {
  //     state: {
  //       email: teacher.email,
  //       name: teacher.username || teacher.email,
  //     }
  //   });
  // };
  

  return (
    
      <div style={{ overflowX: "auto"}}>
      <Table bordered hover className="activity-table" >
        <thead className="table-light">
          <tr>
          <th>
          <div className="checkbox-wrapper">
                <label htmlFor={"teacher-header"} className="form-check-label">
                  <input
                    type="checkbox"
                    id={"teacher-header"}
                    name={"teacher-header"}
                    checked={selectedEmails.length === teachers.length}
                    onChange={handleSelectAllTeachers}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom">
                    {selectedEmails.length === teachers.length && (
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
            <th>Teacher Name</th>
            <th>Email Address</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers?.map((teacher) => (
            <tr key={teacher.id}>
              <td>
              <div className="checkbox-wrapper">
                  <label htmlFor={teacher.id} className="form-check-label">
                    <input
                      type="checkbox"
                      id={teacher.id}
                      name={teacher.username}
                      checked={selectedEmails.includes(teacher?.email)}
                      onChange={() => handleSelectTeachers(teacher?.email)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom">
                      {selectedEmails.includes(teacher?.email) && (
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
              <td>
                <span
                  style={{
                    cursor: "pointer",
                    color: "#000",
                  }}
                >
                  {teacher.username}
                </span>
              </td>
              <td>{teacher.email}</td>
              <td>{teacher?.last_login}</td>
              
              <td>
                <button
                  className="btn btn-link p-1"
                  onClick={()=>handleDeleteTeachers(teacher?.email) }
                  style={{ border: "none", background: "none" }}
                >
                  <img src={deleteIcon} alt="delete" />


                </button>
                {/* <button
                  className="btn btn-link p-1"
                  onClick={() => handleMessageClick(teacher)}
                  style={{ border: "none", background: "none" }}
                >
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={messageIcon} alt="message" />
                    {unreadByEmail[teacher.email] && (
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
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      </div>
     
    
  )
}
