# Line Table Booking Mini App - TODO

## Database & Backend
- [x] Design and create database schema (users, menus, reservations, notifications)
- [x] Create migration SQL and apply to database
- [x] Implement API endpoints for menu listing
- [x] Implement API endpoints for reservation management
- [x] Implement API endpoints for user reservation history
- [x] Implement owner notification system
- [x] Create unit tests for backend procedures

## Frontend - Layout & Navigation
- [x] Set up elegant design system (colors, typography, spacing)
- [x] Create main layout with navigation
- [x] Set up routing structure

## Frontend - Pages
- [x] Create Home page with welcome and navigation
- [x] Create Menu page with new menu items display
- [x] Create Reservation page (booking form)
- [x] Create Reservation History page
- [ ] Create User Profile page

## Line LIFF Integration
- [x] Set up LIFF SDK integration
- [x] Implement Line Login flow
- [ ] Connect Line user data to database
- [ ] Handle Line user profile information

## Features
- [x] Menu display with images and details
- [x] Reservation form with date/time/guests/notes
- [x] Reservation history with status tracking
- [x] Owner notification on new bookings
- [x] Reservation status management (confirmed, completed, cancelled)

## Testing & Polish
- [x] Test all reservation flows
- [ ] Test Line Login integration
- [ ] Optimize UI/UX for mobile
- [ ] Performance testing
- [ ] Create final checkpoint

## Deployment
- [ ] Prepare deployment documentation
- [ ] Set up LIFF configuration
- [ ] Deploy to production

## Share Reservation Feature (NEW)
- [x] Create Flex Message builder for reservation sharing
- [x] Add share button to reservation confirmation page
- [x] Implement LIFF sendMessages API for Line chat sharing
- [x] Test sharing functionality

## LINE Automatic Notification Feature (NEW)
- [x] Set up LINE Message API integration
- [x] Create Flex Message builder for reminder notifications
- [x] Implement scheduled job for 24-hour reminders
- [x] Store LINE user ID with reservations
- [x] Test notification sending

## Admin Dashboard Feature (NEW)
- [x] Create API endpoints for admin statistics and reservation management
- [x] Build Admin Dashboard page with layout and navigation
- [x] Implement reservations table with pagination and filtering
- [x] Add statistics cards (today, this week, this month)
- [x] Create reservation charts/graphs
- [x] Add reservation management features (status update, cancel, search)
- [x] Implement message sending to users
- [x] Test admin dashboard functionality

## LINE Forced Login Feature (NEW)
- [x] Create LINE Login page with LIFF integration
- [x] Implement route guard for forced login
- [x] Handle LINE profile data on login
- [x] Test forced login flow

## LINE LIFF Auth Fix (NEW BUG FIX)
- [x] Replace Manus OAuth with LINE LIFF Auth in context
- [x] Update Home.tsx to check LINE LIFF login status
- [x] Update LineLogin.tsx to use LINE LIFF login directly
- [x] Test LINE login flow from Mini App URL
- [x] Set up VITE_LINE_LIFF_ID environment variable

## UI Improvements (NEW)
- [x] Update Reservation page header to show LINE user profile (picture + name) instead of login button

## Bug Fixes (NEW)
- [x] Fix LINE login returning to same page - added refreshLoginStatus to LiffContext and visibility change listener

## User Profile Feature (NEW)
- [x] Create User Profile page to display customer information
- [x] Update Reservations.tsx to use LINE auth instead of Manus auth
- [x] Change "การจองของฉัน" button to link to profile page instead of showing login

## UI Fixes (NEW)
- [x] Remove login button from Reservation page
- [x] Remove login button from Menu page
- [x] Add branch dropdown selector to Reservation page (10 branches)
- [x] Add 3 sample menu items with images to Menu page

## Branding Update
- [x] Change restaurant name from "Fine Dining" to "Choongman Chicken" across all pages

## Homepage Redesign
- [x] Redesign Home page as all-in-one booking page (branch select, date, time, guests, submit)
- [x] Beautiful UX/UI with Korean fried chicken theme
- [x] Update color theme to match Choongman Chicken brand (red/orange tones)
- [x] Add hero image/banner for the restaurant
- [x] Show LINE profile in header
- [x] Quick access to menu and reservations from home

## Bug Fixes & Features (NEW)
- [x] Fix Reservations page not working
- [x] Add language switcher (English/Thai)
- [x] Create Language Context for i18n
- [ ] Translate all pages to English and Thai (partial - Home page done)

## Bug Reports (NEW)
- [x] Fix UI overlap issue on home page - adjusted negative margin and padding
- [x] Fix Reservations page not working - changed to publicProcedure with user check

## Critical Bug (NEW)
- [x] Fix "Unauthorized" error when confirming reservation - added LINE login bridge to backend
