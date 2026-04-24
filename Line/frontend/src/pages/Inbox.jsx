import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import useStore from '../store/useStore';
import { messageAPI, oaAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatPanel from '../components/ChatPanel';

function Inbox() {
  const {
    conversations,
    activeConversationId,
    messages,
    oaAccounts,
    selectedOAId,
    selectedStatus,
    isLoadingConversations,
    isLoadingMessages,
    setConversations,
    setActiveConversationId,
    setMessages,
    setOAAccounts,
    setSelectedOAId,
    setSelectedStatus,
    setIsLoadingConversations,
    setIsLoadingMessages,
  } = useStore();

  const [messageInput, setMessageInput] = useState('');

  // Load OA accounts on mount
  useEffect(() => {
    loadOAAccounts();
  }, []);

  // Load conversations when filters change
  useEffect(() => {
    loadConversations();
  }, [selectedOAId, selectedStatus]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const loadOAAccounts = async () => {
    try {
      const { oa_accounts } = await oaAPI.getOAs();
      setOAAccounts(oa_accounts);
    } catch (error) {
      console.error('Failed to load OA accounts:', error);
    }
  };

  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const params = {};
      if (selectedOAId) params.oa_id = selectedOAId;
      if (selectedStatus) params.status = selectedStatus;

      const { conversations: data } = await messageAPI.getConversations(params);
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId) => {
    setIsLoadingMessages(true);
    try {
      const { messages: data } = await messageAPI.getMessages(conversationId);
      setMessages(conversationId, data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversationId) return;

    try {
      await messageAPI.sendMessage(activeConversationId, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        oaAccounts={oaAccounts}
        selectedOAId={selectedOAId}
        selectedStatus={selectedStatus}
        isLoading={isLoadingConversations}
        onSelectConversation={setActiveConversationId}
        onSelectOA={setSelectedOAId}
        onSelectStatus={setSelectedStatus}
        onRefresh={loadConversations}
      />

      {/* Chat Panel */}
      <ChatPanel
        conversation={activeConversation}
        messages={currentMessages}
        isLoading={isLoadingMessages}
        messageInput={messageInput}
        onMessageInputChange={setMessageInput}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
}

export default Inbox;
