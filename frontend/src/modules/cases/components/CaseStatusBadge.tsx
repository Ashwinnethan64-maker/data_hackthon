import { Badge } from '../../../components/Badge';

interface CaseStatusBadgeProps {
  status: 'Open' | 'Under Investigation' | 'Under Review' | 'Closed';
}

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  switch (status) {
    case 'Open':
      return <Badge variant="warning">Open</Badge>;
    case 'Under Investigation':
      return <Badge variant="info">Under Investigation</Badge>;
    case 'Under Review':
      return <Badge variant="neutral">Under Review</Badge>;
    case 'Closed':
      return <Badge variant="success">Closed</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}
