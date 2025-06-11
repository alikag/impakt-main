# Netlify Form Field Issue - Troubleshooting Guide

## Problem
Only name and email fields are being captured, despite all fields being present in the HTML.

## Things to Check in Netlify Dashboard

### 1. Form Configuration
- Go to **Site settings** → **Forms** → **Form notifications**
- Click on your "contact" form
- Look for a section called "**Form fields**" or "**Detected fields**"
- See if it lists all fields or just name/email

### 2. Check Form Submissions
- Go to **Forms** → Click on a submission
- Look for a "**Show all fields**" or "**View raw data**" option
- The data might be there but not displayed by default

### 3. Verify Plan Limitations
- Check your Netlify plan details
- Some plans may limit:
  - Number of form fields
  - Form submission data
  - Form processing features

### 4. Build Logs
- Go to **Deploys** → Click on latest deploy → **Deploy log**
- Search for "form" or "Forms detected"
- See if there are any warnings about form processing

## Alternative Solutions

### 1. Use Netlify Functions
Instead of Netlify Forms, create a serverless function to handle submissions:

```javascript
// netlify/functions/submit-form.js
exports.handler = async (event, context) => {
  const data = JSON.parse(event.body);
  // Process all form fields here
  // Send to email service, database, etc.
}
```

### 2. Third-Party Form Services
- **Formspree**: https://formspree.io
- **Getform**: https://getform.io
- **FormSubmit**: https://formsubmit.co

Example with Formspree:
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <!-- All your fields -->
</form>
```

### 3. Custom Backend
- Set up a simple Express server
- Use Vercel Functions
- Use AWS Lambda

## Immediate Workaround

Since only name/email work, you could combine other fields into the message field:

```javascript
// Combine all data into message field
const message = `
Company: ${company}
Phone: ${phone}
Revenue: ${revenue}
Message: ${originalMessage}
`;
```

## Contact Netlify Support

Since this appears to be a platform issue:
1. Go to Netlify Dashboard → **Support**
2. Submit a ticket explaining:
   - Only name/email fields are captured
   - You've tested with pure HTML forms
   - All fields have proper name attributes
   - Form detection is enabled

Include:
- Your site URL
- Form name: "contact"
- Expected fields: name, email, phone, company, revenue, message
- Actual fields received: name, email only

## Testing Form Services

I've created a Formspree example you can test:

```html
<!-- formspree-test.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Formspree Test</title>
</head>
<body>
    <h1>Formspree Test Form</h1>
    <!-- Replace YOUR_FORM_ID with your Formspree form ID -->
    <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
        <p>Name: <input type="text" name="name"></p>
        <p>Email: <input type="email" name="email"></p>
        <p>Phone: <input type="text" name="phone"></p>
        <p>Company: <input type="text" name="company"></p>
        <p>Revenue: <select name="revenue">
            <option value="500k-1m">$500K - $1M</option>
            <option value="1m-2.5m">$1M - $2.5M</option>
        </select></p>
        <p>Message: <textarea name="message"></textarea></p>
        <button type="submit">Submit</button>
    </form>
</body>
</html>
```

## Temporary Solution

Until this is resolved, you could:
1. Add important fields to a follow-up email
2. Use just name/email and follow up for details
3. Put all info in a single textarea field
4. Switch to a different form service