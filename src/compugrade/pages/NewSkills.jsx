import editIcon from "../../compugrade-assets/edit-black.svg";
import MultiSelectInput from "../../compugrade/components/MultiSelectInput";
import { Form } from "react-bootstrap";

import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { base_url } from "../../compugrade-constants";
import SkillsTable from "../../compugrade/components/skillstable";

const NewSkills = () => {
  const navigate = useNavigate();
  const [database, setDataBase] = useState(false);
  const [value, setValue] = useState("CS");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [searchSkills, setSearchSkills] = useState("");
  const [CFSkill,setCFSkill]=useState(true);
  const [skills,setSkills]=useState([])
  const [customerSkill, setCustomerSkill] = useState("");
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
      const fetchSkills = async () => {
        try {
          const response = await fetch(
            `${base_url}/api/skills/get_skills`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
             
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setSkills(data?.skills);
        } catch (err) {
          console.error(err);
        }
      };

      fetchSkills();   
  }, [database]);



  const AddMoreSkills = async (e) => {
    e.preventDefault();

    const skills = selected.map((item) => item.value);

    if (!customerSkill.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${
          base_url
        }/api/skills/add_skill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_facing_name: customerSkill,
            skill_json: skills,
            skill_type: value,
          }),
        }
      );
      const result = await response.json();
      console.log(result)
      setLoading(false);
      setDataBase(true);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <div className="bg-white min-vh-100">
      <div
        className="py-3 border-bottom border-2  d-flex"
        style={{ fontSize: "1.5rem", fontWeight: "600", color: "black" }}
      >
        <Container className="px-4">
          <span>
            <span className="mr-2 mb-3" onClick={() => navigate(-1)}>
              <svg
                width="18"
                height="15"
                viewBox="0 0 18 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.292892 6.79289C-0.0976315 7.18342 -0.0976314 7.81658 0.292893 8.20711L6.65686 14.5711C7.04738 14.9616 7.68054 14.9616 8.07107 14.5711C8.46159 14.1805 8.46159 13.5474 8.07107 13.1569L2.41421 7.5L8.07107 1.84315C8.46159 1.45262 8.46159 0.819457 8.07107 0.428933C7.68054 0.0384087 7.04738 0.0384088 6.65685 0.428933L0.292892 6.79289ZM18 7.5L18 6.5L1 6.5L1 7.5L1 8.5L18 8.5L18 7.5Z"
                  fill="black"
                  fill-opacity="0.6"
                />
              </svg>
            </span>
            Skills
          </span>

          <span>
            <img src={editIcon} alt="edit" />
          </span>
        </Container>
      </div>

      <Container>
        <div syyle={{ width: "100%" }}>
          {!database ? (
            <button
              onClick={() => {setDataBase(true),
                setCFSkill(false);
              }
              }
              className="primary-button px-3 py-2 mt-3"
              style={{ float: "right", marginRight: "20%" }}
            >
              WORD Skills Database
            </button>
          ) : (
            <button
              onClick={() => setDataBase(false)}
              className="primary-button px-3 py-2 mt-3"
              style={{ float: "right", marginRight: "3%" }}
            >
              Add More Skills
            </button>
          )}
             {!database && CFSkill && <section className="py-1 px-4" style={{ width: "60%" }}>
               <h3
                  className="mt-3 mb-2"
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "black",
                  }}
                >
                  Add Skills Covered
                </h3>
                {skills.length > 0 &&<MultiSelectInput
                  search={searchSkills}
                  skills={skills}
                  customerFacing={true}
                  fromSkills={true}
                  seSkills={setSkills}
                  setSearch={setSearchSkills}
                  selected={selectedSkills}
                  setSelected={setSelectedSkills}
                />}
          </section>}
          {!database && !CFSkill ? (
            <section className="py-4 px-4" style={{ width: "60%" }}>
              <h3
                className="mt-1"
                style={{ fontSize: "18px", fontWeight: "600", color: "black" }}
              >
                Customer Facing Skill
              </h3>
              <form onSubmit={(e) => AddMoreSkills(e)} className="mt-3">
                <input
                  type="text"
                  required
                  onChange={(e) => {
                    setCustomerSkill(e.target.value);
                  }}
                  value={customerSkill}
                  className="form-control border-none my-2 py-4"
                  style={{ background: "#EFF6F7" }}
                  placeholder="Type skills here"
                />

                <div className="mb-3">
                  <Form.Label
                    className="mt-2"
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "black",
                    }}
                  >
                    Select CS/FS
                  </Form.Label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "12px",
                    }}
                  >
                    <Form.Check
                      type="radio"
                      id={`CS`}
                      name={`CS`}
                      label="CS"
                      className="me-3 custom-radio"
                      checked={value == "CS"}
                      onChange={() => setValue("CS")}
                      inline
                    />
                    <Form.Check
                      type="radio"
                      id={`FS`}
                      name={`FS`}
                      label="FS"
                      className="me-3 custom-radio"
                      checked={value == "FS"}
                      onChange={() => setValue("FS")}
                      inline
                    />
                  </div>
                </div>

                <h3
                  className="mt-3"
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "black",
                  }}
                >
                  Add Skills Covered
                </h3>
                <div></div>

                <MultiSelectInput
                  search={search}
                  setSearch={setSearch}
                  selected={selected}
                  setSelected={setSelected}
                />

                <button
                  type="submit"
                  disabled={
                    customerSkill?.trim() == "" ||
                    loading ||
                    selected.length == 0
                  }
                  className="primary-button my-3 py-2 px-4"
                >
                  {loading && (
                    <span className="spinner-border spinner-border-sm mr-2"></span>
                  )}
                  {loading ? "Adding..." : "Add Skills"}
                </button>
              </form>
            </section>
          ) : (

            !CFSkill &&<section className="py-4 px-4" style={{ width: "100%" }}>
              <SkillsTable  skills={skills}/>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
};
export default NewSkills;
