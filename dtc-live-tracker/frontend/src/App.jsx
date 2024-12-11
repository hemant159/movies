import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LiveTrackerPage from './pages/LiveTrackerPage';
import TestPage from './pages/TestPage';
import SchedulingPage from './pages/SchedulingPage';
import RoutePlannerPage from './pages/RoutePlannerPage';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
    <Router>
      <Routes>
        <Route path="/live-tracker" element={<LiveTrackerPage />} />
        <Route path="/" element={<TestPage />} />
        <Route path="/scheduling" element={<SchedulingPage />} />
        <Route path="/route-planner" element={<RoutePlannerPage />} />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
