import FormLayout from '@/components/forms/FormLayout'
import SignInForm from '@/components/forms/SignInForm'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Sign In - Ishq Gems',
  description: 'Sign in to your Ishq Gems account to explore luxury gemstones.',
})

export default function SignInPage() {
  return (
    <FormLayout 
      title="Sign In to Ishq Gems"
      subtitle="Welcome back to your luxury gemstone marketplace"
    >
      <SignInForm />
    </FormLayout>
  )
} 