import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import type { Category } from '../types';
import { PageHeader as Header, PageTitle as GalleryTitle, PageSubtitle as GallerySubtitle } from '../styles/components/PageHeaderStyles';
import PhotoStream from '../components/features/album/PhotoStream';
import CategoryNav from '../components/layout/CategoryNav';

interface CategoryPageProps {
  category: Category;
  categories: Category[];
  siteTitle: string;
}

const SiteLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  text-decoration: none;
  opacity: 0.6;
  margin-bottom: 6px;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
`;

const CategoryPage: React.FC<CategoryPageProps> = ({ category, categories, siteTitle }) => (
  <PhotoStream photos={category.photos}>
    <title>{`${category.title} · ${siteTitle}`}</title>
    <Header>
      <SiteLink to="/">{siteTitle}</SiteLink>
      <GalleryTitle>{category.title}</GalleryTitle>
      {category.description && <GallerySubtitle>{category.description}</GallerySubtitle>}
      {categories.length > 1 && <CategoryNav categories={categories} />}
    </Header>
  </PhotoStream>
);

export default CategoryPage;
