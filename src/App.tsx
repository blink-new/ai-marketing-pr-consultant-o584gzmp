import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Badge } from './components/ui/badge'
import { Progress } from './components/ui/progress'
import { ScrollArea } from './components/ui/scroll-area'
import { Separator } from './components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Label } from './components/ui/label'
import { MessageCircle, Brain, Target, FileText, Download, Lightbulb, FileSpreadsheet, Presentation, CheckCircle } from 'lucide-react'
import { DocumentGenerator } from './lib/documentGenerator'
import { BusinessProfileForm } from './components/BusinessProfileForm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Assessment {
  category: string
  score: number
  insights: string[]
}

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

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionProgress, setSessionProgress] = useState(0)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [businessContext, setBusinessContext] = useState({
    industry: '',
    size: '',
    goals: '',
    challenges: ''
  })
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  useEffect(() => {
    try {
      const unsubscribe = blink.auth.onAuthStateChanged((state) => {
        setUser(state.user)
        setLoading(state.isLoading)
        
        if (state.user) {
          loadBusinessProfile(state.user.id)
        } else {
          setProfileLoading(false)
        }
      })
      return unsubscribe
    } catch (error) {
      console.error('Auth initialization error:', error)
      setHasError(true)
      setLoading(false)
      setProfileLoading(false)
    }
  }, [])

  const loadBusinessProfile = async (userId: string) => {
    try {
      // Try to load from localStorage first (fallback since DB limit reached)
      const savedProfile = localStorage.getItem(`businessProfile_${userId}`)
      if (savedProfile) {
        const profile = JSON.parse(savedProfile)
        setBusinessProfile(profile)
        setBusinessContext({
          industry: profile.industry,
          size: profile.companySize,
          goals: '',
          challenges: ''
        })
        setCompanyName(profile.companyName)
        setContactName(profile.fullName)
      }
    } catch (error) {
      console.error('Error loading business profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleProfileComplete = (profile: BusinessProfile) => {
    // Save to localStorage (fallback since DB limit reached)
    localStorage.setItem(`businessProfile_${user.id}`, JSON.stringify(profile))
    
    setBusinessProfile(profile)
    setBusinessContext({
      industry: profile.industry,
      size: profile.companySize,
      goals: '',
      challenges: ''
    })
    setCompanyName(profile.companyName)
    setContactName(profile.fullName)
  }

  // Add global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress analytics-related errors to prevent console spam
      if (event.reason?.message?.includes('analytics') || 
          event.reason?.message?.includes('Failed to fetch') ||
          event.reason?.code === 'NETWORK_ERROR') {
        event.preventDefault()
        console.warn('Analytics service temporarily unavailable:', event.reason?.message)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }, [])

  useEffect(() => {
    if (user && businessProfile && messages.length === 0) {
      // Initialize conversation with personalized welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Welcome ${businessProfile.fullName}! I'm your AI Marketing & PR Requirements Consultant, and I'm excited to help ${businessProfile.companyName} succeed in marketing and public relations.

Based on your profile, I can see you're in the ${businessProfile.industry} industry with a ${businessProfile.companySize} company${businessProfile.businessDescription ? `, focusing on: ${businessProfile.businessDescription}` : ''}.

I'll guide you through a series of adaptive questions to understand your specific business context, challenges, and goals. Based on 30+ years of professional experience, I'll provide you with:

• Detailed contextual assessments tailored to ${businessProfile.industry}
• Expert recommendations for ${businessProfile.companySize} businesses
• Actionable strategies to maximize ROI in your market
• Professional insights to prevent common pitfalls in ${businessProfile.industry}

Let's dive deeper: What are your primary marketing and PR challenges right now? Are you looking to increase brand awareness, generate leads, improve customer retention, or something else entirely?`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [user, businessProfile, messages.length])

  const sendMessage = async () => {
    if (!currentMessage.trim() || isGenerating) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsGenerating(true)

    try {
      let streamingContent = ''
      
      await blink.ai.streamText(
        {
          messages: [
            {
              role: 'system',
              content: `You are an expert Marketing and PR consultant with 30+ years of experience. Your role is to:

1. Gather comprehensive business requirements through adaptive questioning
2. Provide contextual assessments based on user responses
3. Offer expert recommendations that prevent revenue loss and maximize ROI
4. Ask intelligent follow-up questions when users seem stuck or provide insufficient detail

Key principles:
- Be professional yet approachable
- Ask one focused question at a time
- Provide specific, actionable insights
- Reference industry best practices
- Help users understand what they actually need vs what they think they need
- Focus on business outcomes and revenue impact

Client Business Profile:
- Name: ${businessProfile?.fullName || 'Not provided'}
- Company: ${businessProfile?.companyName || 'Not provided'}
- Industry: ${businessProfile?.industry || 'Not provided'}
- Company Size: ${businessProfile?.companySize || 'Not provided'}
- Job Title: ${businessProfile?.jobTitle || 'Not provided'}
- Business Description: ${businessProfile?.businessDescription || 'Not provided'}
- Contact: ${businessProfile?.companyEmail || 'Not provided'}

Use this verified business information to provide highly personalized recommendations. Reference their specific industry, company size, and role when giving advice. Tailor your questions and suggestions to their business context.`
            },
            ...messages.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: currentMessage
            }
          ]
        },
        (chunk) => {
          streamingContent += chunk
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            
            if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id === 'streaming') {
              lastMessage.content = streamingContent
            } else {
              newMessages.push({
                id: 'streaming',
                role: 'assistant',
                content: streamingContent,
                timestamp: new Date()
              })
            }
            return newMessages
          })
        }
      )

      // Update progress based on conversation depth
      setSessionProgress(Math.min(95, (messages.length + 1) * 8))

      // Generate assessment if enough context is gathered
      if (messages.length >= 4) {
        generateAssessment(streamingContent)
      }

    } catch (error) {
      console.error('Error generating response:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAssessment = async (latestResponse: string) => {
    try {
      const { object } = await blink.ai.generateObject({
        prompt: `Based on the conversation history, generate a business assessment with categories, scores (0-100), and key insights. Focus on marketing readiness, brand positioning, target audience clarity, and strategic alignment.

Conversation context: ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
Latest response: ${latestResponse}`,
        schema: {
          type: 'object',
          properties: {
            assessments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  score: { type: 'number' },
                  insights: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      })

      if (object.assessments) {
        setAssessments(object.assessments)
      }
    } catch (error) {
      console.error('Error generating assessment:', error)
    }
  }

  const exportReport = async () => {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Generate a comprehensive Marketing & PR Requirements Report based on this consultation session:

Messages: ${messages.map(m => `${m.role}: ${m.content}`).join('\\n\\n')}

Assessments: ${assessments.map(a => `${a.category}: ${a.score}/100 - ${a.insights.join(', ')}`).join('\\n')}

Create a professional report with:
1. Executive Summary
2. Business Context Analysis  
3. Key Findings & Assessments
4. Strategic Recommendations
5. Next Steps & Action Items
6. Implementation Timeline

Format as a detailed business document.`
      })

      // Create and download the report
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Marketing-PR-Requirements-Report-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const generateRecommendations = async (): Promise<string> => {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Based on this marketing consultation session, generate comprehensive strategic recommendations:

Messages: ${messages.map(m => `${m.role}: ${m.content}`).join('\\n\\n')}

Assessments: ${assessments.map(a => `${a.category}: ${a.score}/100 - ${a.insights.join(', ')}`).join('\\n')}

Business Context: Industry: ${businessContext.industry}, Size: ${businessContext.size}, Goals: ${businessContext.goals}, Challenges: ${businessContext.challenges}

Provide detailed, actionable recommendations that address the specific needs and challenges identified during the consultation. Focus on practical strategies that can drive business growth and improve marketing effectiveness.`
      })
      return text
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return 'Detailed recommendations will be provided based on the consultation analysis.'
    }
  }

  const exportWordProposal = async () => {
    try {
      const recommendations = await generateRecommendations()
      await DocumentGenerator.generateWordProposal({
        messages,
        assessments,
        businessContext,
        recommendations,
        companyName: companyName || 'Your Company',
        contactName: contactName || 'Client'
      })
      setIsExportDialogOpen(false)
    } catch (error) {
      console.error('Error generating Word proposal:', error)
    }
  }

  const exportPowerPointProposal = async () => {
    try {
      const recommendations = await generateRecommendations()
      await DocumentGenerator.generatePowerPointProposal({
        messages,
        assessments,
        businessContext,
        recommendations,
        companyName: companyName || 'Your Company',
        contactName: contactName || 'Client'
      })
      setIsExportDialogOpen(false)
    } catch (error) {
      console.error('Error generating PowerPoint proposal:', error)
    }
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-600">
              <Brain className="h-6 w-6" />
              Service Temporarily Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              We're experiencing some technical difficulties. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading your consultant...' : 'Loading your profile...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              AI Marketing Consultant
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Please sign in to start your consultation</p>
            <Button onClick={() => blink.auth.login()}>
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show business profile form if user is authenticated but profile is incomplete
  if (user && !businessProfile) {
    return <BusinessProfileForm user={user} onProfileComplete={handleProfileComplete} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI Marketing & PR Consultant</h1>
                <p className="text-sm text-gray-500">
                  {businessProfile ? `${businessProfile.companyName} • ${businessProfile.industry}` : 'Professional Requirements Gathering'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Session Progress: {sessionProgress}%
              </Badge>
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={messages.length < 3}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Generate Proposal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generate Professional Proposal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Your Company"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input
                          id="contactName"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Client Name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Choose your preferred format:</p>
                      
                      <Button
                        onClick={exportWordProposal}
                        className="w-full justify-start gap-3 h-12"
                        variant="outline"
                      >
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div className="text-left">
                          <div className="font-medium">Word Document (.docx)</div>
                          <div className="text-xs text-gray-500">Professional proposal with detailed formatting</div>
                        </div>
                      </Button>
                      
                      <Button
                        onClick={exportPowerPointProposal}
                        className="w-full justify-start gap-3 h-12"
                        variant="outline"
                      >
                        <Presentation className="h-5 w-5 text-orange-600" />
                        <div className="text-left">
                          <div className="font-medium">PowerPoint (.pptx)</div>
                          <div className="text-xs text-gray-500">Presentation-ready slides for client meetings</div>
                        </div>
                      </Button>
                      
                      <Button
                        onClick={exportReport}
                        className="w-full justify-start gap-3 h-12"
                        variant="outline"
                      >
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        <div className="text-left">
                          <div className="font-medium">Text Report (.txt)</div>
                          <div className="text-xs text-gray-500">Simple text format for quick reference</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => blink.auth.logout()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Consultation Session
                </CardTitle>
                <Progress value={sessionProgress} className="w-full" />
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-full">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <div className="animate-pulse flex space-x-1">
                              <div className="rounded-full bg-gray-400 h-2 w-2"></div>
                              <div className="rounded-full bg-gray-400 h-2 w-2"></div>
                              <div className="rounded-full bg-gray-400 h-2 w-2"></div>
                            </div>
                            <span className="text-sm text-gray-500">Analyzing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Share details about your business, challenges, or goals..."
                      className="flex-1 min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!currentMessage.trim() || isGenerating}
                      className="self-end"
                    >
                      Send
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Panel */}
          <div className="space-y-6">
            {/* Verified Business Profile */}
            {businessProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Verified Business Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Contact:</span>
                      <p className="text-gray-900">{businessProfile.fullName}</p>
                      <p className="text-gray-600">{businessProfile.jobTitle}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Company:</span>
                      <p className="text-gray-900">{businessProfile.companyName}</p>
                      <p className="text-gray-600">{businessProfile.industry} • {businessProfile.companySize}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Contact Info:</span>
                      <p className="text-gray-600">{businessProfile.companyEmail}</p>
                      <p className="text-gray-600">{businessProfile.contactNumber}</p>
                    </div>
                    {businessProfile.businessDescription && (
                      <div>
                        <span className="font-medium text-gray-700">Business:</span>
                        <p className="text-gray-600 text-xs">{businessProfile.businessDescription}</p>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200 w-fit">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Profile
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Business Context */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Session Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Goals</label>
                  <Input
                    value={businessContext.goals}
                    onChange={(e) => setBusinessContext(prev => ({ ...prev, goals: e.target.value }))}
                    placeholder="e.g., Increase brand awareness, Generate leads"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Key Challenges</label>
                  <Input
                    value={businessContext.challenges}
                    onChange={(e) => setBusinessContext(prev => ({ ...prev, challenges: e.target.value }))}
                    placeholder="e.g., Limited budget, Unclear target audience"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Real-time Assessments */}
            {assessments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                    Live Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessments.map((assessment, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{assessment.category}</span>
                        <Badge variant={assessment.score >= 70 ? 'default' : assessment.score >= 40 ? 'secondary' : 'destructive'}>
                          {assessment.score}/100
                        </Badge>
                      </div>
                      <Progress value={assessment.score} className="h-2" />
                      <ul className="text-xs text-gray-600 space-y-1">
                        {assessment.insights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-blue-600 mt-1">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                      {index < assessments.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Session Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setMessages([])}
                >
                  Start New Session
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsExportDialogOpen(true)}
                  disabled={messages.length < 3}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Proposal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App