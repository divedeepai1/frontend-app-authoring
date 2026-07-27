
import { ArrowLeftRight, Eye, RotateCcw, Trash2, Users } from "lucide-react"
import TpCheckbox from "../common/TpCheckbox"
import { useNavigate } from "react-router"
import { useState } from "react"
import SaveInformationForLater from "./save-information-for-later"
import { tpToast } from "../common/tpToast"
import { resetStudentProgress } from "../../modules/manage-classes/services/studentProgressApi"

import TpLoadingState from "../common/TpLoadingState"

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
  handleMoveStudent,
  classId,
  toolbar,
  embedInModal = false,
  showRowActions,
  isLoading = false,
  loadingLabel = "Loading students…",
}) {
  const navigate = useNavigate()
  const [resettingStudentId, setResettingStudentId] = useState(null)

  const handleResetStudentProgress = async (studentId) => {
    if (!studentId) return
    setResettingStudentId(studentId)
    try {
      await resetStudentProgress(studentId)
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
  const showSelection = Boolean(fromTeachers && handleSelectStudents)
  const showActions = showRowActions ?? Boolean(fromTeachers && handleDeleteStudents)
  const canRemove = typeof handleDeleteStudents === "function"
  const canMove = typeof handleMoveStudent === "function"

  const isStudentSelected = (studentId) =>
    selectedIdList.some((id) => String(id) === String(studentId))

  const renderRowActions = (student) => (
    <div className="tp-portal-data-table-actions">
      {fromTeachers ? (
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
      ) : null}
      {canMove ? (
        <button
          type="button"
          className="tp-portal-data-table-action"
          title="Move student to another class"
          aria-label={`Move ${student.username || "student"} to another class`}
          onClick={(e) => {
            e.stopPropagation()
            handleMoveStudent(student)
          }}
        >
          <ArrowLeftRight size={18} strokeWidth={2} />
        </button>
      ) : null}
      {canRemove ? (
        <button
          type="button"
          className="tp-portal-data-table-action tp-portal-data-table-action--danger"
          title="Remove student from class"
          aria-label="Remove student from class"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteStudents(student.id)
          }}
        >
          <Trash2 size={20} strokeWidth={1.5} />
        </button>
      ) : null}
      {fromTeachers ? (
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
      ) : null}
    </div>
  )

  const tableTitle = fromTeachers ? "Students" : "Students"
  const tableDesc = fromTeachers
    ? "View and manage students enrolled in this class."
    : "Students added to this class appear below."

  const colCount = 4 + (showSelection ? 1 : 0) + (showActions ? 1 : 0)

  return (
    <>
      <div className={`tp-portal-data-table${fromTeachers ? "" : " tp-wizard-students-table"}`}>
        <div className="tp-portal-data-table-head">
          <div className="tp-portal-data-table-head-icon" aria-hidden>
            <Users size={20} color="#fff" strokeWidth={2} />
          </div>
          <div className="tp-portal-data-table-head-text">
            <h3 className="tp-portal-data-table-title">{tableTitle}</h3>
            <p className="tp-portal-data-table-desc">{tableDesc}</p>
          </div>
        </div>

        {fromTeachers && toolbar ? <div className="tp-portal-data-table-toolbar">{toolbar}</div> : null}

        {!fromTeachers ? (
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
        ) : null}

        <div className="tp-portal-data-table-scroll">
          {isLoading ? (
            <TpLoadingState label={loadingLabel} className="tp-portal-data-table-loading" />
          ) : (
          <table className="tp-portal-data-table-grid">
            <colgroup>
              {showSelection ? <col style={{ width: "3rem" }} /> : null}
              <col />
              <col />
              <col />
              <col />
              {showActions ? <col style={{ width: canMove ? "12.5rem" : "10.5rem" }} /> : null}
            </colgroup>
            <thead>
              <tr>
                {showSelection ? (
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
                ) : null}
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
                {showActions ? (
                  <th className="tp-portal-data-table-th tp-portal-data-table-th--actions" scope="col">
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {studentList.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="tp-portal-data-table-empty">
                    No students in this class yet.
                  </td>
                </tr>
              ) : (
                studentList.map((student, index) => (
                  <tr key={student.id} className={index % 2 === 1 ? "tp-portal-data-table-row-alt" : undefined}>
                    {showSelection ? (
                      <td className="tp-portal-data-table-td tp-portal-data-table-td--narrow">
                        <div className="tp-checkbox-cell tp-checkbox-cell--table">
                          <TpCheckbox
                            id={`tp-student-row-${student.id}`}
                            name={student.username}
                            checked={isStudentSelected(student.id)}
                            onChange={() => handleSelectStudents(student.id)}
                            ariaLabel={`Select student ${student.username}`}
                          />
                        </div>
                      </td>
                    ) : null}
                    <td className="tp-portal-data-table-td">
                      {fromTeachers ? (
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
                      ) : (
                        <div className="tp-portal-data-table-cell-strong">{student.username}</div>
                      )}
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
                    {showActions ? (
                      <td className="tp-portal-data-table-td tp-portal-data-table-td--actions">
                        {renderRowActions(student)}
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>
        <div className="tp-portal-data-table-foot">
          {isLoading ? "Loading…" : `Showing ${studentList.length} student${studentList.length === 1 ? "" : "s"}`}
        </div>
      </div>

      {!fromTeachers && !embedInModal && (
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
