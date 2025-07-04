# Nexora Banking

A modern crypto banking application built with Next.js, Supabase, and Resend for email functionality.

## Features

### Security Features

- **Inactivity Timeout**: Automatic logout after 10 minutes of inactivity
  - Tracks user activity (mouse, keyboard, scroll, touch events)
  - Automatically redirects to logout page when timeout occurs
  - Works on both customer and admin dashboards

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

### Required for Production

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret (Change in production!)
JWT_SECRET=your-super-secure-jwt-secret-key

# Email Configuration (Resend)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Development Only

```env
# For local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important Production Notes:**
- `NEXT_PUBLIC_APP_URL` must be set to your actual domain (e.g., `https://yourdomain.com`)
- Never use localhost URLs in production
- Change `JWT_SECRET` to a secure random string in production
- Ensure all Supabase keys are properly configured

## Email Setup with Resend

This application uses [Resend](https://resend.com) for sending OTP verification emails. Here's how to set it up:

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com) and create an account
2. Verify your email address

### 2. Add Your Domain

1. In your Resend dashboard, go to "Domains"
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS verification steps provided by Resend
4. Wait for domain verification (usually takes a few minutes)

### 3. Get Your API Key

1. In your Resend dashboard, go to "API Keys"
2. Create a new API key
3. Copy the API key (it starts with `re_`)

### 4. Set Environment Variables

Create a `.env.local` file in your project root and add:

```env
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Important Notes:**
- Replace `re_your_api_key_here` with your actual Resend API key
- Replace `noreply@yourdomain.com` with an email address from your verified domain
- The sender email must be from a domain you've verified in Resend
- You can use any subdomain of your verified domain (e.g., `noreply@`, `hello@`, `support@`)

### 5. Test Your Setup

1. Start your development server: `npm run dev`
2. Try the signup or login flow
3. Check your email for the OTP code
4. In development mode, the OTP code will also be logged to the console

### Troubleshooting

- **"Domain not verified" error**: Make sure your domain is properly verified in Resend
- **"Invalid API key" error**: Check that your API key is correct and starts with `re_`
- **"Sender email not allowed" error**: Use an email address from your verified domain

## Development

```bash
npm install
npm run dev
```

## Production Deployment

Make sure to set all the required environment variables in your production environment:

### Critical Production Variables

- `NEXT_PUBLIC_APP_URL`: Your production domain (e.g., `https://yourdomain.com`)
- `RESEND_API_KEY`: Your Resend API key
- `RESEND_FROM_EMAIL`: Your verified sender email address
- `JWT_SECRET`: A secure random string for JWT signing
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Deployment Checklist

- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Configure all Supabase environment variables
- [ ] Set up Resend email configuration
- [ ] Change `JWT_SECRET` to a secure value
- [ ] Test the logout functionality in production
- [ ] Verify inactivity timeout works correctly
- [ ] Test email OTP functionality
