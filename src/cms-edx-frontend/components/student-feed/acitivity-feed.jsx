

import { useState } from "react";
import { Table, Dropdown } from "react-bootstrap";
import "./activity-feed.css";

const ActivityFeed = () => {
  const [selectedClass, setSelectedClass] = useState("All Classes");

  const students = [
    {
      username: "ashleyJackson",
      firstName: "",
      lastName: "",
      class: "Computer- College",
      activity: "LBD Microsoft 365 Word-1",
    },
    {
      username: "michealscolfield",
      firstName: "",
      lastName: "",
      class: "Keyboard Class",
      activity: "LBD Microsoft 365 Word-1",
    },
    {
      username: "robinmalfoy",
      firstName: "",
      lastName: "",
      class: "Technical Knowledge",
      activity: "LBD Microsoft 365 Word-1",
    },
    {
      username: "Orlajoffery",
      firstName: "",
      lastName: "",
      class: "computer- College",
      activity: "LBD Microsoft 365 Word-1",
    },
    {
      username: "akshaylavy",
      firstName: "",
      lastName: "",
      class: "Technical Knowledge",
      activity: "LBD Microsoft 365 Word-1",
    },
    {
      username: "tanialevine",
      firstName: "",
      lastName: "",
      class: "Technical Knowledge",
      activity: "LBD Microsoft 365 Word-1",
    },
    {
      username: "sndarmirza",
      firstName: "",
      lastName: "",
      class: "Technical Knowledge",
      activity: "LBD Microsoft 365 Word-1",
    },
    {
      username: "Mark",
      firstName: "",
      lastName: "",
      class: "Technical Knowledge",
      activity: "LBD Microsoft 365 Word-1",
    },
  ];

  return (
    <div>
      <div className="activity-header">
        <h2 className="text-white">Real-time Student Activity Feed</h2>
        <span className="ml-auto mr-2">Select Class : </span>
        <div className="">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="custom-select"
            style={{width:"300px"}}
          >
            <div className="text-black">
            <option value="All Classes">All Classes</option>
            <option value="Computer- College">Computer- College</option>
            <option value="Technical Knowledge">Technical Knowledge</option>
            <option value="Keyboard Class">Keyboard Class</option>
            </div>
          </select>
        </div>
      </div>

      <Table bordered hover className="activity-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>First- Name</th>
            <th>Last-Name</th>
            <th>Class</th>
            <th>Current Activity</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td>{student.username}</td>
              <td>{student.firstName}</td>
              <td>{student.lastName}</td>
              <td>{student.class}</td>
              <td>{student.activity}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ActivityFeed;
