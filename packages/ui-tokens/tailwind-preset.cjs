/**
 * ZENITH Tailwind preset — maps utilities onto the CSS custom properties
 * defined in css/zenith.css, so theming (dark/light/colorblind) is free.
 *
 * Usage (tailwind.config):  presets: [require('@zenith/ui-tokens/tailwind-preset')]
 */
module.exports = {
  // Theming is driven entirely by CSS custom properties ([data-theme] in zenith.css);
  // Tailwind's darkMode toggle is intentionally unused.
  theme: {
    extend: {
      colors: {
        void: 'var(--z-surface-void)',
        raised: 'var(--z-surface-raised)',
        high: 'var(--z-surface-high)',
        overlay: 'var(--z-surface-overlay)',
        hover: 'var(--z-surface-hover)',

        edge: {
          subtle: 'var(--z-border-subtle)',
          DEFAULT: 'var(--z-border-default)',
          strong: 'var(--z-border-strong)',
          luminous: 'var(--z-border-luminous)',
        },

        ink: {
          DEFAULT: 'var(--z-text-primary)',
          secondary: 'var(--z-text-secondary)',
          muted: 'var(--z-text-muted)',
          faint: 'var(--z-text-faint)',
          'on-accent': 'var(--z-text-on-accent)',
        },

        gold: {
          DEFAULT: 'var(--z-gold)',
          hover: 'var(--z-gold-hover)',
          active: 'var(--z-gold-active)',
          subdued: 'var(--z-gold-subdued)',
          glow: 'var(--z-gold-glow)',
          wash: 'var(--z-gold-wash)',
        },

        ion: {
          DEFAULT: 'var(--z-ion)',
          hover: 'var(--z-ion-hover)',
          subdued: 'var(--z-ion-subdued)',
          wash: 'var(--z-ion-wash)',
        },

        profit: {
          DEFAULT: 'var(--z-profit)',
          dim: 'var(--z-profit-dim)',
          wash: 'var(--z-profit-wash)',
        },
        loss: {
          DEFAULT: 'var(--z-loss)',
          dim: 'var(--z-loss-dim)',
          wash: 'var(--z-loss-wash)',
        },
        breakeven: 'var(--z-breakeven)',

        info: 'var(--z-info)',
        warning: 'var(--z-warning)',
        danger: 'var(--z-danger)',
        success: 'var(--z-success)',
      },
      fontFamily: {
        display: ['var(--z-font-display)'],
        ui: ['var(--z-font-ui)'],
        mono: ['var(--z-font-mono)'],
      },
      borderRadius: {
        xs: 'var(--z-radius-xs)',
        sm: 'var(--z-radius-sm)',
        md: 'var(--z-radius-md)',
        lg: 'var(--z-radius-lg)',
        xl: 'var(--z-radius-xl)',
      },
      boxShadow: {
        overlay: 'var(--z-shadow-overlay)',
        modal: 'var(--z-shadow-modal)',
        'focus-ring': 'var(--z-focus-ring)',
        'inner-light': 'var(--z-inner-light)',
      },
      backgroundImage: {
        horizon: 'var(--z-gradient-horizon)',
        dawn: 'var(--z-gradient-dawn)',
        solar: 'var(--z-gradient-solar)',
      },
      transitionTimingFunction: {
        'zenith-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'zenith-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
    },
  },
};
