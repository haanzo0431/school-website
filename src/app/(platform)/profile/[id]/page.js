import AuthorProfileClient from './AuthorProfileClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function AuthorProfilePage() {
  return <AuthorProfileClient />;
}
