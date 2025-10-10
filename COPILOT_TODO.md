# COPILOT TODO - Task Prompts

## Project Context
- Next.js App Router + Supabase + Stripe + shadcn/ui
- Deployed on Vercel
- TypeScript throughout
- Maintain accessibility
- Commit after each step with clear messages

## PDF Assets Setup
- [ ] Add `public/sponsor-tool.pdf` - Professional sponsor deck template (from Gamma)
- [ ] Add `public/financial-mindset-accelerator.pdf` - Free course workbook
- [ ] Update PDF serving logic to use static files instead of generation

## Pending Task Prompts
(Paste new task prompts below this line)

---

### Task 1: PDF Asset Integration
**Status**: Ready for PDFs
**Files**: 
- `src/lib/generateSponsorTemplate.ts` - Update to serve static PDF
- `public/sponsor-tool.pdf` - Gamma-designed sponsor template
- `public/financial-mindset-accelerator.pdf` - Course workbook

**Requirements**:
- Replace programmatic PDF generation with static file serving
- Maintain same download functionality
- Ensure proper MIME types and download attributes
- Add error handling for missing files

---

## Completed Tasks
(Move completed tasks here with commit hashes)

### ✅ Feature Gating System for Fan Monetization - COMPLETED
**Files Created**:
- `src/lib/useFeatureFlag.ts` - Feature flag hook with session caching
- `src/lib/usePro.ts` - Pro subscription status hook
- `src/lib/useModuleGate.ts` - Course module access control hook
- `src/integrations/supabase/types.ts` - Updated TypeScript definitions
- `supabase/migrations/2025_10_09_fan_monetization_gate.sql` - Database schema

**Implementation Details**:
- All three gating hooks implemented with comprehensive error handling
- Memory caching (5 minutes) for optimal performance
- Graceful fallbacks for authentication and database errors
- User feedback via toast notifications for errors
- Full TypeScript support with proper type definitions

**Functionality**:
- `useFeatureFlag('fan_monetization')` - Checks if feature is enabled or auto-enabled by release date
- `usePro()` - Determines if user has active/trialing subscription
- `useModuleGate('module-slug')` - Controls access to course modules based on flags and tier requirements

**Database Schema**:
- `feature_flags` table with release date logic
- `course_modules` table with tier requirements (free/pro)
- `waitlist_signups` table for interest collection
- `user_subscriptions` table for Pro status tracking
- Comprehensive RLS policies for security

### ✅ Waitlist API - COMPLETED  
**Files Created**:
- `api/waitlist.ts` - Vercel API route for waitlist signup

**Implementation Details**:
- **POST `/api/waitlist`** - Accepts `{ moduleSlug, email }` and inserts into `waitlist_signups`
- **Rate Limiting**: 10 requests per minute per IP (in-memory with TODO for Upstash Redis)
- **Email Validation**: Basic regex validation for email format
- **Authentication**: Optional user_id attachment if Bearer token provided
- **Duplicate Prevention**: Checks for existing email+module combinations
- **Module Validation**: Verifies moduleSlug exists in course_modules table
- **Error Handling**: Comprehensive error responses with appropriate HTTP status codes
- **Method Restrictions**: GET returns 405 Method Not Allowed

**API Response Format**:
- Success: `{ ok: true, message: "Successfully joined the waitlist!", id: "uuid" }`
- Errors: `{ ok: false, error: "Error message" }` with appropriate status codes
- Rate limit: `{ ok: false, error: "Rate limit exceeded...", resetTime: timestamp }`

### ✅ FMSA Academy Course Page - COMPLETED
**Files Created**:
- `src/pages/FMSA.tsx` - Financial Mindset & Strategy Accelerator course page
- `supabase/migrations/20251010_add_course_progress.sql` - Course progress tracking table
- Updated `src/integrations/supabase/types.ts` - Added course_progress table types
- Updated `src/App.tsx` - Added route `/academy/fmsa`

**Implementation Details**:
- **Hero Section**: Course title, description, and CTA buttons for workbook/sponsor tool downloads
- **Progress Tracking**: Interactive chips for Day 0-5 with visual completion indicators
- **Course Content**: Six accordion sections (Day 0-5) with Principles/Mindset, Do actions, and Proof sections
- **Gated Content**: Fan Monetization module with `<LessonGate>` component integration
- **Responsive Design**: Mobile-friendly layout with proper spacing and accessibility

**LessonGate Component Features**:
- **Coming Soon State**: Shows waitlist email capture, Discord link, teaser bullets, branding
- **Pro Required State**: Shows Pro upgrade CTA with feature highlights  
- **Unlocked State**: TODO comment for future content display
- **Loading State**: Skeleton animation while checking module access
- **Error Handling**: Toast notifications for API interactions

**Integration Points**:
- Uses `useModuleGate('fan-monetization')` for access control
- Connects to `/api/waitlist` for email capture
- Links to `/settings/billing` for Pro upgrades
- Downloads PDFs via `generateFinancialMindsetAccelerator()` and `generateProfessionalSponsorTemplate()`
- Course progress stored in `course_progress` table with user_id + course_id unique constraint

**Accessibility Features**:
- Focus-visible rings on interactive elements
- Proper ARIA attributes on accordion components
- Semantic HTML structure with headings hierarchy
- Screen reader friendly progress indicators

### ✅ Navigation Integration - COMPLETED
**Files Modified**:
- `src/pages/SeasonDashboard.tsx` - Added Academy and Sponsors nav links
- `src/pages/SponsorsTool.tsx` - Updated navigation with Academy link
- `src/pages/FMSA.tsx` - Added complete navigation header for consistency

**Implementation Details**:
- **Academy Link**: Links to `/academy/fmsa` for the Financial Mindset & Strategy Accelerator course
- **Sponsors Link**: Links to `/sponsors/tool` with existing auth requirement (redirects to `/auth` if not logged in)
- **Active Route Styling**: Shows active page with secondary color and bottom border
- **Consistent Navigation**: All pages with navigation now have the same header structure

**Navigation Pattern**:
- Horizontal navigation bar with Dashboard, Academy, Sponsors, Pricing, Settings
- Sticky header with primary background and proper focus states
- Responsive design with proper spacing and hover effects
- Page titles dynamically update based on current route

**Authentication Requirements**:
- Academy: No auth required (accessible to all users)
- Sponsors: Auth required (existing `checkUser()` function redirects to `/auth`)
- All nav links respect authentication state and redirect appropriately
