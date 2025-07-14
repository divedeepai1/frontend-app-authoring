
import { Table, Container } from "react-bootstrap"
import { Edit, Trash2 } from "lucide-react"


export default function TeachersTable({teachers}) {
  

  return (
    
      
      <Table bordered hover className="activity-table" style={{ borderRadius:"12px"}}>
        <thead className="table-light">
          <tr>
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
                  className="btn btn-link p-1 me-2"
                //   onClick={() => handleEdit(teacher.id)}
                  style={{ border: "none", background: "none" }}
                >
                  <Edit size={16} color="#666" />
                </button>
                <button
                  className="btn btn-link p-1"
                //   onClick={() => handleDelete(teacher.id)}
                  style={{ border: "none", background: "none" }}
                >
                  <Trash2 size={16} color="#666" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
     
    
  )
}
