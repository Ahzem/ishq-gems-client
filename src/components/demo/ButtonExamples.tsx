// Example usage of the reusable Button component
import Button from '@/components/buttons/Button'
import { ArrowRight, Mail, Plus, Download, Settings, Trash2 } from 'lucide-react'

export default function ButtonExamples() {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Button Variants</h2>
        
        {/* Primary Buttons (matching your design) */}
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="primary" shape="rounded">Primary Rounded</Button>
          <Button variant="primaryReverse">Primary Reverse</Button>
        </div>

        {/* Other Variants */}
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Buttons with Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button leftIcon={<Mail />}>Send Message</Button>
          <Button rightIcon={<ArrowRight />}>Get Started</Button>
          <Button leftIcon={<Plus />} variant="secondary">Add Item</Button>
          <Button rightIcon={<Download />} variant="outline">Download</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Link Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button href="/contact">Contact Us</Button>
          <Button href="/about" variant="secondary">Learn More</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Loading States</h2>
        <div className="flex flex-wrap gap-4">
          <Button loading>Loading</Button>
          <Button loading loadingText="Sending...">Send Message</Button>
          <Button loading variant="secondary">Processing</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Disabled States</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled Primary</Button>
          <Button disabled variant="secondary">Disabled Secondary</Button>
          <Button disabled variant="outline">Disabled Outline</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Common Use Cases</h2>
        <div className="flex flex-wrap gap-4">
          {/* CTA Button - matches your ContactJoinUs component style */}
          <Button 
            variant="primary" 
            shape="rounded" 
            rightIcon={<ArrowRight />}
            size="lg"
          >
            Get in Touch
          </Button>

          {/* Settings button */}
          <Button variant="ghost" leftIcon={<Settings />}>
            Settings
          </Button>

          {/* Delete button */}
          <Button variant="danger" leftIcon={<Trash2 />} size="sm">
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
