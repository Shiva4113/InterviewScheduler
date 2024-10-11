import React, { useState, Fragment, useRef } from 'react'
import { Bell, Calendar, ChevronDown, FileText, User, BookOpen, GraduationCap, Info, Upload } from 'lucide-react'
import { Menu, Transition, Dialog } from '@headlessui/react'

import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

export default function InterviewerPortal() {
  const [userName, setUserName] = useState("Dr. Jane Smith")
  const [position, setPosition] = useState("Associate Professor of Computer Science")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [timetableImage, setTimetableImage] = useState(null)
  const fileInputRef = useRef(null)

  const upcomingInterviews = [
    { id: 1, name: "John Doe", position: "Assistant Professor", date: "June 15, 2023", time: "2:00 PM" },
    { id: 2, name: "Alice Johnson", position: "Associate Professor", date: "June 20, 2023", time: "10:00 AM" },
    { id: 3, name: "Bob Williams", position: "Assistant Professor", date: "June 22, 2023", time: "3:00 PM" },
  ]

  const openCandidateModal = (candidate) => {
    setSelectedCandidate(candidate)
    setIsModalOpen(true)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.substr(0, 5) === "image") {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTimetableImage(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      alert("Please upload an image file")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Interviewer Portal</h1>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
              <User className="h-5 w-5 mr-2" />
              <span>{userName}</span>
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
                        className={`${
                          active ? 'bg-indigo-500 text-white' : 'text-gray-900'
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
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
                  <h3 className="text-xl font-semibold mb-4">Interview Schedule</h3>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                      <span className="font-medium">This Week</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        2 Interviews
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Next Week</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        1 Interview
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">This Month</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        5 Interviews
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Your Timetable</h3>
                  {timetableImage ? (
                    <div className="relative">
                      <img src={timetableImage} alt="Timetable" className="w-full rounded-lg" />
                      <Button 
                        onClick={() => fileInputRef.current.click()} 
                        className="absolute top-2 right-2 bg-white text-gray-800 hover:bg-gray-100"
                      >
                        Update
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="timetable-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <input 
                          id="timetable-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileUpload}
                          ref={fileInputRef}
                        />
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Full Schedule
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Interview Guidelines
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Evaluation Forms
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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