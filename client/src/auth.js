const AUTH_KEY = 'clinicflow_auth_session'
const AUTH_NOTICE_KEY = 'clinicflow_auth_notice'

export const roleDashboardMap = {
  admin: '/dashboard/admin',
  doctor: '/dashboard/doctor',
  nurse: '/dashboard/nurse',
  pharmacy: '/dashboard/pharmacy',
  laboratory: '/dashboard/laboratory',
  receptionist: '/dashboard/receptionist',
  patient: '/dashboard/patient'
}

export const loginRouteMap = {
  admin: '/login',
  doctor: '/login',
  nurse: '/login',
  receptionist: '/login',
  pharmacy: '/login',
  laboratory: '/login',
  patient: '/login'
}

export const normalizeRole = (role) => String(role || '').trim().toLowerCase()

export const saveSession = (role, user, token = null) => {
  const safeRole = normalizeRole(role)
  const normalizedUser = user && typeof user === 'object' ? user : { id: user }
  const payload = {
    role: safeRole,
    user: normalizedUser,
    userId: normalizedUser?._id || normalizedUser?.id || null,
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
  } catch {
    return null
  }
}

export const clearSession = () => {
  localStorage.removeItem(AUTH_KEY)
}

export const setAuthNotice = (message) => sessionStorage.setItem(AUTH_NOTICE_KEY, message)

export const consumeAuthNotice = () => {
  const message = sessionStorage.getItem(AUTH_NOTICE_KEY)
  if (message) sessionStorage.removeItem(AUTH_NOTICE_KEY)
  return message
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
