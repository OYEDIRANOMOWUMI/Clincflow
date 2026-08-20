import React, { useEffect } from 'react'
import { saveSession } from '../auth'
import { useNavigate, useParams } from 'react-router-dom'

const DemoLogin = () => {
  const navigate = useNavigate()
  const params = useParams()
  const role = String(params.role || 'doctor').trim().toLowerCase()
  const allowedRoles = ['admin', 'doctor', 'nurse', 'pharmacy', 'laboratory', 'patient']

  useEffect(() => {
    if (!allowedRoles.includes(role)) {
      navigate('/', { replace: true })
      return
    }

    const user = { name: 'Demo Staff', email: `demo@clinicflow.local`, role }
    const demoToken = `demo-${role}`
    saveSession(role, user, demoToken)
    navigate(`/dashboard/${role}`, { replace: true })
  }, [navigate, role])

  return <div style={{padding:40}}>Signing in as demo {role}…</div>
}

export default DemoLogin
