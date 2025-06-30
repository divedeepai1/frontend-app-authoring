
import { Table, Container } from "react-bootstrap"
import { Edit, Trash2 } from "lucide-react"


export default function StudentTable({students,setAddStudents, nextStep, prevStep}) {
  
 

  const handleEdit = (studentId) => {
    console.log("Edit student:", studentId)
  }

  const handleDelete = (studentId) => {
    console.log("Delete student:", studentId)
  }

  return (
    <Container className="mt-4">
      <button className="primary-button float-right px-3 py-2 mb-2" onClick={(e)=>setAddStudents(true)}> Add More Students</button>
      <Table bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>User Name</th>
            <th>Fist Name</th>
            <th>Last Name</th>
            <th>Email Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>
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
              <td>{student.first_name}</td>
              <td>{student.last_name}</td>
              <td>{student.email}</td>
              <td>
                <button
                  className="btn btn-link p-1 me-2"
                  onClick={() => handleEdit(student.id)}
                  style={{ border: "none", background: "none" }}
                >
                  <Edit size={16} color="#666" />
                </button>
                <button
                  className="btn btn-link p-1"
                  onClick={() => handleDelete(student.id)}
                  style={{ border: "none", background: "none" }}
                >
                  <Trash2 size={16} color="#666" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex mt-4 justify-content-between">
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
          <div className="ms-auto">
            <a href="#" className="primary-text">
              Save Information for Later
            </a>
          </div>
        </div>
    </Container>
  )
}
