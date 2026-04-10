import User from "../models/User.js";
import { getChatAIConfiguration } from "../config/openai-config.js";
import { OpenAIApi } from "openai";
const DSA_SYSTEM_PROMPT = {
    role: "system",
    content: "You are an expert Data Structures & Algorithms (DSA) tutor. Only answer questions that are clearly about DSA (data structures, algorithms, complexity, Big-O, coding interview-style DSA problems, proofs/intuition, trade-offs). If the user asks anything outside DSA, refuse briefly and ask them to ask a DSA question.\n\nALWAYS respond in Markdown using this exact numbered structure, and each section must contain bullet points (use '-' bullets):\n1. Definition (simple)\n- ...\n\n2. Key properties and points\n- ...\n\n3. Time and space complexity\n- ...\n\n4. Real life example\n- ...\n\n5. When to use\n- ...\n\nOutput quality rules:\n- Give detailed answers by default.\n- Write at least 3 bullet points in each section.\n- In section 3, include best/average/worst case when relevant.\n- In section 4, include one practical scenario and one coding interview style scenario when relevant.\n- Use simple language, but keep technical accuracy.\n- Do not write paragraph-only output.",
};
/** Keeps prompts smaller so you hit TPM limits less often. */
const MAX_HISTORY_MESSAGES = 40;
function isAxiosLike(err) {
    return (typeof err === "object" &&
        err !== null &&
        ("isAxiosError" in err || "response" in err));
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function getRetryAfterMs(err) {
    if (!isAxiosLike(err))
        return null;
    const raw = err.response?.headers?.["retry-after"];
    if (raw === undefined || raw === null)
        return null;
    const sec = Number(raw);
    if (!Number.isFinite(sec))
        return null;
    return Math.min(Math.max(sec * 1000, 0), 60_000);
}
async function createChatCompletionWithRetry(openai, params) {
    const maxAttempts = 5;
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await openai.createChatCompletion(params);
        }
        catch (e) {
            lastError = e;
            if (!isAxiosLike(e) || e.response?.status !== 429) {
                throw e;
            }
            if (attempt === maxAttempts)
                break;
            const waitMs = getRetryAfterMs(e) ?? Math.min(1000 * 2 ** (attempt - 1), 16_000);
            await delay(waitMs);
        }
    }
    throw lastError;
}
function formatStructuredFallback(raw) {
    return [
        "1. Definition (simple)",
        `- ${raw || "Not available."}`,
        "",
        "2. Key properties and points",
        "- Not clearly provided by model.",
        "",
        "3. Time and space complexity",
        "- Not clearly provided by model.",
        "",
        "4. Real life example",
        "- Not clearly provided by model.",
        "",
        "5. When to use",
        "- Not clearly provided by model.",
    ].join("\n");
}
function ensureStructuredAnswer(content) {
    const hasSections = content.includes("1. Definition") &&
        content.includes("2. Key properties") &&
        content.includes("3. Time and space complexity") &&
        content.includes("4. Real life example") &&
        content.includes("5. When to use");
    const hasBullets = /(^|\n)-\s+/m.test(content);
    if (hasSections && hasBullets)
        return content;
    return formatStructuredFallback(content.trim());
}
export const generateChatCompletion = async (req, res, next) => {
    const { message } = req.body;
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user)
            return res
                .status(401)
                .json({ message: "User not registered OR Token malfunctioned" });
        // grab chats of user (trim history to reduce tokens / rate-limit pressure)
        const history = (user.chats ?? []).map(({ role, content }) => ({
            role,
            content,
        }));
        const trimmed = history.length > MAX_HISTORY_MESSAGES
            ? history.slice(-MAX_HISTORY_MESSAGES)
            : history;
        const chats = [
            DSA_SYSTEM_PROMPT,
            ...trimmed,
            { content: message, role: "user" },
        ];
        user.chats.push({ content: message, role: "user" });
        const { configuration, model } = getChatAIConfiguration();
        const openai = new OpenAIApi(configuration);
        const chatResponse = await createChatCompletionWithRetry(openai, {
            model,
            messages: chats,
        });
        const assistant = chatResponse.data.choices[0]?.message;
        if (!assistant?.content) {
            return res
                .status(502)
                .json({ message: "No reply from the model. Try again." });
        }
        const structuredContent = ensureStructuredAnswer(assistant.content);
        user.chats.push({
            role: assistant.role,
            content: structuredContent,
        });
        await user.save();
        return res.status(200).json({ chats: user.chats });
    }
    catch (error) {
        console.error(error);
        if (isAxiosLike(error) && error.response) {
            const status = error.response?.status;
            const openaiBody = error.response?.data;
            const detail = openaiBody?.error?.message ?? error.message ?? "AI request failed";
            if (status === 429) {
                return res.status(429).json({
                    message: "Rate limit (429) after retries. If you use OpenAI, free tier limits are strict — add GROQ_API_KEY in .env (free tier at console.groq.com) or wait and try again.",
                });
            }
            if (status === 401) {
                return res.status(502).json({
                    message: "API rejected the key. Check GROQ_API_KEY or OPENAI_API_KEY in .env and restart the server.",
                });
            }
            return res.status(502).json({ message: detail });
        }
        const msg = error instanceof Error ? error.message : "Something went wrong";
        return res.status(500).json({ message: msg });
    }
};
export const sendChatsToUser = async (req, res, next) => {
    try {
        //user token check
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send("User not registered OR Token malfunctioned");
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        return res.status(200).json({ message: "OK", chats: user.chats });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause: error.message });
    }
};
export const deleteChats = async (req, res, next) => {
    try {
        //user token check
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send("User not registered OR Token malfunctioned");
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        //@ts-ignore
        user.chats = [];
        await user.save();
        return res.status(200).json({ message: "OK" });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause: error.message });
    }
};
//# sourceMappingURL=chat-controllers.js.map