"use client";

import React, { useState, useEffect } from 'react';
import { openai } from '../openaiConfig';
import './HomePage.css'; // Import the CSS file

const HomePage = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [responses, setResponses] = useState<string[]>([]);
  const [responseInput, setResponseInput] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [isUploadClicked, setIsUploadClicked] = useState<boolean>(false);
  const [isResult, setIsResult] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Client-side only code
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    } else {
      setFile(null);
    }
  };

  const handleClick = async () => {
    if (!file) {
      setMessage('Please upload a resume file.');
      return;
    }

    setIsUploadClicked(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target?.result;
      if (typeof fileContent === 'string') {
        try {
          const maxContentLength = 10000;
          const truncatedContent = fileContent.length > maxContentLength 
            ? fileContent.substring(0, maxContentLength) 
            : fileContent;

          const prompt = `Based on the following resume content, please ask the user a personalized question mentioning specific points from their resume to determine if they are likely to become a millionaire: ${truncatedContent}`;

          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are an AI asking personalized questions mentioning specific points from the resume to determine if someone is likely to become a millionaire.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          const text = response.choices[0]?.message?.content?.trim() || '';
          setCurrentQuestion(text);
          setQuestionCount(1);
        } catch (error) {
          console.error('Error generating question:', error);
          setMessage('Failed to generate question');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResponseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResponseInput(event.target.value);
  };

  const handleSubmitResponse = async () => {
    const newResponses = [...responses, responseInput];
    setResponses(newResponses);
    setResponseInput('');

    if (questionCount >= 4) {
      try {
        const prompt = `Based on the following resume content and responses, determine the likelihood of the user becoming a millionaire: ${responses.join(' ')} ${responseInput}`;

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an AI determining the likelihood of someone becoming a millionaire.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const text = response.choices[0]?.message?.content?.trim() || '';
        setResult(text);
        setIsResult(true);
      } catch (error) {
        console.error('Error determining likelihood:', error);
        setMessage('Failed to determine likelihood');
      }
    } else {
      try {
        const prompt = `Based on the following resume content and previous responses, please ask the user the next personalized question mentioning specific points from their resume to determine if they are likely to become a millionaire: ${responses.join(' ')} ${responseInput}`;

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an AI asking personalized questions mentioning specific points from the resume to determine if someone is likely to become a millionaire.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const text = response.choices[0]?.message?.content?.trim() || '';
        setCurrentQuestion(text);
        setQuestionCount(questionCount + 1);
      } catch (error) {
        console.error('Error generating next question:', error);
        setMessage('Failed to generate next question');
      }
    }
  };

  const handleReturnHome = () => {
    setIsUploadClicked(false);
    setIsResult(false);
    setMessage('');
    setFile(null);
    setCurrentQuestion('');
    setResponses([]);
    setResponseInput('');
    setQuestionCount(0);
    setResult('');
  };

  return (
    <div className="container">
      {!isUploadClicked && <h1>Will you become a millionaire?</h1>}
      {!isUploadClicked && <input type="file" onChange={handleFileChange} />}
      {!isUploadClicked && <button onClick={handleClick}>Upload</button>}
      {currentQuestion && !isResult && (
        <div>
          <p>{currentQuestion}</p>
          <input
            type="text"
            value={responseInput}
            onChange={handleResponseChange}
          />
          <button onClick={handleSubmitResponse}>Submit</button>
        </div>
      )}
      {isResult && (
        <div>
          <p>{result}</p>
          <button onClick={handleReturnHome}>Return to Homepage</button>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default HomePage;
