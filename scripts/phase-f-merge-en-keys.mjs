#!/usr/bin/env node
/**
 * One-shot Phase F key merge into en.json (deep-merge, never deletes).
 * Run: node scripts/phase-f-merge-en-keys.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const enPath = path.join(__dirname, '..', 'src', 'i18n', 'locales', 'en.json');

function isPlainObject(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function deepMerge(base, overlay) {
  if (!isPlainObject(base) || !isPlainObject(overlay)) return overlay;
  const out = { ...base };
  for (const k of Object.keys(overlay)) {
    if (isPlainObject(out[k]) && isPlainObject(overlay[k])) {
      out[k] = deepMerge(out[k], overlay[k]);
    } else {
      out[k] = overlay[k];
    }
  }
  return out;
}

const patch = {
  common: {
    error: 'Error',
    copied: 'Copied',
    close: 'Close',
    cancel: 'Cancel',
    retry: 'Retry',
    vs: 'vs',
    friendIdCopied: 'Friend ID copied to clipboard.',
    copiedBody: 'Value copied to clipboard.',
    copyFailedTitle: 'Copy failed',
    copyFailedBody: 'Could not copy to clipboard.',
    monthsShort: {
      jan: 'JAN',
      feb: 'FEB',
      mar: 'MAR',
      apr: 'APR',
      may: 'MAY',
      jun: 'JUN',
      jul: 'JUL',
      aug: 'AUG',
      sep: 'SEP',
      oct: 'OCT',
      nov: 'NOV',
      dec: 'DEC',
    },
  },
  alerts: {
    generic: {
      title: 'Something went wrong',
      body: 'Please check your connection and try again.',
    },
    missingLink: {
      title: 'Link unavailable',
      body: 'This link isn’t available yet. Please try again later.',
    },
    cannotOpenLink: {
      title: 'Cannot open link',
      body: 'We couldn’t open that link. Please try again later.',
    },
    openLinkFailed: 'Could not open {{label}}.',
    openLinkFailedGeneric: 'Could not open link.',
    shareCopiedTitle: 'Copied to clipboard',
    shareCopiedBody: 'Paste anywhere to share your pull.',
    packOpen: {
      signInTitle: 'Sign in required',
      signInBody: 'Please sign in to open packs.',
      alreadyTitle: 'Already processed',
      alreadyBody: 'This pack open was already recorded.',
      alreadyBulkBody: 'This bulk open was already recorded.',
      connectionTitle: 'Connection problem',
      failedTitle: 'Pack open failed',
      failedBody: 'We couldn’t complete this pack open. Please try again.',
      welcomeUsedTitle: 'Welcome pack used',
      welcomeUsedBody: 'You’ve already claimed this welcome pack.',
    },
    tradeIn: {
      unavailableTitle: 'Trade-in unavailable',
      unavailableBody: 'We couldn’t find this card in your vault. Refresh and try again.',
      failedTitle: 'Trade-in failed',
      failedBody: 'We couldn’t complete the trade-in. Please try again.',
    },
    shipping: {
      unavailableTitle: 'Shipment unavailable',
      unavailableBody: 'Shipping isn’t available right now. Please try again later.',
      addressRequiredTitle: 'Shipping address required',
      addressRequiredBody: 'Add a shipping address before requesting shipment.',
      insufficientTitle: 'Insufficient credits',
      insufficientBody: 'You don’t have enough credits for this shipping fee.',
      failedTitle: 'Shipment request failed',
      failedBody: 'We couldn’t start this shipment. Please try again.',
    },
    serviceUnavailable: {
      title: 'Temporarily unavailable',
      body: 'This feature isn’t available right now. Please try again later.',
    },
  },
  home: {
    filter: {
      featured: 'Featured',
      new: 'New',
      lowStock: 'Low stock',
      all: 'All',
    },
    featured: {
      eyebrow: 'FEATURED',
      cta: 'VIEW ›',
    },
    recentPulls: {
      title: 'Just Pulled',
      sampleBadge: 'SAMPLE',
      caption: 'Example pulls — not real activity.',
      listedUnit: 'listed',
    },
    trustStrip: {
      zeroFeeTitle: 'Zero-fee',
      zeroFeeSub: 'trade-in, always',
      listedValueTitle: '100% listed value',
      listedValueSub: 'back in Coins',
      freeShipTitle: 'Free shipping',
      freeShipSub: 'on orders ',
      freeShipThreshold: '$100+',
    },
  },
  packDetails: {
    featuredBadge: 'FEATURED',
    tradeInRateUnit: 'trade-in · listed value',
    remainingUnit: 'left',
    oddsSummary: '{{tier}} odds',
    listedUnit: 'listed',
    shipsTitle: 'Ships from Tokyo',
    shipsBody:
      'Japanese exclusives, packed and shipped direct. Free shipping on orders {{threshold}}.',
    shipsThreshold: '$100+',
  },
  packOdds: {
    demoNote: 'Sample odds — live odds appear when this pack is online.',
    liveDisclaimer:
      'Every pull can be verified against the published pool weights after you open.',
  },
  resultScreen: {
    headerLabel: 'PULL RECORD',
    stampSuffix: 'JST · TOKYO',
    totalListedValue: 'TOTAL LISTED VALUE',
    cardCount: '{{count}} CARDS',
    ctaTradeInAll: 'Trade in all — {{coins}} Coins',
    ctaTradeIn: 'Trade in — {{coins}} Coins',
    disclaimer: '100% of listed value, in Coins.',
    keepInVault: 'Keep in Vault',
    pullAgain: 'Pull again',
    fairnessFooter: 'Odds applied · Fairness Record →',
    sheet: {
      titleMulti: 'Trade in {{count}} cards?',
      titleOne: 'Trade in 1 card?',
      amountSub: 'COINS · 100% OF LISTED VALUE',
      bodyMulti: 'All {{count}} cards will be traded in for Coins at their listed value.',
      bodyOne: 'This card will be traded in for Coins at its listed value.',
      confirm: 'Trade in',
    },
  },
  fairness: {
    record: {
      title: 'Fairness record',
      method:
        'Before you open, we lock in a secret server value. After the pull, you can check that the result matches what was committed.',
      serverCommitment: 'Server commitment',
      clientSeed: 'Your seed',
      openingNumber: 'Opening #',
      pending:
        'Verification details appear here after a live pack open. Preview opens are not verifiable.',
      verifyCta: 'VERIFY →',
    },
    verify: {
      title: 'Verify fairness',
      body:
        'Live opens lock in a server secret before the draw, then reveal it with your seed so anyone can confirm the outcome was fair.',
      empty:
        'No verification record yet. Open a pack while signed in to see commitment details you can check.',
      closeA11y: 'Close',
      tapToCopy: 'Tap to copy',
      rows: {
        pullId: 'Pull id',
        algorithm: 'Method',
        serverHash: 'Server commitment',
        revealedSeed: 'Revealed server value',
        clientSeed: 'Your seed',
        digest: 'Result digest',
        opening: 'Opening / serial',
      },
    },
  },
  vaultScreen: {
    listedBadge: 'LISTED',
    refreshError: 'Unable to refresh your vault. Please check your connection and try again.',
  },
  creditHistory: {
    offlineNote: 'Credit history needs a signed-in session. Preview mode shows an empty list.',
    loadError: 'Unable to load transactions. Please check your connection and try again.',
    type: {
      packPull: 'Pack pull',
      tradeIn: 'Trade-in',
      topUp: 'Top up',
      refund: 'Refund',
      other: 'Other',
    },
  },
  shippingOrders: {
    offlineNote: 'Shipping history needs a signed-in session. Preview mode shows an empty list.',
  },
  walletLinking: {
    notConfigured: 'Wallet linking isn’t available in this build.',
    authFailed: 'Could not verify your session. Try signing out and back in.',
  },
  creditsPill: {
    a11yHistory: 'Credit history',
    a11yAdd: 'Add credits',
  },
  appHeader: {
    searchA11y: 'Search packs',
  },
  packRing: {
    unavailableTitle: 'Pack scene unavailable',
    loadFailed:
      'The opening scene couldn’t load. Check your connection and try again.',
    misconfigured:
      'The opening scene isn’t available right now. Please try again later.',
    retry: 'Retry',
  },
};

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const merged = deepMerge(en, patch);
fs.writeFileSync(enPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
console.log('Merged Phase F keys into en.json');
