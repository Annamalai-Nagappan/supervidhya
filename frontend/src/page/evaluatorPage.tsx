import { useState } from "react";
import { Button } from "@/components/Button";
import { BrainCircuit, Loader2, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import EvaluationResults from "@/components/EvaluationResults";
import { Badge } from "@/components/badge";
import {
  uploadQuestionPaper,
  uploadModelAnswer,
  uploadStudentSubmission,
  evaluateSubmission
} from "@/lib/api";

const Index = () => {
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [modelAnswer, setModelAnswer] = useState<File | null>(null);
  const [studentSheet, setStudentSheet] = useState<File | null>(null);

  const [examSetId, setExamSetId] = useState<number | null>(null);
  const [submissionId, setSubmissionId] = useState<number | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [status, setStatus] = useState("");

  const handleStep1 = async () => {
    if (!questionPaper) return;
    setLoading(true);
    setError(null);
    setStatus("Processing Question Paper...");
    try {
      const qpResult = await uploadQuestionPaper(questionPaper, "1", "SET-A");
      setExamSetId(qpResult.examSetId);
      setCurrentStep(2);
      setStatus("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (!modelAnswer || !examSetId) return;
    setLoading(true);
    setError(null);
    setStatus("Syncing Model Answer...");
    try {
      await uploadModelAnswer(modelAnswer, examSetId);
      setCurrentStep(3);
      setStatus("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async () => {
    if (!studentSheet || !examSetId) return;
    setLoading(true);
    setError(null);
    setStatus("Uploading Student Work...");
    try {
      const subResult = await uploadStudentSubmission(studentSheet, "1", examSetId, "3");
      setSubmissionId(subResult.submissionId);
      setCurrentStep(4);
      setStatus("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!submissionId) return;
    setLoading(true);
    setError(null);
    setStatus("Grading in Progress...");
    try {
      const evalResult = await evaluateSubmission(submissionId);
      setResults(evalResult);
      setStatus("");
      setCurrentStep(5); // Completed
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setQuestionPaper(null);
    setModelAnswer(null);
    setStudentSheet(null);
    setExamSetId(null);
    setSubmissionId(null);
    setCurrentStep(1);
    setResults(null);
    setError(null);
  };

  const resetStudentOnly = () => {
    setStudentSheet(null);
    setSubmissionId(null);
    setResults(null);
    setError(null);
    setCurrentStep(3);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">AI Answer Sheet Evaluator</h1>
          </div>
          {currentStep > 1 && (
            <Button variant="ghost" size="sm" onClick={resetAll}>Reset</Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <section className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground/90">
            Grading
          </h2>
          <div className="flex justify-center items-center gap-2 text-sm font-medium mt-4">
            <Badge variant={currentStep >= 1 ? "default" : "outline"} className="rounded-full">1. Question Paper</Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant={currentStep >= 2 ? "default" : "outline"} className="rounded-full">2. Model Answers</Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant={currentStep >= 3 ? "default" : "outline"} className="rounded-full">3. Student Submission</Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant={currentStep >= 4 ? "default" : "outline"} className="rounded-full">4. Evaluation</Badge>
          </div>
        </section>

        {/* Upload Section */}
        <section className="grid gap-6 sm:grid-cols-3">
          <div className={`space-y-4 transition-opacity ${currentStep !== 1 && currentStep < 5 ? "opacity-50 pointer-events-none" : ""}`}>
            <FileUpload label="1. Question Paper" file={questionPaper} onFileChange={setQuestionPaper} />
            {currentStep === 1 && questionPaper && (
              <Button className="w-full" onClick={handleStep1} disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Upload Paper"}
              </Button>
            )}
            {currentStep > 1 && (
              <div className="flex justify-center text-green-600 font-medium text-sm gap-1 items-center">
                <CheckCircle2 className="h-4 w-4" /> Uploaded
              </div>
            )}
          </div>

          <div className={`space-y-4 transition-opacity ${currentStep !== 2 && currentStep < 5 ? "opacity-50 pointer-events-none" : ""}`}>
            <FileUpload label="2. Model Answers" file={modelAnswer} onFileChange={setModelAnswer} />
            {currentStep === 2 && modelAnswer && (
              <Button className="w-full" onClick={handleStep2} disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Upload Keys"}
              </Button>
            )}
            {currentStep > 2 && (
              <div className="flex justify-center text-green-600 font-medium text-sm gap-1 items-center">
                <CheckCircle2 className="h-4 w-4" /> Uploaded
              </div>
            )}
          </div>

          <div className={`space-y-4 transition-opacity ${currentStep !== 3 && currentStep < 5 ? "opacity-50 pointer-events-none" : ""}`}>
            <FileUpload label="3. Student Submission" file={studentSheet} onFileChange={setStudentSheet} />
            {currentStep === 3 && studentSheet && (
              <Button className="w-full" onClick={handleStep3} disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Upload Submission"}
              </Button>
            )}
            {currentStep > 3 && (
              <div className="flex justify-center text-green-600 font-medium text-sm gap-1 items-center">
                <CheckCircle2 className="h-4 w-4" /> Uploaded
              </div>
            )}
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Status indicator during loading */}
        {loading && status && (
          <div className="flex flex-col items-center gap-3 py-6 bg-primary/5 rounded-xl border border-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-primary font-semibold animate-pulse">{status}</p>
          </div>
        )}

        {/* Final Evaluate Button */}
        {currentStep === 4 && (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
            <Button
              size="lg"
              onClick={handleEvaluate}
              disabled={loading}
              className="px-12 py-6 text-xl rounded-full shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Evaluate"
              )}
            </Button>
            <p className="text-sm text-muted-foreground italic">All papers uploaded. Ready to grade.</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 mt-12 space-y-6">
            <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg border">
              <div>
                <h3 className="font-bold text-lg text-primary">Evaluation Complete</h3>
                <p className="text-sm text-muted-foreground">You can now view the detailed breakdown or grade another student.</p>
              </div>
              <Button variant="outline" onClick={resetStudentOnly}>
                Grade Another Student
              </Button>
            </div>
            <EvaluationResults data={results} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;