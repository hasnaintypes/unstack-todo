export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  userId: string;
  isFavorite: boolean;
  isArchived: boolean;
  order: number;
}
