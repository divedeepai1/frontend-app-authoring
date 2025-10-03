import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Dropdown } from "react-bootstrap";
import { Line, Bar } from "react-chartjs-2";
import { Save, Printer } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportsDashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState("Select Course");
  const [selectedClass, setSelectedClass] = useState("Grade -3");
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();
    const formatted = now.toISOString().split("T")[0]; 
    setToday(formatted);
  }, []);

  // Sample data for charts
  const lineChartData = {
    labels: [
      "Jan",
      "Feb",
      "March",
      "April",
      "May",
      "June",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Course Name - 1",
        data: [85, 88, 75, 84, 87, 78, 82, 85, 79, 83, 86, 80],
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.1)",
        tension: 0.4,
      },
      {
        label: "Course Name - 2",
        data: [78, 82, 70, 88, 85, 72, 79, 84, 77, 81, 83, 75],
        borderColor: "#6f42c1",
        backgroundColor: "rgba(111, 66, 193, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: [
      "Jan",
      "Feb",
      "March",
      "April",
      "May",
      "June",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
    ],
    datasets: [
      {
        label: "Pass Students",
        data: [68, 62, 75, 80, 58, 70, 85, 73, 78, 82, 90],
        backgroundColor: "#255A71",
        barThickness: 30,
        borderColor: "#138496",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months", 
          font: {
            size: 14,
          },
          color: "gray",
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Percentage", 
          font: {
            size: 14,
          },
          color: "gray",
        },
        ticks: {
          callback: (value) => value + "%",
        },
      },
    },
  };
  

  const topStudents = [
    {
      name: "John Doe",
      email: "john.doe45@gmail.com",
      course: "LBD Microsoft 365 Word-1",
      score: 86,
    },
    {
      name: "John Doe",
      email: "john.doe45@gmail.com",
      course: "LBD Microsoft 365 Word-1",
      score: 81,
    },
    {
      name: "John Doe",
      email: "john.doe45@gmail.com",
      course: "LBD Microsoft 365 Word-1",
      score: 80,
    },
    {
      name: "John Doe",
      email: "john.doe45@gmail.com",
      course: "LBD Microsoft 365 Word-1",
      score: 75,
    },
    {
      name: "John Doe",
      email: "john.doe45@gmail.com",
      course: "LBD Microsoft 365 Word-1",
      score: 72,
    },
    {
      name: "John Doe",
      email: "john.doe45@gmail.com",
      course: "LBD Microsoft 365 Word-1",
      score: 69,
    },
    {
      name: "John Doe",
      email: "john.doe45@gmail.com",
      course: "LBD Microsoft 365 Word-1",
      score: 64,
    },
  ];

  const MetricCard = ({ title, value, subtitle, trend, trendColor }) => (
    <Card
      className="h-100"
      style={{
        backgroundColor: "transparent",
        border: "1px solid #e0e0e0",
        borderRadius: "6px",
        boxShadow: "none",
      }}
    >
      <Card.Body className="text-center px-2 p">
        <Card.Title
          className="small mb-2"
          style={{ fontSize: "16px", fontWeight: "500" }}
        >
          {title}
        </Card.Title>
        <h2
          className="mb-2 fw-bold"
          style={{ fontSize: "24px", color: "#255A71" }}
        >
          {value}
        </h2>
        <small className={`text-${trendColor}`} style={{ fontSize: "12px" }}>
          {subtitle}
        </small>
        {trend && <div className={`text-${trendColor}`}>{trend}</div>}
      </Card.Body>
    </Card>
  );

  const CircularProgress = ({ percentage }) => {
    const circumference = 2 * Math.PI * 70;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "180px" }}
      >
        <div className="position-relative">
          <svg width="160" height="160" className="transform-rotate-180">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#e9ecef"
              strokeWidth="16"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#007618"
              strokeWidth="16"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
            />
          </svg>
          <div
            className="position-absolute"
            style={{ bottom: "60px", left: "50px" }}
          >
            <h2 className="mb-0 fw-bold">{percentage}%</h2>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="col-md-12 d-flex py-4 bg-white">
        <div className="col-md-4">
          <div className="d-flex align-items-center">
            <label
              htmlFor="classSelect"
              className="mr-2"
              style={{ fontWeight: "600" }}
            >
              Select Class :
            </label>
            <select
              id="classSelect"
              className="custom-select-black"
              style={{ width: "300px", padding: "5px" }}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <div className="text-black important">
                <option>Student Class</option>
              </div>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="d-flex align-items-center">
            <input
              type="date"
              place="Select date range"
              value={today}
              onChange={(e) => setToday(e.target.value)}
              className="p-1"
              style={{ width: "500px" }}
            />
          </div>
        </div>
        <div className="col-md-3">
          <div className="d-flex align-items-center">
            <button className="primary-button px-3 py-2 text-small">
              Generate Report
            </button>
          </div>
        </div>
        <div className="col-md-1">
          <div className="d-flex align-items-center" style={{gap:"8px"}}>
            <svg
              width="43"
              height="44"
              viewBox="0 0 43 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="43" height="44" rx="3" fill="#EEEEEE" />
              <path
                d="M13.02 32C12.4442 32 11.9637 31.8075 11.5787 31.4225C11.1937 31.0375 11.0008 30.5567 11 29.98V14.02C11 13.4442 11.1929 12.9637 11.5787 12.5787C11.9646 12.1937 12.445 12.0008 13.02 12H25.8825C26.1517 12 26.4133 12.0542 26.6675 12.1625C26.9217 12.2725 27.1392 12.4179 27.32 12.5988L30.4012 15.68C30.5829 15.8617 30.7279 16.0792 30.8363 16.3325C30.9454 16.5867 31 16.8483 31 17.1175V29.98C31 30.5558 30.8075 31.0367 30.4225 31.4225C30.0375 31.8083 29.5567 32.0008 28.98 32H13.02ZM29.75 16.8125L26.1875 13.25H13.02C12.795 13.25 12.6104 13.3221 12.4662 13.4662C12.3221 13.6104 12.25 13.795 12.25 14.02V29.9813C12.25 30.2054 12.3221 30.3896 12.4662 30.5337C12.6104 30.6779 12.795 30.75 13.02 30.75H28.9813C29.2054 30.75 29.3896 30.6779 29.5337 30.5337C29.6779 30.3896 29.75 30.205 29.75 29.98V16.8125ZM21 27.6737C21.6892 27.6737 22.2783 27.4292 22.7675 26.94C23.2567 26.4508 23.5008 25.8617 23.5 25.1725C23.4992 24.4833 23.2546 23.8946 22.7663 23.4062C22.2779 22.9179 21.6892 22.6737 21 22.6737C20.3108 22.6737 19.7221 22.9179 19.2337 23.4062C18.7454 23.8946 18.5008 24.4833 18.5 25.1725C18.4992 25.8617 18.7438 26.4508 19.2337 26.94C19.7238 27.4292 20.3125 27.6746 21 27.6737ZM15.4713 19.2125H22.7313C23.0213 19.2125 23.2621 19.1167 23.4538 18.925C23.6454 18.7333 23.7413 18.4929 23.7413 18.2038V16.4713C23.7413 16.1813 23.6454 15.9404 23.4538 15.7488C23.2621 15.5571 23.0213 15.4613 22.7313 15.4613H15.4713C15.1813 15.4613 14.9404 15.5571 14.7488 15.7488C14.5571 15.9404 14.4613 16.1813 14.4613 16.4713V18.2025C14.4613 18.4925 14.5571 18.7333 14.7488 18.925C14.9404 19.1167 15.1813 19.2125 15.4713 19.2125ZM12.25 16.8125V30.75V13.25V16.8125Z"
                fill="black"
                fill-opacity="0.7"
              />
            </svg>

            <svg
              width="43"
              height="44"
              viewBox="0 0 43 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="43" height="44" rx="3" fill="#EEEEEE" />
              <path
                d="M25.9995 17.77V14.02H15.9995V17.77H14.7495V12.77H27.2495V17.77H25.9995ZM28.0182 22.145C28.3724 22.145 28.6695 22.025 28.9095 21.785C29.1495 21.545 29.269 21.2484 29.2682 20.895C29.2674 20.5417 29.1478 20.2446 28.9095 20.0038C28.6711 19.7629 28.374 19.6429 28.0182 19.6438C27.6624 19.6446 27.3657 19.7646 27.1282 20.0038C26.8907 20.2429 26.7707 20.54 26.7682 20.895C26.7657 21.25 26.8857 21.5467 27.1282 21.785C27.3707 22.0234 27.6665 22.1434 28.0182 22.145ZM25.9995 30.75V25.0775H15.9995V30.75H25.9995ZM27.2495 32H14.7495V27H10.4707V20.27C10.4707 19.5617 10.7111 18.9679 11.192 18.4888C11.6728 18.0096 12.2657 17.7696 12.9707 17.7688H29.0282C29.7365 17.7688 30.3303 18.0088 30.8095 18.4888C31.2886 18.9688 31.5282 19.5621 31.5282 20.2688V27H27.2495V32ZM30.2782 25.75V20.27C30.2782 19.9159 30.1586 19.6188 29.9195 19.3788C29.6803 19.1388 29.3832 19.0188 29.0282 19.0188H12.9707C12.6165 19.0188 12.3199 19.1388 12.0807 19.3788C11.8415 19.6188 11.7215 19.9159 11.7207 20.27V25.75H14.7495V23.8275H27.2495V25.75H30.2782Z"
                fill="black"
                fill-opacity="0.7"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="py-4" >
        <div
          className="mx-4"
          fluid
          style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid #d0d0d0",
            padding: "30px 30px",
          }}
        >
          {/* Top Metrics Row */}
          <Row className="mb-4 g-3">
            <Col md={2}>
              <MetricCard
                title="Total Students"
                value="450"
                subtitle="20% increase in new students"
                trendColor="muted"
              />
            </Col>
            <Col md={2}>
              <MetricCard
                title="New Students"
                value="40"
                subtitle="Enrolled in this week"
                trendColor="muted"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Avg Course Completion"
                value="60%"
                subtitle="Higher in last 2 weeks"
                trendColor="muted"
              />
            </Col>
            <Col md={2}>
              <MetricCard
                title="Pass Rate"
                value="45%"
                subtitle="Lower in last 2 weeks"
                trendColor="muted"
              />
            </Col>
            <Col md={3}>
              <MetricCard
                title="Avg Rate"
                value="67%"
                subtitle="Best in last 2 weeks"
                trendColor="muted"
              />
            </Col>
          </Row>

          {/* Charts and Tables Row */}
          <Row className="mb-4 g-3">
            {/* Line Chart */}
            <Col lg={8}>
              <Card
                className="h-100"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  boxShadow: "none",
                }}
              >
                <Card.Header
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    textAlign: "center",
                    padding: "20px 20px",
                  }}
                >
                  <h6
                    className="mb-0"
                    style={{ fontSize: "16px", fontWeight: "600" }}
                  >
                    Avg Grade (Y-Axis) vs Months (X-Axis)
                  </h6>
                </Card.Header>
                <Card.Body
                  style={{ padding: "20px", backgroundColor: "transparent" }}
                >
                  <div style={{ height: "300px" }}>
                    <Line data={lineChartData} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Top Students */}
            <Col lg={4}>
              <Card
                className="h-100"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  boxShadow: "none",
                }}
              >
                <Card.Header
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    padding: "15px 20px",
                    border: "1px solid #e0e0e0",
                  }}
                  className="d-flex justify-content-between align-items-center"
                >
                  <h6
                    className="mb-0"
                    style={{ fontSize: "16px", fontWeight: "600" }}
                  >
                    Top Students
                  </h6>
                  <Dropdown >
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      size="sm"
                      style={{
                        border: "1px solid #e0e0e0",
                        fontSize: "14px",
                        width: "max-content",
                        padding: "10px 15px",
                        backgroundColor: "transparent",
                      }}
                    >
                      {selectedCourse}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() =>
                          setSelectedCourse("LBD Microsoft 365 Word-1")
                        }
                      >
                        LBD Microsoft 365 Word-1
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => setSelectedCourse("Course 2")}
                      >
                        Course 2
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Card.Header>
                <Card.Body
                  className="p-0"
                  style={{ backgroundColor: "transparent" }}
                >
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {topStudents.map((student, index) => (
                      <div
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                        style={{
                          padding: "10px 20px",
                          background: index % 2 !== 0 ? "#F9F9F9" : "transparent",
                          borderBottom:
                            index < topStudents.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                        }}
                      >
                        <div className="flex-grow-2">
                          <div style={{ fontSize: "14px", fontWeight: "500" }}>
                            {student.name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6c757d",
                              marginBottom: "1px",
                            }}
                          >
                            {student.email}
                          </div>
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: "500" }}>
                            {student.course}
                          </div>
                        
                        <div style={{ fontSize: "14px", fontWeight: "600" }}>
                          {student.score}%
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Bottom Row */}
          <Row className="g-3">
            {/* Bar Chart */}
            <Col lg={8}>
              <Card
                className="h-100"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  boxShadow: "none",
                }}
              >
                <Card.Header
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    textAlign: "center",
                    padding: "20px 20px",
                  }}
                >
                  <h6
                    className="mb-0"
                    style={{ fontSize: "16px", fontWeight: "600" }}
                  >
                    Pass students (Y-Axis) vs Months (X-Axis)
                  </h6>
                </Card.Header>
                <Card.Body
                  style={{ padding: "20px", backgroundColor: "transparent" }}
                >
                  <div style={{ height: "300px" }}>
                    <Bar data={barChartData} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Top Student Profile */}
            <Col lg={4}>
              <Card
                className="h-100"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  boxShadow: "none",
                }}
              >
                <Card.Header
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    textAlign: "center",
                    paddingTop: "20px",
                  }}
                >
                  <h6
                    className="mb-0"
                    style={{ fontSize: "16px", fontWeight: "600" }}
                  >
                    Top Student
                  </h6>
                </Card.Header>
                <Card.Body
                  className="text-center p-1"
                  style={{ backgroundColor: "transparent" }}
                >
                  <h6
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    John Doe
                  </h6>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6c757d",
                      marginBottom: "8px",
                    }}
                  >
                    john.doe45@gmail.com
                  </div>
                  <CircularProgress percentage={86} />
                  <a
                    href="#"
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#000",
                    }}
                  >
                    See Detail Report
                  </a>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default ReportsDashboard;
