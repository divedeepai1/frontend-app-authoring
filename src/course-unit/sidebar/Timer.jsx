import React, { useState } from "react";
import { Form, Dropdown, Stack, Button } from "@openedx/paragon";
import { base_url } from "../../compugrade-constants";

const Timer = ({ time, blockId }) => {
  // Initial state to separate hours and minutes from the given `time`
  const [hours, setHours] = useState(
    time ? parseInt(time.split(":")[0]) : "00"
  );
  const [minutes, setMinutes] = useState(
    time ? parseInt(time.split(":")[1]) : "05"
  );

  // Handle hours change
  const handleHoursChange = (event) => {
    setHours(event.target.value);
  };

  // Handle minutes change
  const handleMinutesChange = (event) => {
    setMinutes(event.target.value);
  };

  const handleTimeChange = async () => {

    const combinedTime = hours + ":" + minutes
    const apiResponse = await fetch(base_url + "/api/openedx/update_rubric", {
      method: "PATCH",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        time_allowed: combinedTime,
        openedx_based_id: blockId,
      }),
    });
    if (!apiResponse.ok) {
      // Handle non-2xx HTTP responses
      console.error("Error:", apiResponse.status, apiResponse.statusText);
      return;
    }

    // Parse the JSON response
    const responseData = await apiResponse.json();
    // setAttemptValue(responseData.num_of_attempts);
  };

  return (
    <Stack className="course-unit-sidebar-header" direction="vertical">
      <h3 className="course-unit-sidebar-header-title m-0">Time Allowed</h3>
      <p className="small mt-2">
        Select the allowed time for this particular lesson.
      </p>
      <Form.Group controlId={`time-selector-${blockId}`}>
        <Dropdown className="mr-2">
          <div className="d-flex align-items-center" style={{gap:"10px"}}>
            {/* Hours Dropdown */}
            <Dropdown
              className="mr-2"
              style={{ backgroundColor: "white", width: "80px" }}
            >
              <Dropdown.Toggle
                id={`hours-dropdown-${blockId}`}
                variant="outline-primary"
              >
                {`${hours} hr`}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Array.from({ length: 24 }, (_, i) => (
                  <Dropdown.Item
                    key={i}
                    onClick={() =>
                      handleHoursChange({
                        target: { value: String(i).padStart(2, "0") },
                      })
                    }
                  >
                    {String(i).padStart(2, "0")} hr
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            {/* Minutes Dropdown */}
            <Dropdown
              className="mr-2"
              style={{ backgroundColor: "white", width: "80px" }}
            >
              <Dropdown.Toggle
                id={`minutes-dropdown-${blockId}`}
                variant="outline-primary"
              >
                {`${minutes} min`}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Array.from({ length: 60 }, (_, i) => (
                  <Dropdown.Item
                    key={i}
                    onClick={() =>
                      handleMinutesChange({
                        target: { value: String(i).padStart(2, "0") },
                      })
                    }
                  >
                    {String(i).padStart(2, "0")} min
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Dropdown>
      </Form.Group>
      <Button style={{ width: "fit-content" }} onClick={handleTimeChange}>Save Time</Button>
    </Stack>
  );
};

export default Timer;
