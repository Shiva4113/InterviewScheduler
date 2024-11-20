import React, { useState, useEffect, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Calendar, ChevronDown, User, Info, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { useNavigate } from 'react-router-dom';

export default function InterviewerPortal() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [userId, setUserId] = useState("");
  const [freeSlots, setFreeSlots] = useState([]);  // Initialize as empty array
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [position, setPosition] = useState("");
  const [upcomingInterviews, setInterviews] = useState([]);
  const [resultForm, setResultForm] = useState({ result: '', remarks: '', round_no: 1 });
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    // Get user data from sessionStorage
    const storedName = sessionStorage.getItem('userName');
    const storedType = sessionStorage.getItem('userType');
    const storedId = sessionStorage.getItem('userId');
    const storedPosition = sessionStorage.getItem('department'); 
    
    if (storedName) setUserName(storedName);
    if (storedType) setUserType(storedType);
    if (storedId) setUserId(storedId);
    if (storedPosition) setPosition(storedPosition); 
  
    // Fetch free slots using stored ID
    const fetchInterviews = async () => {
      try {
        const response = await fetch(`http://localhost:8000/fetch_interviews/${storedId}`);
        const data = await response.json();
        setInterviews(data);
      } catch (err) {
        console.error('Error fetching interviews:', err);
      }
    };
  
    fetchInterviews(); // Add this line to call the function
  }, []);

  const addFreeSlot = async (e) => {
    e.preventDefault();
    if (newSlotDate && newSlotTime) {
      const formattedDate = new Date(newSlotDate).toISOString().split('T')[0];
      const formattedTime = newSlotTime + ':00';

      try {
        const response = await fetch('http://localhost:8000/add_timeslot/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userId,
            role: userType,
            date: formattedDate,
            time: formattedTime,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();
        
        // Immediately fetch updated slots after successful addition
        const slotsResponse = await fetch(`http://localhost:8000/free_slots/${userId}`);
        const slotsData = await slotsResponse.json();
        
        const formattedSlots = slotsData.map(slot => ({
          date: slot[0],
          time: slot[1]
        }));
        
        setFreeSlots(formattedSlots);
        setNewSlotDate('');
        setNewSlotTime('');
        
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const deleteFreeSlot = async (slot) => {
    try {
      const response = await fetch(
        `http://localhost:8000/delete_slot/${userId}/${slot.date}/${slot.time}`,
        {
          method: 'GET'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete slot');
      }

      // Refresh slots list after deletion
      const slotsResponse = await fetch(`http://localhost:8000/free_slots/${userId}`);
      const slotsData = await slotsResponse.json();
      
      const formattedSlots = slotsData.map(slot => ({
        date: slot[0],
        time: slot[1]
      }));
      
      setFreeSlots(formattedSlots);
      
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('dalfjjdjlf da',resultForm)
      const response = await fetch(
        `http://localhost:8000/add_result/${selectedCandidate.interview_id}/${userId}/${selectedCandidate.candidate_id}/${resultForm.result}/${resultForm.remarks}/${selectedCandidate.round_no}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to submit result');
      }
  
      alert('Result submitted successfully');
      setResultForm({ result: '', remarks: '', round_no: 1 });
    } catch (error) {
      console.error('Error submitting result:', error);
      alert('Failed to submit result');
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const openCandidateModal = (interview) => {
    console.log('Opening candidate modal with interview:', interview);
    setSelectedCandidate(interview);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Interviewer Portal</h1>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
              <User className="h-5 w-5 mr-2" />
              <span>{userName}</span>
              <ChevronDown className="h-5 w-5 ml-2" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-indigo-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      >
                        Profile
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-indigo-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      >
                        Settings
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-red-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      >
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h2>
          <p className="text-xl text-gray-600 mb-6">Position: {position}</p>
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Upcoming Interviews</h3>
                <ul className="space-y-4">
                  {upcomingInterviews.map((interview) => (
                    <li key={interview.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium">{interview.name}</p>
                          <p className="text-sm text-gray-500">{interview.interview_date} - {interview.interview_time}</p>
                        </div>
                      </div>
                      <Button onClick={() => {openCandidateModal(interview)
                      console.log(interview)}}>
                        <Info className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        onClick={() => {
                          console.log(interview)
                          setSelectedCandidate(interview);
                          setIsResultModalOpen(true);
                        }}
                        className="ml-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Result
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Free Slots</h3>
                <form onSubmit={addFreeSlot} className="mb-4">
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={newSlotDate}
                      onChange={(e) => setNewSlotDate(e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <input
                      type="time"
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <Button type="submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Slot
                    </Button>
                  </div>
                </form>
                <ul className="space-y-2">
                  {Array.isArray(freeSlots) && freeSlots.map((slot) => (
                    <li key={slot.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
                      <span>
                        <span className="font-bold">{slot.date}</span>
                        {' - '}
                        <span>{slot.time}</span>
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => deleteFreeSlot(slot)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete slot</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Interview Result</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResultSubmit} className="mt-4">
            <div className="space-y-4">
              <div>
                <Label>Result</Label>
                <select
                  value={resultForm.result}
                  onChange={(e) => setResultForm({...resultForm, result: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Result</option>
                  <option value="PASS">Pass</option>
                  <option value="FAIL">Fail</option>
                </select>
              </div>
              <div>
                <Label>Remarks</Label>
                <textarea
                  value={resultForm.remarks}
                  onChange={(e) => setResultForm({...resultForm, remarks: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsResultModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Result
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-opacity-75">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-sm text-gray-500"><strong>Name:</strong> {selectedCandidate?.name}</p>
            <p className="text-sm text-gray-500"><strong>Department:</strong> {selectedCandidate?.department}</p>
            <p className="text-sm text-gray-500"><strong>Interview Date:</strong> {selectedCandidate?.interview_date}</p>
            <p className="text-sm text-gray-500"><strong>Interview Time:</strong> {selectedCandidate?.interview_time}</p>
            <p className="text-sm text-gray-500"><strong>Education:</strong> {selectedCandidate?.education}</p>
            <p className="text-sm text-gray-500"><strong>Skills:</strong> {selectedCandidate?.skills}</p>
            <p className="text-sm text-gray-500"><strong>Experience:</strong> {selectedCandidate?.experience}</p>
            <p className="text-sm text-gray-500"><strong>Publications:</strong> {selectedCandidate?.publications}</p>
          </div>
          <div className="mt-4">
            <Button onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}