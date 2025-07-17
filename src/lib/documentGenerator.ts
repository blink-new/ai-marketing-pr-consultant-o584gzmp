import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } from 'docx'
import PptxGenJS from 'pptxgenjs'
import { saveAs } from 'file-saver'

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

interface BusinessContext {
  industry: string
  size: string
  goals: string
  challenges: string
}

interface ProposalData {
  messages: Message[]
  assessments: Assessment[]
  businessContext: BusinessContext
  recommendations: string
  companyName?: string
  contactName?: string
}

export class DocumentGenerator {
  static async generateWordProposal(data: ProposalData): Promise<void> {
    const { messages, assessments, businessContext, recommendations, companyName = 'Your Company', contactName = 'Client' } = data

    // Extract key insights from conversation
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content)
    const assistantMessages = messages.filter(m => m.role === 'assistant').map(m => m.content)

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title Page
          new Paragraph({
            children: [
              new TextRun({
                text: "MARKETING & PR STRATEGY PROPOSAL",
                bold: true,
                size: 32,
                color: "2563eb"
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Prepared for: ${companyName}`,
                size: 24,
                bold: true
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Contact: ${contactName}`,
                size: 20
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Date: ${new Date().toLocaleDateString()}`,
                size: 20
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Prepared by: AI Marketing & PR Consultant",
                size: 16,
                italics: true
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 }
          }),

          // Executive Summary
          new Paragraph({
            children: [
              new TextRun({
                text: "EXECUTIVE SUMMARY",
                bold: true,
                size: 24,
                color: "2563eb"
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `This proposal outlines a comprehensive marketing and PR strategy for ${companyName} in the ${businessContext.industry} industry. Based on our consultation analysis, we have identified key opportunities and challenges that require strategic attention to maximize business growth and market presence.`,
                size: 22
              })
            ],
            spacing: { after: 300 }
          }),

          // Business Context Analysis
          new Paragraph({
            children: [
              new TextRun({
                text: "BUSINESS CONTEXT ANALYSIS",
                bold: true,
                size: 24,
                color: "2563eb"
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Industry: ",
                bold: true,
                size: 22
              }),
              new TextRun({
                text: businessContext.industry || "Not specified",
                size: 22
              })
            ],
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Company Size: ",
                bold: true,
                size: 22
              }),
              new TextRun({
                text: businessContext.size || "Not specified",
                size: 22
              })
            ],
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Primary Goals: ",
                bold: true,
                size: 22
              }),
              new TextRun({
                text: businessContext.goals || "To be defined during implementation",
                size: 22
              })
            ],
            spacing: { after: 100 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Key Challenges: ",
                bold: true,
                size: 22
              }),
              new TextRun({
                text: businessContext.challenges || "To be identified during strategy development",
                size: 22
              })
            ],
            spacing: { after: 300 }
          }),

          // Assessment Results
          new Paragraph({
            children: [
              new TextRun({
                text: "STRATEGIC ASSESSMENT RESULTS",
                bold: true,
                size: 24,
                color: "2563eb"
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          // Assessment Table
          ...(assessments.length > 0 ? [
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Assessment Category", bold: true })]
                      })],
                      width: { size: 40, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Score", bold: true })]
                      })],
                      width: { size: 20, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Key Insights", bold: true })]
                      })],
                      width: { size: 40, type: WidthType.PERCENTAGE }
                    })
                  ]
                }),
                ...assessments.map(assessment => 
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: assessment.category })]
                        })]
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ 
                            text: `${assessment.score}/100`,
                            color: assessment.score >= 70 ? "22c55e" : assessment.score >= 40 ? "f59e0b" : "ef4444"
                          })]
                        })]
                      }),
                      new TableCell({
                        children: assessment.insights.map(insight => 
                          new Paragraph({
                            children: [new TextRun({ text: `• ${insight}` })],
                            spacing: { after: 100 }
                          })
                        )
                      })
                    ]
                  })
                )
              ]
            })
          ] : []),

          // Strategic Recommendations
          new Paragraph({
            children: [
              new TextRun({
                text: "STRATEGIC RECOMMENDATIONS",
                bold: true,
                size: 24,
                color: "2563eb"
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: recommendations || "Based on our analysis, detailed recommendations will be provided in the implementation phase.",
                size: 22
              })
            ],
            spacing: { after: 300 }
          }),

          // Implementation Timeline
          new Paragraph({
            children: [
              new TextRun({
                text: "IMPLEMENTATION TIMELINE",
                bold: true,
                size: 24,
                color: "2563eb"
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Phase 1 (Weeks 1-2): Strategy Refinement & Planning",
                bold: true,
                size: 22
              })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Detailed market research and competitive analysis\n• Brand positioning and messaging framework\n• Target audience persona development",
                size: 20
              })
            ],
            spacing: { after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Phase 2 (Weeks 3-6): Content & Campaign Development",
                bold: true,
                size: 22
              })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Content strategy and editorial calendar\n• Marketing materials and collateral creation\n• PR campaign planning and media outreach",
                size: 20
              })
            ],
            spacing: { after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Phase 3 (Weeks 7-12): Execution & Optimization",
                bold: true,
                size: 22
              })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Campaign launch and monitoring\n• Performance tracking and analytics\n• Continuous optimization and refinement",
                size: 20
              })
            ],
            spacing: { after: 300 }
          }),

          // Next Steps
          new Paragraph({
            children: [
              new TextRun({
                text: "NEXT STEPS",
                bold: true,
                size: 24,
                color: "2563eb"
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "1. Review and approve this proposal\n2. Schedule kick-off meeting to finalize strategy details\n3. Begin Phase 1 implementation\n4. Establish regular progress review meetings",
                size: 22
              })
            ],
            spacing: { after: 300 }
          }),

          // Contact Information
          new Paragraph({
            children: [
              new TextRun({
                text: "CONTACT INFORMATION",
                bold: true,
                size: 24,
                color: "2563eb"
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "For questions or to proceed with this proposal, please contact:\n\nAI Marketing & PR Consultant\nEmail: consultant@yourcompany.com\nPhone: (555) 123-4567\n\nThank you for choosing our services. We look forward to helping you achieve your marketing and PR objectives.",
                size: 22
              })
            ],
            spacing: { after: 300 }
          })
        ]
      }]
    })

    const buffer = await Packer.toBuffer(doc)
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    saveAs(blob, `Marketing-PR-Proposal-${companyName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.docx`)
  }

  static async generatePowerPointProposal(data: ProposalData): Promise<void> {
    const { messages, assessments, businessContext, recommendations, companyName = 'Your Company' } = data

    const pptx = new PptxGenJS()
    
    // Set presentation properties
    pptx.author = 'AI Marketing & PR Consultant'
    pptx.company = 'Marketing Consulting Services'
    pptx.title = `Marketing & PR Strategy Proposal - ${companyName}`

    // Slide 1: Title Slide
    const titleSlide = pptx.addSlide()
    titleSlide.addText('MARKETING & PR STRATEGY PROPOSAL', {
      x: 1,
      y: 2,
      w: 8,
      h: 1.5,
      fontSize: 36,
      bold: true,
      color: '2563eb',
      align: 'center'
    })
    
    titleSlide.addText(`Prepared for: ${companyName}`, {
      x: 1,
      y: 4,
      w: 8,
      h: 0.8,
      fontSize: 24,
      bold: true,
      align: 'center'
    })
    
    titleSlide.addText(`Date: ${new Date().toLocaleDateString()}`, {
      x: 1,
      y: 5,
      w: 8,
      h: 0.6,
      fontSize: 18,
      align: 'center'
    })
    
    titleSlide.addText('AI Marketing & PR Consultant', {
      x: 1,
      y: 6.5,
      w: 8,
      h: 0.6,
      fontSize: 16,
      italic: true,
      align: 'center'
    })

    // Slide 2: Executive Summary
    const summarySlide = pptx.addSlide()
    summarySlide.addText('Executive Summary', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fontSize: 32,
      bold: true,
      color: '2563eb'
    })
    
    summarySlide.addText([
      { text: 'Strategic Overview', options: { fontSize: 20, bold: true, bullet: true } },
      { text: `Comprehensive marketing and PR strategy for ${companyName}`, options: { fontSize: 16, bullet: { indent: 20 } } },
      { text: `Industry focus: ${businessContext.industry || 'Multi-sector approach'}`, options: { fontSize: 16, bullet: { indent: 20 } } },
      { text: '', options: { fontSize: 12 } },
      { text: 'Key Opportunities Identified', options: { fontSize: 20, bold: true, bullet: true } },
      { text: 'Brand positioning enhancement', options: { fontSize: 16, bullet: { indent: 20 } } },
      { text: 'Digital marketing optimization', options: { fontSize: 16, bullet: { indent: 20 } } },
      { text: 'PR and media relations improvement', options: { fontSize: 16, bullet: { indent: 20 } } }
    ], {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 5
    })

    // Slide 3: Business Context
    const contextSlide = pptx.addSlide()
    contextSlide.addText('Business Context Analysis', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fontSize: 32,
      bold: true,
      color: '2563eb'
    })
    
    const contextData = [
      ['Category', 'Details'],
      ['Industry', businessContext.industry || 'Not specified'],
      ['Company Size', businessContext.size || 'Not specified'],
      ['Primary Goals', businessContext.goals || 'To be defined'],
      ['Key Challenges', businessContext.challenges || 'To be identified']
    ]
    
    contextSlide.addTable(contextData, {
      x: 0.5,
      y: 1.8,
      w: 9,
      h: 4,
      fontSize: 16,
      border: { pt: 1, color: 'CCCCCC' },
      fill: { color: 'F8F9FA' }
    })

    // Slide 4: Assessment Results
    if (assessments.length > 0) {
      const assessmentSlide = pptx.addSlide()
      assessmentSlide.addText('Strategic Assessment Results', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 32,
        bold: true,
        color: '2563eb'
      })
      
      const assessmentData = [
        ['Category', 'Score', 'Status'],
        ...assessments.map(assessment => [
          assessment.category,
          `${assessment.score}/100`,
          assessment.score >= 70 ? 'Strong' : assessment.score >= 40 ? 'Moderate' : 'Needs Attention'
        ])
      ]
      
      assessmentSlide.addTable(assessmentData, {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 4,
        fontSize: 16,
        border: { pt: 1, color: 'CCCCCC' }
      })
    }

    // Slide 5: Strategic Recommendations
    const recommendationsSlide = pptx.addSlide()
    recommendationsSlide.addText('Strategic Recommendations', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fontSize: 32,
      bold: true,
      color: '2563eb'
    })
    
    recommendationsSlide.addText([
      { text: 'Immediate Actions (0-30 days)', options: { fontSize: 20, bold: true, bullet: true } },
      { text: 'Brand audit and competitive analysis', options: { fontSize: 16, bullet: { indent: 20 } } },
      { text: 'Target audience research and persona development', options: { fontSize: 16, bullet: { indent: 20 } } },
      { text: '', options: { fontSize: 12 } },
      { text: 'Short-term Goals (1-3 months)', options: { fontSize: 20, bold: true, bullet: true } },
      { text: 'Content strategy development', options: { fontSize: 16, bullet: { indent: 20 } } },
      { text: 'PR campaign planning and media outreach', options: { fontSize: 16, bullet: { indent: 20 } } },
      { text: '', options: { fontSize: 12 } },
      { text: 'Long-term Strategy (3-12 months)', options: { fontSize: 20, bold: true, bullet: true } },
      { text: 'Brand positioning and market expansion', options: { fontSize: 16, bullet: { indent: 20 } } },
      { text: 'Performance optimization and scaling', options: { fontSize: 16, bullet: { indent: 20 } } }
    ], {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 5
    })

    // Slide 6: Implementation Timeline
    const timelineSlide = pptx.addSlide()
    timelineSlide.addText('Implementation Timeline', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fontSize: 32,
      bold: true,
      color: '2563eb'
    })
    
    const timelineData = [
      ['Phase', 'Duration', 'Key Activities'],
      ['Strategy & Planning', 'Weeks 1-2', 'Research, analysis, framework development'],
      ['Content Development', 'Weeks 3-6', 'Content creation, campaign planning'],
      ['Execution & Launch', 'Weeks 7-12', 'Campaign launch, monitoring, optimization']
    ]
    
    timelineSlide.addTable(timelineData, {
      x: 0.5,
      y: 1.8,
      w: 9,
      h: 4,
      fontSize: 16,
      border: { pt: 1, color: 'CCCCCC' },
      fill: { color: 'F8F9FA' }
    })

    // Slide 7: Next Steps
    const nextStepsSlide = pptx.addSlide()
    nextStepsSlide.addText('Next Steps', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fontSize: 32,
      bold: true,
      color: '2563eb'
    })
    
    nextStepsSlide.addText([
      { text: '1. Proposal Review & Approval', options: { fontSize: 20, bold: true, bullet: true } },
      { text: 'Review proposal details and provide feedback', options: { fontSize: 16, bullet: { indent: 20 } } },
      { text: '', options: { fontSize: 12 } },
      { text: '2. Project Kick-off Meeting', options: { fontSize: 20, bold: true, bullet: true } },
      { text: 'Schedule initial strategy session', options: { fontSize: 16, bullet: { indent: 20 } } },
      { text: '', options: { fontSize: 12 } },
      { text: '3. Implementation Begin', options: { fontSize: 20, bold: true, bullet: true } },
      { text: 'Start Phase 1 activities and establish regular check-ins', options: { fontSize: 16, bullet: { indent: 20 } } }
    ], {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 5
    })

    // Slide 8: Contact Information
    const contactSlide = pptx.addSlide()
    contactSlide.addText('Contact Information', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fontSize: 32,
      bold: true,
      color: '2563eb'
    })
    
    contactSlide.addText([
      { text: 'AI Marketing & PR Consultant', options: { fontSize: 24, bold: true } },
      { text: '', options: { fontSize: 12 } },
      { text: 'Email: consultant@yourcompany.com', options: { fontSize: 18 } },
      { text: 'Phone: (555) 123-4567', options: { fontSize: 18 } },
      { text: '', options: { fontSize: 16 } },
      { text: 'Thank you for choosing our services!', options: { fontSize: 20, italic: true } },
      { text: 'We look forward to helping you achieve your marketing and PR objectives.', options: { fontSize: 16 } }
    ], {
      x: 1,
      y: 2,
      w: 8,
      h: 4,
      align: 'center'
    })

    // Generate and download the presentation
    const buffer = await pptx.write('arraybuffer')
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
    saveAs(blob, `Marketing-PR-Proposal-${companyName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pptx`)
  }
}