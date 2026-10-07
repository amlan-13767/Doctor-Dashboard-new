"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IDoctor } from '@/models/Doctor';


export default function DoctorRegistration() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<IDoctor>>({
    specializations: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const specializationsOptions = [
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Psychiatry',
    'General Surgery',
    'Internal Medicine',
  ];
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    updateProgress();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        [e.target.name]: file.name, // will do file upload and storing here 
      }));
    }
    updateProgress();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    if (name === 'specializations') {
      setFormData(prev => {
        const currentSpecs = prev.specializations || [];
        return {
          ...prev,
          specializations: checked
            ? [...currentSpecs, value]
            : currentSpecs.filter(spec => spec !== value),
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    }
    updateProgress();
  };

  const updateProgress = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender',
      'licenseNumber', 'experience', 'medicalSchool', 'graduationYear',
      'clinicName', 'practiceAddress', 'city', 'state', 'zipCode',
      'consultationFee', 'medicalLicenseDocument', 'specializations', 'terms'
    ];

    let filledFields = 0;

    requiredFields.forEach(field => {
      if (field === 'specializations') {
        if (formData.specializations && formData.specializations.length > 0) {
          filledFields++;
        }
      } else if (field === 'terms') {
        // Terms is handled separately in the form state
      } else if (formData[field as keyof typeof formData]) {
        filledFields++;
      }
    });

    // Add terms check if implemented in your form state
    const totalFields = requiredFields.length;
    const newProgress = (filledFields / totalFields) * 100;
    setProgress(newProgress);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const currentYear = new Date().getFullYear();

    // Required fields validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
    if (formData.experience === undefined || formData.experience === null) {
      newErrors.experience = 'Experience is required';
    } else if (formData.experience < 0 || formData.experience > 50) {
      newErrors.experience = 'Experience must be between 0 and 50 years';
    }
    if (!formData.medicalSchool) newErrors.medicalSchool = 'Medical school is required';
    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Graduation year is required';
    } else if (formData.graduationYear < 1900 || formData.graduationYear > currentYear) {
      newErrors.graduationYear = `Graduation year must be between 1900 and ${currentYear}`;
    }
    if (!formData.specializations || formData.specializations.length === 0) {
      newErrors.specializations = 'Please select at least one specialization';
    }
    if (!formData.clinicName) newErrors.clinicName = 'Clinic/hospital name is required';
    if (!formData.practiceAddress) newErrors.practiceAddress = 'Practice address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    if (!formData.consultationFee) newErrors.consultationFee = 'Consultation fee is required';
    if (!formData.medicalLicenseDocument) newErrors.medicalLicenseDocument = 'License document is required';
    // Add terms validation if you have a terms checkbox

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        setSuccessMessage(`✅ Registration submitted successfully! Your doctor ID is ${data.doctorId}. We will review your application and contact you within 24-48 hours.`);

      } catch (error) {
        console.error('Error submitting form:', error);
        setErrors((currentErrors) => ({
          ...currentErrors,
          form: error instanceof Error ? error.message : 'An error occurred while submitting the form. Please try again.'
        }));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementById(firstError)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  };

  const saveDraft = () => {
    // In a real app, you might save to localStorage or send to a draft API endpoint
    console.log('Draft data:', formData);
    alert('Draft saved successfully!');
  };

  const goBack = () => {
    router.push('/');
  };

  // Example usage in your React component
  const checkEmailAvailability = async (email: string) => {
    const response = await fetch(`/api/auth/register?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    return !data.exists; // returns true if available
  };

  const checkPhoneAvailability = async (phone: string) => {
    const response = await fetch(`/api/auth/register?phone=${encodeURIComponent(phone)}`);
    const data = await response.json();
    return !data.exists; // returns true if available
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-8">
      <button
        onClick={goBack}
        className="absolute top-8 left-8 z-20 bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md  transition-all hover:-translate-x-1 hover:bg-violet-600 hover:scale-105  focus:outline-2 focus:outline-offset-2 focus:outline-violet-500 active:bg-violet-700"
      >
        ← Back to Home
      </button>
      <button
        onClick={() => { router.push('/login') }}
        className="absolute top-20 left-8 z-20 bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md  transition-all hover:-translate-x-1 hover:bg-violet-600 hover:scale-105  focus:outline-2 focus:outline-offset-2 focus:outline-violet-500 active:bg-violet-700"
      >
        ← Back to Login
      </button>

      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 animate-[slideIn_0.8s_ease]">
        <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 text-center overflow-hidden">
          <div className="pointer-events-none absolute top-0 left-0 w-full h-full bg-radial-gradient opacity-50 animate-pulse"></div>
          <div className="relative z-10 ">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">👨‍⚕️ Doctor Registration</h1>
            <p className="text-lg opacity-90">Join our network of healthcare professionals</p>
            <div className="w-full h-1 bg-white/30 rounded-full mt-4">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {successMessage && (
            <div className="bg-green-500 text-white p-4 rounded-lg mb-6 text-center">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.firstName ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.lastName ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={(e) => {handleChange(e);}}
                  onBlur={() => checkEmailAvailability(formData.email || '')}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={(e) => {handleChange(e);}}
                  onBlur={() => checkPhoneAvailability(formData.phone || '')}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  minLength={6}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.password ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.gender ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>
            </div>

            {/* Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-semibold text-gray-700 mb-1">
                  Medical License Number *
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.licenseNumber ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>}
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-semibold text-gray-700 mb-1">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  min="0"
                  max="50"
                  value={formData.experience || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.experience ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
              </div>

              <div>
                <label htmlFor="medicalSchool" className="block text-sm font-semibold text-gray-700 mb-1">
                  Medical School *
                </label>
                <input
                  type="text"
                  id="medicalSchool"
                  name="medicalSchool"
                  value={formData.medicalSchool || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.medicalSchool ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.medicalSchool && <p className="text-red-500 text-xs mt-1">{errors.medicalSchool}</p>}
              </div>

              <div>
                <label htmlFor="graduationYear" className="block text-sm font-semibold text-gray-700 mb-1">
                  Graduation Year *
                </label>
                <input
                  type="number"
                  id="graduationYear"
                  name="graduationYear"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.graduationYear || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.graduationYear ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.graduationYear && <p className="text-red-500 text-xs mt-1">{errors.graduationYear}</p>}
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Specializations *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                {specializationsOptions.map(spec => (
                  <div
                    key={spec}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${formData.specializations?.includes(spec) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <input
                      type="checkbox"
                      id={spec.toLowerCase()}
                      name="specializations"
                      value={spec}
                      checked={formData.specializations?.includes(spec) || false}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={spec.toLowerCase()} className="text-sm font-medium text-gray-700 cursor-pointer">
                      {spec}
                    </label>
                  </div>
                ))}
              </div>
              {errors.specializations && <p className="text-red-500 text-xs mt-1">{errors.specializations}</p>}
            </div>

            {/* Practice Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="clinicName" className="block text-sm font-semibold text-gray-700 mb-1">
                  Clinic/Hospital Name *
                </label>
                <input
                  type="text"
                  id="clinicName"
                  name="clinicName"
                  value={formData.clinicName || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.clinicName ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.clinicName && <p className="text-red-500 text-xs mt-1">{errors.clinicName}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="practiceAddress" className="block text-sm font-semibold text-gray-700 mb-1">
                  Practice Address *
                </label>
                <textarea
                  id="practiceAddress"
                  name="practiceAddress"
                  value={formData.practiceAddress || ''}
                  onChange={handleChange}
                  placeholder="Enter your practice address"
                  className={`w-full p-3 border-2 rounded-lg transition-all min-h-[100px] ${errors.practiceAddress ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                ></textarea>
                {errors.practiceAddress && <p className="text-red-500 text-xs mt-1">{errors.practiceAddress}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.city ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.state ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.zipCode ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
              </div>

              <div>
                <label htmlFor="consultationFee" className="block text-sm font-semibold text-gray-700 mb-1">
                  Consultation Fee ($) *
                </label>
                <input
                  type="number"
                  id="consultationFee"
                  name="consultationFee"
                  min="0"
                  step="0.01"
                  value={formData.consultationFee || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg transition-all ${errors.consultationFee ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200`}
                  required
                />
                {errors.consultationFee && <p className="text-red-500 text-xs mt-1">{errors.consultationFee}</p>}
              </div>
            </div>

            {/* Document Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="medicalLicenseDocument" className="block text-sm font-semibold text-gray-700 mb-1">
                  Medical License Document *
                </label>
                <label className="relative inline-block w-full cursor-pointer">
                  <input
                    type="file"
                    id="medicalLicenseDocument"
                    name="medicalLicenseDocument"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                    required
                  />
                  <div className={`flex items-center justify-center p-4 border-2 rounded-lg transition-all ${errors.medicalLicenseDocument ? 'border-red-500' : 'border-dashed border-gray-300'} ${formData.medicalLicenseDocument ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 text-gray-500 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-500'}`}>
                    {formData.medicalLicenseDocument ? (
                      <span className="flex items-center gap-2">
                        ✅ {formData.medicalLicenseDocument}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        📄 Upload License Document
                      </span>
                    )}
                  </div>
                </label>
                {errors.medicalLicenseDocument && <p className="text-red-500 text-xs mt-1">{errors.medicalLicenseDocument}</p>}
              </div>

              <div>
                <label htmlFor="photo" className="block text-sm font-semibold text-gray-700 mb-1">
                  Profile Photo
                </label>
                <label className="relative inline-block w-full cursor-pointer">
                  <input
                    type="file"
                    id="photo"
                    name="photo"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png"
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className={`flex items-center justify-center p-4 border-2 rounded-lg transition-all border-dashed ${formData.photo ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-500'}`}>
                    {formData.photo ? (
                      <span className="flex items-center gap-2">
                        ✅ {formData.photo}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        📷 Upload Profile Photo
                      </span>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-1">
                Professional Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                placeholder="Tell patients about yourself, your experience, and your approach to healthcare..."
                rows={4}
                className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              ></textarea>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  onChange={handleCheckboxChange}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the <a href="#" className="text-blue-500 font-medium hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-blue-500 font-medium hover:underline">Privacy Policy</a>. I certify that all information
                  provided is accurate and that I am a licensed medical professional authorized to practice medicine. I understand that
                  false information may result in account suspension.
                </label>
              </div>
              {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                type="button"
                onClick={saveDraft}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                💾 Save Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : '🚀 Submit Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}