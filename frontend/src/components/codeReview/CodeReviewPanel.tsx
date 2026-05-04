import React from "react";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import toast from "react-hot-toast";
import {
  reviewCodeRequest,
  type CodeReviewFeedback,
} from "../../helpers/api-communicator";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { estimateComplexity } from "../../utils/complexityEstimator";

const SAMPLE_CODE = `// Example (C++): Two Sum (brute force)
#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    for (int i = 0; i < (int)nums.size(); i++) {
        for (int j = i + 1; j < (int)nums.size(); j++) {
            if (nums[i] + nums[j] == target) return {i, j};
        }
    }
    return {};
}`;

const LANGUAGE_OPTIONS = [
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
] as const;

type ReviewLanguage = (typeof LANGUAGE_OPTIONS)[number]["value"];

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 3,
        backgroundColor: "rgba(15,23,42,0.8)",
        border: "1px solid rgba(148,163,184,0.25)",
      }}
    >
      <Typography sx={{ color: "rgba(191,219,254,0.95)", mb: 0.75, fontWeight: 600 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export default function CodeReviewPanel() {
  const [code, setCode] = React.useState<string>(SAMPLE_CODE);
  const [language, setLanguage] = React.useState<ReviewLanguage>("cpp");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<CodeReviewFeedback | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputCodeComplexity = React.useMemo(() => {
    const pasted = code.trim();
    if (!pasted) return null;
    return estimateComplexity(pasted);
  }, [code]);
  const improvedCodeComplexity = React.useMemo(() => {
    const improved = result?.improved_code?.trim();
    if (!improved) return null;
    return estimateComplexity(improved);
  }, [result?.improved_code]);

  const onReview = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("Please paste some code to review.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await reviewCodeRequest(trimmed, language);
      setResult(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Code review failed";
      setResult(null);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} lg={6}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 4,
            background:
              "linear-gradient(160deg, rgba(30,41,59,0.92), rgba(15,23,42,0.92))",
            border: "1px solid rgba(96,165,250,0.25)",
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Typography sx={{ color: "#e2e8f0", fontWeight: 600 }}>
                Paste code for review
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <FormControl
                  size="small"
                  sx={{
                    minWidth: 170,
                    mb: 0.5,
                    "& .MuiInputLabel-root": {
                      color: "rgba(219,216,227,0.88)",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#DBD8E3",
                    },
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(15,23,42,0.75)",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(219,216,227,0.42)",
                    },
                    "& .MuiSvgIcon-root": { color: "#DBD8E3" },
                  }}
                >
                  <InputLabel>Language</InputLabel>
                  <Select
                    label="Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as ReviewLanguage)}
                    sx={{
                      color: "#DBD8E3",
                      fontWeight: 600,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(219,216,227,0.75)",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: "#0f172a",
                          color: "#DBD8E3",
                          border: "1px solid rgba(148,163,184,0.35)",
                        },
                      },
                    }}
                  >
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <MenuItem
                        key={lang.value}
                        value={lang.value}
                        sx={{
                          color: "#DBD8E3",
                          "&.Mui-selected": {
                            backgroundColor: "rgba(59,130,246,0.25)",
                          },
                          "&.Mui-selected:hover": {
                            backgroundColor: "rgba(59,130,246,0.35)",
                          },
                        }}
                      >
                        {lang.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Chip
                  label="Load sample"
                  clickable
                  onClick={() => setCode(SAMPLE_CODE)}
                  sx={{ mb: 0.5 }}
                />
                <Chip
                  label="Clear"
                  clickable
                  onClick={() => {
                    setCode("");
                    setResult(null);
                    setError(null);
                  }}
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
                minHeight: 360,
                resize: "vertical",
                borderRadius: 12,
                padding: 12,
                border: "1px solid rgba(96,165,250,0.35)",
                outline: "none",
                background: "rgba(2,6,23,0.75)",
                color: "rgba(226,232,240,0.96)",
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
                variant="contained"
                onClick={onReview}
                disabled={loading}
                sx={{
                  bgcolor: "#2563eb",
                  color: "#e2e8f0",
                  fontWeight: 700,
                  ":hover": { bgcolor: "#1d4ed8" },
                }}
              >
                {loading ? "Reviewing..." : "Review Code"}
              </Button>
            </Stack>

            <Typography sx={{ color: "rgba(191,219,254,0.8)", fontSize: 13 }}>
              The review focuses on complexity, correctness, and readability.
            </Typography>

            {inputCodeComplexity && (
              <Grid container spacing={1.25}>
                <Grid item xs={12} md={6}>
                  <SectionCard title="Pasted Code Time Complexity">
                    <Typography variant="h6" sx={{ color: "#e2e8f0" }}>
                      {inputCodeComplexity.time}
                    </Typography>
                  </SectionCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <SectionCard title="Pasted Code Space Complexity">
                    <Typography variant="h6" sx={{ color: "#e2e8f0" }}>
                      {inputCodeComplexity.space}
                    </Typography>
                  </SectionCard>
                </Grid>
              </Grid>
            )}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} lg={6}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 4,
            background:
              "linear-gradient(160deg, rgba(22,101,52,0.2), rgba(15,23,42,0.92))",
            border: "1px solid rgba(34,197,94,0.3)",
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography sx={{ color: "#dcfce7", fontWeight: 700 }}>
                Review output
              </Typography>
              <Typography sx={{ color: "rgba(220,252,231,0.8)" }}>
                Structured feedback (AI)
              </Typography>
            </Box>

            {error && (
              <SectionCard title="Error">
                <Typography sx={{ color: "rgba(255, 99, 132, 0.95)" }}>
                  {error}
                </Typography>
              </SectionCard>
            )}

            {!error && !result && (
              <SectionCard title="Waiting">
                <Typography sx={{ color: "rgba(219,216,227,0.85)" }}>
                  Paste code and click <b>Review Code</b> to see complexity,
                  issues, and an improved version.
                </Typography>
              </SectionCard>
            )}

            {result && (
              <Stack spacing={1.25}>
                <SectionCard title="Time Complexity">
                  <Typography variant="h6" sx={{ color: "#e2e8f0" }}>
                    {result.time_complexity || inputCodeComplexity?.time || "—"}
                  </Typography>
                </SectionCard>

                <SectionCard title="Space Complexity">
                  <Typography variant="h6" sx={{ color: "#e2e8f0" }}>
                    {result.space_complexity || inputCodeComplexity?.space || "—"}
                  </Typography>
                </SectionCard>

                <Divider sx={{ borderColor: "rgba(219,216,227,0.10)" }} />

                <SectionCard title="Issues">
                  {result.issues.length === 0 ? (
                    <Typography sx={{ color: "rgba(219,216,227,0.85)" }}>
                      — None detected
                    </Typography>
                  ) : (
                    <Stack spacing={0.5}>
                      {result.issues.map((t, idx) => (
                        <Typography
                          key={`issue-${idx}-${t}`}
                          sx={{ color: "rgba(219,216,227,0.85)" }}
                        >
                          - {t}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </SectionCard>

                <SectionCard title="Optimizations">
                  {result.optimizations.length === 0 ? (
                    <Typography sx={{ color: "rgba(219,216,227,0.85)" }}>
                      — No optimizations suggested
                    </Typography>
                  ) : (
                    <Stack spacing={0.5}>
                      {result.optimizations.map((t, idx) => (
                        <Typography
                          key={`opt-${idx}-${t}`}
                          sx={{ color: "rgba(219,216,227,0.85)" }}
                        >
                          - {t}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </SectionCard>

                <SectionCard title="Clean Code Tips">
                  {result.clean_code_suggestions.length === 0 ? (
                    <Typography sx={{ color: "rgba(219,216,227,0.85)" }}>
                      — No suggestions
                    </Typography>
                  ) : (
                    <Stack spacing={0.5}>
                      {result.clean_code_suggestions.map((t, idx) => (
                        <Typography
                          key={`clean-${idx}-${t}`}
                          sx={{ color: "rgba(219,216,227,0.85)" }}
                        >
                          - {t}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </SectionCard>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Grid>

      {result?.improved_code && (
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              background: "linear-gradient(160deg, rgba(2,6,23,0.9), rgba(30,41,59,0.85))",
              border: "1px solid rgba(96,165,250,0.35)",
            }}
          >
            <Stack spacing={1}>
              <Typography sx={{ color: "#bfdbfe", fontWeight: 700 }}>
                Improved Code
              </Typography>
              <Typography sx={{ color: "rgba(191,219,254,0.8)", fontSize: 13 }}>
                Syntax highlighted (best effort).
              </Typography>
              <Box sx={{ borderRadius: 2, overflow: "hidden" }}>
                <SyntaxHighlighter
                  language={language}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    padding: 14,
                    background: "rgba(0,0,0,0.35)",
                  }}
                >
                  {result.improved_code}
                </SyntaxHighlighter>
              </Box>

              {improvedCodeComplexity && (
                <Grid container spacing={1.25} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} md={6}>
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
                        Improved code time complexity
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#DBD8E3", mt: 0.25 }}>
                        {improvedCodeComplexity.time}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
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
                        Improved code space complexity
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#DBD8E3", mt: 0.25 }}>
                        {improvedCodeComplexity.space}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </Stack>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}

