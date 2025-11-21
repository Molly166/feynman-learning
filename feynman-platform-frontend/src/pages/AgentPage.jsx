// src/pages/AgentPage.jsx
import { useState, useRef, useEffect } from 'react';
import apiClient from '../api/axios';
import './AgentPage.css';

function AgentPage() {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: '你好！我是你的专属知识库AI助手。有什么可以帮你的吗？' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // 自动滚动到最新消息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        const question = inputValue;
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await apiClient.post('/ai/rag-qa', { question });
            const botMessage = { sender: 'bot', text: response.data.answer };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error fetching AI response:', error);
            let errorText = error.response?.data?.msg || '抱歉，我遇到了一些问题，请稍后再试。';
            
            // 如果有提示信息，也显示出来
            if (error.response?.data?.hint) {
                errorText += `\n\n💡 ${error.response.data.hint}`;
            }
            
            const errorMessage = { 
                sender: 'bot', 
                text: errorText
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="agent-page">
            <div className="agent-header">
                <h2>AI 知识库助手</h2>
                <p>基于你的知识点进行智能问答</p>
            </div>
            <div className="chat-window">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <div className="message-bubble">{msg.text}</div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message bot">
                        <div className="message-bubble typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="在这里输入你的问题..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? '思考中...' : '发送'}
                </button>
            </form>
        </div>
    );
}

export default AgentPage;

