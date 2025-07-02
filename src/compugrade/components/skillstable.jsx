import { Container, Table, Button } from "react-bootstrap"


const SkillsTable = ({skills}) => {
 
  return (
    <Container fluid className="p-4 mt-4">
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f8f9fa" ,overflow:"hidden" }}>
        <Table
    
          style={{
            margin: "0",
            backgroundColor: "white",
            borderRadius: "6px",
            overflow: "hidden",
            border: "none",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#EFF6F7" }}>
              <th
                style={{
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "#333",
                  border:"none",
                  width: "40%",
                }}
              >
                Customer Facing Skills Names
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "#333",
                  border: "none",
                  width: "30%",
                }}
              >
                OB/AB
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "#333",
                  border: "none",
                  textAlign: "center",
                  width: "30%",
                }}
              >
                CS/FS
              </th>
            </tr>
          </thead>
          <tbody>
            {skills && skills.map((item, index) => (
              <tr key={index} style={{border:"none"}}>
                <td
                  style={{
                    padding: "10px 16px",
                    fontSize: "14px",
                    color: "#333",
                    border:"none",
                    backgroundColor: "white",
                    fontWeight: "500",

                  }}
                >
                  {item?.customer_facing_name}
                </td>
                <td
                  style={{
                    padding: "10px 16px",
                    fontSize: "14px",
                    color: "#333",
                    border:"none",
                    fontWeight: "500",
                    backgroundColor: "white",
                  }}
                >
                  {item?.skill_json.join(',')}
                </td>
                <td
                  style={{
                    padding: "10px 16px",
                    fontSize: "14px",
                    color: "#333",
                    textAlign: "center",
                    backgroundColor: "white",
                    border:"none",
                    fontWeight: "500",
                  }}
                >
                  {item?.skill_type}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  )
}

export default SkillsTable
