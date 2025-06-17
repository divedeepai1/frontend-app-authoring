import React, { useState } from "react";
import { Form, Stack, Button } from "@openedx/paragon";
import classNames from "classnames";
import { base_url } from "./../../compugrade-constants";

const DueDate = ({date,blockId}) => {
  const [dueDate, setDueDate] = useState(date ? date?.split("T")[0]:"");

  const today = new Date().toISOString().split("T")[0];

  const toISOWithOffset = (dateString, time = "13:00:00") => {
    const date = new Date(`${dateString}T${time}`);
    date.setHours(date.getHours() + 4);
    return date.toISOString();
  };
  



  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const isoDateTime = toISOWithOffset(dueDate, "13:00:00");
 
   try {
       
        const response = await fetch(base_url+ '/api/openedx/update_rubric', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            due_date: isoDateTime,
            openedx_based_id: blockId,
  
          }),
        });
    
        if (!response.ok) {
          throw new Error(`Failed to update rubric: ${response.status} ${response.statusText}`);
        }
      
  
      } catch (error) {
        console.error('Error during saving:', error);
      
      } finally {
        
      }
  };

 

  return (
    <Stack className="course-unit-sidebar-header" direction="vertical">
      <h3 className="course-unit-sidebar-header-title m-0">Due Date</h3>
      <Form className="mt-3 w-100">
        <Form.Group className={classNames("form-group-custom")}>
            <Form.Control
              type="date"
              value={dueDate}
              min={today}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-100 me-2"
              style={{backgroundColor:"white"}}
            />
            <Button
              variant="outline-primary bg-primary text-white"
              onClick={handleSubmit}
              aria-label="Copy Access Code"
              className="mt-3"
            >
              Save Due Date
            </Button>
        </Form.Group>
      </Form>
    </Stack>
  );
};

export default DueDate;
