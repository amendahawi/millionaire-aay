"use client";

import React, { useState, useEffect } from "react";
import { openai } from "../openaiConfig";

const HomePage = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    age: "",
    school: "",
    career: "",
  });
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [userResponse, setUserResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [millionairePotential, setMillionairePotential] = useState<boolean | null>(null);

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarted(true);
    setIsLoading(true);
    await startConversation();
    setIsLoading(false);
  };

  const startConversation = async () => {
    try {
      const initialPrompt = `You are an AI assessing millionaire potential. Start a conversation with the user to assess their potential to become a millionaire. Ask questions one at a time, waiting for the user's response before asking the next question. After 4 messages, provide a final assessment. Begin by greeting ${userInfo.name} and asking the first question.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: initialPrompt },
          { role: "user", content: `Name: ${userInfo.name}, Age: ${userInfo.age}, School: ${userInfo.school}, Career: ${userInfo.career}` },
        ],
      });

      const aiMessage = response.choices[0]?.message?.content?.trim() || "";
      setMessages([
        { role: "assistant", content: aiMessage },
      ]);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setMessages([{ role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    }
  };

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userResponse.trim()) return;

    setMessages(prevMessages => [...prevMessages, { role: "user", content: userResponse }]);
    setUserResponse("");
    setIsLoading(true);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system" as const, content: "You are an AI assessing millionaire potential. Continue the conversation, asking relevant questions. After 4 messages, provide a final assessment." },
          ...messages.map(msg => ({ ...msg, role: msg.role as "assistant" | "user" })),
          { role: "user" as const, content: userResponse },
        ],
      });

      const aiMessage = response.choices[0]?.message?.content?.trim() || "";
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: aiMessage }]);

      if (messages.length >= 7) { // 4 user messages + 4 AI messages (including initial greeting)
        setAssessmentComplete(true);
        // Simple check for positive assessment (you might want to implement a more sophisticated analysis)
        setMillionairePotential(aiMessage.toLowerCase().includes("high potential") || aiMessage.toLowerCase().includes("likely to become a millionaire"));
      }
    } catch (error) {
      console.error("Error in conversation:", error);
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    }

    setIsLoading(false);
  };

  const handleRetry = () => {
    setIsStarted(false);
    setMessages([]);
    setUserResponse("");
    setAssessmentComplete(false);
    setMillionairePotential(null);
    setUserInfo({
      name: "",
      age: "",
      school: "",
      career: "",
    });
  };

  return (
    <div className="">
      <div className="game-header">
        <h1>MILLIONAIRE QUEST!</h1>
        <p><b>Do you have potential to become a millionaire in the next 5 years?</b></p>
      </div>

      {!isStarted ? (
        <form onSubmit={handleUserInfoSubmit} className="user-info-form">
          {Object.entries(userInfo).map(([key, value]) => (
            <div key={key} className="input-group">
              <span className="input-label">{`Your ${key.charAt(0).toUpperCase() + key.slice(1)}:`}</span>
              <input
                type={key === 'age' ? 'number' : 'text'}
                name={key}
                value={value}
                onChange={handleUserInfoChange}
                placeholder={key}
                required
                className="user-info-input"
              />
            </div>
          ))}
          <button type="submit" className="start-quest-btn">Start Quest</button>
        </form>
      ) : assessmentComplete ? (
        <div className="assessment-result">
          <h2>{millionairePotential ? "Congratulations!" : "Keep Working Hard!"}</h2>
          <p>{millionairePotential 
            ? "You have high potential to become a millionaire in the next 5 years!" 
            : "While you may not become a millionaire in the next 5 years, keep pursuing your goals!"}
          </p>
          <button onClick={handleRetry} className="retry-btn">Try Again</button>
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                {message.content}
              </div>
            ))}
          </div>
          <form onSubmit={handleResponseSubmit} className="chat-input-form">
            <input
              type="text"
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Send a message..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HomePage;
