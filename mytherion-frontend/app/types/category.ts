export interface Category {
  id: number;
  projectId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
}
