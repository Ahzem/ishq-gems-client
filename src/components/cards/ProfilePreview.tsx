// 'use client'

// import { User, Mail, Shield, Gem, ShoppingBag } from 'lucide-react'
// import { UserProfile } from '@/services/user.service'
// import { cn } from '@/lib/utils'
// import Link from 'next/link'

// interface ProfilePreviewProps {
//   profile: UserProfile
//   compact?: boolean
//   showLink?: boolean
//   className?: string
// }

// export default function ProfilePreview({ 
//   profile, 
//   compact = false, 
//   showLink = true,
//   className 
// }: ProfilePreviewProps) {
//   const getRoleIcon = () => {
//     switch (profile.role) {
//       case 'buyer':
//         return <ShoppingBag className="w-4 h-4 text-blue-500" />
//       case 'seller':
//         return <Gem className="w-4 h-4 text-accent" />
//       case 'admin':
//         return <Shield className="w-4 h-4 text-purple-500" />
//       default:
//         return <User className="w-4 h-4 text-muted-foreground" />
//     }
//   }

//   const getRoleColor = () => {
//     switch (profile.role) {
//       case 'buyer':
//         return 'text-blue-500'
//       case 'seller':
//         return profile.isVerifiedSeller ? 'text-green-500' : 'text-yellow-500'
//       case 'admin':
//         return 'text-purple-500'
//       default:
//         return 'text-muted-foreground'
//     }
//   }

//   const content = (
//     <div className={cn(
//       "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
//       showLink && "hover:bg-secondary/50 cursor-pointer",
//       compact ? "p-2" : "",
//       className
//     )}>
//       {/* Avatar */}
//       <div className={cn(
//         "rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0",
//         compact ? "w-8 h-8" : "w-12 h-12"
//       )}>
//         {profile.avatar ? (
//           <img 
//             src={profile.avatar} 
//             alt="Profile" 
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <User className={cn("text-muted-foreground", compact ? "w-4 h-4" : "w-6 h-6")} />
//         )}
//       </div>

//       {/* Profile Info */}
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2 mb-1">
//           <h3 className={cn(
//             "font-medium text-foreground truncate",
//             compact ? "text-sm" : "text-base"
//           )}>
//             {profile.fullName}
//           </h3>
//           <div className="flex items-center gap-1">
//             {getRoleIcon()}
//             {profile.isEmailVerified && (
//               <Shield className="w-3 h-3 text-green-400" />
//             )}
//           </div>
//         </div>
        
//         {!compact && (
//           <div className="flex items-center gap-2 text-xs text-muted-foreground">
//             <Mail className="w-3 h-3" />
//             <span className="truncate">{profile.email}</span>
//           </div>
//         )}
        
//         <div className="flex items-center gap-2 mt-1">
//           <span className={cn("text-xs font-medium capitalize", getRoleColor())}>
//             {profile.role}
//             {profile.role === 'seller' && (
//               <span className="ml-1">
//                 {profile.isVerifiedSeller ? '✓' : '⏳'}
//               </span>
//             )}
//           </span>
//         </div>
//       </div>

//       {/* Stats (non-compact only) */}
//       {!compact && (
//         <div className="text-right">
//           <div className="text-lg font-bold text-primary">
//             {profile.role === 'buyer' 
//               ? profile.orderCount || 0 
//               : profile.gemsListedCount || 0
//             }
//           </div>
//           <div className="text-xs text-muted-foreground">
//             {profile.role === 'buyer' ? 'Orders' : 'Gems'}
//           </div>
//         </div>
//       )}
//     </div>
//   )

//   if (showLink) {
//     return (
//       <Link href="/account/profile" className="block">
//         {content}
//       </Link>
//     )
//   }

//   return content
// }

// // Quick stats component for profile
// export function ProfileStats({ profile }: { profile: UserProfile }) {
//   return (
//     <div className="grid grid-cols-2 gap-4">
//       <div className="text-center p-3 bg-card rounded-lg border border-border/30">
//         <div className="text-2xl font-bold text-primary">
//           {profile.role === 'buyer' ? profile.orderCount || 0 : profile.gemsListedCount || 0}
//         </div>
//         <div className="text-sm text-muted-foreground">
//           {profile.role === 'buyer' ? 'Orders' : 'Gems Listed'}
//         </div>
//       </div>
      
//       <div className="text-center p-3 bg-card rounded-lg border border-border/30">
//         <div className="text-2xl font-bold text-accent">
//           {profile.role === 'buyer' 
//             ? profile.wishlistCount || 0 
//             : profile.isVerifiedSeller ? '✓' : '⏳'
//           }
//         </div>
//         <div className="text-sm text-muted-foreground">
//           {profile.role === 'buyer' ? 'Wishlist' : 'Status'}
//         </div>
//       </div>
//     </div>
//   )
// } 