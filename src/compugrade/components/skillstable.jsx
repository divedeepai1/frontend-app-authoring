import { Container, Table, Button } from "react-bootstrap";
import { Edit, Trash } from "lucide-react";

const SkillsTable = ({ skills, onEdit, onDelete }) => {
  return (
    <div fluid className="p-4 mt-2">
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f8f9fa",
          overflow: "hidden",
        }}
      >
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
                  border: "none",
                  width: "30%",
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
                  width: "25%",
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
                  width: "25%",
                }}
              >
                CS/FS
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "#333",
                  border: "none",
                  textAlign: "center",
                  width: "20%",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {skills &&
              skills.map((item, index) => (
                <tr key={index} style={{ border: "none" }}>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontSize: "14px",
                      color: "#333",
                      border: "none",
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
                      border: "none",
                      backgroundColor: "white",
                      fontWeight: "500",
                    }}
                  >
                    {item?.skill_json?.join(", ")}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontSize: "14px",
                      color: "#333",
                      textAlign: "center",
                      backgroundColor: "white",
                      border: "none",
                      fontWeight: "500",
                    }}
                  >
                    {item?.skill_type}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      textAlign: "center",
                      cursor:"pointer",
                      backgroundColor: "white",
                      border: "none",
                    }}
                  >
                    <Edit size={18} onClick={() => onEdit(item)} />

                    <Trash
                      size={18}
                      className="ml-3"
                      onClick={() => onDelete(item)}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default SkillsTable;
