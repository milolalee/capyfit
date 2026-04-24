import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useStore from './store/useStore';
import Inbox from './pages/Inbox';

function App() {
  const { connectSocket } = useStore();

  useEffect(() => {
    connectSocket();

    return () => {
      useStore.getState().disconnectSocket();
    };
  }, [connectSocket]);

  return (
    <div className="h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Inbox />} />
        <Route path="/inbox" element={<Inbox />} />
      </Routes>
    </div>
  );
}

export default App;
