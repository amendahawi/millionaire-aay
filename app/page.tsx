"use client";

import React, { useState } from 'react';
import { openai } from '../openaiConfig';

const HomePage = () => {
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [responses, setResponses] = useState<string[]>([]);
  const [responseInput, setResponseInput] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isResult, setIsResult] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [millionairePotential, setMillionairePotential] = useState<string>('');

  const startQuestionnaire = async () => {
    setIsStarted(true);
    await askNextQuestion();
  };

  const askNextQuestion = async () => {
    try {
      const questions = [
        "What university do you attend or plan to attend?",
        "What are your long-term career goals?",
        "How would you describe your work ethic?",
        "What's your approach to personal finance and saving?",
        "Do you have any entrepreneurial aspirations?"
      ];

      setCurrentQuestion(questions[questionCount]);
      setQuestionCount(questionCount + 1);
    } catch (error) {
      console.error('Error generating question:', error);
      setMessage('Failed to generate question');
    }
  };

  const handleResponseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResponseInput(event.target.value);
  };

  const handleSubmitResponse = async () => {
    const newResponses = [...responses, responseInput];
    setResponses(newResponses);
    setResponseInput('');

    if (questionCount >= 5) {
      try {
        const prompt = `Based on the following responses to a questionnaire about becoming a millionaire, analyze the likelihood of this person achieving millionaire status:
        1. University: ${newResponses[0]}
        2. Career goals: ${newResponses[1]}
        3. Work ethic: ${newResponses[2]}
        4. Personal finance approach: ${newResponses[3]}
        5. Entrepreneurial aspirations: ${newResponses[4]}
        
        Provide a detailed analysis of their millionaire potential based on these factors. Keep your answer concise. Start with either "You are likely to be a millionaire" or "You are not likely to be a millionaire" based on your analysis.`;

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an AI analyzing the likelihood of someone becoming a millionaire based on their responses to a questionnaire.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const text = response.choices[0]?.message?.content?.trim() || '';
        setResult(text);
        setMillionairePotential(text.startsWith("You are likely") ? "You are likely to be a millionaire" : "You are not likely to be a millionaire");
        setIsResult(true);
      } catch (error) {
        console.error('Error determining likelihood:', error);
        setMessage('Failed to determine likelihood');
      }
    } else {
      await askNextQuestion();
    }
  };

  const handleReturnHome = () => {
    setIsStarted(false);
    setIsResult(false);
    setMessage('');
    setCurrentQuestion('');
    setResponses([]);
    setResponseInput('');
    setQuestionCount(0);
    setResult('');
    setMillionairePotential('');
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>🚀 Millionaire Quest 💰</h1>
        <p>Discover your millionaire potential through our insightful questionnaire!</p>
      </div>

      {!isStarted && (
        <div className="game-intro">
          <button onClick={startQuestionnaire} className="start-quest-btn">
            🔮 Start Your Quest
          </button>
        </div>
      )}

      {currentQuestion && !isResult && (
        <div className="question-arena">
          <div className="progress-bar">
            <div className="progress" style={{width: `${questionCount * 20}%`}}></div>
          </div>
          <h2>Question {questionCount} of 5</h2>
          <div className="question-bubble">
            <p>{currentQuestion}</p>
          </div>
          <div className="response-area">
            <input
              type="text"
              value={responseInput}
              onChange={handleResponseChange}
              placeholder="Type your answer here..."
              className="response-input"
            />
            <button onClick={handleSubmitResponse} className="submit-btn">
              Submit Answer
            </button>
          </div>
        </div>
      )}

      {isResult && (
        <div className="result-reveal">
          <h2>🎉 Your Millionaire Potential Analysis 🎉</h2>
          <h3>{millionairePotential}</h3>
          <div className="result-scroll">
            <p>{result}</p>
          </div>
          <button onClick={handleReturnHome} className="play-again-btn">
            Take the Quiz Again
          </button>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default HomePage;
