import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

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
    // In a real app, this would be a more complex SQL query or a dedicated view
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

    res.json({
      kpis: {
        totalOrders: ordersCount,
        pendingQuotes,
        totalRevenue,
        avgOrderValue: ordersCount ? Math.round(totalRevenue / ordersCount) : 0
      },
      chartData: formattedChartData
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
  // In a real app, this would use Supabase Auth to create the user
  // For this exercise, we assume the user exists or we insert into table
  try {
    const { email, nom, telephone, role } = req.body;
    const { data: agent, error } = await supabase
      .from('utilisateur')
      .insert({ email, nom, telephone, role, mot_de_passe: 'temporary-pass' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(agent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
