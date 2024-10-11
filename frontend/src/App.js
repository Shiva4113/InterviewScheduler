import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CollegeInterviewPortal from './components/CollegeInterviewPortal';
import InterviewerPortal from './components/InterviewerPortal';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/interviewee" element={<CollegeInterviewPortal />} />
          <Route path="/interviewer" element={<InterviewerPortal />} />
          <Route path="/" element={<Navigate replace to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;