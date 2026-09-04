import api from '../api';

const demoUsers = {
  admin: {
    id: 'demo-admin',
    name: 'System Admin',
    email: 'admin@clinicflow.com',
    role: 'admin',
  },
  doctor: {
    id: 'demo-doctor',
    name: 'Dr. Jane Smith',
    email: 'doctor@clinicflow.com',
    role: 'doctor',
  },
  nurse: {
    id: 'demo-nurse',
    name: 'Nurse Lucy',
    email: 'nurse@clinicflow.com',
    role: 'nurse',
  },
  receptionist: {
    id: 'demo-receptionist',
    name: 'Front Desk',
    email: 'receptionist@clinicflow.com',
    role: 'receptionist',
  },
  pharmacy: {
    id: 'demo-pharmacy',
    name: 'Pharmacy Desk',
    email: 'pharmacy@clinicflow.com',
    role: 'pharmacy',
  },
  laboratory: {
    id: 'demo-laboratory',
    name: 'Lab Technician',
    email: 'laboratory@clinicflow.com',
    role: 'laboratory',
  },
  patient: {
    id: 'demo-patient',
    name: 'Aisha Bello',
    email: 'patient@clinicflow.com',
    role: 'patient',
  },
};

export async function loginUser(credentials) {
  try {
    const response = await api.post('/user/login', {
      email: credentials.email,
      password: credentials.password,
      role: credentials.role,
    });
    return response.data;
  } catch (error) {
    const demoUser = demoUsers[credentials.role];

    if (
      demoUser &&
      credentials.email === demoUser.email &&
      credentials.password === 'password123'
    ) {
      return {
        token: 'demo-token',
        user: demoUser,
      };
    }

    const message = error?.response?.data?.message || 'Invalid email or password';
    throw new Error(message);
  }
}

export async function fetchCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

export function logoutUser() {
  return Promise.resolve(true);
}

export { demoUsers };
