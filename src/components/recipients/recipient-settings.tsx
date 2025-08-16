import { CategoryTransactionHistory } from './category-transaction-history';

interface Recipient {
  id: string;
  name: string;
  allowance_amount: number;
  categories: {
    give: number;
    spend: number;
    save: number;
    invest: number;
  };
}

interface RecipientSettingsProps {
  recipient: Recipient;
  activeCategory?: string;
}

export function RecipientSettings({
  recipient,
  activeCategory = 'give',
}: RecipientSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Show transaction history for the active category */}
      {activeCategory === 'give' && (
        <CategoryTransactionHistory
          recipientId={recipient.id}
          categoryType="give"
          title="Give History"
          description="Track of all charitable contributions and allowance additions"
        />
      )}
      {activeCategory === 'spend' && (
        <CategoryTransactionHistory
          recipientId={recipient.id}
          categoryType="spend"
          title="Spend History"
          description="Track of allowance additions to spending money"
        />
      )}
      {activeCategory === 'save' && (
        <CategoryTransactionHistory
          recipientId={recipient.id}
          categoryType="save"
          title="Save History"
          description="Track of savings contributions and withdrawals"
        />
      )}
      {activeCategory === 'invest' && (
        <CategoryTransactionHistory
          recipientId={recipient.id}
          categoryType="invest"
          title="Investment History"
          description="Track of investments and dividend payments"
        />
      )}
    </div>
  );
}
