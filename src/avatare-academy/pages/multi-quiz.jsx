import QuizBuilder from "./../components/quiz-builder";
import Header from "./../components/header";
import HeaderTop from "../../header";
import { useLocation } from "react-router";

export default function MultiQuiz() {
  const location = useLocation();
  const { quizType, quizId ,status} = location.state || {};

  return (
    <div className="min-h-screen bg-white">
      <HeaderTop isHiddenMainMenu />
      <Header />
      <QuizBuilder quizType={quizType} quizId={quizId} status={status}/>
    </div>
  );
}
