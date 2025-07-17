import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'ai-marketing-pr-consultant-o584gzmp',
  authRequired: true
})

// Disable analytics temporarily to prevent 504 errors
if (blink.analytics && blink.analytics.disable) {
  blink.analytics.disable()
}