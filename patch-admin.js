const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'lib', 'admin-services.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. In updateTransactionStatus: when approved, do not debit sender for transfers/withdrawals since it's already debited
content = content.replace(
  /\/\/ Debit the account\s+if \(currentBalance < amount\) \{\s+throw new Error\('Insufficient funds to approve this transaction'\)\s+\}\s+const newBalance = currentBalance - amount\s+const \{ error: balanceError \} = await supabase\s+\.from\('accounts'\)\s+\.update\(\{ balance: newBalance \}\)\s+\.eq\('id', transaction\.account_id\)\s+if \(balanceError\) throw balanceError/g,
  `// Sender was ALREADY DEBITED when the transaction was created, so we do NOT debit again`
);

// 2. In updateTransactionStatus: when rejected, we should reverse the transaction if it was pending OR approved
content = content.replace(
  /if \(status === 'rejected' && currentStatus === 'approved'\) \{/g,
  `if (status === 'rejected' && (!currentStatus || currentStatus === 'pending' || currentStatus === 'approved')) {`
);

fs.writeFileSync(file, content);
console.log('admin-services.ts patched successfully');
