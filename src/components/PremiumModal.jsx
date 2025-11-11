import { PremiumModal as BasePremiumModal } from './PremiumUI';
import { usePremium } from '../hooks/usePremium';

/**
 * Premium Modal Wrapper
 * Connects PremiumUI to usePremium hook
 */
export default function PremiumModal({ onClose }) {
  const premium = usePremium();

  const handlePurchase = async (tierId) => {
    const result = await premium.purchasePremium(tierId);
    if (result.success) {
      // Close modal after successful purchase
      setTimeout(() => {
        onClose();
      }, 1000);
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
    />
  );
}

