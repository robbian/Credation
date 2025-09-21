import { supabase } from '@/lib/supabase'

export async function testDatabaseConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('student_profiles').select('count', { count: 'exact' })
    
    if (error) {
      console.error('Database connection error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, message: 'Database connection successful' }
  } catch (err) {
    console.error('Connection test failed:', err)
    return { success: false, error: 'Failed to connect to database' }
  }
}

export async function testStorageConnection() {
  try {
    // Test storage bucket access
    const { data, error } = await supabase.storage.from('certificates').list('', { limit: 1 })
    
    if (error) {
      console.error('Storage connection error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, message: 'Storage connection successful' }
  } catch (err) {
    console.error('Storage test failed:', err)
    return { success: false, error: 'Failed to connect to storage' }
  }
}