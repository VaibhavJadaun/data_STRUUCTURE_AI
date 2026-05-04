import { Box, Button, Paper, Radio, RadioGroup, FormControlLabel, Typography, Stack } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getQuizQuestions, submitQuizAnswers } from "../../helpers/api-communicator";

type QuizQuestion = {
  id: string;
  topic: string;
  question: string;
  options: string[];
};

const BATCH_SIZE = 7;
const QUIZ_SECONDS = 120;
const OPTION_BG = [
  "linear-gradient(135deg, rgba(124, 77, 255, 0.26), rgba(124, 77, 255, 0.08))",
  "linear-gradient(135deg, rgba(0, 188, 212, 0.26), rgba(0, 188, 212, 0.08))",
  "linear-gradient(135deg, rgba(255, 193, 7, 0.26), rgba(255, 193, 7, 0.08))",
  "linear-gradient(135deg, rgba(76, 175, 80, 0.26), rgba(76, 175, 80, 0.08))",
];

const QuizPanel = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answeredCount = useMemo(
    () => Object.keys(selectedAnswers).length,
    [selectedAnswers]
  );
  const feedbackMessage = useMemo(() => {
    if (score === null || questions.length === 0) return "";
    const percent = (score / questions.length) * 100;
    if (percent >= 85) {
      return "Excellent work! You are really strong in DSA. Keep it up and best of luck for interviews!";
    }
    if (percent >= 65) {
      return "Very good job! You have a solid base. A little more practice and you will do even better.";
    }
    if (percent >= 40) {
      return "Good effort! You are improving. Keep practicing regularly and best of luck!";
    }
    return "Nice try! Do not worry, every attempt helps you improve. Keep learning and all the best!";
  }, [score, questions.length]);

  const loadQuestions = async () => {
    try {
      toast.loading("Loading quiz...", { id: "quiz-load" });
      const data = await getQuizQuestions(BATCH_SIZE);
      setQuestions(data.questions ?? []);
      setSelectedAnswers({});
      setScore(null);
      setTimeLeft(QUIZ_SECONDS);
      toast.success("Quiz ready", { id: "quiz-load" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to load quiz";
      toast.error(msg, { id: "quiz-load" });
    }
  };

  useEffect(() => {
    if (!hasStarted || questions.length === 0 || score !== null) return;
    if (timeLeft <= 0) {
      void handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [hasStarted, questions.length, timeLeft, score]);

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (questions.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedOptionIndex: selectedAnswers[q.id] ?? -1,
      }));
      const data = await submitQuizAnswers(answers);
      setScore(data.score ?? 0);
      toast.success("Quiz submitted successfully");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to submit quiz";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasStarted) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          bgcolor: "rgba(17,29,39,0.95)",
          border: "1px solid rgba(219,216,227,0.12)",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          DSA Quiz Challenge
        </Typography>
        <Typography sx={{ mb: 2, opacity: 0.85 }}>
          Interactive 5-question quiz with timer, randomized topics, and instant scoring.
        </Typography>
        <Button
          variant="contained"
          onClick={async () => {
            setHasStarted(true);
            await loadQuestions();
          }}
          sx={{
            textTransform: "none",
            bgcolor: "#7C4DFF",
            ":hover": { bgcolor: "#6d42df" },
          }}
        >
          Start Quiz
        </Button>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        bgcolor: "rgba(17,29,39,0.95)",
        border: "1px solid rgba(219,216,227,0.12)",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography sx={{ fontWeight: 700 }}>DSA Quiz (7 Questions)</Typography>
        <Typography sx={{ fontSize: 14, opacity: 0.85 }}>Time left: {timeLeft}s</Typography>
      </Stack>

      {score === null ? (
        <>
          <Typography sx={{ mb: 2, fontSize: 14, opacity: 0.85 }}>
            Answer all topics including arrays, linked list, queue, stack, tree, graph, DP.
          </Typography>
          <Stack spacing={2}>
            {questions.map((question, index) => (
              <Box
                key={question.id}
                sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.18)" }}
              >
                <Typography sx={{ fontSize: 13, opacity: 0.75, mb: 0.5 }}>
                  {question.topic}
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  Q{index + 1}. {question.question}
                </Typography>
                <RadioGroup
                  value={selectedAnswers[question.id] ?? ""}
                  onChange={(e) => handleOptionSelect(question.id, Number(e.target.value))}
                >
                  {question.options.map((option, optionIndex) => (
                    <Box
                      key={`${question.id}-${optionIndex}`}
                      sx={{
                        mt: 1,
                        borderRadius: 2,
                        px: 1,
                        py: 0.25,
                        background: OPTION_BG[optionIndex % OPTION_BG.length],
                        border: "1px solid rgba(219,216,227,0.14)",
                        transition: "all 0.2s ease",
                        ":hover": {
                          transform: "translateY(-1px)",
                          border: "1px solid rgba(219,216,227,0.3)",
                        },
                      }}
                    >
                      <FormControlLabel
                        value={optionIndex}
                        control={
                          <Radio
                            sx={{
                              color: "rgba(219,216,227,0.75)",
                              "&.Mui-checked": { color: "#DBD8E3" },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ color: "rgba(219,216,227,0.95)", fontSize: 14 }}>
                            {option}
                          </Typography>
                        }
                        sx={{ width: "100%", m: 0 }}
                      />
                    </Box>
                  ))}
                </RadioGroup>
              </Box>
            ))}
          </Stack>

          <Stack direction="row" spacing={1.5} mt={2}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{ textTransform: "none" }}
            >
              Submit Quiz
            </Button>
            <Button variant="outlined" onClick={loadQuestions} sx={{ textTransform: "none" }}>
              New Questions
            </Button>
          </Stack>
          <Typography sx={{ mt: 1, fontSize: 13, opacity: 0.75 }}>
            Answered: {answeredCount}/{questions.length}
          </Typography>
        </>
      ) : (
        <>
          <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}>
            Your Score: {score}/{questions.length}
          </Typography>
          <Typography sx={{ mb: 1, opacity: 0.95, fontWeight: 500 }}>
            {feedbackMessage}
          </Typography>
          <Typography sx={{ mb: 2, opacity: 0.8 }}>
            Retry to improve more or load a fresh quiz set.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" onClick={loadQuestions} sx={{ textTransform: "none" }}>
              Retry Quiz
            </Button>
            <Button variant="outlined" onClick={loadQuestions} sx={{ textTransform: "none" }}>
              New Questions
            </Button>
          </Stack>
        </>
      )}
    </Paper>
  );
};

export default QuizPanel;

