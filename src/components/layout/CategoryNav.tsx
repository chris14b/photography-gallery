import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import type { Category } from '../../types';

interface CategoryNavProps {
  categories: Category[];
}

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 20px;
  margin-top: 8px;
`;

const Item = styled(NavLink)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  opacity: 0.5;
  transition: opacity 0.15s ease;

  &:hover,
  &.active {
    opacity: 1;
  }
`;

const CategoryNav: React.FC<CategoryNavProps> = ({ categories }) => (
  <Nav aria-label="Categories">
    {categories.map(category => (
      <Item key={category.slug} to={`/${category.slug}`}>
        {category.title}
      </Item>
    ))}
  </Nav>
);

export default CategoryNav;
