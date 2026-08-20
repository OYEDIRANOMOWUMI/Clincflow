const AUTH_KEY = 'clinicflow_auth_session'

export const roleDashboardMap = {
  admin: '/dashboard/admin',
  doctor: '/dashboard/doctor',
  nurse: '/dashboard/nurse',
  pharmacy: '/dashboard/pharmacy',
  laboratory: '/dashboard/laboratory',
  patient: '/dashboard/patient'
}

export const loginRouteMap = {
  admin: '/admin',
  doctor: '/doctor',
  nurse: '/doctor',
  pharmacy: '/doctor',
  laboratory: '/doctor',
  patient: '/'
}

export const normalizeRole = (role) => String(role || '').trim().toLowerCase()

export const saveSession = (role, user, token = null) => {
  const safeRole = normalizeRole(role)
  const payload = {
    role: safeRole,
    user,
    loggedInAt: new Date().toISOString(),
    ...(token ? { token } : {})
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(payload))
  return payload
}

export const getSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    return null
  }
}

export const clearSession = () => {
  localStorage.removeItem(AUTH_KEY)
}

export const isAuthenticated = (role) => {
  const session = getSession()
  if (!session) return false
  const sessionRole = normalizeRole(session.role)
  if (!role) return Boolean(sessionRole)
  return sessionRole === normalizeRole(role)
}

export const getDashboardPathForRole = (role) => roleDashboardMap[normalizeRole(role)] || '/'

export const getLoginPathForRole = (role) => loginRouteMap[normalizeRole(role)] || '/'
