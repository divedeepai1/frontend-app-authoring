export default function TpStudentTableShell({ columns, children }) {
  return (
    <div className="tp-lesson-modal-table-wrap">
      <div className="tp-lesson-modal-table-scroll">
        <table className="tp-lesson-modal-table">
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} style={col.width ? { width: col.width } : undefined} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`tp-lesson-modal-th${col.alignRight ? " tp-lesson-modal-th--right" : ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}
