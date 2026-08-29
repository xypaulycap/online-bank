import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit-table';
import { sendEmail } from '@/lib/email-service';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const body = await req.json();
    const { accountId, periodDays } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    // 1. Fetch User Profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // 2. Fetch Account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*, account_types(name)')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found or unauthorized' }, { status: 404 });
    }

    // 3. Fetch Transactions
    let query = supabase
      .from('transactions')
      .select('*, transaction_categories(name)')
      .eq('account_id', accountId)
      .order('timestamp', { ascending: false });

    if (periodDays && periodDays !== 'all') {
      const days = parseInt(periodDays);
      if (!isNaN(days)) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        query = query.gte('timestamp', dateLimit.toISOString());
      }
    }

    const { data: transactions, error: txError } = await query;

    if (txError) {
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    // 4. Generate PDF
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(24).fillColor('#2563eb').text('Valtier Financial Group', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).fillColor('#1f2937').text('Statement of Account', { align: 'center' });
        doc.moveDown(2);

        // Account & User Details
        doc.fontSize(12).fillColor('#4b5563');
        
        // Left Column (User Info)
        doc.text(`Account Holder: ${userProfile.first_name} ${userProfile.last_name}`);
        if (userProfile.address) {
          doc.text(`Address: ${userProfile.address.replace(/\n/g, ', ')}`);
        }
        doc.text(`Email: ${userProfile.email}`);
        
        doc.moveUp(3);
        
        // Right Column (Account Info)
        doc.text(`Account Type: ${account.account_types?.name || 'Account'}`, { align: 'right' });
        doc.text(`Account Number: ${account.account_number}`, { align: 'right' });
        const currency = userProfile.currency || 'USD';
        doc.text(`Current Balance: ${formatCurrency(parseFloat(account.balance), currency)}`, { align: 'right' });
        doc.text(`Statement Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
        
        doc.moveDown(3);

        // Transactions Table
        if (transactions && transactions.length > 0) {
          const table = {
            title: "Transaction History",
            headers: ["Date", "Description", "Type", "Status", "Amount"],
            rows: transactions.map((tx: any) => {
              const isDebit = ['withdrawal', 'transfer', 'local_transfer', 'wire_transfer', 'payment'].includes(tx.transaction_type);
              const amountStr = `${isDebit ? '-' : '+'}${formatCurrency(parseFloat(tx.amount), currency)}`;
              const dateStr = new Date(tx.timestamp).toLocaleDateString();
              const typeStr = (tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1)).replace('_', ' ');
              
              // Clean description
              let desc = tx.description || typeStr;
              desc = desc.split('\n')[0].substring(0, 50); // Take first line, max 50 chars
              
              return [dateStr, desc, typeStr, tx.status || 'approved', amountStr];
            }),
          };
          
          doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
            prepareRow: (row: any, indexColumn: any, indexRow: any, rectRow: any) => {
              doc.font("Helvetica").fontSize(10);
            },
          });
        } else {
          doc.fontSize(12).text('No transactions found for the selected period.', { align: 'center' });
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(10).fillColor('#9ca3af').text('This is an automatically generated statement. If you have any questions, please contact our support.', { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    // 5. Send Email
    const periodText = periodDays === 'all' ? 'All Time' : `Last ${periodDays} Days`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2563eb;">Your Account Statement</h2>
        <p>Dear ${userProfile.first_name},</p>
        <p>As requested, please find attached the statement for your ${account.account_types?.name || ''} Account (**** ${account.account_number.slice(-4)}) covering the period: <strong>${periodText}</strong>.</p>
        <p>If you have any questions regarding this statement or your account, please do not hesitate to contact our customer support team.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>Valtier Financial Group</strong></p>
      </div>
    `;

    await sendEmail({
      to: userProfile.email,
      subject: `Statement of Account - ${account.account_number.slice(-4)}`,
      html: emailHtml,
      attachments: [
        {
          filename: `Statement_${account.account_number}_${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    return NextResponse.json({ success: true, message: 'Statement sent successfully' });
  } catch (error: any) {
    console.error('Error generating statement:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
