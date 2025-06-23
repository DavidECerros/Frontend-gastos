import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://<TU-PROYECTO>.supabase.co'
const supabaseAnonKey = '<TU-CLAVE-ANON>'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
