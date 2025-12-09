# Phase 1 Testing Guide

## Testing Checklist

### 1. Google OAuth Login ✓

#### Prerequisites
Google OAuth requires configuration in the Lovable Cloud dashboard:
1. Open the backend settings
2. Navigate to Auth Settings → Google Settings
3. Add your Google Client ID and Secret from Google Cloud Console

#### Test Steps
1. **Navigate to Auth Page**
   - Go to `/auth`
   - You should see "Continue with Google" button

2. **Test Google Login**
   - Click "Continue with Google" button
   - Should redirect to Google login
   - After authentication, should redirect back to app
   - Should land on `/` (AI Assistant page)

3. **Verify Session Persistence**
   - After logging in, refresh the page
   - Should remain logged in
   - Check that user info appears in sidebar

4. **Common Issues**
   - If you get "requested path is invalid" error:
     - Check Site URL and Redirect URL in Lovable Cloud dashboard
     - Site URL should be your app's URL
     - Redirect URL should include your preview/deployed URL
   - If redirected to localhost:3000:
     - Update redirect URLs in Lovable Cloud settings

**Expected Result**: Successful Google login with session persistence

---

### 2. AI Chat - Hidden Internal Processing ✓

#### Test Steps
1. **Start New Conversation**
   - Navigate to `/` (AI Assistant)
   - Type a question like: "What are the top engineering colleges in India?"
   - Press Enter or click Send

2. **Observe Loading State**
   - You should see a clean loading indicator with 3 bouncing dots
   - You should **NOT** see any of these:
     - "Searching web..."
     - "Querying database..."
     - "Analyzing your question..."
     - "Gathering information..."
     - Any tool/function call references

3. **Check Streaming Response**
   - Response should appear gradually (streaming)
   - Text should appear word by word
   - No technical artifacts in the response

4. **Test Complex Query**
   - Ask: "Compare IIT Delhi vs BITS Pilani for Computer Science"
   - Should trigger web search and database queries internally
   - BUT user should only see clean loading indicator
   - Response should be comprehensive without exposing internal operations

**Expected Result**: 
- Clean loading animation only
- No internal processing details visible
- Smooth streaming responses
- Professional UX throughout

---

### 3. Profile Sync to Database ✓

#### Test Steps

**Part A: Save Profile (Logged Out)**
1. Navigate to `/profile`
2. Fill in mandatory fields:
   - Full Name
   - Email
   - Phone
   - 10th Board & Percentage
   - 12th Board, Stream & Percentage
3. Click "Save Profile"
4. Should see toast: "Saved Locally"
5. Refresh page - data should persist

**Part B: Save Profile (Logged In)**
1. Log in via Google OAuth (or email/password)
2. Navigate to `/profile`
3. Fill in profile fields
4. Click "Save Profile"
5. Should see toast: "Profile saved successfully!"
6. Open browser console and check network tab
7. Should see POST request to Supabase
8. Check database:
   ```sql
   SELECT * FROM student_profiles ORDER BY created_at DESC LIMIT 1;
   ```
   Your profile data should be there

**Part C: Test Auto-sync After Login**
1. Log out
2. Fill profile while logged out (saves to localStorage)
3. Log in
4. Navigate to profile
5. Save profile
6. Data should sync to database
7. Profile should now be accessible across devices

**Part D: Mandatory Fields Validation**
1. Navigate to `/profile`
2. Leave some mandatory fields empty
3. Should see alert at top with:
   - Progress bar showing completion %
   - List of missing fields
4. Fill missing fields
5. Alert should update/disappear when complete

**Expected Result**:
- Profile saves locally when logged out
- Profile syncs to Supabase when logged in
- Mandatory field validation works
- Data persists across sessions

---

### 4. Forum Real-Time Updates ✓

#### Test Setup
Open two browser windows side-by-side (or two different browsers):
- Window A: Your main testing window
- Window B: Second window for real-time verification

#### Test Steps

**Test 4A: Like/Unlike Posts**
1. Both windows: Navigate to `/forum`
2. Window A: Click like/heart on a post
3. Window B: Like count should update immediately (no refresh needed)
4. Window A: Click unlike
5. Window B: Like count should decrement immediately

**Test 4B: Comments**
1. Both windows: Open same post (click on a post)
2. Window A: Add a comment
3. Window B: New comment should appear immediately
4. Comment count on post should update in both windows

**Test 4C: Community Join/Leave**
1. Both windows: Navigate to `/forum/community/:communityId`
2. Window A: Click "Join Community"
3. Window B: Member count should increment immediately
4. Window A: Click "Leave Community"
5. Window B: Member count should decrement immediately

**Test 4D: Reposts/Shares**
1. Both windows: View a post
2. Window A: Click repost/share button
3. Window B: Repost count should update immediately

**Expected Result**:
- All interactions update in real-time across windows
- No page refresh needed
- Counts update within 1-2 seconds
- Smooth, seamless experience

---

## Troubleshooting

### Google OAuth Not Working
**Symptom**: Error on login or redirect issues
**Solution**:
1. Check Google Cloud Console:
   - Authorized JavaScript origins includes your app URL
   - Authorized redirect URLs includes Supabase callback URL
2. Check Lovable Cloud dashboard:
   - Site URL is set correctly
   - Redirect URLs include all your domains
3. Verify in config:
   - Client ID and Secret are correct

### AI Chat Still Showing Internal Processing
**Symptom**: Seeing "Searching web..." or similar messages
**Solution**:
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check browser console for errors
- Verify ChatInterface.tsx changes were deployed

### Profile Not Syncing to Database
**Symptom**: Profile saves locally but not to Supabase
**Solution**:
1. Check authentication: Make sure you're logged in
2. Check browser console for errors
3. Verify RLS policies on student_profiles table:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'student_profiles';
   ```
4. Check user has permission to insert/update

### Real-Time Updates Not Working
**Symptom**: Changes don't appear in other windows
**Solution**:
1. Check if realtime is enabled:
   ```sql
   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   ```
2. Verify tables are in publication:
   - likes
   - comments
   - reposts
   - community_members
3. Check browser console for WebSocket errors
4. Verify both windows are authenticated

---

## Manual Database Verification

### Check Profile Data
```sql
-- View all student profiles
SELECT 
  full_name,
  email,
  phone,
  tenth_percentage,
  twelfth_percentage,
  created_at
FROM student_profiles
ORDER BY created_at DESC;
```

### Check Real-Time Tables
```sql
-- Check if tables are in realtime publication
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND schemaname = 'public';
```

### Check RLS Policies
```sql
-- Verify student_profiles policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'student_profiles';
```

---

## Success Criteria

✅ **Google OAuth**
- User can log in with Google
- Session persists across refreshes
- Redirects work correctly

✅ **AI Chat**
- No internal processing visible to users
- Clean loading indicators only
- Smooth streaming responses

✅ **Profile Sync**
- Saves locally when logged out
- Syncs to database when logged in
- Mandatory field validation works
- Progress tracking accurate

✅ **Forum Real-Time**
- Likes update across windows instantly
- Comments appear in real-time
- Community member counts sync
- All interactions < 2 second latency

---

## Next Steps After Testing

If all tests pass:
✓ Phase 1 implementation verified
✓ Ready for Phase 2 implementation

If issues found:
1. Document specific errors
2. Check browser console logs
3. Check Supabase logs in Lovable Cloud dashboard
4. Report issues for fixes
