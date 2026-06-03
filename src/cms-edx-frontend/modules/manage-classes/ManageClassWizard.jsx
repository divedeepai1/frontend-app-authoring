import { useNavigate } from "react-router"
import ProgressIndicator from "../../components/classes/progress-indicator"
import ClassDetails from "../../components/classes/class-details"
import AddStudent from "../../components/classes/add-student"
import AssignCourses from "../../components/classes/assign-courses"
import ManageClassModalFrame from "./components/ManageClassModalFrame"
import WizardShell from "./components/WizardShell"
import { useManageClassWizard } from "./hooks/useManageClassWizard"
import "../../theme/teachers-portal-scope.css"

function readManageClassIsEdit() {
  if (typeof sessionStorage === "undefined") return false
  return sessionStorage.getItem("manageClassMode") === "edit"
}

export default function ManageClassWizard({ isNewStudent, modalHeaderEnd, onClose }) {
  const navigate = useNavigate()
  const w = useManageClassWizard({ isNewStudent })
  const isEditMode = readManageClassIsEdit()
  const progress = !isNewStudent ? <ProgressIndicator activeStep={w.activeStep} /> : null

  let body = null
  if (w.activeStep === 1) {
    body = (
      <ClassDetails
        formData={w.formData}
        handleInputChange={w.handleInputChange}
        nextStep={w.nextStep}
        embedInModal
      />
    )
  } else if (w.activeStep === 2) {
    body = (
      <AddStudent
        isNewStudent={isNewStudent}
        nextStep={w.nextStep}
        prevStep={w.prevStep}
        embedInModal
      />
    )

  } else if (w.activeStep === 3) {
    body = (
      <AssignCourses
        formData={w.formData}
        courses={w.courses}
        handleCourseSelection={w.handleCourseSelection}
        nextStep={w.nextStep}
        prevStep={w.prevStep}
        embedInModal
      />
    )
  }

  const modalTitle = isNewStudent ? "Add students" : isEditMode ? "Edit class" : "Create class"
  const modalSubtitle = isNewStudent
    ? "Add students to this class."
    : isEditMode
      ? `Update information for ${w.formData?.name?.trim() || "this class"}`
      : "Create and configure your new class"

  let footer = null
  if (!isNewStudent && w.activeStep === 1) {
    footer = (
      <div className="tp-mc-modal-footer-inner">
        <div className="tp-mc-modal-footer-spacer" aria-hidden />
        <div className="tp-mc-modal-footer-btns">
          <button type="button" className="tp-btn tp-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="tp-mc-class-details-form" className="tp-btn tp-btn-primary">
            Next
          </button>
        </div>
      </div>
    )
  } else if (!isNewStudent && w.activeStep === 2) {
    footer = (
      <div className="tp-mc-modal-footer-inner">
        <a
          href="/classes"
          className="tp-muted-link"
          onClick={(e) => {
            e.preventDefault()
            navigate("/classes")
          }}
        >
          Save information for later
        </a>
        <div className="tp-mc-modal-footer-btns">
          <button type="button" className="tp-btn tp-btn-secondary" onClick={w.prevStep}>
            Back
          </button>
          <button type="button" className="tp-btn tp-btn-primary" onClick={() => w.nextStep()}>
            Next
          </button>
        </div>
      </div>
    )
  } else if (!isNewStudent && w.activeStep === 3) {
    footer = (
      <div className="tp-mc-modal-footer-inner">
        <a
          href="/classes"
          className="tp-muted-link"
          onClick={(e) => {
            e.preventDefault()
            navigate("/classes")
          }}
        >
          Save information for later
        </a>
        <div className="tp-mc-modal-footer-btns">
          <button type="button" className="tp-btn tp-btn-secondary" onClick={w.prevStep}>
            Back
          </button>
          <button type="button" className="tp-btn tp-btn-primary" onClick={() => w.nextStep()}>
            {isEditMode ? "Update class" : "Create class"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <ManageClassModalFrame
        title={modalTitle}
        subtitle={modalSubtitle}
        onClose={onClose}
        headerEnd={modalHeaderEnd}
        showProgress={!isNewStudent}
        progress={progress}
        footer={footer}
      >
        <WizardShell embedded>{body}</WizardShell>
      </ManageClassModalFrame>
  )
}
