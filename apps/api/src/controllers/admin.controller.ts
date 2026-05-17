import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { query } from '../lib/db';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Basic counts
    const { count: ordersCount } = await supabase
      .from('commande')
      .select('*', { count: 'exact', head: true });

    const { count: pendingQuotes } = await supabase
      .from('devis')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    // 2. Revenue & Commissions (Aggregated)
    const { data: revenueData } = await supabase
      .from('commande')
      .select('total_ttc');
    
    const totalRevenue = revenueData?.reduce((acc, curr) => acc + curr.total_ttc, 0) || 0;

    // 3. Stats by day (for Recharts)
    const { data: chartData } = await supabase
      .from('commande')
      .select('created_at, total_ttc')
      .order('created_at', { ascending: true })
      .limit(30);

    const formattedChartData = chartData?.reduce((acc: any[], curr) => {
      const date = new Date(curr.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.amount += curr.total_ttc;
      } else {
        acc.push({ date, amount: curr.total_ttc });
      }
      return acc;
    }, []);

    // 4. Global visits count
    const visitCountRes = await query('SELECT COUNT(*) as count FROM visite');
    const totalVisits = parseInt(visitCountRes.rows[0]?.count || '0', 10);

    // 5. Daily visits (last 30 days)
    const dailyVisitsRes = await query(`
      SELECT TO_CHAR(created_at, 'DD/MM') as date, COUNT(*)::integer as count 
      FROM visite 
      WHERE created_at >= NOW() - INTERVAL '30 days' 
      GROUP BY TO_CHAR(created_at, 'DD/MM') 
      ORDER BY MIN(created_at) ASC
    `);
    const dailyVisits = dailyVisitsRes.rows;

    // 6. Daily logins (last 30 days)
    const dailyLoginsRes = await query(`
      SELECT TO_CHAR(created_at, 'DD/MM') as date, COUNT(*)::integer as count 
      FROM connexion_log 
      WHERE created_at >= NOW() - INTERVAL '30 days' 
      GROUP BY TO_CHAR(created_at, 'DD/MM') 
      ORDER BY MIN(created_at) ASC
    `);
    const dailyLogins = dailyLoginsRes.rows;

    res.json({
      kpis: {
        totalOrders: ordersCount,
        pendingQuotes,
        totalRevenue,
        avgOrderValue: ordersCount ? Math.round(totalRevenue / ordersCount) : 0,
        totalVisits
      },
      chartData: formattedChartData,
      dailyVisits,
      dailyLogins
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getReportsStats = async (req: Request, res: Response) => {
  try {
    const onboardingRolesRes = await query(`
      SELECT role, COUNT(*)::integer as count
      FROM utilisateur
      GROUP BY role
    `);

    const registrationsTrendRes = await query(`
      SELECT TO_CHAR(created_at, 'DD/MM') as date, COUNT(*)::integer as count
      FROM utilisateur
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY TO_CHAR(created_at, 'DD/MM')
      ORDER BY MIN(created_at) ASC
    `);

    const shippingMethodStatsRes = await query(`
      SELECT shipping_method, COUNT(*)::integer as count, SUM(shipping_montant)::integer as total_shipping_revenue
      FROM devis
      GROUP BY shipping_method
    `);

    const commissionStatsRes = await query(`
      SELECT 
        COALESCE(AVG(commission_taux), 0)::float as avg_commission_rate, 
        COALESCE(SUM(commission_montant), 0)::integer as total_commission_revenue
      FROM devis
    `);

    const categoryStatsRes = await query(`
      SELECT c.nom as category_name, COUNT(p.id)::integer as product_count
      FROM categorie c
      LEFT JOIN produit p ON p.categorie_id = c.id
      GROUP BY c.nom
    `);

    const popularProductsRes = await query(`
      SELECT nom, stock, prix_cny, poids_kg 
      FROM produit 
      ORDER BY stock DESC 
      LIMIT 5
    `);

    res.json({
      onboarding: {
        roles: onboardingRolesRes.rows,
        trend: registrationsTrendRes.rows
      },
      metadata: {
        shipping: shippingMethodStatsRes.rows,
        commission: commissionStatsRes.rows[0] || { avg_commission_rate: 0, total_commission_revenue: 0 },
        categories: categoryStatsRes.rows,
        popularProducts: popularProductsRes.rows
      }
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllQuotes = async (req: Request, res: Response) => {
  try {
    const { data: quotes, error } = await supabase
      .from('devis')
      .select('*, client:utilisateur!client_id(nom, telephone, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(quotes);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAgents = async (req: Request, res: Response) => {
  try {
    const { data: agents, error } = await supabase
      .from('utilisateur')
      .select('*')
      .in('role', ['agent', 'secretaire']);

    if (error) throw error;
    res.json(agents);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createAgent = async (req: Request, res: Response) => {
  try {
    const { email, nom, telephone, role, password } = req.body;
    const { data: agent, error } = await supabase
      .from('utilisateur')
      .insert({ 
        email, 
        nom, 
        telephone, 
        role, 
        mot_de_passe: password || 'temporary-pass' 
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(agent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
