import React from 'react';
import { formatDistanceToNow } from 'date-fns';

function Sidebar({
  conversations,
  activeConversationId,
  oaAccounts,
  selectedOAId,
  selectedStatus,
  isLoading,
  onSelectConversation,
  onSelectOA,
  onSelectStatus,
  onRefresh,
}) {
  const statusOptions = [
    { value: null, label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Inbox</h1>
        
        {/* Filters */}
        <div className="space-y-3">
          {/* OA Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Filter by OA
            </label>
            <select
              value={selectedOAId || ''}
              onChange={(e) => onSelectOA(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All OA Accounts</option>
              {oaAccounts.map((oa) => (
                <option key={oa.id} value={oa.id}>
                  {oa.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus || ''}
              onChange={(e) => onSelectStatus(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value || ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                activeConversationId === conversation.id
                  ? 'bg-blue-50 border-l-4 border-l-blue-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    User: {conversation.user_id}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {conversation.oa_name}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {formatDistanceToNow(new Date(conversation.last_message_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    conversation.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {conversation.status}
                </span>
                {conversation.assigned_agent && (
                  <span className="text-xs text-gray-500">
                    Agent: {conversation.assigned_agent}
                  </span>
                )}
              </div>

              {/* Last Message Preview */}
              {conversation.last_message && (
                <p className="text-sm text-gray-600 truncate">
                  {conversation.last_message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

export default Sidebar;
