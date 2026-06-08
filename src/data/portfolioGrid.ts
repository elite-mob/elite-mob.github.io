import type { ProjectCategory } from '@/data/portfolioData';
import grid from '@/data/portfolioGrid.json';

/** Lightweight project shape for the home portfolio grid. */
export type PortfolioGridProject = {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  imageUrl: string;
  link?: string;
  androidLink?: string;
  featured?: boolean;
};

export const portfolioGridProjects = grid as PortfolioGridProject[];
