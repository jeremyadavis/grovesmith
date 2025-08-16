import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Recipient {
  id: string;
  name: string;
  allowance_amount: number;
  avatar_url?: string;
  categories?: {
    give: number;
    spend: number;
    save: number;
    invest: number;
  };
}

interface RecipientCardProps {
  recipient: Recipient;
}

export function RecipientCard({ recipient }: RecipientCardProps) {
  const categories = recipient.categories || {
    give: 0,
    spend: 0,
    save: 0,
    invest: 0,
  };

  return (
    <Link href={`/recipients/${recipient.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-lg font-semibold text-white">
              {recipient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg">{recipient.name}</CardTitle>
              <p className="text-sm text-gray-500">
                ${recipient.allowance_amount.toFixed(2)} per week
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-green-50 p-2 text-center">
              <div className="font-semibold text-green-700">Give</div>
              <div className="text-gray-600">${categories.give.toFixed(2)}</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-2 text-center">
              <div className="font-semibold text-blue-700">Spend</div>
              <div className="text-gray-600">
                ${categories.spend.toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg bg-purple-50 p-2 text-center">
              <div className="font-semibold text-purple-700">Save</div>
              <div className="text-gray-600">${categories.save.toFixed(2)}</div>
            </div>
            <div className="rounded-lg bg-orange-50 p-2 text-center">
              <div className="font-semibold text-orange-700">Invest</div>
              <div className="text-gray-600">
                ${categories.invest.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
