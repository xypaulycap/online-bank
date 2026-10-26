import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email-service';

// Service role Supabase client for admin operations (bypassing RLS and accessing user_profiles/notifications)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, category, subject, message, priority, user_id } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, subject, message' },
        { status: 400 }
      );
    }

    const inquiryPayload = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : null,
      category: category ? String(category).trim() : 'General Inquiry',
      subject: String(subject).trim(),
      message: String(message).trim(),
      priority: priority === 'urgent' ? 'urgent' : 'normal',
      status: 'pending',
      user_id: user_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let savedInquiry = null;

    // 1. Save inquiry in DB
    try {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('inquiries')
        .insert(inquiryPayload)
        .select()
        .single();

      if (insertError) {
        console.warn('Inquiries table insert note (will still notify admin):', insertError.message);
      } else {
        savedInquiry = inserted;
      }
    } catch (dbErr) {
      console.warn('Database error while saving inquiry:', dbErr);
    }

    // 2. Query admin users to send in-app notifications
    try {
      const { data: admins, error: adminQueryError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, first_name, last_name')
        .eq('is_admin', true);

      if (!adminQueryError && admins && admins.length > 0) {
        const adminNotifications = admins.map((admin) => ({
          user_id: admin.id,
          title: `New Customer Inquiry: ${inquiryPayload.subject}`,
          message: `Inquiry from ${inquiryPayload.name} (${inquiryPayload.email})\nCategory: ${inquiryPayload.category}${
            inquiryPayload.phone ? ` | Phone: ${inquiryPayload.phone}` : ''
          }\nPriority: ${inquiryPayload.priority.toUpperCase()}\n\nMessage:\n${inquiryPayload.message}`,
          is_read: false,
          created_at: new Date().toISOString(),
        }));

        await supabaseAdmin.from('notifications').insert(adminNotifications);
      }
    } catch (notifErr) {
      console.warn('Could not insert admin in-app notification:', notifErr);
    }

    // 3. If authenticated user, send user acknowledgment notification in-app
    if (user_id) {
      try {
        await supabaseAdmin.from('notifications').insert({
          user_id: user_id,
          title: `Inquiry Received: ${inquiryPayload.subject}`,
          message: `Thank you for contacting Valtier Financial Group. Your inquiry regarding "${inquiryPayload.subject}" has been received and our support team will respond shortly.`,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      } catch (userNotifErr) {
        console.warn('Could not insert user acknowledgment notification:', userNotifErr);
      }
    }

    // 4. Send email notification to Admin
    try {
      const adminEmail =
        process.env.ADMIN_EMAIL ||
        process.env.DEFAULT_FROM_EMAIL ||
        'support@atlanticgates.live';

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Customer Inquiry</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Valtier Financial Group</h1>
              <p style="color: #d1fae5; margin: 6px 0 0 0; font-size: 14px;">Customer Help Center & Support Notification</p>
            </div>

            <div style="padding: 24px;">
              <div style="display: inline-block; padding: 4px 12px; background-color: ${
                inquiryPayload.priority === 'urgent' ? '#fee2e2' : '#ecfdf5'
              }; color: ${
                inquiryPayload.priority === 'urgent' ? '#b91c1c' : '#047857'
              }; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">
                ${inquiryPayload.priority.toUpperCase()} PRIORITY INQUIRY
              </div>

              <h2 style="color: #111827; font-size: 18px; margin: 0 0 16px 0;">New Inquiry Received</h2>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 130px; font-weight: 600;">Customer Name:</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${inquiryPayload.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px;"><a href="mailto:${inquiryPayload.email}" style="color: #059669; text-decoration: none;">${inquiryPayload.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Phone:</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px;">${inquiryPayload.phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Category:</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px;">${inquiryPayload.category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Subject:</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${inquiryPayload.subject}</td>
                </tr>
                ${
                  inquiryPayload.user_id
                    ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">User ID:</td><td style="padding: 8px 0; color: #6b7280; font-size: 12px; font-family: monospace;">${inquiryPayload.user_id}</td></tr>`
                    : ''
                }
              </table>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h3 style="color: #374151; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">Message Content:</h3>
                <p style="color: #1f2937; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${inquiryPayload.message}</p>
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://valtierfingroup.com'}/admin/inquiries" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px;">View Inquiries in Admin Panel</a>
              </div>
            </div>

            <div style="background-color: #f9fafb; padding: 16px 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">Received on ${new Date().toLocaleString()} | Valtier Financial Group Automated Notification</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: adminEmail,
        subject: `[New Inquiry] ${inquiryPayload.subject} - ${inquiryPayload.name}`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.warn('Could not send admin inquiry email (non-blocking):', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been submitted successfully. Our support team will get in touch with you shortly.',
        data: savedInquiry || inquiryPayload,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in /api/inquiries POST:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to submit inquiry',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist yet, return empty list gracefully
      console.warn('Inquiries query note:', error.message);
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error in /api/inquiries GET:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing inquiry ID' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updatePayload.status = status;
    if (admin_notes !== undefined) updatePayload.admin_notes = admin_notes;

    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // If status updated to resolved and there is a user_id, notify the user
    if (status === 'resolved' && data.user_id) {
      try {
        await supabaseAdmin.from('notifications').insert({
          user_id: data.user_id,
          title: `Inquiry Resolved: ${data.subject}`,
          message: `Your inquiry regarding "${data.subject}" has been marked as resolved by our customer support team.${
            data.admin_notes ? `\n\nResolution Notes:\n${data.admin_notes}` : ''
          }`,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      } catch (userNotifErr) {
        console.warn('Could not notify user of resolved inquiry:', userNotifErr);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in /api/inquiries PATCH:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}
