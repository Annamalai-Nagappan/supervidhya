import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Progress } from "@/components/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Badge } from "@/components/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { dummyResults } from "@/lib/dummy_data";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const EvaluationResults = () => {
  const { totalMarks, maxMarks, confidenceScore, answers, feedback } = dummyResults;
  const pct = Math.round((totalMarks / maxMarks) * 100);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Total Marks */}
      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle>Total Marks</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-8">
            <div className="relative h-28 w-28 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - pct / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                {pct}%
              </span>
            </div>
            <div>
              <p className="text-4xl font-bold">{totalMarks} <span className="text-muted-foreground text-2xl">/ {maxMarks}</span></p>
              <p className="text-muted-foreground mt-1">Overall Score</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Extracted Answers */}
      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle>Extracted Answers</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Q#</TableHead>
                  <TableHead>Student's Answer Summary</TableHead>
                  <TableHead className="w-24 text-right">Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {answers.map((a) => (
                  <TableRow key={a.question}>
                    <TableCell className="font-medium">{a.question}</TableCell>
                    <TableCell className="text-sm">{a.answer}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={a.marks >= a.maxMarks * 0.8 ? "default" : a.marks >= a.maxMarks * 0.5 ? "secondary" : "destructive"}>
                        {a.marks}/{a.maxMarks}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Feedback */}
      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle>AI Feedback</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {feedback.map((f) => (
              <div key={f.question} className="rounded-lg border p-4 space-y-2">
                <p className="font-semibold">Question {f.question}</p>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Strengths:</strong> {f.strengths}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Improve:</strong> {f.improvements}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Confidence Score */}
      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle>AI Confidence Score</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{confidenceScore}%</span>
              <Badge variant="secondary">High Confidence</Badge>
            </div>
            <Progress value={confidenceScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              The AI model is {confidenceScore}% confident in its evaluation. This score reflects the clarity of handwriting, answer structure, and alignment with the model answer paper.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default EvaluationResults;
