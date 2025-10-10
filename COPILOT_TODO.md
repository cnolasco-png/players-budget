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
