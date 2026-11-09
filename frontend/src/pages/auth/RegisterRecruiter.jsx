import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import {
  Building2,
  Mail,
  Lock,
  Phone,
  Globe,
  FileCheck2,
  FileText,
  MapPin,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { isValidEmail, isValidVietnamesePhone, isValidUrl } from "../../utils/validators";
import toast from "react-hot-toast";

export const RegisterRecruiter = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    website: "",
    businessRegistrationNumber: "",
    businessLicenseUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required.";
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid business email address.";
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (formData.phone && !isValidVietnamesePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (10 digits).";
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid website URL (e.g. https://company.com).";
    }

    if (!formData.businessRegistrationNumber.trim()) {
      newErrors.businessRegistrationNumber = "Business registration number is required.";
    }

    if (!formData.businessLicenseUrl.trim() || !isValidUrl(formData.businessLicenseUrl)) {
      newErrors.businessLicenseUrl = "A valid document URL for business license is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setLoading(true);
      await authService.registerRecruiter({
        companyName: formData.companyName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        website: formData.website.trim() || undefined,
        businessRegistrationNumber: formData.businessRegistrationNumber.trim(),
        businessLicenseUrl: formData.businessLicenseUrl.trim(),
      });

      toast.success("Recruiter registration submitted! Please sign in.");
      navigate("/login");
    } catch (err) {
      if (err.validationErrors) {
        const fieldErrors = {};
        err.validationErrors.forEach((ve) => {
          fieldErrors[ve.field] = ve.message;
        });
        setErrors(fieldErrors);
      } else {
        setServerError(err.message || "Registration failed. Please check your data.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
      <div className="mb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Register Company / Recruiter
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Join TalentPulse to post vacancies and hire vetted candidates.
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Company Name"
          name="companyName"
          placeholder="Acme Corp Vietnam"
          required
          icon={Building2}
          value={formData.companyName}
          onChange={handleChange}
          error={errors.companyName}
          disabled={loading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Corporate Email"
            name="email"
            type="email"
            placeholder="hr@acme.com"
            required
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={loading}
          />

          <Input
            label="Contact Phone"
            name="phone"
            placeholder="0901234567"
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Min 8 characters"
            required
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={loading}
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            required
            icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={loading}
          />
        </div>

        <Input
          label="Headquarters Address"
          name="address"
          placeholder="District 1, Ho Chi Minh City"
          icon={MapPin}
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          disabled={loading}
        />

        <Input
          label="Company Website"
          name="website"
          placeholder="https://acme.com"
          icon={Globe}
          value={formData.website}
          onChange={handleChange}
          error={errors.website}
          disabled={loading}
        />

        <Input
          label="Business Registration Number"
          name="businessRegistrationNumber"
          placeholder="0101234567"
          required
          icon={FileCheck2}
          value={formData.businessRegistrationNumber}
          onChange={handleChange}
          error={errors.businessRegistrationNumber}
          disabled={loading}
        />

        <Input
          label="Business License Document URL"
          name="businessLicenseUrl"
          placeholder="https://storage.example.com/license.pdf"
          required
          icon={FileText}
          value={formData.businessLicenseUrl}
          onChange={handleChange}
          error={errors.businessLicenseUrl}
          helperText="Public verification URL for company registration certificate"
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={loading}
        >
          Submit Recruiter Registration
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterRecruiter;

