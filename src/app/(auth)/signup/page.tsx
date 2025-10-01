import FormLayout from '@/components/forms/FormLayout'
import SignUpForm from '@/components/forms/SignUpForm'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Sign Up - Ishq Gems',
  description: 'Create your Ishq Gems account to start exploring luxury gemstones.',
})

export default function SignUpPage() {
  return (
    <FormLayout title="Join Ishq Gems" subtitle="Create your account to discover the world's finest gemstones">
      <SignUpForm />
    </FormLayout>
  )
}