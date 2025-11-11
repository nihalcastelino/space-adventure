import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Admin Hook
 * 
 * Provides admin functionality for managing users and premium status
 */
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('space_adventure_profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.is_admin === true);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Update user premium status
  const updateUserPremium = useCallback(async (userId, tier, options = {}) => {
    if (!isAdmin) {
      return { success: false, error: 'Not authorized' };
    }

    try {
      const updateData = {
        premium_tier: tier,
        subscription_status: {
          active: tier !== 'free',
          expires_at: options.expiresAt || (tier === 'lifetime' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
          auto_renew: options.autoRenew !== undefined ? options.autoRenew : (tier === 'monthly'),
        },
      };

      // Clear Stripe IDs if manually setting premium (not via Stripe)
      if (options.clearStripeIds) {
        updateData.stripe_customer_id = null;
        updateData.stripe_subscription_id = null;
      }

      const { data, error } = await supabase
        .from('space_adventure_profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [isAdmin]);

  // Get all users (admin only)
  const getAllUsers = useCallback(async (limit = 50, offset = 0) => {
    if (!isAdmin) {
      return { success: false, error: 'Not authorized', users: [] };
    }

    try {
      const { data, error } = await supabase
        .from('space_adventure_profiles')
        .select('id, email, display_name, premium_tier, subscription_status, is_admin, created_at, total_games, total_wins')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message, users: [] };
      }

      return { success: true, users: data || [] };
    } catch (err) {
      return { success: false, error: err.message, users: [] };
    }
  }, [isAdmin]);

  // Search users by email
  const searchUsers = useCallback(async (searchTerm) => {
    if (!isAdmin) {
      return { success: false, error: 'Not authorized', users: [] };
    }

    try {
      const { data, error } = await supabase
        .from('space_adventure_profiles')
        .select('id, email, display_name, premium_tier, subscription_status, is_admin, created_at')
        .ilike('email', `%${searchTerm}%`)
        .limit(20);

      if (error) {
        return { success: false, error: error.message, users: [] };
      }

      return { success: true, users: data || [] };
    } catch (err) {
      return { success: false, error: err.message, users: [] };
    }
  }, [isAdmin]);

  // Set user as admin
  const setUserAdmin = useCallback(async (userId, adminStatus) => {
    if (!isAdmin) {
      return { success: false, error: 'Not authorized' };
    }

    try {
      const { data, error } = await supabase
        .from('space_adventure_profiles')
        .update({ is_admin: adminStatus })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [isAdmin]);

  return {
    isAdmin,
    loading,
    updateUserPremium,
    getAllUsers,
    searchUsers,
    setUserAdmin,
  };
}

