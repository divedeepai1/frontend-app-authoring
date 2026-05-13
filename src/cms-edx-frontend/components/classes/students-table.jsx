
import { Table } from "react-bootstrap"
import { RotateCcw } from "lucide-react"
import viewIcon from "../../assests/view-icon.svg";
import deleteIcon from "../../assests/delete-icon.svg";
// import messageIcon from "../../assests/message-icon.svg";
import { useNavigate } from "react-router";
import { useState } from "react";
// import { getConfig } from "@edx/frontend-platform";
// import { fetchCsrfToken } from "../../../cms-csrftoken";
import SaveInformationForLater from "./save-information-for-later";
import ToastContainer from "../../../compugrade/pages/MultiPartLessonBuilder/components/ui/toast";
import { base_url } from "../../../compugrade-constants";


export default function StudentTable({students,setAddStudents, nextStep, prevStep , fromTeachers , selectedIds, handleDeleteStudents, handleSelectAllStudents, handleSelectStudents,classId}) {
  const navigate = useNavigate()
  // const [unreadByEmail, setUnreadByEmail] = useState({});
  const [resettingStudentId, setResettingStudentId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // useEffect(() => {
  //   let cancelled = false;
  //   const loadStatuses = async () => {
  //     try {
  //       const token = await fetchCsrfToken();
  //       const emails = Array.from(new Set((students || []).map(s => s.email).filter(Boolean)));
  //       const results = await Promise.all(emails.map(async (email) => {
  //         try {
  //           const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/chat/unread-status/?email=${encodeURIComponent(email)}`, {
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
  //   if (fromTeachers) loadStatuses();
  //   return () => { cancelled = true; }
  // }, [students, fromTeachers])

  // const handleMessageClick = (student) => {
  //   navigate("/classes/chat", {
  //     state: {
  //       email: student.email,
  //       name: student.username || `${student.first_name} ${student.last_name}` || student.email,
  //     }
  //   });
  // };

  
  const addToast = ({ title, message, variant = "info" }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleResetStudentProgress = async (studentId) => {
    if (!studentId) return;
    setResettingStudentId(studentId);
    try {
      const response = await fetch(`${base_url}/api/openedx/user/reset_student_progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: studentId,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to reset student progress.");
      }
      addToast({
        title: "Student progress reset",
        message: "Progress has been reset successfully.",
        variant: "success",
      });
    } catch (error) {
      addToast({
        title: "Reset failed",
        message: "Unable to reset student progress right now.",
        variant: "error",
      });
    } finally {
      setResettingStudentId(null);
    }
  };

  return (
      <>
      <style>{`
        .students-table-responsive-wrap {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .students-table-responsive-wrap .activity-table {
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
        }
        .students-table-responsive-wrap .activity-table th,
        .students-table-responsive-wrap .activity-table td {
          word-break: break-word;
          overflow-wrap: anywhere;
          vertical-align: top;
        }
        .students-table-responsive-wrap .activity-table td.students-table-actions-cell {
          white-space: nowrap;
          width: 1%;
        }
        .students-table-responsive-wrap .activity-table th.students-table-checkbox-col,
        .students-table-responsive-wrap .activity-table td.students-table-checkbox-col {
          width: 44px;
          max-width: 44px;
        }
      `}</style>
      {!fromTeachers && (
        <div className="d-flex justify-content-end flex-wrap gap-2 mb-2 mt-4 w-100">
          <button className="primary-button px-3 py-2" type="button" onClick={(e) => setAddStudents(true)}>
            Add More Students
          </button>
        </div>
      )}
      
      <div className="students-table-responsive-wrap">
      <Table bordered hover className="activity-table" style={{ borderRadius:"12px"}}>
        <thead className="table-light">
          <tr>
            {fromTeachers &&<th className="students-table-checkbox-col">
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
            {fromTeachers && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              {fromTeachers &&<td className="students-table-checkbox-col">
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
              <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
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
              <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{student.first_name}</td>
              <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{student.last_name}</td>
              <td style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{student.email}</td>
              {fromTeachers && (
              <td className="students-table-actions-cell" style={{ whiteSpace: "nowrap" }}>
                <div className="d-inline-flex align-items-center" style={{ gap: 8 }}>
                <button
                    className="btn btn-link p-1 me-2"
                    onClick={() => {
                      navigate(`/classes/${classId}/${student.id}`)
                      sessionStorage.setItem("student-name", student.username)
                      sessionStorage.setItem("student-email", student.email)
                    }}
                    style={{ border: "none", background: "none" }}
                    title="View student details"
                    aria-label="View student details"
                  >
                    <img src={viewIcon} alt="view" />
                  </button>
                <button
                  className="btn btn-link p-1 me-2"
                  onClick={() => handleDeleteStudents(student.id)}
                  style={{ border: "none", background: "none" }}
                  title="Delete student"
                  aria-label="Delete student"
                >
                  <img src={deleteIcon} alt="delete" />
                </button>
                  <button
                    className="btn btn-link p-1"
                    onClick={() => handleResetStudentProgress(student.id)}
                    style={{
                      border: "none",
                      background: "#e3e1e1",
                      borderRadius: 2,
                      width: 24,
                      height: 24,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Reset student progress"
                    aria-label="Reset student progress"
                    disabled={resettingStudentId === student.id}
                  >
                    <RotateCcw size={14} color={resettingStudentId === student.id ? "#9CA3AF" : "#6B7280"} />
                  </button>
                {/* {fromTeachers && (
                  <button
                    className="btn btn-link p-1"
                    onClick={() => {
                      setUnreadByEmail((prev) => ({ ...prev, [student.email]: false }));
                      handleMessageClick(student);
                    }}
                    style={{ border: "none", background: "none" }}
                    title="Message student"
                    aria-label="Message student"
                  >
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <img src={messageIcon} alt="message" />
                      {unreadByEmail[student.email] && (
                        <span
                          style={{
                            position: "absolute",
                            top: -2,
                            right: -2,
                            width: 8,
                            height: 8,
                            backgroundColor: "#16A34A",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </div>
                  </button>
                )} */}
                </div>
              </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      </div>
    
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
          <SaveInformationForLater />
        </div>}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}
