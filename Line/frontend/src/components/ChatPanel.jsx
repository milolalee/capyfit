import React, { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';

function ChatPanel({
  conversation,
  messages,
  isLoading,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onKeyPress,
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Select a conversation
          </h2>
          <p className="text-gray-500">
            Choose a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              User: {conversation.user_id}
            </h2>
            <p className="text-sm text-gray-500">
              {conversation.oa_name} • Status: {conversation.status}
            </p>
          </div>
          {conversation.assigned_agent && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Agent:</span>{' '}
              {conversation.assigned_agent}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_type === 'agent' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`message-bubble px-4 py-2 rounded-lg ${
                    message.sender_type === 'agent'
                      ? 'message-agent'
                      : 'message-user'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_type === 'agent'
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={messageInput}
            onChange={(e) => onMessageInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={onSendMessage}
            disabled={!messageInput.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

export default ChatPanel;
