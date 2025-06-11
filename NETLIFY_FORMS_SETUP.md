# Netlify Forms Email Configuration

## Setting up Email Notifications

The contact form is configured to use Netlify Forms. To receive email notifications at info@impaktlabs.com:

1. **Log into Netlify Dashboard**
   - Go to your site dashboard at https://app.netlify.com

2. **Navigate to Forms**
   - Click on "Forms" in the site menu
   - You should see a form named "contact" after the first submission

3. **Configure Email Notifications**
   - Click on the "contact" form
   - Go to "Settings" → "Form notifications"
   - Click "Add notification" → "Email notification"
   - Enter: info@impaktlabs.com
   - Save the settings

4. **Form Fields**
   The form will send the following fields:
   - Name
   - Email
   - Phone (optional)
   - Company
   - Revenue Range
   - Message (optional)

## Testing

1. Deploy the site
2. Submit a test form
3. Check that it appears in Netlify Forms dashboard
4. Verify email is received at info@impaktlabs.com

## Spam Protection

The form includes:
- Honeypot field (bot-field) to catch bots
- Required field validation
- Netlify's built-in spam filtering

## Alternative Setup (Zapier/Integromat)

If you need more advanced email formatting, you can:
1. Keep Netlify Forms as the receiver
2. Set up a Zapier/Integromat webhook in Form notifications
3. Create a workflow to format and send custom emails