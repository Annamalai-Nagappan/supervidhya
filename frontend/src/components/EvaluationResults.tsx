import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Progress } from "@/components/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Badge } from "@/components/badge";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface EvaluationData {
  results: any[];
  totalMarks: number;
  maxMarks: number;
  confidenceScore: number;
}

const EvaluationResults = ({ data }: { data: EvaluationData }) => {
  const { totalMarks, maxMarks, confidenceScore, results } = data;
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
                {results.map((r: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{r.Question?.question_no || 'Q'}</TableCell>
                    <TableCell className="text-sm line-clamp-2">{r.feedback}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={r.ai_score >= r.Question?.max_marks * 0.8 ? "default" : r.ai_score >= r.Question?.max_marks * 0.5 ? "secondary" : "destructive"}>
                        {r.ai_score}/{r.Question?.max_marks || '?'}
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
            {results.map((r: any, idx: number) => (
              <div key={idx} className="rounded-lg border p-4 space-y-2">
                <p className="font-semibold">Question {r.Question?.question_no || '?'}</p>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">{r.feedback}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{r.match_quality}</Badge>
                  <span className="text-xs text-muted-foreground">Confidence: {Math.round(r.confidence_score * 100)}%</span>
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
