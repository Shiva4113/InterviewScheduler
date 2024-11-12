import React, { useState, useEffect, Fragment } from 'react';
import { Calendar, ChevronDown, User, Clock } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useNavigate } from 'react-router-dom';

export default function CollegeInterviewPortal() {
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [position, setPosition] = useState("Interviewee");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from sessionStorage
    const storedName = sessionStorage.getItem('userName');
    const storedType = sessionStorage.getItem('userType');
    
    if (storedName) setUserName(storedName);
    if (storedType) setUserType(storedType);
  }, []); // Empty dependency array means this runs once on mount

  const availableSlots = [
    { id: 1, date: "June 15, 2023", time: "2:00 PM", interviewer: "Dr. Smith" },
    { id: 2, date: "June 15, 2023", time: "4:00 PM", interviewer: "Dr. Johnson" },
    { id: 3, date: "June 16, 2023", time: "10:00 AM", interviewer: "Dr. Williams" },
    { id: 4, date: "June 16, 2023", time: "3:00 PM", interviewer: "Dr. Brown" },
  ];

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">College Interview Portal</h1>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
              <User className="h-5 w-5 mr-2" />
              <span>{userName} ({userType})</span>
              <ChevronDown className="h-4 w-4 ml-2" />
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
                <h3 className="text-xl font-semibold mb-4">Upcoming Interview Rounds</h3>
                <ul className="space-y-4">
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium">Teaching Demonstration</p>
                        <p className="text-sm text-gray-500">
                          {selectedSlot ? `${selectedSlot.date} - ${selectedSlot.time}` : "Not scheduled"}
                        </p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Clock className="h-4 w-4 mr-2" />
                          Choose Timeslot
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Choose Interview Timeslot</DialogTitle>
                        </DialogHeader>
                        <RadioGroup value={selectedSlot?.id} onValueChange={(value) => handleSlotSelection(availableSlots.find(slot => slot.id === parseInt(value)))}>
                          {availableSlots.map((slot) => (
                            <div key={slot.id} className="flex items-center space-x-2 mb-2">
                              <RadioGroupItem value={slot.id.toString()} id={`slot-${slot.id}`} />
                              <Label htmlFor={`slot-${slot.id}`}>
                                {slot.date} - {slot.time} with {slot.interviewer}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        <Button onClick={() => setSelectedSlot(null)}>Clear Selection</Button>
                      </DialogContent>
                    </Dialog>
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">Faculty Panel Interview</p>
                      <p className="text-sm text-gray-500">June 20, 2023 - 10:00 AM</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Application Status</h3>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Round 1: Initial Screening</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Passed
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Round 2: Research Presentation</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Passed
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Round 3: Teaching Demonstration</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Upcoming
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Round 4: Faculty Panel Interview</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Pending
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
