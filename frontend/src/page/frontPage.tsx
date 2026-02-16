import { useState } from "react";
import { Button } from "@/components/Button";
import { BrainCircuit, Loader2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import EvaluationResults from "@/components/EvaluationResults";

const Index = () => {
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [modelAnswer, setModelAnswer] = useState<File | null>(null);
  const [studentSheet, setStudentSheet] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const allUploaded = questionPaper && modelAnswer && studentSheet;

  const handleEvaluate = () => {
    setLoading(true);
    setShowResults(false);
    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center gap-3 py-6 px-4">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">AI Answer Sheet Evaluator</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        {/* Upload Section */}
        <section className="grid gap-4 sm:grid-cols-3">
          <FileUpload label="Question Paper" file={questionPaper} onFileChange={setQuestionPaper} />
          <FileUpload label="Model Answer Paper" file={modelAnswer} onFileChange={setModelAnswer} />
          <FileUpload label="Student Answer Sheet" file={studentSheet} onFileChange={setStudentSheet} />
        </section>

        {/* Evaluate Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!allUploaded || loading}
            onClick={handleEvaluate}
            className="px-10"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Evaluating…
              </>
            ) : (
              "Evaluate"
            )}
          </Button>
        </div>

        {/* Results */}
        {showResults && <EvaluationResults />}
      </main>
    </div>
  );
};

export default Index;