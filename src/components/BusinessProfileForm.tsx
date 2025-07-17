import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Building2, User, Mail, Phone, Shield, CheckCircle } from 'lucide-react'
import { blink } from '../blink/client'

interface BusinessProfile {
  fullName: string
  companyName: string
  companyEmail: string
  contactNumber: string
  jobTitle: string
  companySize: string
  industry: string
  businessDescription: string
}

interface BusinessProfileFormProps {
  user: any
  onProfileComplete: (profile: BusinessProfile) => void
}

export function BusinessProfileForm({ user, onProfileComplete }: BusinessProfileFormProps) {
  const [profile, setProfile] = useState<BusinessProfile>({
    fullName: user?.displayName || '',
    companyName: '',
    companyEmail: user?.email || '',
    contactNumber: '',
    jobTitle: '',
    companySize: '',
    industry: '',
    businessDescription: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<BusinessProfile>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<BusinessProfile> = {}
    
    if (!profile.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!profile.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }
    
    if (!profile.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.companyEmail)) {
      newErrors.companyEmail = 'Please enter a valid email address'
    }
    
    if (!profile.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    } else if (!/^[+]?[1-9][\d]{0,15}$/.test(profile.contactNumber.replace(/[\s\-()]/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid phone number'
    }
    
    if (!profile.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required'
    }
    
    if (!profile.companySize) {
      newErrors.companySize = 'Company size is required'
    }
    
    if (!profile.industry.trim()) {
      newErrors.industry = 'Industry is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Save business profile to database
      await blink.db.businessProfiles.create({
        userId: user.id,
        fullName: profile.fullName,
        companyName: profile.companyName,
        companyEmail: profile.companyEmail,
        contactNumber: profile.contactNumber,
        jobTitle: profile.jobTitle,
        companySize: profile.companySize,
        industry: profile.industry,
        businessDescription: profile.businessDescription,
        verificationStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Update user profile with business context
      await blink.auth.updateMe({
        displayName: profile.fullName,
        metadata: {
          companyName: profile.companyName,
          jobTitle: profile.jobTitle,
          industry: profile.industry,
          profileCompleted: true
        }
      })

      onProfileComplete(profile)
    } catch (error) {
      console.error('Error saving business profile:', error)
      setErrors({ companyEmail: 'Failed to save profile. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof BusinessProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-2xl">Business Profile Verification</CardTitle>
              <p className="text-gray-600 mt-2">
                Complete your professional profile to access the AI Marketing Consultant
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              OAuth Verified
            </Badge>
            <Badge variant="secondary">
              Business Verification Required
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="John Smith"
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={profile.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Marketing Director"
                    className={errors.jobTitle ? 'border-red-500' : ''}
                  />
                  {errors.jobTitle && (
                    <p className="text-sm text-red-600 mt-1">{errors.jobTitle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Company Information</h3>
              </div>
              
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={profile.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Acme Corporation"
                  className={errors.companyName ? 'border-red-500' : ''}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600 mt-1">{errors.companyName}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companySize">Company Size *</Label>
                  <select
                    id="companySize"
                    value={profile.companySize}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.companySize ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees (Startup)</option>
                    <option value="11-50">11-50 employees (Small)</option>
                    <option value="51-200">51-200 employees (Medium)</option>
                    <option value="201-1000">201-1000 employees (Large)</option>
                    <option value="1000+">1000+ employees (Enterprise)</option>
                  </select>
                  {errors.companySize && (
                    <p className="text-sm text-red-600 mt-1">{errors.companySize}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={profile.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="Technology, Healthcare, Finance..."
                    className={errors.industry ? 'border-red-500' : ''}
                  />
                  {errors.industry && (
                    <p className="text-sm text-red-600 mt-1">{errors.industry}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyEmail">Company Email *</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={profile.companyEmail}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                    placeholder="john@company.com"
                    className={errors.companyEmail ? 'border-red-500' : ''}
                  />
                  {errors.companyEmail && (
                    <p className="text-sm text-red-600 mt-1">{errors.companyEmail}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={profile.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={errors.contactNumber ? 'border-red-500' : ''}
                  />
                  {errors.contactNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.contactNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Description */}
            <div>
              <Label htmlFor="businessDescription">Business Description (Optional)</Label>
              <Textarea
                id="businessDescription"
                value={profile.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Brief description of your business, products, or services..."
                className="min-h-[80px]"
              />
              <p className="text-sm text-gray-500 mt-1">
                This helps our AI provide more relevant recommendations
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Security & Privacy</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your information is encrypted and used solely for business verification and 
                    providing personalized marketing consultation. We never share your data with third parties.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Verifying Profile...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Complete Profile & Start Consultation
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}