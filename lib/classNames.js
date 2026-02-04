/**
 * Shared CSS class utilities to reduce repetition
 */

export const cardClasses = {
  default: 'cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-6',
  compact: 'cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4',
  hover: 'cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4 hover:border-shadow-accent transition-all',
  accent: 'cyber-card bg-shadow-surface rounded-lg border-2 border-shadow-accent/30 p-6',
  large: 'cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-8',
}

export const buttonClasses = {
  primary: 'cyber-button bg-shadow-accent px-6 py-3 rounded-lg hover:shadow-glow transition-all',
  secondary: 'cyber-button bg-shadow-accent/10 text-shadow-accent px-4 py-2 rounded hover:bg-shadow-accent/20 transition-all',
  small: 'cyber-button bg-shadow-accent px-4 py-2 rounded text-sm hover:shadow-glow transition-all',
  icon: 'cyber-button bg-shadow-surface/90 p-3 rounded-full hover:bg-shadow-accent transition-all',
}

export const containerClasses = {
  page: 'min-h-screen bg-shadow-bg',
  centered: 'min-h-screen bg-shadow-bg flex items-center justify-center',
  maxWidth: 'max-w-7xl mx-auto',
  padding: 'p-6',
}

export const textClasses = {
  title: 'text-4xl font-bold text-shadow-text cyber-text',
  subtitle: 'text-shadow-text/60',
  heading: 'text-2xl font-bold text-shadow-text',
  body: 'text-shadow-text',
  muted: 'text-shadow-text/60',
}
