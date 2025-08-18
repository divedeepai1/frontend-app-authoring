import React, { useState, useEffect } from "react";

import { Button, Collapse, Table } from "react-bootstrap";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { Download, FileText } from "lucide-react";

function TableView({ sections, skills, courseId }) {
  const navigate = useNavigate();

 

const getFileNameFromPath = (path) => {
  return path?.split("/").pop() || "";
};

const handleDownload = (filePath) => {
  if (!filePath) return;
  
  const link = document.createElement("a");
  link.href = filePath;
  link.download = getFileNameFromPath(filePath);
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedSubsections, setExpandedSubsections] = useState({});

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubsection = (id) => {
    setExpandedSubsections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <style
        // @ts-ignore
        jsx
      >{`
        .skill-tag {
          //   background-color: white;
          border: 2px solid #f0cc00;
          border-radius: 16px;
          padding: 4px 8px;
          font-size: 10px;
          font-weight: 500;
          color: #1f2937;
          display: inline-block;
          white-space: nowrap;
        }
      `}</style>
      <div>
        <div className="activity-header">
          <h2 className="text-white">Course Lessons</h2>
        </div>
        <Table bordered hover className="activity-table">
          <thead>
            <tr>
              <th>Lesson Name</th>
              <th style={{ width: "500px" }}>Skills Taught</th>
              <th>Source File</th>
              <th>Answer File</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <React.Fragment key={`section-${section.id}`}>
                {/* Section Row */}
                <tr>
                  <td colSpan={4} style={{ padding: "5px 5px" }}>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-black"
                      style={{ fontWeight: "600" }}
                      onClick={() => toggleSection(section.id)}
                    >
                      {expandedSections[section.id] ? (
                        <ChevronDown />
                      ) : (
                        <ChevronRight />
                      )}
                      {section.displayName}
                    </Button>
                  </td>
                </tr>

                {expandedSections[section.id] &&
                  section.childInfo.children.map((sub) => (
                    <React.Fragment key={`sub-${sub.id}`}>
                      <tr>
                        <td colSpan={4} style={{ padding: "5px 9px" }}>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-black"
                            onClick={() => toggleSubsection(sub.id)}
                            style={{ fontWeight: "600" }}
                          >
                            {expandedSubsections[sub.id] ? (
                              <ChevronDown />
                            ) : (
                              <ChevronRight />
                            )}
                            {sub.displayName}
                          </Button>
                        </td>
                      </tr>

                      {expandedSubsections[sub.id] &&
                        sub.childInfo.children.map((unit) => {
                          const filteredSkills = skills.filter(
                            (skill) => skill.unit_id === unit.id
                          );

                          return (
                            <tr key={`unit-${unit.id}`}>
                              <td
                                onClick={(e) =>
                                  navigate(
                                    `/course/${courseId}/container/${unit.id}/${sub.id}`
                                  )
                                }
                                style={{ fontWeight: "600", cursor: "pointer" }}
                              >
                                {unit.displayName}
                              </td>
                              <td>
                                {filteredSkills.length > 0 &&
                                  filteredSkills[0]?.skills_used?.length > 0 &&
                                  filteredSkills[0].skills_used.map(
                                    (skill, index) => (
                                      <span
                                        key={index}
                                        className="skill-tag ml-1 mt-1"
                                      >
                                        {skill?.customer_facing_name}
                                      </span>
                                    )
                                  )}
                              </td>
                              <td>
                                {filteredSkills[0]?.source_file_path_s3 ? (
                                  <div className="d-flex align-items-center gap-2">
                                    {/* Small Word file icon in blue */}
                                    <FileText size={16} color="#2B579A" />
                                    {/* Download icon */}
                                    <Download
                                      size={16}
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        handleDownload(
                                          filteredSkills[0]?.source_file_path_s3
                                        )
                                      }
                                    />
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>

                              <td>
                                {filteredSkills[0]?.answer_file_path_s3 ? (
                                  <div className="d-flex align-items-center gap-2">
                                    <FileText size={16} color="#2B579A" />
                                    <Download
                                      size={16}
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        handleDownload(
                                          filteredSkills[0]?.answer_file_path_s3
                                        )
                                      }
                                    />
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default TableView;
