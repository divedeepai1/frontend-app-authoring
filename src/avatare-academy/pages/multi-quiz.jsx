import QuizBuilder from "./../components/quiz-builder";
import Header from "./../components/header";
import HeaderTop from "../../header";

export default function MultiQuiz() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderTop isHiddenMainMenu />
      <Header />
      <QuizBuilder />
    </div>
  );
}
