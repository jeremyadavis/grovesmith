import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Recipient {
  id: string;
  name: string;
  allowance_amount: number;
  avatar_url?: string;
}

interface RecipientCardProps {
  recipient: Recipient;
}

export function RecipientCard({ recipient }: RecipientCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
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
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="font-semibold text-green-700">Give</div>
            <div className="text-gray-600">$0.00</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-700">Spend</div>
            <div className="text-gray-600">$0.00</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <div className="font-semibold text-purple-700">Save</div>
            <div className="text-gray-600">$0.00</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <div className="font-semibold text-orange-700">Invest</div>
            <div className="text-gray-600">$0.00</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}