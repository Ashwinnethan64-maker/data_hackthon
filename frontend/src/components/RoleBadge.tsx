import { Badge } from './Badge';
import type { UserRole } from '../store/AuthContext';

const roleLabel: Record<UserRole, string> = {
  investigator: 'Investigator',
  analyst: 'Analyst',
  supervisor: 'Supervisor',
  administrator: 'Administrator',
  policy_maker: 'Policy Maker',
  viewer: 'Viewer'
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge variant="info">{roleLabel[role] || role}</Badge>;
}
