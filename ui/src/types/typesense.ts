export interface TypesenseProtocolDoc {
  id: string;
  title: string;
  content_preview?: string;
  author_name?: string;
  author_avatar?: string;
  category?: string;
  tags?: string[];
  rating?: number;
  reviews_count?: number;
  threads_count?: number;
  votes_count?: number; 
  steps_count?: number;
  created_at_timestamp?: number;
}