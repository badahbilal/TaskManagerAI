export interface CategoryDto {
  id: number;
  name: string;
  color: string | null;
}

export interface CreateCategoryDto {
  name: string;
  color?: string | null;
}

export interface UpdateCategoryDto {
  name: string;
  color?: string | null;
}
