import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { usePremium } from '../hooks/usePremium';
import { useCurrency } from '../hooks/useCurrency';

export default function CheckoutSuccess({ sessionId, onClose }) {
  const premium = usePremium();
  const currency = useCurrency();

  useEffect(() => {
    // Reload premium status and coins after checkout
    const reloadData = async () => {
      // Wait a bit for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reload premium status
      if (premium.loadPremiumStatus) {
        await premium.loadPremiumStatus();
      }
      
      // Reload currency (coins should be updated by webhook)
      // Currency hook should automatically sync with Supabase
    };

    reloadData();
  }, [premium]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 bg-gray-900 rounded-2xl border-2 border-green-400 shadow-2xl w-full max-w-md mx-4 pointer-events-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-900 to-blue-900 p-6 rounded-t-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 text-center mb-4">
            Your payment has been processed successfully.
          </p>
          
          {sessionId && (
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-400 mb-1">Session ID:</p>
              <p className="text-sm text-gray-300 font-mono break-all">{sessionId}</p>
            </div>
          )}

          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-400/30">
            <p className="text-sm text-blue-300 mb-2">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
              <li>Your premium access will be activated automatically</li>
              <li>Coins will be added to your account (if purchased)</li>
              <li>This may take a few seconds to process</li>
            </ul>
          </div>

          <button
            onClick={() => {
              window.location.reload();
            }}
            className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

