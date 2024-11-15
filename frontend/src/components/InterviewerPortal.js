import React, { useState, useEffect, Fragment } from 'react'
import { Bell, Calendar, ChevronDown, FileText, User, BookOpen, GraduationCap, Info, Plus, Trash2 } from 'lucide-react'
import { Menu, Transition, Dialog } from '@headlessui/react'
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

export default function InterviewerPortal() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [userId, setUserId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [freeSlots, setFreeSlots] = useState([]);  // Initialize as empty array
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [position, setPosition] = useState("");

  const upcomingInterviews = [
    { id: 1, name: "John Doe", position: "Assistant Professor", date: "June 15, 2023", time: "2:00 PM" },
    { id: 2, name: "Alice Johnson", position: "Associate Professor", date: "June 20, 2023", time: "10:00 AM" },
    { id: 3, name: "Bob Williams", position: "Assistant Professor", date: "June 22, 2023", time: "3:00 PM" },
  ]

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
    const fetchFreeSlots = async () => {
      try {
        const response = await fetch(`http://localhost:8000/free_slots/${storedId}`);
        const data = await response.json();
        
        const dateTimeArray = Array.isArray(data) 
          ? data.map(slot => `${slot.date} ${slot.time}`)
          : [];
          
        setFreeSlots(dateTimeArray);
      } catch (error) {
        console.error('Error fetching slots:', error);
        setFreeSlots([]);
      }
    };

    fetchFreeSlots();
  }, []);
  
  const addFreeSlot = async (e) => {
    e.preventDefault();
    if (newSlotDate && newSlotTime) {

      const formattedDate = new Date(newSlotDate).toISOString().split('T')[0]; // YYYY-MM-DD
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

        const data = await response.json();
        console.log(data);
        setFreeSlots([...freeSlots, data]);
        setNewSlotDate('');
        setNewSlotTime('');
      } catch (error) {
        console.error('Error adding free slot:', error);
      }
    }
  };

  const deleteFreeSlot = async (id) => {
    try {
      await axios.delete(`/free-slots/${id}`);
      setFreeSlots(freeSlots.filter(slot => slot.id !== id));
    } catch (error) {
      console.error('Error deleting free slot:', error);
    }
  };

  const openCandidateModal = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleLogout = () => {

    sessionStorage.clear();

    navigate('/login');
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
                          <p className="text-sm text-gray-500">{interview.date} - {interview.time}</p>
                        </div>
                      </div>
                      <Button onClick={() => openCandidateModal(interview)}>
                        <Info className="h-4 w-4 mr-2" />
                        View Details
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
                      <span>{slot.date} - {slot.time}</span>
                      <Button variant="ghost" size="sm" onClick={() => deleteFreeSlot(slot.id)}>
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

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Candidate Details
                  </Dialog.Title>
                  {selectedCandidate && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <strong>Name:</strong> {selectedCandidate.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Position:</strong> {selectedCandidate.position}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Interview Date:</strong> {selectedCandidate.date}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Interview Time:</strong> {selectedCandidate.time}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <Button onClick={() => setIsModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}