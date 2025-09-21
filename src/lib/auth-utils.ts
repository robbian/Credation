export const USER_ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const ROUTE_PATHS = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  FACULTY_REVIEW: '/faculty',
  HOME: '/',
} as const

export function getRedirectPath(role: string | null): string {
  switch (role) {
    case USER_ROLES.STUDENT:
      return ROUTE_PATHS.DASHBOARD
    case USER_ROLES.FACULTY:
      return ROUTE_PATHS.FACULTY_REVIEW
    default:
      return ROUTE_PATHS.HOME
  }
}

export function isValidRole(role: string): role is UserRole {
  return Object.values(USER_ROLES).includes(role as UserRole)
}