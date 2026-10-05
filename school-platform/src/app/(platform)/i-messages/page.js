'use client';

import { useState } from 'react';
import { 
  MessageSquare, Send, User, 
  Search, CheckCheck, Clock 
} from 'lucide-react';

const CONVERSATIONS = [
  {
    id: 'math',
    teacher: 'A. Karimov',
    subject: 'Mathematics & Homeroom Teacher',
    lastMessage: 'Jasur performed exceptionally well in the regional algebra contest.',
    time: '10:30 AM',
    unread: false,
  },
  {
    id: 'physics',
    teacher: 'M. Sobirova',
    subject: 'Physics Teacher',
    lastMessage: 'Hello, please remind Jasur to bring the laboratory notebook on Thursday.',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 'english',
    teacher: 'D. Aliyeva',
    subject: 'English Teacher',
    lastMessage: 'Thank you for updating the contact preferences.',
    time: 'Sep 09',
    unread: false,
  },
];

const INITIAL_MESSAGES = {
  math: [
    { sender: 'teacher', text: 'Good morning! I wanted to inform you about Jasurs performance.', time: '10:15 AM' },
    { sender: 'parent', text: 'Hello Mr. Karimov! Thank you for reaching out. How is he doing?', time: '10:20 AM' },
    { sender: 'teacher', text: 'Jasur performed exceptionally well in the regional algebra contest.', time: '10:30 AM' },
  ],
  physics: [
    { sender: 'teacher', text: 'Hello, please remind Jasur to bring the laboratory notebook on Thursday.', time: 'Yesterday' },
  ],
  english: [
    { sender: 'teacher', text: 'Thank you for updating the contact preferences.', time: 'Sep 09' },
  ],
};

export default function ParentMessagesPage() {
  const [activeChat, setActiveChat] = useState(CONVERSATIONS[0]);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const currentChatMessages = messages[activeChat.id] || [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      sender: 'parent',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
    }));

    setInputText('');
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b theme-border pb-4">
        <h1 className="text-3xl font-serif font-bold">Teacher Messages</h1>
        <p className="text-xs theme-text-secondary mt-1">
          Direct messaging channel between parents and course instructors.
        </p>
      </div>

      {/* Main Chat Interface Layout */}
      <div className="grid md:grid-cols-3 gap-6 h-[600px] theme-bg-card border theme-border rounded-3xl overflow-hidden">
        {/* Left Sidebar: Conversations */}
        <div className="border-r theme-border flex flex-col h-full">
          <div className="p-4 border-b theme-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary" />
              <input
                type="text"
                placeholder="Search instructor..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y theme-border">
            {CONVERSATIONS.map((c) => {
              const isActive = activeChat.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveChat(c)}
                  className={`w-full p-4 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                    isActive ? 'bg-emerald-500/10' : 'hover:bg-emerald-500/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/20">
                    {c.teacher.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-xs truncate">{c.teacher}</h3>
                      <span className="text-[10px] theme-text-secondary font-mono">{c.time}</span>
                    </div>
                    <p className="text-[11px] text-emerald-400 font-mono truncate">{c.subject}</p>
                    <p className="text-xs theme-text-secondary truncate mt-1">{c.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Active Chat Box */}
        <div className="md:col-span-2 flex flex-col h-full theme-bg-page">
          {/* Active Chat Header */}
          <div className="p-4 border-b theme-border theme-bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                {activeChat.teacher.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-xs">{activeChat.teacher}</h3>
                <p className="text-[10px] theme-text-secondary">{activeChat.subject}</p>
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {currentChatMessages.map((msg, idx) => {
              const isParent = msg.sender === 'parent';
              return (
                <div
                  key={idx}
                  className={`flex ${isParent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 ${
                      isParent
                        ? 'bg-emerald-500 text-black font-medium rounded-tr-none'
                        : 'theme-bg-card border theme-border theme-text-primary rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] font-mono block text-right ${
                        isParent ? 'text-black/70' : 'theme-text-secondary'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t theme-border theme-bg-card flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Write a message to ${activeChat.teacher}...`}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-black p-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}