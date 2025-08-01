import { useState } from "react";
import { Container} from "react-bootstrap";

import HeaderTop from "../../header";
import Header from "./../components/header";

import QuizPreview from "../components/quiz-preview"
import { useLocation } from "react-router";

function PublishQuiz() {
  const location = useLocation();
  const { isPublish } = location.state || {};

 
  return (
    <>
      <HeaderTop isHiddenMainMenu />
      <Header />
      <Container className="py-2">
      <QuizPreview isPublish={isPublish} />
      </Container>
    </>
  );
}

export default PublishQuiz;
