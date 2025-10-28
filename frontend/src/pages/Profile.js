import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { resolveImageUrl } from '../utils/media';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [message, setMessage] = useState({ text: '', type: '' });

  // State for profile form
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // State for password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
      });
      setAvatarPreview(user.avatar ? resolveImageUrl(user.avatar) : '');
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('phone', profileData.phone);
      
      const address = {
        street: profileData.street,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
      };
      formData.append('address', JSON.stringify(address));

      if (avatar) {
        formData.append('avatar', avatar);
      }

      const res = await authAPI.updateProfile(formData);
      setUser(res.data.data.user);
      showMessage('Profile updated successfully');
    } catch (error) {
      showMessage('Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await authAPI.changePassword(passwordData);
      setPasswordData({ currentPassword: '', newPassword: '' });
      showMessage('Password changed successfully');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to change password', 'error');
    }
  };

  if (!user) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        {message.text && (
          <div className={`p-4 mb-6 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Profile Information Form */}
        <form onSubmit={handleUpdateProfile} className="bg-card p-8 rounded-lg border border-border mb-8">
          <h2 className="text-xl font-semibold text-card-foreground mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Avatar</label>
              <div className="flex items-center space-x-4">
                <img src={avatarPreview || `https://ui-avatars.com/api/?name=${profileData.name}&background=random`} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
                <input type="file" id="avatar-upload" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                <label htmlFor="avatar-upload" className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80">
                  Change
                </label>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Full Name</label>
                <input type="text" name="name" id="name" value={profileData.name} onChange={handleProfileChange} className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email Address</label>
                <input type="email" name="email" id="email" value={user.email} disabled className="mt-1 block w-full bg-input/50 border-border rounded-md shadow-sm p-2 text-muted-foreground cursor-not-allowed" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground">Phone</label>
                <input type="tel" name="phone" id="phone" value={profileData.phone} onChange={handleProfileChange} className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2" />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-card-foreground mb-4">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-muted-foreground">Street</label>
                <input type="text" name="street" id="street" value={profileData.street} onChange={handleProfileChange} className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-muted-foreground">City</label>
                <input type="text" name="city" id="city" value={profileData.city} onChange={handleProfileChange} className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-muted-foreground">State</label>
                <input type="text" name="state" id="state" value={profileData.state} onChange={handleProfileChange} className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-muted-foreground">ZIP Code</label>
                <input type="text" name="zipCode" id="zipCode" value={profileData.zipCode} onChange={handleProfileChange} className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2" />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Save Changes
            </button>
          </div>
        </form>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="bg-card p-8 rounded-lg border border-border">
          <h2 className="text-xl font-semibold text-card-foreground mb-6">Change Password</h2>
          <div className="space-y-4 max-w-sm">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-muted-foreground">Current Password</label>
              <input type="password" name="currentPassword" id="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-muted-foreground">New Password</label>
              <input type="password" name="newPassword" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2" />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Change Password
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Profile;
        </div>
      </div>
    </div>
  );
};

export default Profile;
