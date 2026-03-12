// lib/useAdmin.ts
import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook pour vérifier si l'utilisateur est admin
 * @returns {isAdmin: boolean, loading: boolean}
 */
export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si pas connecté
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Vérifier le rôle
    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erreur vérification admin:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.role === 'admin');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, loading };
}