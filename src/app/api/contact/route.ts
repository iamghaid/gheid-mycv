import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function escapeHtml(str: string) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();
        if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string' || (subject !== undefined && typeof subject !== 'string') || name.length > 200 || email.length > 254 || message.length > 10000 || (subject?.length ?? 0) > 300 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid contact details' }, { status: 400 });
        }
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            return NextResponse.json({ error: 'Contact email is not configured' }, { status: 503 });
        }

        // Basic validation
        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            connectionTimeout: 10000,
            socketTimeout: 15000,
            auth: {
                user: (process.env.EMAIL_USER || '').trim(),
                pass: (process.env.EMAIL_APP_PASSWORD || '').replace(/\s/g, '')
            },
        });

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(subject || 'No Subject');
        const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER || '',
            to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
            replyTo: email.trim(),
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
            subject: `New Message: ${safeSubject}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h3 style="color: #333;">You have a new message from your website!</h3>
                    <p><strong>Name: </strong> ${safeName}</p>
                    <p><strong>Email: </strong> ${safeEmail}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap; color: #555;">${safeMessage}</p>
                </div>
            `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });
    } catch (error) {
        console.error('Contact email delivery failed', { code: (error as { code?: string }).code, responseCode: (error as { responseCode?: number }).responseCode });
        return NextResponse.json({ error: 'Failed to send email. Ensure Gmail App Password is set.' }, { status: 500 });
    }
}
