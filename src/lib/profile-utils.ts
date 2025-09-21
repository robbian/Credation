import { supabase } from '@/lib/supabase'

/**
 * Ensure a student profile exists for the current user
 * This function will create a profile if one doesn't exist
 */
export async function ensureStudentProfile(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return { success: true }
    }

    // If profile doesn't exist and it's not a "not found" error, return the error
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking student profile:', checkError)
      return { success: false, error: checkError.message }
    }

    // Create new student profile
    const { error: insertError } = await supabase
      .from('student_profiles')
      .insert({
        id: userId,
        roll_no: null,
        course: null,
        credits: 0,
        attendance_percentage: 0
      })

    if (insertError) {
      console.error('Error creating student profile:', insertError)
      return { success: false, error: insertError.message }
    }

    console.log('Student profile created successfully for user:', userId)
    return { success: true }

  } catch (error) {
    console.error('Unexpected error in ensureStudentProfile:', error)
    return { success: false, error: 'Failed to create student profile' }
  }
}

/**
 * Get current user's role from Supabase auth metadata
 */
export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return null
    }
    return user.user_metadata?.role || (user as any).raw_user_meta_data?.role || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}