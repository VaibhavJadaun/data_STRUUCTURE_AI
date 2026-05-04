import { Box, Paper, Typography } from "@mui/material";
import QuizPanel from "../components/quiz/QuizPanel";

const Quiz = () => {
  return (
    <Box width="100%" sx={{ px: { xs: 2, md: 6 }, py: { xs: 3, md: 4 } }}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(124, 77, 255, 0.16), rgba(0, 188, 212, 0.14), rgba(0,0,0,0.18))",
          border: "1px solid rgba(219,216,227,0.12)",
          boxShadow: "-5px -5px 105px rgba(176,190,197,0.35)",
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: "#DBD8E3", textShadow: "1px 1px 20px #000", mb: 0.5 }}
        >
          DSA Quiz Arena
        </Typography>
        <Typography sx={{ color: "rgba(219,216,227,0.85)", mb: 2 }}>
          Practice MCQs from core DSA topics like arrays, linked list, stack, queue, trees,
          graphs, hashing, and dynamic programming.
        </Typography>
        <QuizPanel />
      </Paper>
    </Box>
  );
};

export default Quiz;

