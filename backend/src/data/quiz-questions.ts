export type QuizQuestion = {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
};

export const DSA_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "arr-1",
    topic: "Arrays",
    question: "What is the time complexity to access arr[i] in an array?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctOptionIndex: 0,
  },
  {
    id: "ll-1",
    topic: "Linked List",
    question: "Which linked list allows traversal in both directions?",
    options: ["Singly linked list", "Circular linked list", "Doubly linked list", "Skip list"],
    correctOptionIndex: 2,
  },
  {
    id: "stack-1",
    topic: "Stack",
    question: "Which order does a stack follow?",
    options: ["FIFO", "LIFO", "Priority-based", "Random"],
    correctOptionIndex: 1,
  },
  {
    id: "queue-1",
    topic: "Queue",
    question: "Which operation removes an element from a queue?",
    options: ["push", "enqueue", "dequeue", "insert"],
    correctOptionIndex: 2,
  },
  {
    id: "tree-1",
    topic: "Trees",
    question: "In a Binary Search Tree, left subtree values are:",
    options: ["Always greater", "Always equal", "Always smaller", "Unordered"],
    correctOptionIndex: 2,
  },
  {
    id: "graph-1",
    topic: "Graphs",
    question: "Which traversal uses a queue?",
    options: ["DFS", "BFS", "Topological Sort", "Dijkstra"],
    correctOptionIndex: 1,
  },
  {
    id: "heap-1",
    topic: "Heap",
    question: "What is the complexity of inserting into a binary heap?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctOptionIndex: 1,
  },
  {
    id: "sort-1",
    topic: "Sorting",
    question: "Which sorting algorithm is stable by default?",
    options: ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"],
    correctOptionIndex: 2,
  },
  {
    id: "dp-1",
    topic: "Dynamic Programming",
    question: "DP usually optimizes by storing:",
    options: ["Only final answer", "Intermediate results", "Input values", "Tree edges"],
    correctOptionIndex: 1,
  },
  {
    id: "greedy-1",
    topic: "Greedy",
    question: "Greedy algorithms make decisions based on:",
    options: ["Global optimum at each step", "Local optimum at each step", "Backtracking all paths", "Random choice"],
    correctOptionIndex: 1,
  },
  {
    id: "rec-1",
    topic: "Recursion",
    question: "What is required to avoid infinite recursion?",
    options: ["Memoization only", "Base case", "Tail recursion only", "Queue"],
    correctOptionIndex: 1,
  },
  {
    id: "bigo-1",
    topic: "Complexity",
    question: "Which growth rate is better for large n?",
    options: ["O(n^2)", "O(n log n)", "O(2^n)", "O(n!)"],
    correctOptionIndex: 1,
  },
  {
    id: "trie-1",
    topic: "Trie",
    question: "Trie is mainly used for:",
    options: ["Range sums", "Prefix-based search", "Shortest path", "Balancing trees"],
    correctOptionIndex: 1,
  },
  {
    id: "hash-1",
    topic: "Hashing",
    question: "Average-case lookup in hash table is:",
    options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
    correctOptionIndex: 0,
  },
  {
    id: "dp-2",
    topic: "Dynamic Programming",
    question: "0/1 Knapsack is commonly solved using:",
    options: ["Greedy only", "Dynamic Programming", "Binary Search", "Union-Find"],
    correctOptionIndex: 1,
  },
];

