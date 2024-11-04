import React, { useState } from 'react'
import { Bell, Calendar, ChevronDown, FileText, User, BookOpen, GraduationCap, Clock } from 'lucide-react'

import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"

export default function CollegeInterviewPortal() {
  const [userName, setUserName] = useState("John Doe")
  const [position, setPosition] = useState("Assistant Professor of Computer Science")
  const [selectedSlot, setSelectedSlot] = useState(null)

  // Mock data for available slots
  const availableSlots = [
    { id: 1, date: "June 15, 2023", time: "2:00 PM", interviewer: "Dr. Smith" },
    { id: 2, date: "June 15, 2023", time: "4:00 PM", interviewer: "Dr. Johnson" },
    { id: 3, date: "June 16, 2023", time: "10:00 AM", interviewer: "Dr. Williams" },
    { id: 4, date: "June 16, 2023", time: "3:00 PM", interviewer: "Dr. Brown" },
  ]

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">College Interview Portal</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{userName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
  )
}