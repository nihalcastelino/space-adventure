import { useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';

// Table name constant
const TABLE_NAME = 'space_adventure_profiles';

/**
 * User Data Sync Hook
 * 
 * Syncs user data (coins, level, premium) between Supabase and localStorage
 * Falls back to localStorage if Supabase is not configured or user not logged in
 */
export function useUserData() {
  const { user, isAuthenticated, configured } = useAuth();

  // Load user data from Supabase
  const loadUserData = useCallback(async () => {
    if (!configured || !isAuthenticated || !user) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user data:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error loading user data:', err);
      return null;
    }
  }, [configured, isAuthenticated, user]);

  // Save user data to Supabase
  const saveUserData = useCallback(async (updates) => {
    if (!configured || !isAuthenticated || !user) {
      return false;
    }

    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error saving user data:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error saving user data:', err);
      return false;
    }
  }, [configured, isAuthenticated, user]);

  // Migrate localStorage data to Supabase on login
  const migrateLocalData = useCallback(async (localData) => {
    if (!configured || !isAuthenticated || !user || !supabase) {
      return false;
    }

    try {
      // Load current Supabase data
      const supabaseData = await loadUserData();
      
      // If no Supabase profile exists, create one with local data
      if (!supabaseData) {
        const { error: insertError } = await supabase
          .from(TABLE_NAME)
          .insert({
            id: user.id,
            email: user.email,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
            coins: localData.coins || 100,
            level: localData.level || 1,
            xp: localData.xp || 0,
            premium_tier: localData.premium_tier || 'free',
            subscription_status: localData.subscription_status || 'inactive'
          });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return false;
        }
        return true;
      }
      
      // Merge: Use higher values (don't lose progress)
      const mergedData = {
        coins: Math.max(localData.coins || 100, supabaseData?.coins || 100),
        level: Math.max(localData.level || 1, supabaseData?.level || 1),
        xp: Math.max(localData.xp || 0, supabaseData?.xp || 0),
        premium_tier: supabaseData?.premium_tier || localData.premium_tier || 'free',
        subscription_status: supabaseData?.subscription_status || localData.subscription_status || 'inactive'
      };

      // Save merged data
      await saveUserData(mergedData);

      return true;
    } catch (err) {
      console.error('Error migrating local data:', err);
      return false;
    }
  }, [configured, isAuthenticated, user, loadUserData, saveUserData, supabase]);

  return {
    loadUserData,
    saveUserData,
    migrateLocalData,
    isSynced: configured && isAuthenticated
  };
}

