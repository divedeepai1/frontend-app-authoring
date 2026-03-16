import HeaderActionButton from "../ui/HeaderActionButton";
import { Play } from "lucide-react";

export default function QARundiv({ onRunQA, loading = false }) {
  return (
    <HeaderActionButton
      icon={Play}
      onClick={onRunQA}
      loading={loading}
      variant="primary"
    >
      {loading ? "Running QA..." : "Run QA"}
    </HeaderActionButton>
  );
}
