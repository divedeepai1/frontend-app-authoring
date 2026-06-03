
import { Eye, RotateCcw, Trash2, Users } from "lucide-react"
import TpCheckbox from "../common/TpCheckbox"
// import { useEffect } from "react"
// import { getConfig } from "@edx/frontend-platform"
// import { fetchCsrfToken } from "../../../cms-csrftoken"
// import messageIcon from "../../assests/message-icon.svg"
import { useNavigate } from "react-router"
import { useState } from "react"
import SaveInformationForLater from "./save-information-for-later"
import { tpToast } from "../common/tpToast"
import { base_url } from "../../../compugrade-constants"

// const [unreadByEmail, setUnreadByEmail] = useState({})

// useEffect(() => {
//   let cancelled = false
//   const loadStatuses = async () => {
//     try {
//       const token = await fetchCsrfToken()
//       const uniqueEmails = Array.from(new Set((students || []).map((s) => s.email).filter(Boolean)))
//       const results = await Promise.all(
//         uniqueEmails.map(async (email) => {
//           try {
//             const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/chat/unread-status/?email=${email}`, {
//               method: "GET",
//               credentials: "include",
//               headers: {
//                 "Content-Type": "application/json",
//                 "X-CSRFToken": token,
//               },
//             })
//             if (!res.ok) throw new Error("status failed")
//             const data = await res.json()
//             return [email, !!data?.is_unread]
//           } catch (_) {
//             return [email, false]
//           }
//         })
//       )
//       if (!cancelled) {
//         const map = {}
//         results.forEach(([email, flag]) => {
//           map[email] = flag
//         })
//         setUnreadByEmail(map)
//       }
//     } catch (_) {}
//   }
//   loadStatuses()
//   return () => {
//     cancelled = true
//   }
// }, [students])

// const handleMessageClick = (student) => {
//   setUnreadByEmail((prev) => ({ ...prev, [student.email]: false }))
//   navigate("/classes/chat", {
//     state: {
//       email: student.email,
//       name: student.username || student.email,
//     },
//   })
// }

export default function StudentTable({
  students,
  setAddStudents,
  nextStep,
  prevStep,
  fromTeachers,
  selectedIds,
  handleDeleteStudents,
  handleSelectAllStudents,
  handleSelectStudents,
  classId,
  toolbar,
  embedInModal = false,
}) {
  const navigate = useNavigate()
  const [resettingStudentId, setResettingStudentId] = useState(null)
  const handleResetStudentProgress = async (studentId) => {
    if (!studentId) return
    setResettingStudentId(studentId)
    try {
      const response = await fetch(`${base_url}/api/openedx/user/reset_student_progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: studentId,
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Failed to reset student progress.")
      }
      tpToast.success("Student progress reset", "Progress has been reset successfully.")
    } catch {
      tpToast.error("Reset failed", "Unable to reset student progress right now.")
    } finally {
      setResettingStudentId(null)
    }
  }

  const studentList = Array.isArray(students) ? students : []
  const selectedIdList = Array.isArray(selectedIds) ? selectedIds : []
  const allStudentsSelected = studentList.length > 0 && selectedIdList.length === studentList.length
  const someStudentsSelected = selectedIdList.length > 0 && !allStudentsSelected

  if (fromTeachers) {
    return (
      <>
        <div className="tp-portal-data-table">
          <div className="tp-portal-data-table-head">
            <div className="tp-portal-data-table-head-icon" aria-hidden>
              <Users size={20} color="#fff" strokeWidth={2} />
            </div>
            <div className="tp-portal-data-table-head-text">
              <h3 className="tp-portal-data-table-title">Students</h3>
              <p className="tp-portal-data-table-desc">View and manage students enrolled in this class.</p>
            </div>
          </div>
          {toolbar ? <div className="tp-portal-data-table-toolbar">{toolbar}</div> : null}
          <div className="tp-portal-data-table-scroll">
            <table className="tp-portal-data-table-grid">
              <colgroup>
                <col style={{ width: "3rem" }} />
                <col />
                <col />
                <col />
                <col />
                <col style={{ width: "8.5rem" }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="tp-portal-data-table-th tp-portal-data-table-th--narrow" scope="col">
                    <div className="tp-checkbox-cell tp-checkbox-cell--table">
                      <TpCheckbox
                        id="student-header"
                        name="student-header"
                        checked={allStudentsSelected}
                        indeterminate={someStudentsSelected}
                        onChange={handleSelectAllStudents}
                        ariaLabel="Select all students"
                      />
                    </div>
                  </th>
                  <th className="tp-portal-data-table-th" scope="col">
                    User name
                  </th>
                  <th className="tp-portal-data-table-th" scope="col">
                    First name
                  </th>
                  <th className="tp-portal-data-table-th" scope="col">
                    Last name
                  </th>
                  <th className="tp-portal-data-table-th" scope="col">
                    Email address
                  </th>
                  <th className="tp-portal-data-table-th tp-portal-data-table-th--actions" scope="col">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="tp-portal-data-table-empty">
                      No students in this class yet.
                    </td>
                  </tr>
                ) : (
                  studentList.map((student, index) => (
                    <tr key={student.id} className={index % 2 === 1 ? "tp-portal-data-table-row-alt" : undefined}>
                      <td className="tp-portal-data-table-td tp-portal-data-table-td--narrow">
                        <div className="tp-checkbox-cell tp-checkbox-cell--table">
                          <TpCheckbox
                            id={`tp-student-row-${student.id}`}
                            name={student.username}
                            checked={selectedIdList.includes(student?.id)}
                            onChange={() => handleSelectStudents(student?.id)}
                            ariaLabel={`Select student ${student.username}`}
                          />
                        </div>
                      </td>
                      <td className="tp-portal-data-table-td">
                        <button
                          type="button"
                          className="tp-portal-data-table-name-link"
                          onClick={() => {
                            navigate(`/classes/${classId}/${student.id}`)
                            sessionStorage.setItem("student-name", student.username)
                            sessionStorage.setItem("student-email", student.email)
                          }}
                        >
                          {student.username}
                        </button>
                      </td>
                      <td className="tp-portal-data-table-td">
                        <div className="tp-portal-data-table-cell-muted">{student.first_name}</div>
                      </td>
                      <td className="tp-portal-data-table-td">
                        <div className="tp-portal-data-table-cell-muted">{student.last_name}</div>
                      </td>
                      <td className="tp-portal-data-table-td">
                        <div className="tp-portal-data-table-cell-muted">{student.email}</div>
                      </td>
                      <td className="tp-portal-data-table-td tp-portal-data-table-td--actions">
                        <div className="tp-portal-data-table-actions">
                          <button
                            type="button"
                            className="tp-portal-data-table-action"
                            title="View student details"
                            aria-label="View student details"
                            onClick={() => {
                              navigate(`/classes/${classId}/${student.id}`)
                              sessionStorage.setItem("student-name", student.username)
                              sessionStorage.setItem("student-email", student.email)
                            }}
                          >
                            <Eye size={20} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            className="tp-portal-data-table-action tp-portal-data-table-action--muted"
                            title="Remove student"
                            aria-label="Remove student"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteStudents(student.id)
                            }}
                          >
                            <Trash2 size={20} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            className="tp-portal-data-table-action tp-portal-data-table-action--muted"
                            title="Reset student progress"
                            aria-label="Reset student progress"
                            disabled={resettingStudentId === student.id}
                            onClick={() => handleResetStudentProgress(student.id)}
                          >
                            <RotateCcw size={18} strokeWidth={2} />
                          </button>
                          {/* <button
                            type="button"
                            className="tp-portal-data-table-action tp-portal-data-table-action--muted"
                            onClick={() => handleMessageClick(student)}
                            title="Message student"
                            aria-label="Message student"
                          >
                            <div style={{ position: "relative", display: "inline-flex" }}>
                              <img src={messageIcon} alt="" />
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
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="tp-portal-data-table-foot">
            Showing {studentList.length} student{studentList.length === 1 ? "" : "s"}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="tp-portal-data-table tp-wizard-students-table">
        <div className="tp-portal-data-table-head">
          <div className="tp-portal-data-table-head-icon" aria-hidden>
            <Users size={20} color="#fff" strokeWidth={2} />
          </div>
          <div className="tp-portal-data-table-head-text">
            <h3 className="tp-portal-data-table-title">Students</h3>
            <p className="tp-portal-data-table-desc">Students added to this class appear below.</p>
          </div>
        </div>
        <div className="tp-portal-data-table-toolbar">
          <div className="tp-portal-data-table-toolbar-inner">
            <div className="tp-portal-data-table-toolbar-spacer" />
            <div className="tp-portal-data-table-toolbar-actions">
              <button type="button" className="tp-btn tp-btn-primary" onClick={() => setAddStudents(true)}>
                + Add more students
              </button>
            </div>
          </div>
        </div>
        <div className="tp-portal-data-table-scroll">
          <table className="tp-portal-data-table-grid">
            <colgroup>
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th className="tp-portal-data-table-th" scope="col">
                  User name
                </th>
                <th className="tp-portal-data-table-th" scope="col">
                  First name
                </th>
                <th className="tp-portal-data-table-th" scope="col">
                  Last name
                </th>
                <th className="tp-portal-data-table-th" scope="col">
                  Email address
                </th>
              </tr>
            </thead>
            <tbody>
              {studentList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="tp-portal-data-table-empty">
                    No students in this class yet.
                  </td>
                </tr>
              ) : (
                studentList.map((student, index) => (
                  <tr key={student.id} className={index % 2 === 1 ? "tp-portal-data-table-row-alt" : undefined}>
                    <td className="tp-portal-data-table-td">
                      <div className="tp-portal-data-table-cell-strong">{student.username}</div>
                    </td>
                    <td className="tp-portal-data-table-td">
                      <div className="tp-portal-data-table-cell-muted">{student.first_name}</div>
                    </td>
                    <td className="tp-portal-data-table-td">
                      <div className="tp-portal-data-table-cell-muted">{student.last_name}</div>
                    </td>
                    <td className="tp-portal-data-table-td">
                      <div className="tp-portal-data-table-cell-muted">{student.email}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="tp-portal-data-table-foot">
          Showing {studentList.length} student{studentList.length === 1 ? "" : "s"}
        </div>
      </div>

      {!embedInModal && (
        <div className="tp-wizard-students-table-footer">
          <div className="tp-actions-row">
            <button type="button" className="tp-btn tp-btn-primary" onClick={nextStep}>
              Next
            </button>
            <button type="button" className="tp-btn tp-btn-secondary" onClick={prevStep}>
              Back
            </button>
          </div>
          <SaveInformationForLater />
        </div>
      )}
    </>
  )
}
