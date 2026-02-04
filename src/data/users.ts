export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'SHG Leader' | 'Member';
  shg_name: string;
  member_id?: string;
  created_at: string;
}

export const users: User[] = [
  {
    user_id: "USR001",
    name: "Priya Sharma",
    email: "priya.admin@shg.org",
    phone: "9988776655",
    role: "Admin",
    shg_name: "Shakti Mahila SHG",
    created_at: "2023-01-01"
  },
  {
    user_id: "USR002",
    name: "Lakshmi Devi",
    email: "lakshmi.leader@shg.org",
    phone: "9876543210",
    role: "SHG Leader",
    shg_name: "Shakti Mahila SHG",
    member_id: "MEM001",
    created_at: "2023-01-15"
  },
  {
    user_id: "USR003",
    name: "Sunita Kumari",
    email: "sunita.member@shg.org",
    phone: "9876543211",
    role: "Member",
    shg_name: "Shakti Mahila SHG",
    member_id: "MEM002",
    created_at: "2023-01-15"
  },
  {
    user_id: "USR004",
    name: "Meera Bai",
    email: "meera.member@shg.org",
    phone: "9876543212",
    role: "Member",
    shg_name: "Shakti Mahila SHG",
    member_id: "MEM003",
    created_at: "2023-02-01"
  }
];

// Current logged in user (mock)
export const currentUser: User = users[1]; // Lakshmi Devi - SHG Leader

// Helper to authenticate user (mock)
export const authenticateUser = (email: string, password: string, role: string): User | null => {
  const user = users.find(u => u.email === email && u.role === role);
  return user || null;
};

// SHG Info
export const shgInfo = {
  name: "Shakti Mahila SHG",
  registration_no: "SHG/2023/001234",
  formation_date: "2023-01-15",
  village: "Rampur",
  block: "Sadar",
  district: "Varanasi",
  state: "Uttar Pradesh",
  bank_name: "State Bank of India",
  bank_account: "32456789012",
  ifsc: "SBIN0001234",
  total_members: 12,
  monthly_saving: 500
};
