import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Icon from '../components/icons/Icon';

describe('Icon Component', () => {
  it('should render Search icon', () => {
    const { container } = render(<Icon.Search size={16} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('should render Check icon', () => {
    const { container } = render(<Icon.Check size={20} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg).toHaveAttribute('width', '20');
  });

  it('should render X icon with default size', () => {
    const { container } = render(<Icon.X />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('should render Sparkle icon with custom size', () => {
    const { container } = render(<Icon.Sparkle size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('should render Logo icon', () => {
    const { container } = render(<Icon.Logo size={28} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
  });

  it('should have stroke attribute for outlined icons', () => {
    const { container } = render(<Icon.Search />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('should support all icon types', () => {
    const iconNames = [
      'Search', 'Check', 'X', 'Sparkle', 'Alert', 'Info',
      'Pill', 'Clock', 'Shield', 'Filter', 'ArrowR', 'ArrowL',
      'Chevron', 'Doc', 'Bell', 'Grid', 'List', 'External', 'Split', 'Logo',
    ];

    iconNames.forEach((name) => {
      expect(Icon[name]).toBeDefined();
      expect(typeof Icon[name]).toBe('function');
    });
  });
});

describe('CSS Design Tokens', () => {
  it('should have color variables defined', () => {
    const styles = getComputedStyle(document.documentElement);
    expect(styles.getPropertyValue('--pv-blue-700')).toBeTruthy();
    expect(styles.getPropertyValue('--pv-teal-400')).toBeTruthy();
    expect(styles.getPropertyValue('--pv-orange-500')).toBeTruthy();
  });

  it('should have spacing variables defined', () => {
    const styles = getComputedStyle(document.documentElement);
    expect(styles.getPropertyValue('--pv-s-4')).toBeTruthy();
    expect(styles.getPropertyValue('--pv-s-6')).toBeTruthy();
  });

  it('should have font variables defined', () => {
    const styles = getComputedStyle(document.documentElement);
    const fontSans = styles.getPropertyValue('--pv-font-sans');
    expect(fontSans).toContain('Plus Jakarta Sans');
  });
});
