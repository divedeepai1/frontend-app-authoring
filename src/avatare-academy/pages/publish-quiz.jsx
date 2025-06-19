import { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";

import HeaderTop from "../../header";
import Header from "./../components/header";
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../cms-csrftoken";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QuizPreview from "../components/quiz-preview"

function PublishQuiz() {
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizType, setQuizType] = useState("multi_component");
  const [quizInstructions, setQuizInstructions] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Always prevent default at the start
    const form = e.currentTarget;
  
    if (!form.checkValidity()) {
      e.stopPropagation(); // Optional: prevent further event bubbling
      return;
    }
  
    const token = await fetchCsrfToken();
  
    const data = JSON.stringify({
      title: quizTitle,
      description: quizDescription,
      quiz_type: quizType,
      instructions: quizInstructions,
      category_id: 1,
      course_key: "",
    });
  
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/quizplugin/api/quizzes/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: data,
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add quiz: ${response.status} ${errorText}`);
      }
      const responseData = await response.json();
      sessionStorage.setItem("quizId", responseData.id);
      navigate("/create-multi-quiz");
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  
  const handleCancel = () => {
    navigate("/home");
  };

  return (
    <>
      <HeaderTop isHiddenMainMenu />
      <Header />
      <Container className="py-2">
      <QuizPreview />

        
      </Container>
    </>
  );
}

export default PublishQuiz;
