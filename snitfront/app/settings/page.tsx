'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Calendar, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  Target, 
  Clock, 
  MapPin, 
  Save, 
  Edit2, 
  X, 
  Bell, 
  BarChart3,
  Zap,
  Settings as SettingsIcon
} from 'lucide-react';
import { authAPI } from '@/lib/api-client-new';

const GOAL_OPTIONS = ['Improve Focus', 'Increase Productivity', 'Better Time Management', 'Reduce Distractions', 'Learn New Skills', 'Work-Life Balance'];
const FOCUS_AREAS = ['Coding', 'Writing', 'Reading', 'Design', 'Research', 'Planning', 'Communication', 'Analysis'];
const HOBBY_OPTIONS = ['Reading', 'Gaming', 'Sports', 'Music', 'Art', 'Cooking', 'Travel', 'Photography', 'Fitness'];
const LEARNING_INTERESTS = ['Programming', 'Data Science', 'AI/ML', 'Web Development', 'Mobile Development', 'Design', 'Business', 'Marketing', 'Languages'];
const CHALLENGES = ['Procrastination', 'Distractions', 'Time Management', 'Lack of Motivation', 'Overwhelm', 'Burnout', 'Multitasking'];

export default function Settings() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    occupation: '',
    company: '',
    jobTitle: '',
    industry: '',
    yearsOfExperience: '',
    educationLevel: '',
    fieldOfStudy: '',
    institution: '',
    primaryGoals: [] as string[],
    focusAreas: [] as string[],
    hobbies: [] as string[],
    learningInterests: [] as string[],
    preferredWorkingHours: '',
    workEnvironment: '',
    productivityChallenges: [] as string[],
    timezone: '',
    country: '',
    city: '',
    bio: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    } else if (!authLoading && isAuthenticated) {
      loadUserProfile();
    }
  }, [authLoading, isAuthenticated, router]);

  const calculateAge = (dob: string): number | undefined => {
    if (!dob) return undefined;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUserProfile();
      const userData = response.user || response;
      
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userData.gender || '',
        phoneNumber: userData.phoneNumber || '',
        occupation: userData.occupation || '',
        company: userData.company || '',
        jobTitle: userData.jobTitle || '',
        industry: userData.industry || '',
        yearsOfExperience: userData.yearsOfExperience?.toString() || '',
        educationLevel: userData.educationLevel || '',
        fieldOfStudy: userData.fieldOfStudy || '',
        institution: userData.institution || '',
        primaryGoals: userData.primaryGoals || [],
        focusAreas: userData.focusAreas || [],
        hobbies: userData.hobbies || [],
        learningInterests: userData.learningInterests || [],
        preferredWorkingHours: userData.preferredWorkingHours || '',
        workEnvironment: userData.workEnvironment || '',
        productivityChallenges: userData.productivityChallenges || [],
        timezone: userData.timezone || '',
        country: userData.country || '',
        city: userData.city || '',
        bio: userData.bio || '',
      });
      setMessage({ type: '', text: '' });
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const updateData: any = {
        name: formData.name,
      };
      
      const calculatedAge = calculateAge(formData.dateOfBirth);
      if (calculatedAge) updateData.age = calculatedAge;
      if (formData.dateOfBirth) updateData.dateOfBirth = formData.dateOfBirth;
      if (formData.gender) updateData.gender = formData.gender;
      if (formData.phoneNumber) updateData.phoneNumber = formData.phoneNumber;
      if (formData.occupation) updateData.occupation = formData.occupation;
      if (formData.company) updateData.company = formData.company;
      if (formData.jobTitle) updateData.jobTitle = formData.jobTitle;
      if (formData.industry) updateData.industry = formData.industry;
      if (formData.yearsOfExperience) updateData.yearsOfExperience = parseInt(formData.yearsOfExperience);
      if (formData.educationLevel) updateData.educationLevel = formData.educationLevel;
      if (formData.fieldOfStudy) updateData.fieldOfStudy = formData.fieldOfStudy;
      if (formData.institution) updateData.institution = formData.institution;
      if (formData.primaryGoals.length > 0) updateData.primaryGoals = formData.primaryGoals;
      if (formData.focusAreas.length > 0) updateData.focusAreas = formData.focusAreas;
      if (formData.hobbies.length > 0) updateData.hobbies = formData.hobbies;
      if (formData.learningInterests.length > 0) updateData.learningInterests = formData.learningInterests;
      if (formData.preferredWorkingHours) updateData.preferredWorkingHours = formData.preferredWorkingHours;
      if (formData.workEnvironment) updateData.workEnvironment = formData.workEnvironment;
      if (formData.productivityChallenges.length > 0) updateData.productivityChallenges = formData.productivityChallenges;
      if (formData.timezone) updateData.timezone = formData.timezone;
      if (formData.country) updateData.country = formData.country;
      if (formData.city) updateData.city = formData.city;
      if (formData.bio) updateData.bio = formData.bio;
      
      await authAPI.updateUserProfile(updateData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'goals', label: 'Goals & Interests', icon: Target },
    { id: 'preferences', label: 'Preferences', icon: Clock },
    { id: 'location', label: 'Location & Bio', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [180, 0, 180],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 glass border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">FlowState</h1>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 glass hover:bg-white/10 rounded-lg transition-all text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Quick Links */}
        <div className="mb-8 grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
          >
            <Link
              href="/settings/reminders"
              className="block glass p-6 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Health & Wellness</h3>
                    <p className="text-gray-400 text-sm">
                      Configure wellness reminders
                    </p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-white transition-colors text-2xl">
                  →
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Link
              href="/settings/reports"
              className="block glass p-6 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Reports & Analytics</h3>
                    <p className="text-gray-400 text-sm">
                      Email/SMS reports settings
                    </p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-white transition-colors text-2xl">
                  →
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-3xl mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Profile Settings</h1>
              <p className="text-gray-300 text-lg">Manage your personal information and preferences</p>
            </div>
            {!editMode ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                <Edit2 size={20} />
                Edit Profile
              </motion.button>
            ) : (
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditMode(false);
                    loadUserProfile();
                  }}
                  className="flex items-center gap-2 px-6 py-3 glass border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            )}
          </div>
          
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-2 rounded-2xl mb-8 overflow-x-auto"
        >
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Basic Information */}
          {activeTab === 'basic' && (
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <User size={24} className="text-purple-400" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl text-white opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  {formData.dateOfBirth && (
                    <p className="text-sm text-gray-400 mt-2">
                      Age: {calculateAge(formData.dateOfBirth)} years old
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!editMode}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Professional Information */}
          {activeTab === 'professional' && (
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Briefcase size={24} className="text-purple-400" />
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    disabled={!editMode}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    disabled={!editMode}
                    placeholder="e.g., Tech Corp"
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    disabled={!editMode}
                    placeholder="e.g., Senior Developer"
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    disabled={!editMode}
                    placeholder="e.g., Technology"
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    disabled={!editMode}
                    placeholder="5"
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          {activeTab === 'education' && (
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <GraduationCap size={24} className="text-purple-400" />
                Education
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Education Level</label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="">Select level</option>
                    <option value="high-school">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Field of Study</label>
                  <input
                    type="text"
                    value={formData.fieldOfStudy}
                    onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                    disabled={!editMode}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Institution</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    disabled={!editMode}
                    placeholder="e.g., University of Technology"
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Goals & Interests */}
          {activeTab === 'goals' && (
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Target size={24} className="text-purple-400" />
                Goals & Interests
              </h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Primary Goals</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {GOAL_OPTIONS.map(goal => (
                      <motion.button
                        key={goal}
                        type="button"
                        onClick={() => editMode && setFormData({ ...formData, primaryGoals: toggleArrayItem(formData.primaryGoals, goal) })}
                        disabled={!editMode}
                        whileHover={editMode ? { scale: 1.05 } : {}}
                        whileTap={editMode ? { scale: 0.95 } : {}}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.primaryGoals.includes(goal) 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                            : 'glass border border-white/10 text-gray-300 hover:border-purple-500/50'
                        } ${editMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                      >
                        {goal}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Focus Areas</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {FOCUS_AREAS.map(area => (
                      <motion.button
                        key={area}
                        type="button"
                        onClick={() => editMode && setFormData({ ...formData, focusAreas: toggleArrayItem(formData.focusAreas, area) })}
                        disabled={!editMode}
                        whileHover={editMode ? { scale: 1.05 } : {}}
                        whileTap={editMode ? { scale: 0.95 } : {}}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.focusAreas.includes(area) 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                            : 'glass border border-white/10 text-gray-300 hover:border-purple-500/50'
                        } ${editMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                      >
                        {area}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Hobbies</label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {HOBBY_OPTIONS.map(hobby => (
                      <motion.button
                        key={hobby}
                        type="button"
                        onClick={() => editMode && setFormData({ ...formData, hobbies: toggleArrayItem(formData.hobbies, hobby) })}
                        disabled={!editMode}
                        whileHover={editMode ? { scale: 1.05 } : {}}
                        whileTap={editMode ? { scale: 0.95 } : {}}
                        className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.hobbies.includes(hobby) 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                            : 'glass border border-white/10 text-gray-300 hover:border-purple-500/50'
                        } ${editMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                      >
                        {hobby}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Learning Interests</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {LEARNING_INTERESTS.map(interest => (
                      <motion.button
                        key={interest}
                        type="button"
                        onClick={() => editMode && setFormData({ ...formData, learningInterests: toggleArrayItem(formData.learningInterests, interest) })}
                        disabled={!editMode}
                        whileHover={editMode ? { scale: 1.05 } : {}}
                        whileTap={editMode ? { scale: 0.95 } : {}}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.learningInterests.includes(interest) 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                            : 'glass border border-white/10 text-gray-300 hover:border-purple-500/50'
                        } ${editMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                      >
                        {interest}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Work Preferences */}
          {activeTab === 'preferences' && (
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Clock size={24} className="text-purple-400" />
                Work Preferences
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Working Hours</label>
                  <select
                    value={formData.preferredWorkingHours}
                    onChange={(e) => setFormData({ ...formData, preferredWorkingHours: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="">Select preferred hours</option>
                    <option value="early-morning">Early Morning (5AM - 9AM)</option>
                    <option value="morning">Morning (9AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 5PM)</option>
                    <option value="evening">Evening (5PM - 9PM)</option>
                    <option value="night">Night (9PM - 12AM)</option>
                    <option value="late-night">Late Night (12AM - 5AM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Work Environment</label>
                  <select
                    value={formData.workEnvironment}
                    onChange={(e) => setFormData({ ...formData, workEnvironment: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="">Select environment</option>
                    <option value="remote">Remote / Work from Home</option>
                    <option value="office">Office</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="coworking">Co-working Space</option>
                    <option value="student">Student / Campus</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Productivity Challenges</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CHALLENGES.map(challenge => (
                      <motion.button
                        key={challenge}
                        type="button"
                        onClick={() => editMode && setFormData({ ...formData, productivityChallenges: toggleArrayItem(formData.productivityChallenges, challenge) })}
                        disabled={!editMode}
                        whileHover={editMode ? { scale: 1.05 } : {}}
                        whileTap={editMode ? { scale: 0.95 } : {}}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.productivityChallenges.includes(challenge) 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                            : 'glass border border-white/10 text-gray-300 hover:border-purple-500/50'
                        } ${editMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                      >
                        {challenge}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location & Bio */}
          {activeTab === 'location' && (
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <MapPin size={24} className="text-purple-400" />
                Location & Bio
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      disabled={!editMode}
                      placeholder="United States"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!editMode}
                      placeholder="New York"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="">Select timezone</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                    <option value="Asia/Kolkata">India</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!editMode}
                    rows={6}
                    placeholder="Share a bit about yourself, your aspirations, what motivates you..."
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
