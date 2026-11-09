import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionReceiptEmail } from '@/lib/email-service';

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
    const { user_id, transaction_id } = body;

    if (!user_id || !transaction_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, transaction_id' },
        { status: 400 }
      );
    }

    // Get user email from auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user_id);

    if (authError || !authUser?.user?.email) {
      console.error('Error fetching user email:', authError);
      return NextResponse.json(
        { error: 'User not found or email not available' },
        { status: 404 }
      );
    }

    // Get transaction details with related data
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        account:accounts!transactions_account_id_fkey(
          id,
          account_number,
          balance,
          user_id,
          account_type:account_types(name)
        ),
        recipient_account:accounts!transactions_recipient_account_id_fkey(
          id,
          account_number,
          balance,
          user_id,
          account_type:account_types(name)
        )
      `)
      .eq('id', transaction_id)
      .single();

    if (txError || !transaction) {
      console.error('Error fetching transaction:', txError);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const isRecipient = transaction.recipient_account?.user_id === user_id;

    // Get recipient user name
    let recipientName: string | undefined;
    if (transaction.recipient_account?.user_id) {
      const { data: recipientProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', transaction.recipient_account.user_id)
        .single();

      if (recipientProfile) {
        recipientName = `${recipientProfile.first_name || ''} ${recipientProfile.last_name || ''}`.trim();
      }
    }

    // Get sender user name
    let senderName: string | undefined;
    if (transaction.account?.user_id) {
      const { data: senderProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', transaction.account.user_id)
        .single();

      if (senderProfile) {
        senderName = `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim();
      }
    }

    // Prepare transaction data for email based on sender vs recipient
    const emailAccount = isRecipient && transaction.recipient_account
      ? transaction.recipient_account
      : transaction.account;

    const emailType = isRecipient && transaction.transaction_type === 'transfer'
      ? 'received_transfer'
      : transaction.transaction_type;

    const transactionData = {
      type: emailType,
      status: transaction.status,
      amount: parseFloat(transaction.amount.toString()),
      description: transaction.description || undefined,
      accountNumber: emailAccount.account_number,
      accountType: emailAccount.account_type?.name || 'Account',
      balance: parseFloat((emailAccount.balance ?? '0').toString()),
      recipientAccountNumber: transaction.recipient_account?.account_number,
      recipientName: recipientName,
      senderName: senderName,
      transactionHash: transaction.description?.includes('Transaction Hash:') 
        ? transaction.description.split('Transaction Hash:')[1]?.trim() 
        : undefined,
      timestamp: transaction.timestamp || transaction.created_at || new Date().toISOString(),
    };

    // Send email
    console.log('Sending transaction receipt email to:', authUser.user.email, 'isRecipient:', isRecipient);
    
    await sendTransactionReceiptEmail(authUser.user.email, transactionData);

    console.log('✅ Transaction receipt email sent successfully');

    return NextResponse.json(
      { success: true, message: 'Transaction receipt sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in send-transaction-receipt API:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        error: 'Failed to send transaction receipt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
