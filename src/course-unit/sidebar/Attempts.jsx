import React, { useState } from "react";
import { Dropdown, Stack } from "@openedx/paragon";
import { base_url } from "../../compugrade-constants";

const Attempts = ({ attempts, blockId }) => {
  const [attemptValue, setAttemptValue] = useState(attempts);
  const attemptsObject = {
    label: "No of Attempts",
    name: "attempts",
    disabled: false,
    options: [1, 2, 3, 4, 5,6,7,8,9,10],
  };

  const handleAttemptChange = async (value) => {
    const apiResponse = await fetch(base_url + "/api/openedx/update_rubric", {
      method: "PATCH",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        num_of_attempts: value,
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
    setAttemptValue(responseData.num_of_attempts);
  };

  return (
    <Stack className="course-unit-sidebar-header" direction="vertical">
      <h3 className="course-unit-sidebar-header-title m-0">
        {attemptsObject.label}
      </h3>
      <p style={{fontSize:"14px", marginTop:"5px"}}>It's for selecting the number of attempts for students for this particular lesson.</p>
      <Dropdown className="mt-[5px] w-100">
        <Dropdown.Toggle
          id="type-dropdown"
          variant="outline-primary"
          className="w-100 d-flex justify-content-between align-items-center"
        >
          {attemptValue}
        </Dropdown.Toggle>
        <Dropdown.Menu className="w-100">
          {attemptsObject.options.map((value) => (
            <Dropdown.Item
              key={value}
              onClick={() => handleAttemptChange(value)}
            >
              {value}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </Stack>
  );
};

export default Attempts;
