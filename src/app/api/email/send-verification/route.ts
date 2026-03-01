import { NextRequest, NextResponse } from 'next/server';

// Using Resend for email (free tier available)
// Install: npm install resend
// Alternative: SendGrid, Mailgun, etc.

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { email, userId, userName } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId required' },
        { status: 400 }
      );
    }

    // For now, return success (implement with Resend/SendGrid when ready)
    // This is a placeholder - you'll need to:
    // 1. Sign up for Resend or another email service
    // 2. Add their API key to environment variables
    // 3. Send actual email with verification link

    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?userId=${userId}&token=placeholder`;

    // Placeholder response - actual implementation would call email service
    console.log(`Email verification would be sent to ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Verification email queued',
      debug: {
        email,
        link: verificationLink,
      },
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
