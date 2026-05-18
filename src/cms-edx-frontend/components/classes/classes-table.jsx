import { Users, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router"
import TpDeleteConfirmationModal from "../common/TpDeleteConfirmationModal"
import { tpToast } from "../common/tpToast"
import TpCheckbox from "../common/TpCheckbox"
import * as classroomApi from "../../modules/manage-classes/services/classroomApi"

const ActivityFeed = ({ classes, setClasses }) => {
  const navigate = useNavigate()
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" })
  const [selectedClasses, setSelectedClasses] = useState([])

  const list = classes || []

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedClasses(list.map((cls) => cls.id))
    else setSelectedClasses([])
  }

  const handleSelectOne = (id) => {
    setSelectedClasses((prev) => (prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]))
  }

  const isAllSelected = list.length > 0 && selectedClasses.length === list.length
  const isSomeSelected = selectedClasses.length > 0 && !isAllSelected

  const handleEdit = (e, cls) => {
    e.stopPropagation()
    sessionStorage.setItem("manageClassMode", "edit")
    sessionStorage.setItem("classId", cls.id)
    sessionStorage.setItem("classData", JSON.stringify(cls))
    navigate("/manage-classes/1")
  }

  const deleteClass = async () => {
    if (!deleteModal.id) return
    const className = deleteModal.name
    try {
      await classroomApi.deleteClassroom(deleteModal.id)
      setClasses((prev) => prev.filter((cls) => cls.id !== deleteModal.id))
      tpToast.success(
        className ? `Class "${className}" deleted successfully` : "Class deleted successfully",
      )
    } catch (err) {
      tpToast.error(err?.message || "Unable to delete class. Please try again.")
      throw err
    }
  }

  return (
    <>
      <div className="tp-myclasses-card">
        <div className="tp-myclasses-head">
          <div className="tp-myclasses-head-inner">
            <div className="tp-myclasses-title-block">
              <div className="tp-myclasses-icon-wrap">
                <Users size={20} color="#fff" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h3 className="tp-myclasses-heading">My classes</h3>
                <p className="tp-myclasses-desc">Manage and organize your class information</p>
              </div>
            </div>
            <button
              type="button"
              className="tp-btn tp-btn-primary"
              style={{ padding: "0.65rem 1.1rem" }}
              onClick={() => {
                sessionStorage.removeItem("classId")
                sessionStorage.removeItem("classData")
                sessionStorage.setItem("manageClassMode", "create")
                navigate("/manage-classes/1")
              }}
            >
              <Plus size={16} strokeWidth={2} aria-hidden />
              Add a new class
            </button>
          </div>
        </div>
        <div className="tp-myclasses-table-wrap">
          <table className="tp-myclasses-table">
            <colgroup>
              <col style={{ width: "3rem" }} />
              <col />
              <col style={{ width: "5.5rem" }} />
              <col style={{ width: "5.5rem" }} />
              <col style={{ width: "6.5rem" }} />
              <col />
              <col style={{ width: "8.5rem" }} />
            </colgroup>
            <thead>
              <tr>
                <th className="tp-myclasses-th tp-myclasses-th--checkbox" scope="col">
                  <div className="tp-checkbox-cell">
                    <TpCheckbox
                      id="tp-class-select-all"
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onChange={handleSelectAll}
                      ariaLabel="Select all classes"
                    />
                  </div>
                </th>
                <th className="tp-myclasses-th" scope="col">
                  Class name
                </th>
                <th className="tp-myclasses-th" scope="col">
                  Grade
                </th>
                <th className="tp-myclasses-th" scope="col">
                  Period
                </th>
                <th className="tp-myclasses-th" scope="col">
                  Students
                </th>
                <th className="tp-myclasses-th" scope="col">
                  Assigned courses
                </th>
                {/* <th>Status</th> */}
                <th className="tp-myclasses-th tp-myclasses-th--actions" scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {list.length ? (
                list.map((cls) => (
                  <tr key={cls.id}>
                    <td className="tp-myclasses-td tp-myclasses-td--checkbox">
                      <div className="tp-checkbox-cell">
                        <TpCheckbox
                          id={`tp-class-${cls.id}`}
                          checked={selectedClasses.includes(cls.id)}
                          onChange={() => handleSelectOne(cls.id)}
                          ariaLabel={`Select class ${cls.name}`}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="tp-cell-strong">{cls.name}</div>
                    </td>
                    <td>{cls.grade}</td>
                    <td>{cls.period}</td>
                    <td>{cls?.students?.length ?? 0}</td>
                    <td>
                      <div className="tp-cell-truncate" title={cls?.courses?.map((c) => c.display_name).join(", ")}>
                        {cls?.courses?.map((course) => course.display_name).join(", ") || "—"}
                      </div>
                    </td>
                    {/* <td>
                      {cls.status === "active" ? (
                        <span className="tp-pill tp-pill-active">Active</span>
                      ) : (
                        <span className="tp-pill tp-pill-paused">Paused</span>
                      )}
                    </td> */}
                    <td className="tp-myclasses-td tp-myclasses-td--actions">
                      <div className="tp-icon-actions">
                        <button
                          type="button"
                          className="tp-icon-btn"
                          title="View class"
                          aria-label="View class"
                          onClick={() => {
                            navigate(`/classes/${cls.id}`)
                            sessionStorage.setItem("classData", JSON.stringify(cls))
                          }}
                        >
                          <Eye size={20} strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          className="tp-icon-btn"
                          title="Edit class"
                          aria-label="Edit class"
                          onClick={(e) => handleEdit(e, cls)}
                        >
                          <Edit size={20} strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          className="tp-icon-btn tp-icon-btn-danger"
                          title="Delete class"
                          aria-label="Delete class"
                          onClick={() => setDeleteModal({ open: true, id: cls.id, name: cls.name })}
                        >
                          <Trash2 size={20} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                    <span className="tp-subtitle" style={{ display: "inline", margin: 0 }}>
                      No classes found
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TpDeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, name: "" })}
        onConfirm={deleteClass}
        title="Delete class"
        message="Are you sure you want to delete this class? All associated students and data will be removed. This action cannot be undone."
        itemName={deleteModal.name || undefined}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  )
}

export default ActivityFeed
