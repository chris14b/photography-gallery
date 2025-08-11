import { createGlobalStyle } from 'styled-components';
import type {Theme} from '../types';

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    font-family: ${({ theme }) => theme.fonts.main};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    min-height: 100vh;
    width: 100%;
  }

  body {
    overflow-x: hidden;
    display: block; /* Override the flex display from index.css */
    place-items: initial; /* Remove centering that affects layout */
  }

  #root {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: ${({ theme }) => theme.colors.text};
    }
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  button {
    cursor: pointer;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    border: none;
    padding: 0.5rem 0.5rem;
    font-family: inherit;
    transition: background-color 0.2s ease;
    
    &:hover {
      background: ${({ theme }) => theme.colors.secondary};
    }
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 1rem;
    font-weight: 500;
  }
`;

export default GlobalStyles;