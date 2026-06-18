const fs = require('fs');
const path = require('path');

// 1. Update supabase-services.ts
let file = path.join(__dirname, 'lib', 'supabase-services.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /timestamp: tx\.timestamp,/g,
  `timestamp: tx.timestamp,
      status: tx.status,`
);

fs.writeFileSync(file, content);


// 2. Update dashboard/page.tsx
file = path.join(__dirname, 'app', 'dashboard', 'page.tsx');
content = fs.readFileSync(file, 'utf8');

// Add status to type
content = content.replace(
  /recipient_account: number \| null;\s+timestamp: string;\s+\}/,
  `recipient_account: number | null;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}`
);

// Add Badge to imports
if (!content.includes('Badge } from "@/components/ui/badge"')) {
    content = content.replace(
        /import \{ Badge \} from "@\/components\/ui\/badge";/,
        `import { Badge } from "@/components/ui/badge";`
    );
}

// Add Badge to render
content = content.replace(
  /\{transaction\.category && \(\s+<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">\s+\{transaction\.category\.name\}\s+<\/p>\s+\)\}/g,
  `{transaction.category && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {transaction.category.name}
                              </p>
                            )}
                            <Badge variant={transaction.status === 'approved' ? 'default' : transaction.status === 'pending' ? 'secondary' : 'destructive'} className="mt-2 text-[10px] h-4 py-0 px-2 capitalize inline-flex">
                              {transaction.status || 'approved'}
                            </Badge>`
);

fs.writeFileSync(file, content);


// 3. Update transaction-history/page.tsx
file = path.join(__dirname, 'app', 'transaction-history', 'page.tsx');
content = fs.readFileSync(file, 'utf8');

// Add status to type
content = content.replace(
  /recipient_account: number \| null;\s+timestamp: string;\s+\}/,
  `recipient_account: number | null;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}`
);

// Add Badge import if not exists
if (!content.includes('import { Badge } from "@/components/ui/badge"')) {
    content = content.replace(
        /import \{ Select, SelectContent, SelectItem, SelectTrigger, SelectValue \} from "@\/components\/ui\/select";/,
        `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";`
    );
}

// Add Status table header
content = content.replace(
  /<TableHead className="text-green-800">Amount<\/TableHead>/g,
  `<TableHead className="text-green-800">Amount</TableHead>
                  <TableHead className="text-green-800">Status</TableHead>`
);

// Add Status table cell
content = content.replace(
  /<\/TableCell>\s+<TableCell>\{txn\.category\?\.name \|\| "N\/A"\}<\/TableCell>/g,
  `</TableCell>
                    <TableCell>
                      <Badge variant={txn.status === 'approved' ? 'default' : txn.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">
                        {txn.status || 'approved'}
                      </Badge>
                    </TableCell>
                    <TableCell>{txn.category?.name || "N/A"}</TableCell>`
);

fs.writeFileSync(file, content);
console.log('UI updated with status successfully');
