import { useEffect, useState } from "react"
import { Link2, Upload, UserPlus, Users } from "lucide-react"
import SingleStudentForm from "../student-feed/forms/single-student-form"
import BulkStudentForm from "../student-feed/forms/bulk-student-form"
import CsvImportForm from "../student-feed/forms/import-student-list-form"
import SelfJoinLinkForm from "../student-feed/forms/self-joining-students"
import StudentTable from "./students-table"
import * as classroomApi from "../../modules/manage-classes/services/classroomApi"

const CHOICE_OPTIONS = [
  { key: "single", title: "Add a single student", icon: UserPlus, disabled: false },
  { key: "bulk", title: "Add bulk students", icon: Users, disabled: true },
  { key: "link", title: "Self-joining link", icon: Link2, disabled: true },
  { key: "csv", title: "Import list of students", icon: Upload, disabled: false },
]

const StudentDetails = ({ nextStep, prevStep, isNewStudent, embedInModal = false }) => {
  const [addStudents, setAddStudents] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [students, setStudents] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const classId = sessionStorage.getItem("classId")
      if (!classId) {
        if (!cancelled) setStudents([])
        return
      }
      try {
        const result = await classroomApi.fetchStudentsList(classId)
        if (!cancelled) setStudents(result?.students || [])
      } catch {
        if (!cancelled) setStudents([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [addStudents])

  const handleStudentAdded = async () => {
    setSelectedOption(null)
    setAddStudents(false)
    const classId = sessionStorage.getItem("classId")
    if (!classId) return
    try {
      const result = await classroomApi.fetchStudentsList(classId)
      setStudents(result?.students || [])
    } catch {
      setStudents([])
    }
  }

  const renderForm = () => {
    switch (selectedOption) {
      case "single":
        return (
          <SingleStudentForm
            setSelectedOption={setSelectedOption}
            isNewStudent={isNewStudent}
            setAddStudents={setAddStudents}
            onStudentAdded={handleStudentAdded}
          />
        )
      case "bulk":
        return (
          <BulkStudentForm
            setSelectedOption={setSelectedOption}
            isNewStudent={isNewStudent}
            setAddStudents={setAddStudents}
          />
        )
      case "csv":
        return (
          <CsvImportForm
            setSelectedOption={setSelectedOption}
            isNewStudent={isNewStudent}
            setAddStudents={setAddStudents}
            onStudentAdded={handleStudentAdded}
          />
        )
      case "link":
        return (
          <SelfJoinLinkForm
            setSelectedOption={setSelectedOption}
            isNewStudent={isNewStudent}
            setAddStudents={setAddStudents}
          />
        )
      default:
        return null
    }
  }

  const showTable =
    students.length > 0 && !addStudents && !isNewStudent && !selectedOption

  return (
    <>
      {showTable ? (
        <StudentTable
          students={students}
          setAddStudents={setAddStudents}
          nextStep={nextStep}
          prevStep={prevStep}
          embedInModal={embedInModal}
        />
      ) : (
        <div className="tp-add-students">
          <h3 className="tp-title">Add students</h3>
          <p className="tp-subtitle">Select how you would like to add new students to this class.</p>
          <div className="tp-choice-grid tp-choice-grid--four">
            {CHOICE_OPTIONS.map(({ key, title, icon: Icon, disabled }) => (
              <button
                key={key}
                type="button"
                className={`tp-choice-card${disabled ? " tp-choice-disabled" : ""}`}
                disabled={disabled}
                onClick={() => !disabled && setSelectedOption(key)}
              >
                <div className="tp-choice-card-icon-wrap">
                  <Icon className="tp-choice-card-icon" size={24} strokeWidth={1.5} aria-hidden />
                </div>
                <span className="tp-choice-label">{title}</span>
              </button>
            ))}
          </div>
          <div className="tp-add-students-forms">{renderForm()}</div>
          {!isNewStudent && !embedInModal && (
            <div className="tp-add-students-footer">
              <div className="tp-actions-row">
                <button type="button" className="tp-btn tp-btn-primary" onClick={nextStep}>
                  Next
                </button>
                <button type="button" className="tp-btn tp-btn-secondary" onClick={prevStep}>
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default StudentDetails
