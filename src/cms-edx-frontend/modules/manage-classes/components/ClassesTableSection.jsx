import TpCheckbox from "../../../components/common/TpCheckbox"
import TpLoadingState from "../../../components/common/TpLoadingState"
import ClassRowActions from "./ClassRowActions"
import ClassStatusBadge from "./ClassStatusBadge"
import { isClassArchived } from "../utils/classStatus"

export default function ClassesTableSection({
  title,
  description,
  classrooms,
  emptyMessage,
  enableSelection = false,
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  headerAction = null,
  filterBar = null,
  isLoading = false,
  loadingLabel = "Loading classes…",
}) {
  const list = classrooms || []
  const allSelected = list.length > 0 && selectedIds.length === list.length
  const someSelected = selectedIds.length > 0 && !allSelected
  const colSpan = enableSelection ? 8 : 7

  return (
    <div className="tp-myclasses-card">
      <div className="tp-myclasses-head">
        <div className="tp-myclasses-head-inner">
          <div className="tp-myclasses-title-block">
            <div>
              <h3 className="tp-myclasses-heading">{title}</h3>
              <p className="tp-myclasses-desc">{description}</p>
            </div>
          </div>
          {headerAction}
        </div>
      </div>
      {filterBar}
      <div className="tp-myclasses-table-wrap">
        {isLoading ? (
          <TpLoadingState label={loadingLabel} className="tp-myclasses-loading" />
        ) : (
        <table className="tp-myclasses-table">
          <colgroup>
            {enableSelection ? <col style={{ width: "3rem" }} /> : null}
            <col />
            <col style={{ width: "5.5rem" }} />
            <col style={{ width: "5.5rem" }} />
            <col style={{ width: "6.5rem" }} />
            <col />
            <col style={{ width: "7.5rem" }} />
            <col style={{ width: "10.5rem" }} />
          </colgroup>
          <thead>
            <tr>
              {enableSelection ? (
                <th className="tp-myclasses-th tp-myclasses-th--checkbox" scope="col">
                  <div className="tp-checkbox-cell">
                    <TpCheckbox
                      id="tp-class-select-all"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={onSelectAll}
                      ariaLabel="Select all classes"
                    />
                  </div>
                </th>
              ) : null}
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
              <th className="tp-myclasses-th" scope="col">
                Status
              </th>
              <th className="tp-myclasses-th tp-myclasses-th--actions" scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {list.length ? (
              list.map((cls) => {
                const archived = isClassArchived(cls)
                return (
                  <tr
                    key={cls.id}
                    className={archived ? "tp-myclasses-row--archived" : undefined}
                  >
                    {enableSelection ? (
                      <td className="tp-myclasses-td tp-myclasses-td--checkbox">
                        <div className="tp-checkbox-cell">
                          <TpCheckbox
                            id={`tp-class-${cls.id}`}
                            checked={selectedIds.includes(cls.id)}
                            onChange={() => onSelectOne(cls.id)}
                            ariaLabel={`Select class ${cls.name}`}
                          />
                        </div>
                      </td>
                    ) : null}
                    <td>
                      <div className="tp-cell-strong">{cls.name}</div>
                    </td>
                    <td>{cls.grade != null && cls.grade !== "" ? cls.grade : "—"}</td>
                    <td>{cls.period != null && cls.period !== "" ? cls.period : "—"}</td>
                    <td>{cls?.students?.length ?? 0}</td>
                    <td>
                      <div
                        className="tp-cell-truncate"
                        title={cls?.courses?.map((c) => c.display_name).join(", ")}
                      >
                        {cls?.courses?.map((course) => course.display_name).join(", ") || "—"}
                      </div>
                    </td>
                    <td>
                      <ClassStatusBadge classroom={cls} />
                    </td>
                    <td className="tp-myclasses-td tp-myclasses-td--actions">
                      <ClassRowActions
                        classroom={cls}
                        onView={onView}
                        onEdit={onEdit}
                        onArchive={onArchive}
                        onUnarchive={onUnarchive}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={colSpan} className="tp-myclasses-empty">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}
