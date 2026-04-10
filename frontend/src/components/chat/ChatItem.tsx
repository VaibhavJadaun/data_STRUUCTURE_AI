import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import { useAuth } from "../../context/useAuth";
import { getUserInitials } from "../../utils/userInitials";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const ChatItem = ({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) => {
  const auth = useAuth();
  return role == "assistant" ? (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d5612",
        gap: 2,
        borderRadius: 2,
        my: 1,
      }}
    >
      <Avatar sx={{ ml: "0" }}>
        <img src="openai.png" alt="openai" width={"30px"} />
      </Avatar>
      <Box>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <Typography sx={{ fontSize: "20px" }}>{children}</Typography>,
            li: ({ children }) => (
              <Typography component="li" sx={{ fontSize: "18px", ml: 3 }}>
                {children}
              </Typography>
            ),
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <SyntaxHighlighter
                  style={coldarkDark}
                  language={match?.[1] || "javascript"}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d56",
        gap: 2,
        borderRadius: 2,
      }}
    >
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "#DBD8E3" }}>
        {getUserInitials(auth?.user?.name)}
      </Avatar>
      <Box>
        <Typography sx={{ fontSize: "20px" }}>{content}</Typography>
      </Box>
    </Box>
  );
};

export default ChatItem;
