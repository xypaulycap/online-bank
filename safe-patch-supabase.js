const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'lib', 'supabase-services.ts');
let content = fs.readFileSync(file, 'utf8');

// Fix type error: accountService.getAccount returns Account, not { data: Account }
content = content.replace(/const \{ data: account \} = await accountService\.getAccount\(accountId\)/g, "const account = await accountService.getAccount(accountId)");

// 1. In transfer: remove recipient credit, add status: 'pending'
content = content.replace(
  /\/\/ Update recipient account\s+const newRecipientBalance = parseFloat\(recipientAccount\.balance\) \+ amount\s+const \{ error: recipientError \} = await supabase\s+\.from\('accounts'\)\s+\.update\(\{ balance: newRecipientBalance \}\)\s+\.eq\('id', recipientAccountId\)\s+if \(recipientError\) throw recipientError\s+\/\/ Create transaction record\s+const \{ data: transaction, error: txError \} = await supabase\s+\.from\('transactions'\)\s+\.insert\(\{([\s\S]*?)recipient_account_id: recipientAccountId,\s+\}\)/,
  `// Create transaction record (recipient will be credited on admin approval)
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({$1recipient_account_id: recipientAccountId,
        status: 'pending',
      })`
);

// 2. In wireTransfer: add status: 'pending'
content = content.replace(
  /recipient_account_id: null, \/\/ External account, not in our database\s+\}\)\s+\.select\(\)\s+\.single\(\)/,
  `recipient_account_id: null, // External account, not in our database
        status: 'pending',
      })
      .select()
      .single()`
);

// 3. In createPendingWireTransfer: Debit account immediately
content = content.replace(
  /createPendingWireTransfer: async \(([\s\S]*?)if \(parseFloat\(sourceAccountData\.balance\.toString\(\)\) < amount\) \{\s+throw new Error\('Insufficient funds'\)\s+\}\s+\/\/ For wire transfers, recipient is external \(not in our database\)/,
  `createPendingWireTransfer: async ($1if (parseFloat(sourceAccountData.balance.toString()) < amount) {
      throw new Error('Insufficient funds')
    }

    // Debit source account IMMEDIATELY to reserve funds
    const newSourceBalance = parseFloat(sourceAccountData.balance.toString()) - amount
    const { error: sourceError } = await supabase
      .from('accounts')
      .update({ balance: newSourceBalance })
      .eq('id', accountId)
    
    if (sourceError) throw sourceError

    // For wire transfers, recipient is external (not in our database)`
);

// 4. In createPendingInternationalTransfer: Debit account immediately
content = content.replace(
  /createPendingInternationalTransfer: async \(([\s\S]*?)if \(parseFloat\(sourceAccountData\.balance\.toString\(\)\) < amount\) throw new Error\('Insufficient funds'\)\s+const fullDescription = bankDetails/,
  `createPendingInternationalTransfer: async ($1if (parseFloat(sourceAccountData.balance.toString()) < amount) throw new Error('Insufficient funds')

    // Debit source account IMMEDIATELY to reserve funds
    const newSourceBalance = parseFloat(sourceAccountData.balance.toString()) - amount
    const { error: sourceError } = await supabase
      .from('accounts')
      .update({ balance: newSourceBalance })
      .eq('id', accountId)
    
    if (sourceError) throw sourceError

    const fullDescription = bankDetails`
);

// 5. In createPendingLocalTransfer: Debit account immediately
content = content.replace(
  /createPendingLocalTransfer: async \(([\s\S]*?)if \(parseFloat\(sourceAccountData\.balance\.toString\(\)\) < amount\) throw new Error\('Insufficient funds'\)\s+const fullDescription = bankDetails/,
  `createPendingLocalTransfer: async ($1if (parseFloat(sourceAccountData.balance.toString()) < amount) throw new Error('Insufficient funds')

    // Debit source account IMMEDIATELY to reserve funds
    const newSourceBalance = parseFloat(sourceAccountData.balance.toString()) - amount
    const { error: sourceError } = await supabase
      .from('accounts')
      .update({ balance: newSourceBalance })
      .eq('id', accountId)
    
    if (sourceError) throw sourceError

    const fullDescription = bankDetails`
);

// 6. In completePendingWireTransfer: Remove balance modifications and 'approved' status
content = content.replace(
  /\/\/ For wire transfers, recipient is external - only debit source account\s+\/\/ For local transfers, we would credit the recipient account, but wire transfers are external\s+if \(\['wire_transfer', 'international_transfer'\]\.includes\(transaction\.transaction_type\) \|\|\s+\(transaction\.transaction_type === 'local_transfer' && !transaction\.recipient_account_id\)\) \{[\s\S]*?\/\/ Update transaction status to approved\s+const \{ error: updateTxError \} = await supabase\s+\.from\('transactions'\)\s+\.update\(\{ status: 'approved' \}\)\s+\.eq\('id', transactionId\)\s+if \(updateTxError\) throw updateTxError/,
  `// Funds are already debited when the pending transaction was created
    // We only need to mark verification step as completed
    const { error: updateTxError } = await supabase
      .from('transactions')
      .update({ verification_step: 2 })
      .eq('id', transactionId)

    if (updateTxError) throw updateTxError`
);

fs.writeFileSync(file, content);
console.log('supabase-services.ts safely patched successfully');
