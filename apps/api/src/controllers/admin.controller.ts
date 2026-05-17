import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { query } from '../lib/db';
import { hashPassword } from '../services/auth.service';

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
    const { count: totalVisits } = await supabase
      .from('visite')
      .select('*', { count: 'exact', head: true });

    // 5. Daily visits (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: visitsData } = await supabase
      .from('visite')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    const dailyVisitsMap = (visitsData || []).reduce((acc: Record<string, number>, curr) => {
      const date = new Date(curr.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const dailyVisits = Object.entries(dailyVisitsMap).map(([date, count]) => ({
      date,
      count
    }));

    // 6. Daily logins (last 30 days)
    const { data: loginsData } = await supabase
      .from('connexion_log')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    const dailyLoginsMap = (loginsData || []).reduce((acc: Record<string, number>, curr) => {
      const date = new Date(curr.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const dailyLogins = Object.entries(dailyLoginsMap).map(([date, count]) => ({
      date,
      count
    }));

    res.json({
      kpis: {
        totalOrders: ordersCount || 0,
        pendingQuotes: pendingQuotes || 0,
        totalRevenue,
        avgOrderValue: ordersCount ? Math.round(totalRevenue / ordersCount) : 0,
        totalVisits: totalVisits || 0
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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Roles distribution
    const { data: usersData } = await supabase
      .from('utilisateur')
      .select('role');
    const rolesMap = (usersData || []).reduce((acc: Record<string, number>, curr) => {
      acc[curr.role] = (acc[curr.role] || 0) + 1;
      return acc;
    }, {});
    const roles = Object.entries(rolesMap).map(([role, count]) => ({ role, count }));

    // 2. Registrations Trend
    const { data: trendData } = await supabase
      .from('utilisateur')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });
    const trendMap = (trendData || []).reduce((acc: Record<string, number>, curr) => {
      const date = new Date(curr.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const trend = Object.entries(trendMap).map(([date, count]) => ({ date, count }));

    // 3. Shipping method stats
    const { data: devisData } = await supabase
      .from('devis')
      .select('shipping_method, shipping_montant');
    const shippingMap = (devisData || []).reduce((acc: Record<string, { count: number, total_shipping_revenue: number }>, curr) => {
      const method = curr.shipping_method || 'AUTRE';
      if (!acc[method]) acc[method] = { count: 0, total_shipping_revenue: 0 };
      acc[method].count += 1;
      acc[method].total_shipping_revenue += curr.shipping_montant || 0;
      return acc;
    }, {});
    const shipping = Object.entries(shippingMap).map(([shipping_method, stats]) => ({
      shipping_method,
      ...stats
    }));

    // 4. Commission stats
    const { data: commissionData } = await supabase
      .from('devis')
      .select('commission_taux, commission_montant');
    let totalCommissionMontant = 0;
    let totalCommissionTaux = 0;
    const countCommission = commissionData?.length || 0;
    (commissionData || []).forEach(d => {
      totalCommissionMontant += d.commission_montant || 0;
      totalCommissionTaux += d.commission_taux || 0;
    });
    const avg_commission_rate = countCommission ? (totalCommissionTaux / countCommission) : 0;
    const commission = {
      avg_commission_rate,
      total_commission_revenue: totalCommissionMontant
    };

    // 5. Categories stats
    const { data: categories } = await supabase.from('categorie').select('id, nom');
    const { data: products } = await supabase.from('produit').select('categorie_id');
    const categoriesMap = (categories || []).reduce((acc: Record<string, number>, cat) => {
      acc[cat.nom] = 0;
      return acc;
    }, {});
    (products || []).forEach(p => {
      const cat = (categories || []).find(c => c.id === p.categorie_id);
      if (cat) {
        categoriesMap[cat.nom] = (categoriesMap[cat.nom] || 0) + 1;
      }
    });
    const categoriesStats = Object.entries(categoriesMap).map(([category_name, product_count]) => ({
      category_name,
      product_count
    }));

    // 6. Popular products
    const { data: popularProducts } = await supabase
      .from('produit')
      .select('nom, stock, prix_cny, poids_kg')
      .order('stock', { ascending: false })
      .limit(5);

    res.json({
      onboarding: {
        roles,
        trend
      },
      metadata: {
        shipping,
        commission,
        categories: categoriesStats,
        popularProducts: popularProducts || []
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
      .select('*, client:client!client_id(nom, telephone, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const mappedQuotes = (quotes || []).map((quote: any) => ({
      ...quote,
      pdf_url: `${baseUrl}/api/v1/orders/quotes/${quote.id}/download-pdf`
    }));

    res.json(mappedQuotes);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAgents = async (req: Request, res: Response) => {
  try {
    const { data: agents, error } = await supabase
      .from('utilisateur')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(agents);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createAgent = async (req: Request, res: Response) => {
  try {
    const { email, nom, telephone, role, password } = req.body;
    
    // Hash password before saving
    const plainPassword = password || 'temporary-pass';
    const hashedPassword = await hashPassword(plainPassword);

    const { data: agent, error } = await supabase
      .from('utilisateur')
      .insert({ 
        email, 
        nom, 
        telephone, 
        role, 
        mot_de_passe: hashedPassword 
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(agent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, nom, telephone, role, password } = req.body;

    const updateData: any = { email, nom, telephone, role };
    if (password) {
      updateData.mot_de_passe = await hashPassword(password);
    }

    const { data: agent, error } = await supabase
      .from('utilisateur')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(agent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('utilisateur')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Agent supprimé avec succès' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const { data: clients, error } = await supabase
      .from('client')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedClients = clients?.map((c: any) => ({
      ...c,
      role: 'client'
    })) || [];

    res.json(formattedClients);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, nom, telephone, password } = req.body;

    const updateData: any = { email, nom, telephone };
    if (password) {
      updateData.mot_de_passe = await hashPassword(password);
    }

    const { data: client, error } = await supabase
      .from('client')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const formattedClient = client ? { ...client, role: 'client' } : null;
    res.json(formattedClient);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('client')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
