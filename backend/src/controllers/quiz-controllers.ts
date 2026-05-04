import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import QuizResult from "../models/QuizResult.js";
import { COOKIE_NAME } from "../utils/constants.js";
import { DSA_QUIZ_QUESTIONS } from "../data/quiz-questions.js";

type SubmittedAnswer = {
  questionId: string;
  selectedOptionIndex: number;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

function getUserIdFromSignedCookie(req: Request): string | null {
  const token = req.signedCookies?.[COOKIE_NAME];
  if (!token || typeof token !== "string") return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return typeof decoded?.id === "string" ? decoded.id : null;
  } catch {
    return null;
  }
}

export const getQuizQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limitRaw = Number(req.query.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 5;

    // Shuffle questions so each attempt feels new.
    const shuffled = [...DSA_QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(limit, DSA_QUIZ_QUESTIONS.length));

    // Never expose correct answer index to client.
    const safePayload = selected.map(({ correctOptionIndex, ...question }) => question);
    return res.status(200).json({
      questions: safePayload,
      totalAvailable: DSA_QUIZ_QUESTIONS.length,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unable to fetch questions";
    return res.status(500).json({ message: msg });
  }
};

export const submitQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const answers = (req.body?.answers ?? []) as SubmittedAnswer[];
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(422).json({ message: "answers are required" });
    }

    const answerMap = new Map(
      DSA_QUIZ_QUESTIONS.map((question) => [question.id, question.correctOptionIndex])
    );

    const score = answers.reduce((acc, answer) => {
      if (
        typeof answer?.questionId !== "string" ||
        typeof answer?.selectedOptionIndex !== "number"
      ) {
        return acc;
      }
      const correctIndex = answerMap.get(answer.questionId);
      if (correctIndex === undefined) return acc;
      return acc + (correctIndex === answer.selectedOptionIndex ? 1 : 0);
    }, 0);

    const totalQuestions = answers.length;
    const userId = getUserIdFromSignedCookie(req);

    await QuizResult.create({
      userId: userId ?? undefined,
      score,
      totalQuestions,
      date: new Date(),
    });

    return res.status(200).json({
      score,
      totalQuestions,
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unable to submit quiz";
    return res.status(500).json({ message: msg });
  }
};

