// ==============================================
// SETTINGS PAGE
// ==============================================
// User profile, security, and app preferences
// Modify settings sections based on your requirements

import React, { useState } from 'react';
import { User } from '../types';
import { 
  User as UserIcon, 
  Shield, 
  Bell, 
  Smartphone, 
  CreditCard,
  FileText,
  HelpCircle,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Lock,
  Fingerprint
} from 'lucide-react';

interface SettingsProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUserUpdate }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(user);

  const handleProfileUpdate = () => {
    onUserUpdate(profileData);
    setEditingProfile(false);
  };

  const settingSections = [
    {
      id: 'profile',
      title: 'Profile & Personal Info',
      icon: UserIcon,
      description: 'Update your personal information and contact details'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: Shield,
      description: 'Manage your security settings and privacy preferences'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Control how and when you receive notifications'
    },
    {
      id: 'devices',
      title: 'Connected Devices',
      icon: Smartphone,
      description: 'Manage devices with access to your account'
    },
    {
      id: 'cards',
      title: 'Card Settings',
      icon: CreditCard,
      description: 'Manage your cards and payment preferences'
    },
    {
      id: 'statements',
      title: 'Statements & Documents',
      icon: FileText,
      description: 'Access statements and manage document preferences'
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      description: 'Get help and contact customer support'
    }
  ];

  const renderProfileSection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        <button
          onClick={() => setEditingProfile(!editingProfile)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <Edit3 size={16} />
          <span className="text-sm font-medium">
            {editingProfile ? 'Cancel' : 'Edit'}
          </span>
        </button>
      </div>

      {editingProfile ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={profileData.address.street}
              onChange={(e) => setProfileData({
                ...profileData, 
                address: {...profileData.address, street: e.target.value}
              })}
              placeholder="Street Address"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={profileData.address.city}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  address: {...profileData.address, city: e.target.value}
                })}
                placeholder="City"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={profileData.address.state}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  address: {...profileData.address, state: e.target.value}
                })}
                placeholder="State"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setEditingProfile(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleProfileUpdate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Mail className="text-gray-400" size={20} />
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="font-medium text-gray-900">{user.email}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Phone className="text-gray-400" size={20} />
            <div>
              <div className="text-sm text-gray-600">Phone</div>
              <div className="font-medium text-gray-900">{user.phone}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <MapPin className="text-gray-400" size={20} />
            <div>
              <div className="text-sm text-gray-600">Address</div>
              <div className="font-medium text-gray-900">
                {user.address.street}, {user.address.city}, {user.address.state} {user.address.zip}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSecuritySection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Lock className="text-gray-400" size={20} />
            <div>
              <div className="font-medium text-gray-900">Change Password</div>
              <div className="text-sm text-gray-600">Last changed 3 months ago</div>
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Fingerprint className="text-gray-400" size={20} />
            <div>
              <div className="font-medium text-gray-900">Biometric Authentication</div>
              <div className="text-sm text-gray-600">Use fingerprint or face ID</div>
            </div>
          </div>
          <div className="flex items-center">
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Smartphone className="text-gray-400" size={20} />
            <div>
              <div className="font-medium text-gray-900">Two-Factor Authentication</div>
              <div className="text-sm text-gray-600">Extra security for your account</div>
            </div>
          </div>
          <div className="flex items-center">
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 pb-24 md:pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
          <span className="text-white text-xl font-bold">
            {user.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600">Member since 2020</p>
        </div>
      </div>

      {/* Active Section Content */}
      {activeSection === 'profile' && renderProfileSection()}
      {activeSection === 'security' && renderSecuritySection()}
      
      {/* Settings Menu */}
      {!activeSection && (
        <div className="space-y-3">
          {settingSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Back Button for Active Sections */}
      {activeSection && (
        <button
          onClick={() => setActiveSection(null)}
          className="fixed bottom-20 md:bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 shadow-lg"
        >
          Back to Settings
        </button>
      )}

      {/* App Info */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <div className="text-sm text-gray-600 mb-2">RBFCU Mobile</div>
        <div className="text-xs text-gray-500">Version 2.1.4 • Build 2024.1</div>
        <div className="text-xs text-gray-500 mt-2">
          © 2024 RBFCU Credit Union. All rights reserved.
        </div>
        <div className="text-xs text-gray-500">
          Federally insured by NCUA. Equal Housing Lender.
        </div>
      </div>
    </div>
  );
};