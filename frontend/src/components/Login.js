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

    try {
      // Make a POST request to the backend with email, password, and user_type
      const response = await axios.post('http://127.0.0.1:8000/login/', {
        email,
        password,
        user_type
      });

      // Check if the response contains the user details
      if (response.data && response.data.id && response.data.name) {
        console.log('Login successful:', response.data);

        // Store user details (id and name) in local storage or a global state
        localStorage.setItem('user_id', response.data.id);
        localStorage.setItem('user_name', response.data.name);

        // Redirect based on user type
        if (user_type === 'interviewee') {
          navigate('/interviewee');
        } else {
          navigate('/interviewer');
        }
      } else {
        setError('Unexpected response from server.');
        alert('Unexpected response from server. Please try again.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials and try again.');
      alert(err.response?.data?.detail || 'Login failed. Please check your credentials and try again.');
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
