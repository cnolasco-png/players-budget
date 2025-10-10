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
