import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import userService from "../../services/userService";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Shield,
} from "lucide-react";
import { isValidEmail, isValidVietnamesePhone } from "../../utils/validators";
import toast from "react-hot-toast";

export const Profile = () => {
  const { user, updateUserState } = useAuth();

  // Profile Form state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileServerError, setProfileServerError] = useState("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Change Password Form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordServerError, setPasswordServerError] = useState("");
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await userService.getMyProfile();
        if (res?.data) {
          const u = res.data;
          setProfileData({
            fullName: u.fullName || "",
            email: u.email || "",
            phone: u.phone || "",
            address: u.address || "",
          });
        }
      } catch (err) {
        setProfileServerError(err.message || "Failed to load candidate profile.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: null }));
    }
    setProfileSuccessMsg("");
    setProfileServerError("");
  };

  const validateProfile = () => {
    const errors = {};
    if (!profileData.fullName.trim() || profileData.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }
    if (!isValidEmail(profileData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (profileData.phone && !isValidVietnamesePhone(profileData.phone)) {
      errors.phone = "Phone must be a valid 10-11 digit Vietnamese phone number.";
    }
    if (profileData.address && profileData.address.trim().length < 5) {
      errors.address = "Address must be at least 5 characters.";
    }
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg("");
    setProfileServerError("");

    if (!validateProfile()) return;

    try {
      setSavingProfile(true);
      const res = await userService.updateMyProfile({
        fullName: profileData.fullName.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim() || undefined,
        address: profileData.address.trim() || undefined,
      });

      if (res?.data) {
        updateUserState(res.data);
      }

      toast.success("Profile saved successfully!");
      setProfileSuccessMsg("Your personal information has been updated.");
    } catch (err) {
      if (err.validationErrors) {
        const fieldErrors = {};
        err.validationErrors.forEach((ve) => {
          fieldErrors[ve.field] = ve.message;
        });
        setProfileErrors(fieldErrors);
      } else {
        setProfileServerError(err.message || "Failed to update profile.");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: null }));
    }
    setPasswordSuccessMsg("");
    setPasswordServerError("");
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required.";
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      errors.newPassword = "New password must be at least 8 characters.";
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = "New password must be different from current password.";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordServerError("");
    setPasswordSuccessMsg("");

    if (!validatePassword()) return;

    try {
      setSavingPassword(true);
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      toast.success("Password updated successfully!");
      setPasswordSuccessMsg("Your password has been changed.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      if (err.validationErrors) {
        const fieldErrors = {};
        err.validationErrors.forEach((ve) => {
          fieldErrors[ve.field] = ve.message;
        });
        setPasswordErrors(fieldErrors);
      } else {
        setPasswordServerError(err.message || "Failed to change password. Please check your current password.");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="py-24 bg-white rounded-2xl border border-slate-200">
        <LoadingSpinner text="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Candidate Profile"
        subtitle="Manage your personal details, contact information, and account security."
      />

      {/* Section 1: Personal Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            Personal Information
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            These contact details are automatically pre-filled when you submit job applications.
          </p>
        </div>

        {profileServerError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{profileServerError}</span>
          </div>
        )}

        {profileSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{profileSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="fullName"
            required
            icon={User}
            value={profileData.fullName}
            onChange={handleProfileChange}
            error={profileErrors.fullName}
            disabled={savingProfile}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            icon={Mail}
            value={profileData.email}
            onChange={handleProfileChange}
            error={profileErrors.email}
            disabled={savingProfile}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              name="phone"
              placeholder="0912345678"
              icon={Phone}
              value={profileData.phone}
              onChange={handleProfileChange}
              error={profileErrors.phone}
              helperText="Vietnamese phone format"
              disabled={savingProfile}
            />

            <Input
              label="Address / Location"
              name="address"
              placeholder="District, City"
              icon={MapPin}
              value={profileData.address}
              onChange={handleProfileChange}
              error={profileErrors.address}
              disabled={savingProfile}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={savingProfile}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Section 2: Change Password (Inside Profile Page) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            Change Password
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Update your password to keep your account secure. Minimum 8 characters.
          </p>
        </div>

        {passwordServerError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{passwordServerError}</span>
          </div>
        )}

        {passwordSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{passwordSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            placeholder="Enter your current password"
            required
            icon={Lock}
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.currentPassword}
            disabled={savingPassword}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="Min 8 characters"
              required
              icon={Lock}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.newPassword}
              disabled={savingPassword}
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              required
              icon={Lock}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.confirmPassword}
              disabled={savingPassword}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="secondary"
              size="md"
              loading={savingPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
