import { useState } from 'react';
import { PremiumModal as BasePremiumModal } from './PremiumUI';
import { usePremium } from '../hooks/usePremium';

/**
 * Premium Modal Wrapper
 * Connects PremiumUI to usePremium hook
 */
export default function PremiumModal({ onClose }) {
  const premium = usePremium();
  const [error, setError] = useState(null);

  const handlePurchase = async (tierId) => {
    setError(null);
    const result = await premium.purchasePremium(tierId);
    if (result.success) {
      // Close modal after successful purchase
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      // Show error to user
      setError(result.error || 'Failed to start checkout. Please try again.');
      console.error('Purchase error:', result.error);
    }
    return result;
  };

  return (
    <BasePremiumModal
      currentTier={premium.tier}
      subscriptionStatus={premium.subscriptionStatus}
      onPurchase={handlePurchase}
      onCancel={premium.cancelSubscription}
      onRestore={premium.restorePurchases}
      onClose={onClose}
      error={error}
    />
  );
}

