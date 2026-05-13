import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { productSchema, categorySchema } from '../schemas/product.schema';
import { processAndUploadImage } from '../services/upload.service';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { categorie_id, prix_min, prix_max, search, page = 1, limit = 12 } = req.query;
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit) - 1;

    let query = supabase
      .from('produit')
      .select('*, categorie(nom)', { count: 'exact' });

    if (categorie_id) query = query.eq('categorie_id', categorie_id);
    if (prix_min) query = query.gte('prix_cny', Number(prix_min) * 100);
    if (prix_max) query = query.lte('prix_cny', Number(prix_max) * 100);
    if (search) query = query.ilike('nom', `%${search}%`);

    const { data, count, error } = await query.range(start, end).order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      products: data,
      total: count,
      page: Number(page),
      totalPages: Math.ceil((count || 0) / Number(limit))
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('produit')
      .select('*, categorie(*)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ message: 'Produit non trouvé' });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const validatedData = productSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];
    
    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const { url800 } = await processAndUploadImage(file);
        imageUrls.push(url800);
      }
    }

    const { data, error } = await supabase
      .from('produit')
      .insert([{ ...validatedData, images: imageUrls }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const validatedData = productSchema.partial().parse(req.body);
    const files = req.files as Express.Multer.File[];

    let imageUrls = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
    if (files && files.length > 0) {
      for (const file of files) {
        const { url800 } = await processAndUploadImage(file);
        imageUrls.push(url800);
      }
    }

    const { data, error } = await supabase
      .from('produit')
      .update({ ...validatedData, images: imageUrls, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('produit')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Produit supprimé' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('categorie')
      .select('*')
      .order('nom');

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getExchangeRate = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('configuration')
      .select('valeur')
      .eq('cle', 'TAUX_CHANGE_CNY_XAF')
      .single();

    if (error) throw error;
    res.json({ rate: Number(data.valeur) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
