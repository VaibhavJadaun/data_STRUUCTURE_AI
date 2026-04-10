import React from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { estimateComplexity } from "../utils/complexityEstimator";

const SAMPLE = `// Example: nested loops
function pairs(arr) {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] < arr[j]) count++;
    }
  }
  return count;
}`;

const SAMPLE_SORT = `// Example: sort call
function sortedCopy(arr) {
  return [...arr].sort((a, b) => a - b);
}`;

const SAMPLE_LOG = `// Example: logarithmic loop
function logSteps(n) {
  let steps = 0;
  for (let i = n; i > 1; i = Math.floor(i / 2)) steps++;
  return steps;
}`;

const Complexity = () => {
  const [code, setCode] = React.useState(SAMPLE);
  const [result, setResult] = React.useState(() => estimateComplexity(SAMPLE));

  return (
    <Box width="100%" sx={{ px: { xs: 2, md: 6 }, py: { xs: 3, md: 4 } }}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(0, 180, 216, 0.16), rgba(153, 102, 255, 0.14), rgba(0,0,0,0.18))",
          border: "1px solid rgba(219,216,227,0.12)",
          boxShadow: "-5px -5px 105px rgba(176,190,197,0.35)",
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography
              variant="h4"
              sx={{ color: "#DBD8E3", textShadow: "1px 1px 20px #000" }}
            >
              Time & Space Complexity Calculator
            </Typography>
            <Typography sx={{ color: "rgba(219,216,227,0.85)", mt: 0.5 }}>
              Paste code and get an estimated Big‑O. Best for JavaScript snippets
              (loops, recursion, and common patterns).
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, rgba(255, 99, 132, 0.14), rgba(54, 162, 235, 0.12), rgba(0,0,0,0.18))",
                  border: "1px solid rgba(219,216,227,0.10)",
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <Typography sx={{ color: "#DBD8E3" }}>
                      Paste your code
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        label="Sample: O(n²)"
                        clickable
                        onClick={() => setCode(SAMPLE)}
                        sx={{ mb: 0.5 }}
                      />
                      <Chip
                        label="Sample: O(n log n)"
                        clickable
                        onClick={() => setCode(SAMPLE_SORT)}
                        sx={{ mb: 0.5 }}
                      />
                      <Chip
                        label="Sample: O(log n)"
                        clickable
                        onClick={() => setCode(SAMPLE_LOG)}
                        sx={{ mb: 0.5 }}
                      />
                    </Stack>
                  </Stack>

                  <Box
                    component="textarea"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    style={{
                      width: "100%",
                      minHeight: 340,
                      resize: "vertical",
                      borderRadius: 12,
                      padding: 12,
                      border: "1px solid rgba(219,216,227,0.20)",
                      outline: "none",
                      background: "rgba(0,0,0,0.25)",
                      color: "rgba(219,216,227,0.92)",
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      fontSize: 14,
                      lineHeight: 1.45,
                    }}
                  />

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent="flex-end"
                  >
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setCode("");
                        setResult(
                          estimateComplexity(
                            "// Paste code above and click Analyze"
                          )
                        );
                      }}
                      sx={{
                        borderColor: "rgba(219,216,227,0.35)",
                        color: "#DBD8E3",
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setResult(estimateComplexity(code))}
                      sx={{
                        bgcolor: "#B0BEC5",
                        color: "black",
                        ":hover": { bgcolor: "#DBD8E3" },
                      }}
                    >
                      Analyze
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, rgba(75, 192, 192, 0.14), rgba(255, 193, 7, 0.12), rgba(0,0,0,0.18))",
                  border: "1px solid rgba(219,216,227,0.10)",
                }}
              >
                <Stack spacing={1.5}>
                  <Box>
                    <Typography sx={{ color: "#DBD8E3" }}>
                      Estimated result
                    </Typography>
                    <Typography sx={{ color: "rgba(219,216,227,0.75)" }}>
                      Confidence: {result.confidence}
                    </Typography>
                  </Box>

                  <Grid container spacing={1.25}>
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: "rgba(0,0,0,0.20)",
                          border: "1px solid rgba(219,216,227,0.10)",
                        }}
                      >
                        <Typography sx={{ color: "rgba(219,216,227,0.8)" }}>
                          Time complexity
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{ color: "#DBD8E3", mt: 0.25 }}
                        >
                          {result.time}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: "rgba(0,0,0,0.20)",
                          border: "1px solid rgba(219,216,227,0.10)",
                        }}
                      >
                        <Typography sx={{ color: "rgba(219,216,227,0.8)" }}>
                          Space complexity
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{ color: "#DBD8E3", mt: 0.25 }}
                        >
                          {result.space}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "rgba(0,0,0,0.20)",
                      border: "1px solid rgba(219,216,227,0.10)",
                    }}
                  >
                    <Typography sx={{ color: "#DBD8E3", mb: 0.75 }}>
                      Why this estimate?
                    </Typography>
                    <Stack spacing={0.75}>
                      {result.notes.map((n, idx) => (
                        <Typography
                          key={`${idx}-${n}`}
                          sx={{ color: "rgba(219,216,227,0.85)" }}
                        >
                          - {n}
                        </Typography>
                      ))}
                    </Stack>
                  </Paper>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Complexity;

