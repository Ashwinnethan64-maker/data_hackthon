import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '../components/PlaceholderPage';

export function CaseDetailsPage() {
  const { id } = useParams();

  return (
    <PlaceholderPage
      eyebrow="Case Details"
      title={`Case Summary ${id ? `· ${id}` : ''}`}
      description="This view combines the case timeline, involved entities, acts, evidence, AI summary, and similar cases into one investigation workspace."
      primaryActionLabel="Review timeline, victims, accused, and evidence"
      secondaryActionLabel="Ask AI to summarize this FIR or explain connections"
    />
  );
}
