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

    // Fetch main admin balance
    const { data: adminUser } = await supabase
      .from('utilisateur')
      .select('solde')
      .eq('email', 'siataiger7@gmail.com')
      .single();
    const soldeAdmin = Number(adminUser?.solde || 0);

    res.json({
      kpis: {
        totalOrders: ordersCount || 0,
        pendingQuotes: pendingQuotes || 0,
        totalRevenue,
        avgOrderValue: ordersCount ? Math.round(totalRevenue / ordersCount) : 0,
        totalVisits: totalVisits || 0
      },
      soldeAdmin,
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

export const createSpecialQuote = async (req: Request, res: Response) => {
  try {
    const {
      client_id,
      quantite,
      nom,
      categorie_id,
      description,
      prix_cny,
      poids_kg,
      moq,
      lien_fournisseur,
      longueur_m,
      largeur_m,
      hauteur_m,
      couleurs,
      image_url
    } = req.body;

    if (!client_id || !quantite || !nom || !prix_cny) {
      return res.status(400).json({ message: 'Certains champs requis sont manquants (client_id, quantite, nom, prix_cny).' });
    }

    // 1. Get configurations
    const { data: configData } = await supabase
      .from('configuration_site')
      .select('cle, valeur');
      
    const configMap = (configData || []).reduce((acc: Record<string, string>, item) => {
      acc[item.cle] = item.valeur;
      return acc;
    }, {});
    
    const exchangeRate = configMap['TAUX_CHANGE_CNY_XAF'] ? Number(configMap['TAUX_CHANGE_CNY_XAF']) : 95;

    // 2. Compute cost and commission
    // Subtotal Products in FCFA
    const subtotal_products = Math.round(Number(prix_cny) * exchangeRate * Number(quantite));

    // Logistic Commission variable grid:
    // < 350 000 FCFA : 10%
    // 350 000 - 1 000 000 FCFA : 15%
    // >= 1 000 000 FCFA : 20%
    let commission_rate = 0.10;
    if (subtotal_products >= 350000 && subtotal_products < 1000000) {
      commission_rate = 0.15;
    } else if (subtotal_products >= 1000000) {
      commission_rate = 0.20;
    }

    const commission_montant = Math.round(subtotal_products * commission_rate);
    const total_ttc = subtotal_products + commission_montant;

    // 3. Build unique reference and items structure
    const reference = `DEV-SPEC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const items = [{
      product: {
        nom,
        categorie_id,
        description,
        prix_cny: Number(prix_cny),
        poids_kg: Number(poids_kg || 0),
        moq: Number(moq || 1),
        lien_fournisseur,
        longueur_m: Number(longueur_m || 0),
        largeur_m: Number(largeur_m || 0),
        hauteur_m: Number(hauteur_m || 0),
        couleurs: couleurs || [],
        images: image_url ? [image_url] : []
      },
      quantity: Number(quantite)
    }];

    // 4. Save Quote
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .insert({
        client_id,
        reference,
        items,
        subtotal_products,
        commission_taux: Math.round(commission_rate * 100),
        commission_montant,
        shipping_method: 'AIR_NORMAL',
        shipping_montant: 0,
        total_ttc,
        status: 'PENDING'
      })
      .select()
      .single();

    if (devisError) throw devisError;

    // 5. Update client balance
    const { data: clientObj } = await supabase
      .from('client')
      .select('solde')
      .eq('id', client_id)
      .single();

    const currentClientSolde = Number(clientObj?.solde || 0);
    const newClientSolde = currentClientSolde + total_ttc;
    
    await supabase
      .from('client')
      .update({ solde: newClientSolde })
      .eq('id', client_id);

    // 6. Update administrative space balance
    const { data: adminUser } = await supabase
      .from('utilisateur')
      .select('id, solde')
      .eq('email', 'siataiger7@gmail.com')
      .single();

    if (adminUser) {
      const currentAdminSolde = Number(adminUser.solde || 0);
      const newAdminSolde = currentAdminSolde + total_ttc;
      await supabase
        .from('utilisateur')
        .update({ solde: newAdminSolde })
        .eq('id', adminUser.id);
    }

    // 7. Push real-time notification to client
    await supabase.from('notification').insert({
      client_id,
      title: '🔎 Nouveau Devis Spécial',
      content: `Un devis spécial (${reference}) de ${total_ttc.toLocaleString()} FCFA pour commande spécifique a été généré et ajouté à votre solde.`,
      type: 'devis',
      is_read: false
    });

    res.status(201).json({
      success: true,
      message: 'Devis spécial créé avec succès et soldes mis à jour.',
      devis
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erreur lors de la création du devis spécial.' });
  }
};
