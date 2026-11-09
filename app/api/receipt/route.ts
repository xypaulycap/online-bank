import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit-table';
import { formatCurrency } from '@/lib/utils';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: missing authorization header' }, { status: 401 });
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

    // Fetch user profile of requester
    const { data: requesterProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fetch transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        account:accounts!transactions_account_id_fkey(
          id,
          user_id,
          account_number,
          balance,
          account_type:account_types(name)
        ),
        recipient_account:accounts!transactions_recipient_account_id_fkey(
          id,
          account_number,
          user_id,
          balance,
          account_type:account_types(name)
        )
      `)
      .eq('id', transactionId)
      .single();

    if (txError || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Ensure transaction belongs to user as either SENDER or RECIPIENT
    const isSender = transaction.account?.user_id === user.id;
    const isRecipient = transaction.recipient_account?.user_id === user.id;

    if (!isSender && !isRecipient) {
      return NextResponse.json({ error: 'Unauthorized access to this transaction' }, { status: 403 });
    }

    // Resolve sender profile
    let senderProfile: any = null;
    if (transaction.account?.user_id) {
      if (transaction.account.user_id === user.id) {
        senderProfile = requesterProfile;
      } else {
        const { data: sProf } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', transaction.account.user_id)
          .single();
        senderProfile = sProf;
      }
    }

    // Resolve recipient profile
    let recipientProfile: any = null;
    if (transaction.recipient_account?.user_id) {
      if (transaction.recipient_account.user_id === user.id) {
        recipientProfile = requesterProfile;
      } else {
        const { data: rProf } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', transaction.recipient_account.user_id)
          .single();
        recipientProfile = rProf;
      }
    }

    // Parse description for extra transfer fields (wire / local / international)
    const rawDesc = transaction.description || '';
    const detailsMap: Record<string, string> = {};
    const lines = rawDesc.split('\n');
    let userNote = '';

    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
        const value = line.substring(colonIdx + 1).trim();
        if (key && value) {
          detailsMap[key] = value;
        }
      } else if (!userNote && line.trim()) {
        userNote = line.trim();
      }
    }

    const isDeposit = transaction.transaction_type === 'deposit';
    const isWithdrawal = transaction.transaction_type === 'withdrawal';

    // Sender Display
    const senderFullName = senderProfile
      ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim()
      : (detailsMap['sender_name'] || (isDeposit ? 'Deposit Processing' : 'Valtier Account Holder'));

    const senderAccountDisplay = transaction.account?.account_number
      ? `${transaction.account.account_type?.name || 'Account'} (**** ${transaction.account.account_number.slice(-4)})`
      : 'N/A';

    // Recipient Display
    const recipientFullName = recipientProfile
      ? `${recipientProfile.first_name || ''} ${recipientProfile.last_name || ''}`.trim()
      : (detailsMap['recipient_name'] || (isDeposit ? senderFullName : (isWithdrawal ? senderFullName : 'Authorized Beneficiary')));

    const recipientAccountDisplay = 
      detailsMap['recipient_account'] || 
      detailsMap['swiss_iban'] || 
      detailsMap['account_number'] || 
      (transaction.recipient_account?.account_number ? `${transaction.recipient_account.account_type?.name || 'Account'} (**** ${transaction.recipient_account.account_number.slice(-4)})` : null) || 
      (isDeposit ? senderAccountDisplay : (isWithdrawal ? 'Direct Withdrawal' : 'N/A'));

    const bankNameDisplay = 
      detailsMap['bank_name'] || 
      (transaction.transaction_type === 'transfer' || isDeposit ? 'Valtier Financial Group' : 'External Institution');

    const routingOrSwift = 
      detailsMap['swift_bic'] || 
      detailsMap['sort_code'] || 
      detailsMap['routing_number'] || 
      '';

    const currency = requesterProfile?.currency || 'USD';
    const amountNum = parseFloat(transaction.amount);
    const amountFormatted = formatCurrency(amountNum, currency);
    const dateFormatted = new Date(transaction.timestamp || transaction.created_at || Date.now()).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    const typeLabels: Record<string, string> = {
      transfer: isRecipient ? 'Received Transfer' : 'Internal Transfer',
      local_transfer: 'Local Transfer (SEPA / Swiss)',
      international_transfer: 'International Wire Transfer',
      wire_transfer: 'Wire Transfer',
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
    };
    const transactionTypeLabel = typeLabels[transaction.transaction_type] || transaction.transaction_type;

    // Status label
    const rawStatus = (transaction.status || 'pending').toLowerCase();
    const statusLabel = rawStatus === 'approved' || rawStatus === 'completed'
      ? 'COMPLETED'
      : (rawStatus === 'rejected' || rawStatus === 'cancelled' ? 'CANCELLED' : 'PROCESSING');

    // Generate PDF
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header Section
        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 40, 40, { width: 130 });
        } else {
          doc.fontSize(18).fillColor('#1e40af').font('Helvetica-Bold').text('Valtier Financial Group', 40, 40);
        }

        // Bank Contact Details (Right align)
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e293b').text('Valtier Financial Group', 200, 40, { align: 'right' });
        doc.font('Helvetica').fontSize(8.5).fillColor('#64748b');
        doc.text('5714 Paradeplatz, Apt 239, St. Gallen, Basel 55742', 200, doc.y, { align: 'right' });
        doc.text('Email: support@valtierfingroup.com | Web: www.valtierfingroup.com', 200, doc.y, { align: 'right' });
        doc.text('Phone: +1 (800) 123-4567 | Swift: VLTFCHZZ', 200, doc.y, { align: 'right' });

        // Divider
        doc.moveDown(1.5);
        const dividerY = Math.max(doc.y, 95);
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, dividerY).lineTo(555, dividerY).stroke();

        // Title and Status Banner
        doc.y = dividerY + 15;
        const mainTitle = isRecipient ? 'TRANSACTION RECEIPT (CREDIT)' : 'TRANSACTION RECEIPT';
        const subTitle = isRecipient ? 'Official Electronic Confirmation of Received Funds' : 'Official Electronic Payment Confirmation';

        doc.font('Helvetica-Bold').fontSize(16).fillColor('#0f172a').text(mainTitle, 40, doc.y);
        doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(subTitle, 40, doc.y);

        // Status Badge Box
        const statusBoxX = 400;
        const statusBoxY = dividerY + 12;
        const isCompleted = statusLabel === 'COMPLETED';
        const isCancelled = statusLabel === 'CANCELLED';
        const badgeBgColor = isCompleted ? '#ecfdf5' : (isCancelled ? '#fef2f2' : '#eff6ff');
        const badgeTextColor = isCompleted ? '#047857' : (isCancelled ? '#b91c1c' : '#1d4ed8');
        const badgeBorderColor = isCompleted ? '#a7f3d0' : (isCancelled ? '#fecaca' : '#bfdbfe');

        doc.roundedRect(statusBoxX, statusBoxY, 155, 30, 4).fillAndStroke(badgeBgColor, badgeBorderColor);
        doc.font('Helvetica-Bold').fontSize(10.5).fillColor(badgeTextColor)
          .text(`STATUS: ${statusLabel}`, statusBoxX, statusBoxY + 8, { width: 155, align: 'center' });

        // Amount Card Box
        doc.moveDown(2);
        const amountBoxY = doc.y + 10;
        doc.roundedRect(40, amountBoxY, 515, 65, 6).fillAndStroke('#f8fafc', '#cbd5e1');

        const amountBoxTitle = isRecipient ? 'AMOUNT RECEIVED (CREDIT)' : 'AMOUNT TRANSFERRED';
        const amountDisplay = isRecipient ? `+${amountFormatted}` : amountFormatted;

        doc.font('Helvetica').fontSize(10).fillColor('#64748b').text(amountBoxTitle, 55, amountBoxY + 12);
        doc.font('Helvetica-Bold').fontSize(22).fillColor(isRecipient ? '#15803d' : '#0f172a').text(amountDisplay, 55, amountBoxY + 28);
        doc.font('Helvetica').fontSize(9).fillColor('#3b82f6').text('Processing fee: $0.00 (Standard)', 350, amountBoxY + 30, { align: 'right', width: 190 });

        // Main Details Table / Key-Values
        let detailY = amountBoxY + 80;

        const drawSectionTitle = (title: string, yPos: number) => {
          doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e40af').text(title.toUpperCase(), 40, yPos);
          doc.strokeColor('#bfdbfe').lineWidth(0.75).moveTo(40, yPos + 15).lineTo(555, yPos + 15).stroke();
          return yPos + 22;
        };

        const drawRow = (label: string, value: string, yPos: number, isRight = false) => {
          const colX = isRight ? 300 : 40;
          doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#64748b').text(label, colX, yPos);
          doc.font('Helvetica').fontSize(9.5).fillColor('#0f172a').text(value, colX, yPos + 12, { width: 235 });
        };

        // Transaction Overview Section
        detailY = drawSectionTitle('Transaction Overview', detailY);
        drawRow('Transaction Reference', `VFG-TXN-${transaction.id.toString().padStart(6, '0')}`, detailY);
        drawRow('Date & Time', dateFormatted, detailY, true);

        detailY += 32;
        drawRow('Transfer Type', transactionTypeLabel, detailY);
        drawRow('Payment Channel', 'Online Banking Portal', detailY, true);

        // Sender Details Section
        detailY += 40;
        detailY = drawSectionTitle('Sender Information', detailY);
        drawRow('Sender Name', senderFullName, detailY);
        drawRow('Source Account', senderAccountDisplay, detailY, true);

        // Beneficiary Details Section
        detailY += 40;
        detailY = drawSectionTitle('Beneficiary & Bank Details', detailY);
        drawRow('Beneficiary / Recipient', recipientFullName, detailY);
        drawRow('Recipient Account / IBAN', recipientAccountDisplay, detailY, true);

        detailY += 32;
        drawRow('Receiving Bank', bankNameDisplay, detailY);
        drawRow('Routing / SWIFT / Sort Code', routingOrSwift || 'N/A', detailY, true);

        // Additional Information / Notes
        detailY += 40;
        detailY = drawSectionTitle('Additional Details', detailY);
        drawRow('Reference / Note', userNote || detailsMap['message'] || 'No note provided', detailY);
        drawRow('Direction / Impact', isRecipient ? 'Incoming Credit (+)' : 'Outgoing Debit (-)', detailY, true);

        // Notice / Information Box
        detailY += 42;
        doc.roundedRect(40, detailY, 515, 48, 4).fillAndStroke('#f1f5f9', '#e2e8f0');
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text('Notice on Processing:', 50, detailY + 8);

        const noticeText = isRecipient
          ? (statusLabel === 'COMPLETED'
              ? 'These funds have been successfully received and credited to your account. Keep this receipt for your records.'
              : 'This incoming transfer instruction has been registered and is undergoing final settlement. Keep this receipt for your records.')
          : 'This transaction instruction has been submitted and registered. Internal transfers reflect immediately or upon final ledger settlement. External and wire transfers may require standard interbank clearing cycles (1-3 business days). Keep this receipt for your records.';

        doc.font('Helvetica').fontSize(8).fillColor('#64748b').text(
          noticeText,
          50,
          detailY + 20,
          { width: 495, lineGap: 1 }
        );

        // Footer
        doc.fontSize(8).fillColor('#94a3b8').text(
          'Valtier Financial Group • Regulated Financial Institution • Electronic Receipt • Valid without physical seal or signature.',
          40,
          780,
          { align: 'center', width: 515 }
        );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Transaction_Receipt_TXN_${transaction.id}.pdf"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generating transaction receipt:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while generating receipt' },
      { status: 500 }
    );
  }
}
