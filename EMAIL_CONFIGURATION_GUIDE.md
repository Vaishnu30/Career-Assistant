# 📧 Email Configuration Guide for AI Career Assistant

## Quick Setup (Gmail - Recommended)

### Step 1: Enable Gmail App Passwords
1. **Sign in to your Google Account**: https://myaccount.google.com/
2. **Enable 2-Factor Authentication** (if not already enabled)
3. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character app password

### Step 2: Update .env.local
```bash
# Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

## Alternative Email Providers

### Microsoft Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password  # Generate at https://login.yahoo.com/account/security
```

### SendGrid (Production Recommended)
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

### Amazon SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_aws_access_key_id
SMTP_PASS=your_aws_secret_access_key
```

## Testing Email Configuration

### 1. Without Email (Development)
- Emails won't be sent
- Reset URLs will be logged to console
- Copy URL from console to test password reset

### 2. With Email (Production Ready)
- Configure SMTP settings in .env.local
- Restart development server
- Test forgot password flow
- Check your email inbox

## Troubleshooting

### Common Issues:

#### "SMTP not configured"
- Check all SMTP environment variables are set
- Restart the development server after changes

#### "Failed to send email"
- Verify SMTP credentials are correct
- Check if 2FA is enabled (required for Gmail)
- Ensure app password is used (not regular password)
- Check firewall/network restrictions

#### "Authentication failed"
- Double-check email and password
- For Gmail: Use app password, not regular password
- For Outlook: May need to enable "Less secure app access"

### Debug Mode:
1. Check console logs for detailed error messages
2. Visit `/api/debug/tokens` to see active reset tokens
3. SMTP configuration is logged on email send attempts

## Security Best Practices

### For Production:
1. **Use dedicated email service** (SendGrid, Amazon SES)
2. **Set strong SMTP credentials**
3. **Enable rate limiting** on forgot password endpoint
4. **Monitor email sending** for abuse
5. **Use HTTPS** for all reset links

### Environment Variables:
- Never commit .env.local to version control
- Use different SMTP configs for dev/staging/production
- Rotate SMTP credentials regularly

## Email Template Features

### Current Template Includes:
- 📱 **Mobile-responsive design**
- 🎨 **Professional branding**
- ⏰ **Clear expiration warning**
- 🔒 **Security messaging**
- 📋 **Backup text link**
- 🔧 **Development-friendly fallbacks**

### Customization:
- Edit email template in `/src/app/api/auth/forgot-password/route.ts`
- Update colors, fonts, and messaging as needed
- Test across different email clients

## Port Configuration Fixed

### Issues Resolved:
- ✅ **Dynamic port detection** (3000/3001 confusion fixed)
- ✅ **Environment-aware URLs** (dev/staging/production)
- ✅ **Vercel deployment ready**
- ✅ **Proper NEXTAUTH_URL handling**

The system now automatically detects the correct port and generates proper reset URLs!
