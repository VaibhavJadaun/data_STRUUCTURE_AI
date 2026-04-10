import {
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import TypingAnim from "../components/typer/TypingAnim";

const Home = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const [activeAlgo, setActiveAlgo] = React.useState<
    "bubble" | "insertion" | "selection" | "merge" | "quick"
  >("merge");
  const [activeBigO, setActiveBigO] = React.useState<
    "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n^2)" | "O(2^n)"
  >("O(n log n)");

  const algoDetails = React.useMemo(() => {
    return {
      bubble: {
        title: "Bubble sort",
        color: "linear-gradient(135deg, rgba(255, 99, 132, 0.22), rgba(0,0,0,0.15))",
        best: "O(n)",
        avg: "O(n^2)",
        worst: "O(n^2)",
        stable: "Yes",
        idea: "Repeatedly swap adjacent out-of-order elements.",
        pseudocode:
          "for i = 0..n-1\n  swapped = false\n  for j = 0..n-2-i\n    if a[j] > a[j+1]\n      swap(a[j], a[j+1]); swapped = true\n  if !swapped break",
      },
      insertion: {
        title: "Insertion sort",
        color: "linear-gradient(135deg, rgba(255, 193, 7, 0.20), rgba(0,0,0,0.15))",
        best: "O(n)",
        avg: "O(n^2)",
        worst: "O(n^2)",
        stable: "Yes",
        idea: "Grow a sorted prefix by inserting the next element.",
        pseudocode:
          "for i = 1..n-1\n  key = a[i]\n  j = i-1\n  while j >= 0 and a[j] > key\n    a[j+1] = a[j]; j--\n  a[j+1] = key",
      },
      selection: {
        title: "Selection sort",
        color: "linear-gradient(135deg, rgba(54, 162, 235, 0.20), rgba(0,0,0,0.15))",
        best: "O(n^2)",
        avg: "O(n^2)",
        worst: "O(n^2)",
        stable: "No",
        idea: "Select the minimum and place it at the front (repeat).",
        pseudocode:
          "for i = 0..n-1\n  min = i\n  for j = i+1..n-1\n    if a[j] < a[min] min = j\n  swap(a[i], a[min])",
      },
      merge: {
        title: "Merge sort",
        color: "linear-gradient(135deg, rgba(153, 102, 255, 0.22), rgba(0,0,0,0.15))",
        best: "O(n log n)",
        avg: "O(n log n)",
        worst: "O(n log n)",
        stable: "Yes",
        idea: "Divide array, sort halves, then merge two sorted lists.",
        pseudocode:
          "mergeSort(a)\n  if len(a) <= 1 return a\n  mid = len(a)/2\n  left = mergeSort(a[0..mid))\n  right = mergeSort(a[mid..end))\n  return merge(left, right)",
      },
      quick: {
        title: "Quick sort",
        color: "linear-gradient(135deg, rgba(75, 192, 192, 0.20), rgba(0,0,0,0.15))",
        best: "O(n log n)",
        avg: "O(n log n)",
        worst: "O(n^2)",
        stable: "No",
        idea: "Partition around a pivot, then sort subarrays.",
        pseudocode:
          "quickSort(a, lo, hi)\n  if lo >= hi return\n  p = partition(a, lo, hi)\n  quickSort(a, lo, p-1)\n  quickSort(a, p+1, hi)",
      },
    } as const;
  }, []);

  const bigOHelp = React.useMemo(() => {
    return {
      "O(1)": "Constant time: doesn’t grow with n (e.g., array index access).",
      "O(log n)": "Logarithmic: halves the problem each step (binary search).",
      "O(n)": "Linear: one pass over the data.",
      "O(n log n)": "Typical for efficient comparison sorts (merge/quick avg).",
      "O(n^2)": "Nested loops (simple sorts, pair checks).",
      "O(2^n)": "Explodes fast (subsets / brute force on n).",
    } as const;
  }, []);
  return (
    <Box width={"100%"} height={"100%"}>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          mx: "auto",
          mt: 3,
        }}
      >
        <Box>
          <TypingAnim />
        </Box>
        {/* <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: { md: "row", xs: "column", sm: "column" },
            gap: 5,
            my: 10,
          }}
        >
          <img
            src="robot.png"
            alt="robot"
            style={{ width: "200px", margin: "auto" }}
          />
          <img
            className="image-inverted rotate"
            src="openai.png"
            alt="openai"
            style={{ width: "200px", margin: "auto" }}
          />
        </Box> */}
        <Box
          sx={{
            width: isBelowMd ? "92%" : "70%",
            mt: 4,
            mb: 4,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              p: isBelowMd ? 2 : 3,
              borderRadius: 4,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(0,0,0,0.16))",
              boxShadow: "-5px -5px 105px rgba(176,190,197,0.45)",
              border: "1px solid rgba(219,216,227,0.12)",
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant={isBelowMd ? "h5" : "h4"}
                  sx={{ color: "#DBD8E3", textShadow: "1px 1px 20px #000" }}
                >
                  Data Structures & Algorithms
                </Typography>
                <Typography sx={{ color: "rgba(219,216,227,0.85)", mt: 0.5 }}>
                  Explore sorting + understand time complexity (Big‑O).
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: algoDetails[activeAlgo].color,
                      border: "1px solid rgba(219,216,227,0.10)",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography sx={{ color: "#DBD8E3" }}>
                          Sorting explorer
                        </Typography>
                        <Typography
                          sx={{ color: "rgba(219,216,227,0.85)", mt: 0.25 }}
                        >
                          Tap an algorithm to see details.
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label="Bubble"
                          size="small"
                          clickable
                          color={activeAlgo === "bubble" ? "secondary" : "default"}
                          onClick={() => setActiveAlgo("bubble")}
                          sx={{ mb: 1 }}
                        />
                        <Chip
                          label="Insertion"
                          size="small"
                          clickable
                          color={
                            activeAlgo === "insertion" ? "secondary" : "default"
                          }
                          onClick={() => setActiveAlgo("insertion")}
                          sx={{ mb: 1 }}
                        />
                        <Chip
                          label="Selection"
                          size="small"
                          clickable
                          color={
                            activeAlgo === "selection" ? "secondary" : "default"
                          }
                          onClick={() => setActiveAlgo("selection")}
                          sx={{ mb: 1 }}
                        />
                        <Chip
                          label="Merge"
                          size="small"
                          clickable
                          color={activeAlgo === "merge" ? "secondary" : "default"}
                          onClick={() => setActiveAlgo("merge")}
                          sx={{ mb: 1 }}
                        />
                        <Chip
                          label="Quick"
                          size="small"
                          clickable
                          color={activeAlgo === "quick" ? "secondary" : "default"}
                          onClick={() => setActiveAlgo("quick")}
                          sx={{ mb: 1 }}
                        />
                      </Stack>

                      <Divider sx={{ borderColor: "rgba(219,216,227,0.14)" }} />

                      <Box>
                        <Typography sx={{ color: "#DBD8E3", mb: 0.25 }}>
                          {algoDetails[activeAlgo].title}
                        </Typography>
                        <Typography sx={{ color: "rgba(219,216,227,0.85)" }}>
                          {algoDetails[activeAlgo].idea}
                        </Typography>
                      </Box>

                      <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              backgroundColor: "rgba(0,0,0,0.16)",
                              border: "1px solid rgba(219,216,227,0.10)",
                            }}
                          >
                            <Typography sx={{ color: "#DBD8E3", mb: 0.5 }}>
                              Time complexity
                            </Typography>
                            <Typography
                              sx={{ color: "rgba(219,216,227,0.85)" }}
                            >
                              Best: {algoDetails[activeAlgo].best}
                              <br />
                              Avg: {algoDetails[activeAlgo].avg}
                              <br />
                              Worst: {algoDetails[activeAlgo].worst}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              backgroundColor: "rgba(0,0,0,0.16)",
                              border: "1px solid rgba(219,216,227,0.10)",
                            }}
                          >
                            <Typography sx={{ color: "#DBD8E3", mb: 0.5 }}>
                              Properties
                            </Typography>
                            <Typography
                              sx={{ color: "rgba(219,216,227,0.85)" }}
                            >
                              Stable: {algoDetails[activeAlgo].stable}
                              <br />
                              In-place:{" "}
                              {activeAlgo === "merge" ? "No" : "Usually yes"}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: "rgba(0,0,0,0.16)",
                          border: "1px solid rgba(219,216,227,0.10)",
                        }}
                      >
                        <Typography sx={{ color: "#DBD8E3", mb: 0.75 }}>
                          Pseudocode
                        </Typography>
                        <Typography
                          component="pre"
                          sx={{
                            m: 0,
                            whiteSpace: "pre-wrap",
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            fontSize: "0.9rem",
                            color: "rgba(219,216,227,0.9)",
                          }}
                        >
                          {algoDetails[activeAlgo].pseudocode}
                        </Typography>
                      </Paper>
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
                        "linear-gradient(135deg, rgba(255, 159, 64, 0.18), rgba(0,0,0,0.15))",
                      border: "1px solid rgba(219,216,227,0.10)",
                    }}
                  >
                    <Typography sx={{ color: "#DBD8E3", mb: 1.5 }}>
                      Big‑O visualizer
                    </Typography>
                    <Stack spacing={1}>
                      <ToggleButtonGroup
                        exclusive
                        value={activeBigO}
                        onChange={(_, val) => {
                          if (val) setActiveBigO(val);
                        }}
                        size="small"
                        sx={{
                          flexWrap: "wrap",
                          gap: 1,
                          "& .MuiToggleButtonGroup-grouped": {
                            m: 0,
                            borderRadius: 2,
                            border: "1px solid rgba(219,216,227,0.14) !important",
                            color: "rgba(219,216,227,0.9)",
                          },
                          "& .Mui-selected": {
                            backgroundColor: "rgba(219,216,227,0.14) !important",
                            color: "#DBD8E3",
                          },
                        }}
                      >
                        <ToggleButton value="O(1)">O(1)</ToggleButton>
                        <ToggleButton value="O(log n)">O(log n)</ToggleButton>
                        <ToggleButton value="O(n)">O(n)</ToggleButton>
                        <ToggleButton value="O(n log n)">O(n log n)</ToggleButton>
                        <ToggleButton value="O(n^2)">O(n²)</ToggleButton>
                        <ToggleButton value="O(2^n)">O(2ⁿ)</ToggleButton>
                      </ToggleButtonGroup>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: "rgba(0,0,0,0.16)",
                          border: "1px solid rgba(219,216,227,0.10)",
                        }}
                      >
                        <Typography sx={{ color: "#DBD8E3", mb: 0.5 }}>
                          {activeBigO}
                        </Typography>
                        <Typography sx={{ color: "rgba(219,216,227,0.85)" }}>
                          {bigOHelp[activeBigO]}
                        </Typography>
                      </Paper>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Box>
      </Box>
      {/* <Footer /> */}
    </Box>
  );
};

export default Home;
