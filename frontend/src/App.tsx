import React, { useState, useEffect, useRef } from 'react';
import { Building2, Users, ClipboardCheck, BedDouble, Info, GripVertical, UserPlus, Check, X, Bell, Search, AlertTriangle, User, Mail, Phone, MapPin, School, Calendar, Trophy } from 'lucide-react';
import * as XLSX from "xlsx";
import Chatbot from './Chatbot';
import AdminPanel from './AdminPanel';

interface UserProfile {
  name: string;
  registrationNumber: string;
  gender: string;
  course: string;
  year: string;
  rank: number;
  email?: string;
  phone?: string;
  address?: string;
}

interface StudentData {
  name: string;
  registrationNumber: string;
  gender: string;
  course: string;
  year: string;
}

interface RoomType {
  id: string;
  block: string;
  type: string;
  capacity: string;
  price: string;
}

interface Friend {
  id: string;
  name: string;
  registrationNumber: string;
  rank: number; // Added rank property
  status: 'pending' | 'accepted' | 'rejected';
}

interface RoommateRequest {
  id: string;
  from: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface GroupData {
  leader: {
    registrationNumber: string;
    rank: number;
  };
  members: {
    registrationNumber: string;
    rank: number;
  }[];
  roomPreferences: {
    key: string;
    value: string;
  }[];
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  _id: string; // Add _id property
}

interface Student {
  id: string;
  name: string;
  registrationNumber: string;
  gender: string;
  course: string;
  year: string;
  rank: number; // Added rank property
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [step, setStep] = useState(0);
  const [loginData, setLoginData] = useState({
    applicationNo: '',
    dob: '',
  });
  const [studentData, setStudentData] = useState<StudentData & { rank: number }>({
    name: '',
    registrationNumber: '',
    gender: '',
    course: '',
    year: '',
    rank: 0,
  });
  const [roomPreferences, setRoomPreferences] = useState<RoomType[]>([
    { id: '1', block: 'Premium', type: '4- Bedded Bunk Non AC Rooms', capacity: '4', price: '₹1,50,000/year' },
    { id: '2', block: 'Premium', type: '4- Bedded Flat Non AC Rooms', capacity: '4', price: '₹1,50,000/year' },
    { id: '3', block: 'Normal', type: '4- Bedded Bunk Non AC Rooms', capacity: '4', price: '₹1,50,000/year' },
    { id: '4', block: 'Normal', type: '4- Bedded Flat Non AC Rooms', capacity: '4', price: '₹1,50,000/year' },
    { id: '5', block: 'Normal', type: '4- Bedded Bunk Non AC Rooms', capacity: '4', price: '₹1,50,000/year' },
    { id: '6', block: 'Normal', type: '6- Bedded Bunk Non AC Rooms', capacity: '6', price: '₹1,50,000/year' },
    { id: '7', block: 'Normal', type: '6- Bedded Bunk AC Rooms', capacity: '6', price: '₹1,50,000/year' },
    { id: '8', block: 'Normal', type: '4- Bedded Bunk AC Rooms', capacity: '4', price: '₹1,50,000/year' },
    { id: '9', block: 'Premium', type: '4- Bedded Bunk AC Rooms', capacity: '4', price: '₹1,50,000/year' },
    { id: '10', block: 'Premium', type: '4- Bedded Flat AC Rooms', capacity: '4', price: '₹1,50,000/year' },
    { id: '11', block: 'Normal', type: '3- Bedded Bunk Non AC Rooms', capacity: '3', price: '₹1,50,000/year' },
    { id: '12', block: 'Normal', type: '3- Bedded Flat Non AC Rooms', capacity: '3', price: '₹1,50,000/year' },
    { id: '13', block: 'Premium', type: '3- Bedded Flat Non AC Rooms', capacity: '3', price: '₹1,50,000/year' },
    { id: '14', block: 'Premium', type: '3- Bedded Flat AC Rooms', capacity: '3', price: '₹1,50,000/year' },
    { id: '15', block: 'Normal', type: '3- Bedded Flat AC Rooms', capacity: '3', price: '₹1,50,000/year' },
    { id: '16', block: 'Normal', type: '2- Bedded Bunk Non AC Rooms', capacity: '2', price: '₹1,50,000/year' },
    { id: '17', block: 'Normal', type: '2- Bedded Flat Non AC Rooms', capacity: '2', price: '₹1,50,000/year' },
    { id: '18', block: 'Premium', type: '2- Bedded Flat Non AC Rooms', capacity: '2', price: '₹1,50,000/year' },
    { id: '19', block: 'Normal', type: '2- Bedded Flat AC Rooms', capacity: '2', price: '₹1,50,000/year' },
    { id: '20', block: 'Premium', type: '2- Bedded Flat AC Rooms', capacity: '2', price: '₹1,50,000/year' },
    
  ]);

  // State for all students loaded from Excel
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [roommateRequests, setRoommateRequests] = useState<RoommateRequest[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Add new state for viewing groups
  const [showGroups, setShowGroups] = useState(false);

  // Add new state for groups
  const [userGroups, setUserGroups] = useState<GroupData[]>([]);

  // Load data from Excel file
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setIsLoading(true);
        console.log("Loading student data from Excel file...");
        
        // Path to the Excel file
        const filePath = "/Data.xlsx";
        
        // Fetch the Excel file
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();
        
        // Parse the Excel data
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert the worksheet to JSON
        const excelData = XLSX.utils.sheet_to_json<any>(worksheet);
        
        // Map the data to our Student interface
        const students: Student[] = excelData.map((row, index) => ({
          id: (index + 1).toString(),
          name: row['Name'] || '',
          registrationNumber: row['Reg No'] || '',
          gender: row['Gender'] || '',
          course: 'B.Tech', // Default value as it's not in the Excel file
          year: '3', // Default value as it's not in the Excel file
          rank: parseInt(row['Rank']) || 0
        }));
        
        setAllStudents(students);
        console.log("Student data loaded successfully", students);
      } catch (error) {
        console.error('Error loading student data from Excel:', error);
        setErrorMessage("Failed to load student data. Please check if the Excel file exists and is correctly formatted.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStudentData();
  }, []);

  // Filter students based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allStudents.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log("Filtered students:", filtered);
      setFilteredStudents(filtered);
      setShowDropdown(true);
    } else {
      setFilteredStudents([]);
      setShowDropdown(false);
    }
  }, [searchQuery, allStudents]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserProfile = async (registrationNumber: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${registrationNumber}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const user = await response.json();
      
      if (user) {
        // Create a complete user profile with all available data
        const userProfile: UserProfile = {
          name: studentData.name,
          registrationNumber: studentData.registrationNumber,
          gender: studentData.gender,
          course: studentData.course,
          year: studentData.year,
          rank: studentData.rank,
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || ''
        };
        console.log("Setting user profile:", userProfile); // Debug log
        setUserProfile(userProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // If there's an error fetching from the server, use the local student data
      const userProfile: UserProfile = {
        name: studentData.name,
        registrationNumber: studentData.registrationNumber,
        gender: studentData.gender,
        course: studentData.course,
        year: studentData.year,
        rank: studentData.rank,
        email: '',
        phone: '',
        address: ''
      };
      console.log("Setting fallback user profile:", userProfile); // Debug log
      setUserProfile(userProfile);
    }
  };

  const saveUserToMongoDB = async (userData: UserProfile) => {
    try {
      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to save user data');
      }

      console.log("User data saved successfully");
    } catch (error) {
      console.error("Error saving user to MongoDB:", error);
    }
  };

  // Update handleLogin to fetch profile after successful login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const student = allStudents.find(s => s.registrationNumber === loginData.applicationNo);
    
    if (student) {
      setIsLoggedIn(true);
      setStep(1);
      const userData = {
        name: student.name,
        registrationNumber: student.registrationNumber,
        gender: student.gender,
        course: student.course,
        year: student.year,
        rank: student.rank,
      };
      setStudentData(userData);
      // Clear previous user's data
      setSelectedFriends([]);
      setRoommateRequests([]);
      await saveUserToMongoDB(userData);
      await fetchUserProfile(student.registrationNumber);
      setErrorMessage(null);
    } else {
      setErrorMessage("Invalid application number. Please check and try again.");
    }
  };

  // Update the profile button click handler
  const handleProfileClick = async () => {
    if (studentData.registrationNumber) {
      await fetchUserProfile(studentData.registrationNumber);
    }
    setShowProfile(true);
  };

  const handleRoomPreferenceChange = (dragIndex: number, dropIndex: number) => {
    const newPreferences = [...roomPreferences];
    const [draggedItem] = newPreferences.splice(dragIndex, 1);
    newPreferences.splice(dropIndex, 0, draggedItem);
    setRoomPreferences(newPreferences);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    handleRoomPreferenceChange(dragIndex, dropIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Prevent selecting a student who is already in any group
  const handleSelectStudent = (student: Student) => {
    // Check if student is already selected
    const exists = selectedFriends.some(friend => friend.registrationNumber === student.registrationNumber);
    if (exists) {
      setErrorMessage("This student is already in your selection.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    // Check if student is already in any group (backend check)
    fetch(`http://localhost:5001/api/groups/member/${student.registrationNumber}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.groupExists) {
          setErrorMessage("This student is already part of another group and cannot be added.");
          setTimeout(() => setErrorMessage(null), 3000);
        } else {
          // Check rank difference
          const rankDifference = Math.abs(student.rank - studentData.rank);
          if (rankDifference > 500) {
            setErrorMessage(`Cannot select this student. Rank difference (${rankDifference}) exceeds 500.`);
            setTimeout(() => setErrorMessage(null), 3000);
            return;
          }
          // Add to selected friends
          setSelectedFriends([
            ...selectedFriends,
            {
              id: student.id,
              name: student.name,
              registrationNumber: student.registrationNumber,
              rank: student.rank,
              status: 'pending'
            }
          ]);
          setSearchQuery('');
          setShowDropdown(false);
        }
      })
      .catch(() => {
        setErrorMessage("Failed to check if student is in another group. Please try again.");
        setTimeout(() => setErrorMessage(null), 3000);
      });
  };

  const handleRoommateRequest = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.map(friend => 
        friend.id === friendId 
          ? { ...friend, status: 'pending' }
          : friend
      )
    );
  };

  const handleRequestResponse = (requestId: string, status: 'accepted' | 'rejected') => {
    setRoommateRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status }
          : request
      )
    );
  };

  const handleRemoveFriend = (friendId: string) => {
    setSelectedFriends(prev => prev.filter(friend => friend.id !== friendId));
  };

  // Add function to fetch groups
  const fetchUserGroups = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/groups/leader/${studentData.registrationNumber}`);
      if (!response.ok) {
        if (response.status === 404) {
          setUserGroups([]);
          return;
        }
        throw new Error('Failed to fetch groups');
      }
      const data = await response.json();
      setUserGroups(data ? [data] : []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setErrorMessage("Failed to fetch groups. Please try again.");
      setUserGroups([]);
    }
  };

  // Fetch group info on login and keep it updated
  useEffect(() => {
    if (isLoggedIn && studentData.registrationNumber) {
      fetchUserGroups();
    }
    // eslint-disable-next-line
  }, [isLoggedIn, studentData.registrationNumber]);

  // Modify handleViewGroups to fetch groups
  const handleViewGroups = async () => {
    setShowGroups(true);
    await fetchUserGroups();
  };

  // Add function to handle returning to home
  const handleReturnHome = () => {
    setStep(1);
    setShowGroups(false);
  };

  // Add new function to save group data
  const saveGroupData = async (groupData: GroupData) => {
    try {
      console.log('Sending group data to backend:', groupData);
      const response = await fetch('http://localhost:5001/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(errorData.message || 'Failed to save group data');
      }

      const savedGroup = await response.json();
      console.log('Group data saved successfully:', savedGroup);
      setUserGroups([savedGroup]);
    } catch (error) {
      console.error("Error saving group data:", error);
      setErrorMessage("Failed to save group data. Please try again.");
    }
  };

  // Prevent group creation and editing if userGroups.length > 0
  const handleCreateGroup = () => {
    if (userGroups.length > 0) {
      setErrorMessage("You already have a group. You can only view your existing group.");
      return;
    }
    setStep(2);
  };

  const renderWelcomeMessage = () => {
    if (isLoggedIn) return null;

    return (
      <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 text-white py-16 overflow-hidden">
        {/* Background Logo Image */}
        <img 
          src="/sdasd.jpg" 
          alt="VIT Bhopal Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none select-none z-0"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Welcome to VIT Bhopal Hostel Management
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-200">
              Your one-stop solution for hassle-free hostel room allocation and management.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderFeatures = () => {
    if (isLoggedIn) return null;

    return (
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Features & Benefits</h2>
            <p className="mt-4 text-lg text-gray-600">Everything you need for a comfortable stay</p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Easy Room Selection',
                  description: 'Choose your preferred room type and block with our intuitive interface',
                  icon: BedDouble
                },
                {
                  title: 'Roommate Matching',
                  description: 'Find and select compatible roommates based on preferences',
                  icon: Users
                },
                {
                  title: 'Real-time Updates',
                  description: 'Get instant notifications about your room allocation status',
                  icon: Bell
                }
              ].map((feature) => (
                <div key={feature.title} className="relative p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-slate-100 rounded-lg">
                      <feature.icon className="h-6 w-6 text-slate-700" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWelcomeBanner = () => {
    if (!isLoggedIn) return null;

    return (
      <div className="bg-slate-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-slate-200" />
              <div>
                <h2 className="text-xl font-semibold">Welcome, {studentData.name}</h2>
                <p className="text-sm text-slate-300">
                  Reg. No: {studentData.registrationNumber} | Rank: {studentData.rank}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSelectedRoommates = () => {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Selected Roommates</h3>
        <div className="space-y-4">
          {selectedFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium">{friend.name}</div>
                <div className="text-sm text-gray-500">
                  {friend.registrationNumber} | Rank: {friend.rank}
                </div>
              </div>
              <button
                onClick={() => handleRemoveFriend(friend.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirmation</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Group Members</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg">
                <Check className="text-green-500" size={20} />
                <span>{studentData.name} ({studentData.registrationNumber}) | Rank: {studentData.rank}</span>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">Leader</span>
              </div>
              {selectedFriends.map((friend) => (
                <div key={friend.id} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg">
                  <Check className="text-green-500" size={20} />
                  <span>{friend.name} ({friend.registrationNumber}) | Rank: {friend.rank}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Room Preferences</h3>
            <div className="space-y-2">
              {roomPreferences.map((room, index) => (
                <div key={room.id} className="flex items-center space-x-2">
                  <span className="text-slate-700 font-medium">{index + 1}.</span>
                  <span>{room.type} ({room.block} Block) • Capacity: {room.capacity} • {room.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={async () => {
                const groupData: GroupData = {
                  leader: {
                    registrationNumber: studentData.registrationNumber,
                    rank: studentData.rank,
                  },
                  members: [
                    {
                      registrationNumber: studentData.registrationNumber,
                      rank: studentData.rank,
                    },
                    ...selectedFriends.map(friend => ({
                      registrationNumber: friend.registrationNumber,
                      rank: friend.rank,
                    }))
                  ],
                  roomPreferences: roomPreferences.map(room => ({
                    key: room.id,
                    value: `${room.block}-${room.type}-${room.capacity}-${room.price}`
                  })),
                  submissionDate: new Date().toISOString(),
                  status: 'pending'
                };
                await saveGroupData(groupData);
                setStep(4);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProfileModal = () => {
    if (!showProfile || !userProfile) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Profile Details</h2>
            <button
              onClick={() => setShowProfile(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{userProfile.name}</h3>
                <p className="text-sm text-gray-500">{userProfile.registrationNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <School className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Course</p>
                  <p className="text-gray-900">{userProfile.course}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Year</p>
                  <p className="text-gray-900">{userProfile.year}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Trophy className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Rank</p>
                  <p className="text-gray-900">{userProfile.rank}</p>
                </div>
              </div>
              {userProfile.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{userProfile.email}</p>
                  </div>
                </div>
              )}
              {userProfile.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{userProfile.phone}</p>
                  </div>
                </div>
              )}
              {userProfile.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-900">{userProfile.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGroupView = (group: GroupData) => (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Group Details</h3>
          <p className="text-sm text-gray-500">
            Submitted on: {new Date(group.submissionDate).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
          group.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          group.status === 'approved' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Group Members</h4>
          <div className="space-y-2">
            {group.members.map((member, index) => (
              <div key={index} className="bg-white p-3 rounded-lg flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Registration Number: {member.registrationNumber} | Rank: {member.rank}
                </p>
                {member.registrationNumber === group.leader.registrationNumber && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    Leader
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Room Preferences</h4>
          <div className="space-y-2">
            {group.roomPreferences.map((room, roomIndex) => (
              <div key={roomIndex} className="bg-white p-3 rounded-lg">
                <p className="text-sm text-gray-500">
                  {room.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div>
      {userGroups.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Your Group Details</h2>
          {renderGroupView(userGroups[0])}
        </div>
      ) : (
        <p className="text-gray-500 mb-4">You have not created a group yet.</p>
      )}
      {/* ...other dashboard content... */}
    </div>
  );

  return (
    <div>
      {/* Admin Portal Button (Bottom Left) */}
      <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 50 }}>
        <button
          onClick={() => setShowAdmin(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
        >
          Admin Portal
        </button>
      </div>

      {showAdmin ? (
        <AdminPanel onBack={() => setShowAdmin(false)} />
      ) : (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {isLoggedIn && (
            <nav className="bg-white shadow-lg sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-slate-700" />
                    <h1 className="ml-2 text-xl font-bold text-gray-900">VIT Bhopal Hostel</h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <User size={20} />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => setIsLoggedIn(false)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          )}

          <main className="flex-grow">
            {renderWelcomeMessage()}
            {renderFeatures()}
            {renderWelcomeBanner()}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {!isLoggedIn ? (
                <div className="max-w-md mx-auto">
                  <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Student Login</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Application Number</label>
                        <input
                          type="text"
                          value={loginData.applicationNo}
                          onChange={(e) => setLoginData({ ...loginData, applicationNo: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                          type="date"
                          value={loginData.dob}
                          onChange={(e) => setLoginData({ ...loginData, dob: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      {errorMessage && (
                        <div className="text-red-600 text-sm">{errorMessage}</div>
                      )}
                      <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Login
                      </button>
                    </form>
                  </div>

                  <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Important Information</h3>
                    <ul className="space-y-4 text-sm text-gray-600">
                      <li className="flex items-start">
                        <Info className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>Room allocation is based on your rank and preferences</span>
                      </li>
                      <li className="flex items-start">
                        <Info className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>You can select roommates with rank difference less than 500</span>
                      </li>
                      <li className="flex items-start">
                        <Info className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>Make sure to review all details before final submission</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {step === 1 && renderDashboard()}
                  {step === 1 && (
                    <div className="space-y-8">
                      {/* Welcome Section */}
                      <div className="bg-white rounded-lg shadow-xl p-8">
                        <div className="max-w-3xl mx-auto text-center">
                          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Room Allocation Portal</h2>
                          <p className="text-lg text-gray-600 mb-6">
                            As the group leader, you can create your room allocation request by following these simple steps:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-slate-50 rounded-lg">
                              <UserPlus className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                              <h3 className="font-semibold text-gray-900 mb-2">1. Add Members</h3>
                              <p className="text-sm text-gray-600">Select your preferred roommates based on rank compatibility</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                              <BedDouble className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                              <h3 className="font-semibold text-gray-900 mb-2">2. Choose Rooms</h3>
                              <p className="text-sm text-gray-600">Arrange your room preferences in order of priority</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                              <ClipboardCheck className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                              <h3 className="font-semibold text-gray-900 mb-2">3. Submit Request</h3>
                              <p className="text-sm text-gray-600">Review and confirm your allocation request</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Member Selection Section */}
                      <div className="bg-white rounded-lg shadow-xl p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">Room Allocation Request</h2>
                            <p className="text-gray-600 mt-1">You are creating this request as the group leader</p>
                          </div>
                          <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                            <p className="text-sm text-indigo-700">Your Rank: {studentData.rank}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg mb-6">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-gray-900">Important Notes:</h3>
                              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                                <li>You can only add members with a rank difference of 500 or less</li>
                                <li>All members will be notified of their inclusion in the group</li>
                                <li>Room preferences can be modified until final submission</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="relative" ref={searchRef}>
                          <div className="flex items-center space-x-2">
                            <Search className="text-gray-400" size={20} />
                            <input
                              type="text"
                              placeholder="Search members by name or registration number..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="flex-1 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          {showDropdown && filteredStudents.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                              {filteredStudents.map((student) => {
                                if (student.registrationNumber === studentData.registrationNumber) {
                                  return null;
                                }
                                
                                const rankDifference = Math.abs(student.rank - studentData.rank);
                                const canAdd = rankDifference <= 500;
                                
                                return (
                                  <div
                                    key={student.id}
                                    onClick={() => canAdd && handleSelectStudent(student)}
                                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                                      !canAdd ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    <div className="font-medium">{student.name}</div>
                                    <div className="text-sm text-gray-500">
                                      {student.registrationNumber} | Rank: {student.rank}
                                    </div>
                                    {!canAdd && (
                                      <div className="text-sm text-red-500 mt-1">
                                        Rank difference ({rankDifference}) exceeds 500. Cannot be added to group.
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {renderSelectedRoommates()}

                        <div className="mt-8 flex justify-end">
                          <button
                            onClick={handleCreateGroup}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Next: Choose Rooms
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="bg-white rounded-lg shadow-xl p-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Room Preferences</h2>
                      <div className="space-y-4">
                        {roomPreferences.map((room, index) => (
                          <div
                            key={room.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragOver={handleDragOver}
                            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg cursor-move"
                          >
                            <GripVertical className="text-gray-400" size={20} />
                            <div className="flex-1">
                              <div className="font-medium">{room.type}</div>
                              <div className="text-sm text-gray-500">
                                {room.block} Block • Capacity: {room.capacity} • {room.price}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 flex justify-between">
                        <button
                          onClick={() => setStep(1)}
                          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setStep(3)}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 3 && renderConfirmation()}

                  {step === 4 && (
                    <div className="bg-white rounded-lg shadow-xl p-8">
                      {!showGroups ? (
                        <div className="text-center">
                          <Check className="mx-auto text-green-500" size={64} />
                          <h2 className="text-2xl font-bold text-gray-800 mt-4">Submission Successful!</h2>
                          <p className="text-gray-600 mt-2">Your hostel preferences have been submitted successfully.</p>
                          <div className="mt-8 space-y-4">
                            <button
                              onClick={async () => {
                                try {
                                  await fetchUserGroups();
                                  setShowGroups(true);
                                } catch (error) {
                                  console.error("Error fetching groups:", error);
                                  setErrorMessage("Failed to fetch groups. Please try again.");
                                }
                              }}
                              className="w-full px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                            >
                              View Created Groups
                            </button>
                            <button
                              onClick={handleReturnHome}
                              className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Return to Home
                            </button>
                            <button
                              onClick={() => {
                                setIsLoggedIn(false);
                                setStep(0);
                              }}
                              className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Your Groups</h2>
                            <button
                              onClick={() => setShowGroups(false)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X size={24} />
                            </button>
                          </div>
                          
                          <div className="space-y-6">
                            {userGroups && userGroups.length > 0 ? (
                              userGroups.map((group, index) => (
                                <div key={index}>
                                  {renderGroupView(group)}
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-gray-500">No groups found. Please create a group first.</p>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between mt-6">
                            <button
                              onClick={handleReturnHome}
                              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Return to Home
                            </button>
                            <button
                              onClick={() => {
                                setIsLoggedIn(false);
                                setStep(0);
                              }}
                              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>

          <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-2">
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-slate-700" />
                    <h2 className="ml-2 text-xl font-bold text-gray-900">VIT Bhopal University</h2>
                  </div>
                  <p className="mt-4 text-base text-gray-500">
                    Providing quality education and comfortable accommodation for students since 2017.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Quick Links</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">About Us</a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">Contact</a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">FAQs</a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact Info</h3>
                  <ul className="mt-4 space-y-4">
                    <li className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-500">Bhopal-Indore Highway, Kothrikalan, Madhya Pradesh</span>
                    </li>
                    <li className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <a href="mailto:info@vitbhopal.ac.in" className="text-gray-500 hover:text-gray-900">
                        info@vitbhopal.ac.in
                      </a>
                    </li>
                    <li className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <a href="tel:+917552024236" className="text-gray-500 hover:text-gray-900">
                        +91 755 202 4236
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-200 pt-8">
                <p className="text-base text-gray-400 text-center">
                  &copy; {new Date().getFullYear()} VIT Bhopal University. All rights reserved.
                </p>
              </div>
            </div>
          </footer>

          {renderProfileModal()}
          <Chatbot />
        </div>
      )}
    </div>
  );
}

export default App;