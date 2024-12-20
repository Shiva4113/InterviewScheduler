import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user_type, setUsertype] = useState('interviewee');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (email && password) {
      try {
        const response = await fetch('http://127.0.0.1:8000/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, user_type })
        });
  
        const data = await response.json();
        
        if (response.ok) {
          sessionStorage.setItem('userName', data.name);
          sessionStorage.setItem('userId', data.id);
          sessionStorage.setItem('userType', user_type);
          sessionStorage.setItem('userEmail', email);
          
          if (user_type === 'interviewee') {
            navigate('/interviewee');
          } else {
            navigate('/interviewer');
          }
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
      } catch (err) {
        console.error('Login failed:', err);
        setError('An error occurred. Please try again later.');
      }
    } else {
      setError('Please enter both email and password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white pt-10 pb-10 pl-20 pr-20 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label>
              <input
                type="radio"
                name="role"
                value="interviewee"
                checked={user_type === 'interviewee'}
                onChange={() => setUsertype('interviewee')}
              />
              Interviewee
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="interviewer"
                checked={user_type === 'interviewer'}
                onChange={() => setUsertype('interviewer')}
              />
              Interviewer
            </label>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign in
          </button>
        </form>
        <div className="text-sm text-center mt-4">
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
