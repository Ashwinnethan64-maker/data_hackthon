import { Badge } from '../../../components/Badge';

export function ConfidenceBadge({ value }: { value: number }) {
  const variant = value >= 90 ? 'success' : value >= 75 ? 'warning' : 'danger';

  return <Badge variant={variant}>Confidence {value}%</Badge>;
}
