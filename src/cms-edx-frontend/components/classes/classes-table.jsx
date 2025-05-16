
import { Table } from "react-bootstrap";
import "./classes-table.css";

import editIcon from "../../assests/edit-icon.svg"
import viewIcon from "../../assests/view-icon.svg"
import deleteIcon from "../../assests/delete-icon.svg"
import messageIcon from "../../assests/message-icon.svg"




const ActivityFeed = () => {
  const classes = [
    {
      className: "Computer- College",
      grade: 8,
      period: 4,
      numberOfStudents: 126,
      assignedCourses: "LBD Microsoft 365 Word-1",
      classStatus: "Active",
    },
    {
      className: "Keyboard Class",
      grade: 1,
      period: 1,
      numberOfStudents: 126,
      assignedCourses: "LBD Microsoft 365 Word-1",
      classStatus: "Active",
    },
    {
      className: "Technical Knowledge",
      grade: 2,
      period: 2,
      numberOfStudents: 126,
      assignedCourses: "LBD Microsoft 365 Word-1",
      classStatus: "Active",
    },
    {
      className: "Computer- College",
      grade: 6,
      period: 6,
      numberOfStudents: 126,
      assignedCourses: "LBD Microsoft 365 Word-1",
      classStatus: "Active",
    },
    {
      className: "Computer- College",
      grade: 4,
      period: 4,
      numberOfStudents: 126,
      assignedCourses: "LBD Microsoft 365 Word-1",
      classStatus: "Active",
    },
    {
      className: "Computer- College",
      grade: 9,
      period: 9,
      numberOfStudents: 126,
      assignedCourses: "LBD Microsoft 365 Word-1",
      classStatus: "Paused",
    },
    {
      className: "Computer- College",
      grade: 6,
      period: 5,
      numberOfStudents: 126,
      assignedCourses: "LBD Microsoft 365 Word-1\nOpen EDX Course",
      classStatus: "Active",
    },
    {
      className: "Computer- College",
      grade: 6,
      period: 6,
      numberOfStudents: 126,
      assignedCourses: "LBD Microsoft 365 Word-1",
      classStatus: "Active",
    },
    {
      className: "Computer- College",
      grade: 4,
      period: 4,
      numberOfStudents: 126,
      assignedCourses: "LBD Microsoft 365 Word-1",
      classStatus: "Active",
    },
  ];

  return (
    <div>
      <div className="activity-header">
        <h2 className="text-white">My Classes</h2>
      </div>

      <Table bordered hover className="activity-table">
        <thead>
          <tr>
            <th>Class Name</th>
            <th>Grade</th>
            <th>period</th>
            <th>No.of Students</th>
            <th>Assigned Courses</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls, index) => (
            <tr key={index}>
              <td>{cls.className}</td>
              <td>{cls.grade}</td>
              <td>{cls.period}</td>
              <td>{cls.numberOfStudents}</td>
              <td>{cls.assignedCourses}</td>
              <td>{cls.classStatus =="Active" ? <button className="primary-button py-2 px-3">Active</button>:<button className="brown-button py-2 px-3">Paused</button>}</td>
              <td className="d-flex justify-content-around">
                <img src={editIcon} alt="edit"/>
                <img src={viewIcon} alt="view"/>
                <img src={deleteIcon} alt="delete"/>
                <img src={messageIcon} alt="edit"/>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ActivityFeed;
