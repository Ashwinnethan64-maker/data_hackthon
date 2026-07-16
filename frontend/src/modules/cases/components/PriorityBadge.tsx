import { Badge } from '../../../components/Badge';

interface PriorityBadgeProps {
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  switch (priority) {
    case 'Low':
      return <Badge variant="neutral">Low</Badge>;
    case 'Medium':
      return <Badge variant="info">Medium</Badge>;
    case 'High':
      return <Badge variant="warning">High</Badge>;
    case 'Critical':
      return <Badge variant="danger">Critical</Badge>;
    default:
      return <Badge variant="neutral">{priority}</Badge>;
  }
}
