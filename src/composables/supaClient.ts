import { supabase } from '../supabase/supabase';

export const getData = async (
  from: string,
  select: string,
  column: string = '',
  compareColumn: string = ''
) => {
  try {
    const { data, error } = await supabase
      .from(from)
      .select(select)
      .eq(column, compareColumn);
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(error.message);
  }
};

export const insertData = async (
  from: string,
  insert: object[],
  upsert: boolean = true
) => {
  try {
    const { data, error } = await supabase
      .from(from)
      .insert(insert, { upsert });
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(error.message);
  }
};

export const updateData = async (
  from: string,
  update: object,
  column: string,
  compareColumn: any
) => {
  try {
    const { data, error } = await supabase
      .from(from)
      .update(update)
      .eq(column, compareColumn);
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(error.message);
  }
};

export const deleteData = async (
  from: string,
  column: string,
  compareColumn: any
) => {
  try {
    const { data, error } = await supabase
      .from(from)
      .delete()
      .eq(column, compareColumn);
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(error.message);
  }
};

export const storageUpload = async (from: string, path: string, file: File) => {
  try {
    const { data, error } = await supabase.storage
      .from(from)
      .upload(path, file);
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(error.message);
  }
};
