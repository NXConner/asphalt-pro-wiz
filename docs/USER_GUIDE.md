# Pavement Performance Suite - User Guide

Welcome to the Pavement Performance Suite! This guide will help you get started with the application.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [User Roles](#user-roles)
4. [Core Features](#core-features)
5. [Admin Panel](#admin-panel)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Time Setup

1. **Access the Application**
   - Open your web browser
   - Navigate to your application URL
   - You'll be redirected to the login page

2. **Create an Account**
   - Click the "Sign Up" tab
   - Enter your email address
   - Create a secure password (minimum 6 characters)
   - Click "Sign Up"
   - Check your email for confirmation (if enabled)

3. **Sign In**
   - Enter your email and password
   - Click "Sign In"
   - You'll be redirected to the Operations Canvas

---

## Authentication

### Signing In

1. Go to the login page
2. Enter your email and password
3. Click "Sign In"

### Signing Out

1. Click your profile icon in the header
2. Click "Sign Out"
3. You'll be redirected to the login page

### Password Requirements

- Minimum 6 characters
- Should include a mix of letters and numbers
- Consider using a password manager for security

### Forgot Password

1. Click "Forgot Password?" on the sign-in page
2. Enter your email address
3. Check your email for reset instructions
4. Follow the link to reset your password

---

## User Roles

The application has six role levels with different permissions:

### Client
- View assigned jobs and estimates
- Upload documents
- Track job progress
- **Cannot**: Create jobs, access admin features

### Field Technician
- Everything Client can do, plus:
- Update job status
- Upload field photos
- Log work hours
- **Cannot**: Create estimates, manage users

### Field Crew Lead
- Everything Field Technician can do, plus:
- Assign crew members
- Approve timesheets
- Review job completion
- **Cannot**: Create estimates, access financials

### Estimator
- Everything Field Crew Lead can do, plus:
- Create and edit estimates
- Access pricing tools
- Generate proposals
- **Cannot**: Manage users, access admin panel

### Administrator
- Everything Estimator can do, plus:
- Manage user roles
- Access admin panel
- View all data across organization
- Configure system settings
- **Cannot**: System-level configuration (reserved for Super Admin)

### Super Administrator
- Full system access
- Manage all administrators
- System-level configuration
- Database management

---

## Core Features

### Operations Canvas

The main dashboard for managing pavement projects.

**Key Features:**
- Job overview and status tracking
- Estimate creation and management
- Document storage
- Team collaboration tools

**Getting Started:**
1. Click "New Job" to create a project
2. Enter job details (name, location, description)
3. Add project areas and measurements
4. Generate estimates
5. Assign crew members
6. Track progress

### Estimator Studio

Create detailed cost estimates for pavement projects.

**Creating an Estimate:**
1. Select a job from your list
2. Click "Create Estimate"
3. Define project scope:
   - Sealcoating specifications
   - Striping requirements
   - Crack repair needs
4. Review materials and labor costs
5. Adjust pricing and margins
6. Generate proposal document

**Tips:**
- Save draft estimates for review
- Use templates for common job types
- Include detailed line items for transparency

### Command Center

View real-time analytics and metrics.

**Available Metrics:**
- Active jobs count
- Completed jobs
- Total revenue
- Job status distribution
- Crew utilization
- Average turnaround time

**Accessing Command Center:**
1. Click "Open Command Center" in the header
2. View dashboard metrics
3. Filter by date range
4. Export reports (admin only)

### Document Management

Upload and organize project documents.

**Supported File Types:**
- PDF documents
- Images (JPG, PNG)
- Spreadsheets (CSV, XLSX)
- CAD files (if configured)

**Uploading Documents:**
1. Navigate to a job
2. Click "Documents" tab
3. Click "Upload" button
4. Select files from your computer
5. Add optional description
6. Click "Upload"

**Security:**
- Documents are private to your organization
- Only authorized users can view
- Audit logs track access

---

## Admin Panel

**Note**: Only available to users with Administrator or Super Administrator roles.

### Accessing Admin Panel

1. Click the "Admin Panel" button in the header (only visible to admins)
2. Or navigate to `/admin`

### Managing User Roles

**Grant Admin Role:**
1. Go to Admin Panel
2. Enter user's email in "Grant Admin Access" field
3. Click "Grant Admin Role"
4. User receives admin privileges immediately

**Revoke Admin Role:**
1. Find user in the user list
2. Click "Revoke Admin" button next to their name
3. Confirm the action
4. User loses admin privileges immediately

**View User Roles:**
- See all users and their assigned roles
- View when roles were assigned
- Track role changes in audit log

### Best Practices

- **Limit admin access**: Only grant admin roles to trusted team members
- **Regular audits**: Review admin users quarterly
- **Document changes**: Keep records of who has admin access
- **Remove promptly**: Revoke admin access when team members leave

---

## Troubleshooting

### Cannot Sign In

**Problem**: "Invalid credentials" error

**Solutions:**
1. Verify email is typed correctly
2. Check password (case-sensitive)
3. Try password reset
4. Clear browser cache and cookies
5. Contact administrator if issue persists

### Cannot Access Admin Panel

**Problem**: Admin Panel button not visible or access denied

**Solutions:**
1. Verify you have Administrator role
2. Sign out and sign back in
3. Check with your system administrator
4. Ensure you're on the correct account

### Documents Won't Upload

**Problem**: Upload fails or hangs

**Solutions:**
1. Check file size (maximum 50MB)
2. Verify file format is supported
3. Check internet connection
4. Try a different browser
5. Contact support if issue persists

### Page Not Loading

**Problem**: Blank page or infinite loading

**Solutions:**
1. Refresh the page (F5 or Ctrl+R)
2. Clear browser cache
3. Try incognito/private mode
4. Check internet connection
5. Try a different browser

### Lost Data

**Problem**: Cannot find jobs or documents

**Solutions:**
1. Check you're signed in to correct account
2. Verify you have proper permissions
3. Check organization settings
4. Contact administrator
5. Check if items were archived/deleted

---

## Keyboard Shortcuts

Speed up your workflow with these shortcuts:

- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + N`: New job
- `Ctrl/Cmd + S`: Save current work
- `Esc`: Close dialogs/modals
- `Tab`: Navigate between fields
- `Shift + ?`: Show help

---

## Mobile Usage

The application is optimized for mobile devices:

**Supported Browsers:**
- Safari (iOS 12+)
- Chrome (Android 8+)
- Mobile responsive design

**Tips:**
- Use landscape mode for better view
- Pinch to zoom on maps
- Swipe to navigate between sections

---

## Getting Help

### In-App Help

- Click the "?" icon in the top right
- Access contextual help for each feature
- View tooltips by hovering over elements

### Documentation

- [Admin Setup Guide](./ADMIN_SETUP.md)
- [API Reference](./API_REFERENCE.md)
- [Architecture Overview](./ARCHITECTURE.md)

### Support Channels

- **Email**: support@yourcompany.com
- **Documentation**: https://docs.yourcompany.com
- **Status Page**: https://status.yourcompany.com

### Reporting Issues

When reporting issues, include:
1. What you were trying to do
2. What happened instead
3. Steps to reproduce
4. Screenshots (if applicable)
5. Browser and device information

---

## Tips for Success

1. **Regular Updates**: Keep the app updated to access new features
2. **Backup Important Data**: Export critical reports regularly
3. **Use Templates**: Save time with job and estimate templates
4. **Collaborate**: Use comments and notes to communicate with team
5. **Stay Organized**: Archive completed jobs regularly
6. **Monitor Metrics**: Review Command Center weekly for insights
7. **Secure Your Account**: Use a strong password and sign out on shared devices

---

## What's New

Check the [Changelog](../CHANGELOG.md) for the latest updates and features.

---

## Feedback

We value your feedback! Contact us with:
- Feature requests
- Bug reports
- Usability improvements
- Documentation suggestions

Together, we'll make the Pavement Performance Suite even better!
