// Configuration for the authentication and device fingerprinting system

// Supabase Configuration (already defined in supabase.ts, but we keep constants here for reference)
export const SUPABASE_URL = 'https://pqqaupbkamtfjweajkjo.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWF1cGJrYW10Zmp3ZWFqa2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjc4MDgsImV4cCI6MjA4MzEwMzgwOH0.Poaanj0Xa3wDfDRe5Q1pZpdGtkR-hOMUZSrdm9dLfSE'

// Session Configuration
export const SESSION_DURATION_DAYS = 7 // Session validity in days
export const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000 // In milliseconds

// Cookie Names
export const COOKIE_SESSION_TOKEN = 'ebook_session_token'
export const COOKIE_DEVICE_ID = 'ebook_device_id'
export const COOKIE_USER_ID = 'ebook_user_id'

// Cookie Settings
export const COOKIE_MAX_AGE = SESSION_DURATION_DAYS * 24 * 60 * 60 // In seconds
export const COOKIE_PATH = '/'
export const COOKIE_SECURE = process.env.NODE_ENV === 'production' // Use secure cookies in production
export const COOKIE_SAME_SITE = 'Strict' as const

// Total pages in the book (for reading progress)
export const TOTAL_BOOK_PAGES = 73 // Intro 2 + S1 11 + S2 6 + S3 9 + S4 11 + S5 10 + S6 9 + Library 6 + Appendix 6 + Glossary 3 = 73
