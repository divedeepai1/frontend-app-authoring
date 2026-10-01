import { Trash2, UserRound } from "lucide-react"
import TpCheckbox from "../common/TpCheckbox"
// import { useNavigate } from "react-router"
// import { useEffect, useState } from "react"
// import { getConfig } from "@edx/frontend-platform"
// import { fetchCsrfToken } from "../../../cms-csrftoken"
// import messageIcon from "../../assests/message-icon.svg"

// const [unreadByEmail, setUnreadByEmail] = useState({})

// useEffect(() => {
//   let cancelled = false
//   const loadStatuses = async () => {
//     try {
//       const token = await fetchCsrfToken()
//       const uniqueEmails = Array.from(new Set((teachers || []).map((t) => t.email).filter(Boolean)))
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
// }, [teachers])

// const handleMessageClick = (teacher) => {
//   setUnreadByEmail((prev) => ({ ...prev, [teacher.email]: false }))
//   navigate("/classes/chat", {
//     state: {
//       email: teacher.email,
//       name: teacher.username || teacher.email,
//     },
//   })
// }

import TpLoadingState from "../common/TpLoadingState"

export default function TeachersTable({
  teachers,
  selectedEmails,
  handleDeleteTeachers,
  handleSelectAllTeachers,
  handleSelectTeachers,
  toolbar,
  isLoading = false,
  loadingLabel = "Loading teachers…",
}) {
  const tList = teachers || []
  const allTeachersSelected = tList.length > 0 && selectedEmails.length === tList.length
  const someTeachersSelected = selectedEmails.length > 0 && !allTeachersSelected

  return (
    <div className="tp-portal-data-table">
      <div className="tp-portal-data-table-head">
        <div className="tp-portal-data-table-head-icon" aria-hidden>
          <UserRound size={20} color="#fff" strokeWidth={2} />
        </div>
        <div className="tp-portal-data-table-head-text">
          <h3 className="tp-portal-data-table-title">Assigned teachers</h3>
          <p className="tp-portal-data-table-desc">View and manage teachers linked to this class.</p>
        </div>
      </div>
      {toolbar ? <div className="tp-portal-data-table-toolbar">{toolbar}</div> : null}
      <div className="tp-portal-data-table-scroll">
        {isLoading ? (
          <TpLoadingState label={loadingLabel} className="tp-portal-data-table-loading" />
        ) : (
        <table className="tp-portal-data-table-grid">
          <colgroup>
            <col style={{ width: "3rem" }} />
            <col />
            <col />
            <col />
            <col style={{ width: "5.5rem" }} />
          </colgroup>
          <thead>
            <tr>
              <th className="tp-portal-data-table-th tp-portal-data-table-th--narrow" scope="col">
                <div className="tp-checkbox-cell tp-checkbox-cell--table">
                  <TpCheckbox
                    id="teacher-header"
                    name="teacher-header"
                    checked={allTeachersSelected}
                    indeterminate={someTeachersSelected}
                    onChange={handleSelectAllTeachers}
                    ariaLabel="Select all teachers"
                  />
                </div>
              </th>
              <th className="tp-portal-data-table-th" scope="col">
                Teacher name
              </th>
              <th className="tp-portal-data-table-th" scope="col">
                Email address
              </th>
              <th className="tp-portal-data-table-th" scope="col">
                Last login
              </th>
              <th className="tp-portal-data-table-th tp-portal-data-table-th--actions" scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {tList.length === 0 ? (
              <tr>
                <td colSpan={5} className="tp-portal-data-table-empty">
                  No teachers in this class yet.
                </td>
              </tr>
            ) : (
              tList.map((teacher, index) => (
                <tr key={teacher.id} className={index % 2 === 1 ? "tp-portal-data-table-row-alt" : undefined}>
                  <td className="tp-portal-data-table-td tp-portal-data-table-td--narrow">
                    <div className="tp-checkbox-cell tp-checkbox-cell--table">
                      <TpCheckbox
                        id={`tp-teacher-row-${teacher.id}`}
                        name={teacher.username}
                        checked={selectedEmails.includes(teacher?.email)}
                        onChange={() => handleSelectTeachers(teacher?.email)}
                        ariaLabel={`Select teacher ${teacher.username || teacher.email}`}
                      />
                    </div>
                  </td>
                  <td className="tp-portal-data-table-td">
                    <div className="tp-portal-data-table-cell-strong">{teacher.username}</div>
                  </td>
                  <td className="tp-portal-data-table-td">
                    <div className="tp-portal-data-table-cell-muted">{teacher.email}</div>
                  </td>
                  <td className="tp-portal-data-table-td">
                    <div className="tp-portal-data-table-cell-muted">{teacher?.last_login || "—"}</div>
                  </td>
                  <td className="tp-portal-data-table-td tp-portal-data-table-td--actions">
                    <div className="tp-portal-data-table-actions">
                      <button
                        type="button"
                        className="tp-portal-data-table-action tp-portal-data-table-action--danger"
                        title="Remove teacher"
                        aria-label="Remove teacher"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTeachers(teacher?.email)
                        }}
                      >
                        <Trash2 size={20} strokeWidth={1.5} />
                      </button>
                      {/* <button
                        type="button"
                        className="tp-portal-data-table-action tp-portal-data-table-action--muted"
                        onClick={() => handleMessageClick(teacher)}
                        title="Message teacher"
                        aria-label="Message teacher"
                      >
                        <div style={{ position: "relative", display: "inline-flex" }}>
                          <img src={messageIcon} alt="" />
                          {unreadByEmail[teacher.email] && (
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
        )}
      </div>
      <div className="tp-portal-data-table-foot">
        {isLoading ? "Loading…" : `Showing ${tList.length} teacher${tList.length === 1 ? "" : "s"}`}
      </div>
    </div>
  )
}
