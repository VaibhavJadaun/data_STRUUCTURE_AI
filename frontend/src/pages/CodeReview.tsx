import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CodeReviewPanel from "../components/codeReview/CodeReviewPanel";

export default function CodeReview() {
  const navigate = useNavigate();

  return (
    <Box
      width="100%"
      sx={{
        px: { xs: 2, md: 6 },
        py: { xs: 3, md: 4 },
        background:
          "radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.20), transparent 40%), radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.16), transparent 45%), linear-gradient(180deg, rgba(2,6,23,0.55), rgba(15,23,42,0.65))",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, md: 3.5 },
          borderRadius: 5,
          background:
            "linear-gradient(150deg, rgba(2, 6, 23, 0.92), rgba(15, 23, 42, 0.9), rgba(3, 7, 18, 0.95))",
          border: "1px solid rgba(59,130,246,0.28)",
          boxShadow: "0 28px 70px rgba(2, 6, 23, 0.55)",
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: "#DBD8E3",
                  textShadow: "1px 1px 20px #000",
                  fontWeight: 700,
                }}
              >
                AI Code Reviewer
              </Typography>
              <Typography sx={{ color: "rgba(191,219,254,0.88)", mt: 0.5 }}>
                Paste any DSA/problem-solving snippet and get issues, optimizations,
                clean-code feedback, and improved code analysis.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              onClick={() => navigate("/complexity")}
              sx={{
                borderColor: "rgba(148,163,184,0.45)",
                color: "#DBD8E3",
                textTransform: "none",
                ":hover": { borderColor: "rgba(148,163,184,0.75)" },
              }}
            >
              Back to Complexity Calculator
            </Button>
          </Stack>

          <CodeReviewPanel />
        </Stack>
      </Paper>
    </Box>
  );
}

