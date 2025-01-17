import React, { useState } from "react";
import { Form, Stack, Button } from "@openedx/paragon";
import classNames from "classnames";

const AccessCode = ({accessCode}) => {

  const copyToClipboard = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Modern API
      navigator.clipboard.writeText(accessCode).then(() => {
        alert("Access code copied to clipboard!");
      }).catch((error) => {
        console.error("Failed to copy:", error);
        fallbackCopyToClipboard();
      });
    } else {
      // Fallback for older browsers
      fallbackCopyToClipboard();
    }
  };

  const fallbackCopyToClipboard = () => {
    const textarea = document.createElement("textarea");
    textarea.value = accessCode;
    textarea.style.position = "fixed"; // Avoid scrolling to the bottom
    textarea.style.opacity = "0"; // Invisible to users
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        alert("Access code copied to clipboard!");
      } else {
        alert("Failed to copy access code.");
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }
    document.body.removeChild(textarea);
  };

  return (
    <Stack className="course-unit-sidebar-header" direction="vertical">
      <h3 className="course-unit-sidebar-header-title m-0">Access Codes</h3>
      <Form className="mt-3 w-100">
        <Form.Group className={classNames("form-group-custom")}>
            <Form.Control
              value={accessCode}
              className="w-100 me-2"
              disabled={true}
              style={{backgroundColor:"white"}}
            />
            <Button
              variant="outline-primary bg-primary text-white"
              onClick={copyToClipboard}
              aria-label="Copy Access Code"
              className="mt-3"
            >
              Copy
            </Button>
        </Form.Group>
      </Form>
    </Stack>
  );
};

export default AccessCode;
