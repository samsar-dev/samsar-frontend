import CreateListingPage from '@/pages/CreateListing';
import { ProtectedRoute } from './ProtectedRoute';

export function Component() {
  return <ProtectedRoute element={<CreateListingPage />} />;
}

Component.displayName = 'CreateListingPage';
