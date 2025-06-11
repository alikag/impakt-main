# Netlify Form Email Configuration

## Setting Up Multiple Email Recipients

To receive form submissions at multiple email addresses, follow these steps:

### 1. Log into Netlify Dashboard
- Go to https://app.netlify.com
- Select your site (impakt-main)

### 2. Navigate to Forms
- Click on "Forms" in the left sidebar
- You should see your form named "contact" listed

### 3. Configure Email Notifications
- Click on the "contact" form
- Go to "Settings" → "Form notifications"
- Click "Add notification" → "Email notification"

### 4. Add Email Recipients
You have two options:

#### Option A: Multiple Individual Notifications
Create three separate email notifications:
1. Click "Add notification" → "Email notification"
   - Email to notify: `agraham@impaktlabs.com`
   - Save
2. Click "Add notification" → "Email notification" again
   - Email to notify: `kkopczynski@impaktlabs.com`
   - Save
3. Click "Add notification" → "Email notification" once more
   - Email to notify: `nhahn@impaktlabs.com`
   - Save

#### Option B: Single Notification with Multiple Recipients
Some email providers support multiple recipients:
1. Click "Add notification" → "Email notification"
2. In the email field, try entering:
   `agraham@impaktlabs.com, kkopczynski@impaktlabs.com, nhahn@impaktlabs.com`
3. Save and test

### 5. Email Format
The default email will include all form fields:
- Name
- Email
- Phone (if provided)
- Company
- Revenue Range
- Message (if provided)

### 6. Advanced Options
If you need custom email formatting or CC/BCC functionality:
1. Use "Webhook notification" instead
2. Connect to Zapier or Make (Integromat)
3. Create a workflow that sends formatted emails to all recipients

### 7. Testing
After configuration:
1. Submit a test form from your live site
2. Verify all three recipients receive the email
3. Check spam folders if emails don't arrive

## Alternative: Email Forwarding
If Netlify doesn't support multiple recipients directly, consider:
1. Send to a single email address (e.g., `forms@impaktlabs.com`)
2. Set up email forwarding rules to distribute to all three recipients
3. Or use a distribution list/group email that includes all three addresses

## Form Submission Data
All submissions are also stored in Netlify's dashboard under Forms, so you won't lose any data even if emails fail to deliver.