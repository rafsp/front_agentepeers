// 'use client'

// import React from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { 
//   ArrowLeft, 
//   Home,
//   Settings,
//   Activity,
//   FileText,
//   Code2,
//   Github,
//   User,
//   LogOut,
//   Menu,
//   X
// } from 'lucide-react'
// import { useState } from 'react'
// import { useJobStore } from '@/stores/job-store'
// import { useCompanyStore } from '@/stores/company-store'

// interface DashboardLayoutProps {
//   children: React.ReactNode
//   title?: string
//   subtitle?: string
//   showBackButton?: boolean
//   backHref?: string
//   actions?: React.ReactNode
// }

// export function DashboardLayout({
//   children,
//   title,
//   subtitle,
//   showBackButton = false,
//   backHref = '/dashboard',
//   actions
// }: DashboardLayoutProps) {
//   const router = useRouter()
//   const pathname = usePathname()
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const { jobs } = useJobStore()
//  // const { githubToken } = useCompanyStore()

//   const jobsList = Object.values(jobs)
//   const runningJobs = jobsList.filter(job => 
//     ['running', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)
//   )
//   const pendingJobs = jobsList.filter(job => job.status === 'pending_approval')

//   const navigation = [
//     {
//       name: 'Dashboard',
//       href: '/dashboard',
//       icon: Home,
//       current: pathname === '/dashboard'
//     },
//     {
//       name: 'Nova Análise',
//       href: '/dashboard/new-analysis',
//       icon: Code2,
//       current: pathname === '/dashboard/new-analysis'
//     },
//     {
//       name: 'Jobs',
//       href: '/dashboard/jobs',
//       icon: Activity,
//       current: pathname.startsWith('/dashboard/jobs'),
//       badge: runningJobs.length + pendingJobs.length > 0 ? runningJobs.length + pendingJobs.length : null
//     },
//     {
//       name: 'Relatórios',
//       href: '/dashboard/reports',
//       icon: FileText,
//       current: pathname.startsWith('/dashboard/reports')
//     },
//     {
//       name: 'Configurações',
//       href: '/dashboard/settings',
//       icon: Settings,
//       current: pathname.startsWith('/dashboard/settings')
//     }
//   ]

//   const NavItem = ({ item, mobile = false }: { item: typeof navigation[0], mobile?: boolean }) => (
//     <button
//       onClick={() => {
//         router.push(item.href)
//         if (mobile) setSidebarOpen(false)
//       }}
//       className={`
//         w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
//         ${item.current 
//           ? 'bg-blue-50 text-blue-700 border border-blue-200' 
//           : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
//         }
//       `}
//     >
//       <item.icon className="h-5 w-5" />
//       <span className="flex-1 text-left">{item.name}</span>
//       {item.badge && (
//         <Badge className="bg-red-500 text-white text-xs">
//           {item.badge}
//         </Badge>
//       )}
//     </button>
//   )

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Mobile sidebar backdrop */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={`
//         fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:transform-none lg:static lg:inset-0
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
//       `}>
//         <div className="flex flex-col h-full">
//           {/* Logo */}
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
//                 <Code2 className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">Peers</h1>
//                 <p className="text-xs text-gray-600">AI Code Analysis</p>
//               </div>
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 p-4">
//             <div className="space-y-2">
//               {navigation.map((item) => (
//                 <NavItem key={item.name} item={item} />
//               ))}
//             </div>

//             {/* GitHub Status */}
//             <div className="mt-8">
//               <div className={`
//                 p-4 rounded-lg border-2 border-dashed transition-all duration-200
//                 ${githubToken 
//                   ? 'border-green-200 bg-green-50' 
//                   : 'border-amber-200 bg-amber-50'
//                 }
//               `}>
//                 <div className="flex items-center gap-3 mb-2">
//                   <Github className={`h-5 w-5 ${githubToken ? 'text-green-600' : 'text-amber-600'}`} />
//                   <span className={`text-sm font-medium ${githubToken ? 'text-green-700' : 'text-amber-700'}`}>
//                     GitHub
//                   </span>
//                 </div>
//                 <p className={`text-xs ${githubToken ? 'text-green-600' : 'text-amber-600'}`}>
//                   {githubToken ? 'Conectado' : 'Não configurado'}
//                 </p>
//                 {!githubToken && (
//                   <Button 
//                     size="sm" 
//                     className="mt-2 w-full bg-amber-600 hover:bg-amber-700 text-white"
//                     onClick={() => router.push('/dashboard/settings/github')}
//                   >
//                     Configurar
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </nav>

//           {/* User section */}
//           <div className="p-4 border-t border-gray-200">
//             <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
//               <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
//                 <User className="h-4 w-4 text-gray-600" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-sm font-medium text-gray-900">Usuário</p>
//                 <p className="text-xs text-gray-600">Administrator</p>
//               </div>
//               <Button variant="ghost" size="sm">
//                 <LogOut className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="lg:ml-64">
//         {/* Top bar */}
//         <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
//           <div className="px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between h-16">
//               {/* Mobile menu button */}
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="lg:hidden"
//                 onClick={() => setSidebarOpen(true)}
//               >
//                 <Menu className="h-5 w-5" />
//               </Button>

//               {/* Page title */}
//               <div className="flex-1 lg:flex lg:items-center lg:justify-between">
//                 <div className="flex items-center gap-4">
//                   {showBackButton && (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => router.push(backHref)}
//                       className="text-gray-600 hover:text-gray-900"
//                     >
//                       <ArrowLeft className="h-4 w-4 mr-2" />
//                       Voltar
//                     </Button>
//                   )}
//                   {title && (
//                     <div>
//                       <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
//                       {subtitle && (
//                         <p className="text-sm text-gray-600">{subtitle}</p>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Actions */}
//                 {actions && (
//                   <div className="flex items-center gap-3">
//                     {actions}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="flex-1">
//           {children}
//         </main>
//       </div>

//       {/* Mobile sidebar close button */}
//       {sidebarOpen && (
//         <Button
//           variant="ghost"
//           size="sm"
//           className="fixed top-4 right-4 z-50 lg:hidden bg-white shadow-lg"
//           onClick={() => setSidebarOpen(false)}
//         >
//           <X className="h-5 w-5" />
//         </Button>
//       )}
//     </div>
//   )
// }