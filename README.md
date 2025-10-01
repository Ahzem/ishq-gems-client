# Ishq Gems - Luxury Jewelry Marketplace

A modern, luxury-themed landing page for a premium gems and jewelry marketplace built with Next.js and Tailwind CSS.

## ✨ Features

### 🎨 **Luxury Design**
- **Premium Black/Gold Theme**: Elegant color scheme with gold accents (`#d4af37`, `#ffd700`)
- **Typography**: Playfair Display (serif) for headings, Inter for body text
- **Responsive Design**: Mobile-first approach with smooth breakpoints
- **Smooth Animations**: Custom luxury animations (`luxury-fade-in`, `luxury-slide-up`)

### 🌓 **Theme System**
- **Dark/Light Mode Toggle**: Seamless theme switching with `next-themes`
- **Persistent Theme**: User preference saved in localStorage
- **Smooth Transitions**: 300ms transition effects for theme changes

### 🧭 **Navigation**
- **Fixed Header**: Elegant navigation with logo and theme toggle
- **Mobile Responsive**: Hamburger menu for mobile devices
- **Active States**: Hover effects and gradient underlines
- **Routes Available**:
  - `/` - Home (fully functional)
  - `/explore` - Coming Soon page
  - `/about` - Coming Soon page  
  - `/contact` - Coming Soon page
  - `/sell` - Coming Soon page

### 🏠 **Landing Page Components**

#### **Hero Section**
- **Background**: Cloudinary-hosted luxury jewelry image
- **Typography**: Large serif headings with gradient text effects
- **CTAs**: Primary and secondary call-to-action buttons
- **Stats**: Showcase key metrics (10K+ pieces, 50+ craftsmen, 25 years legacy)
- **Animations**: Fade-in effects and decorative elements

#### **About Section**
- **Feature Cards**: Premium quality, craftsmanship, and elegance highlights
- **Story Section**: Company heritage and legacy
- **Visual Elements**: Cloudinary image integration
- **CTA Integration**: "Start Exploring" button

#### **Footer**
- **Brand Section**: Logo, description, and contact information
- **Link Categories**: Quick links, customer care, and legal pages
- **Newsletter**: Email subscription with luxury styling
- **Social Media**: Facebook, Twitter, Instagram links
- **Copyright**: Legal information and policy links

### 🚧 **Coming Soon Pages**
- **Consistent Design**: Matches luxury theme across all pages
- **Interactive Elements**: Email notification signup
- **Navigation**: Easy return to home page
- **Custom Content**: Tailored messaging for each page type

## 🛠️ **Tech Stack**

- **Framework**: Next.js 15.3.2 (App Router)
- **Styling**: Tailwind CSS 4.1.10
- **Fonts**: Google Fonts (Playfair Display, Inter)
- **Icons**: Lucide React
- **Theme**: next-themes
- **Images**: Cloudinary integration
- **TypeScript**: Full type safety

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── about/
│   │   └── page.tsx       # About page (Coming Soon)
│   ├── contact/
│   │   └── page.tsx       # Contact page (Coming Soon)
│   ├── explore/
│   │   └── page.tsx       # Explore page (Coming Soon)
│   ├── sell/
│   │   └── page.tsx       # Sell page (Coming Soon)
│   ├── globals.css        # Global styles with custom CSS variables
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Home page
├── components/
│   ├── Header.tsx         # Navigation header with theme toggle
│   ├── Hero.tsx           # Landing page hero section
│   ├── About.tsx          # About section component
│   ├── Footer.tsx         # Site footer
│   └── ComingSoon.tsx     # Reusable coming soon component
```

## 🎨 **Design System**

### **Colors**
```css
--primary: #d4af37    /* Gold */
--accent: #ffd700     /* Bright Gold */
--background: #0a0a0a /* Dark Black */
--foreground: #fafafa /* Light Gray */
```

### **Typography**
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Weights**: 400, 500, 600, 700

### **Animations**
- **luxury-fade-in**: Smooth fade with slight upward movement
- **luxury-slide-up**: Slide up animation with opacity transition
- **Hover Effects**: Scale, shadow, and color transitions

## 🖼️ **Image Integration**

The project uses Cloudinary for image hosting:

- **Hero Background**: `luxury-jewelry-background`
- **About Section**: `jewelry-craftsmanship`
- **Optimized Delivery**: Auto-format and quality optimization
- **Responsive**: Different sizes for different breakpoints

## 📱 **Responsive Breakpoints**

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px
- **Large Desktop**: > 1280px

## 🔧 **Customization**

### **Theme Colors**
Modify colors in `src/app/globals.css`:

```css
:root {
  --primary: #your-color;
  --accent: #your-accent;
}
```

### **Fonts**
Update fonts in `src/app/layout.tsx`:

```typescript
const customFont = Your_Font({
  variable: "--font-custom",
  subsets: ["latin"],
});
```

### **Content**
Update text content directly in component files:
- Hero messaging in `src/components/Hero.tsx`
- About content in `src/components/About.tsx`
- Footer links in `src/components/Footer.tsx`

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
npm run build
# Deploy to Vercel
```

### **Other Platforms**
```bash
npm run build
npm start
```

## 📄 **License**

This project is created for Ishq Gems luxury jewelry marketplace.

---

**Built with ❤️ for luxury and elegance**
