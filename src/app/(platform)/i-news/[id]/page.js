import ArticleDetailClient from './ArticleDetailClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function ArticleDetailPage() {
  return <ArticleDetailClient />;
}
