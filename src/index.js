// Utilities
import { addUIStyles } from './modules/utils';

// Global styles
import globalStyles from './styles.css';

// Core 'Better' modules
import betterFriends from './modules/better-friends';
import betterInventory from './modules/better-inventory';
import betterJournal from './modules/better-journal';
import betterQuests from './modules/better-quests';
import betterShops from './modules/better-shops';
import betterUi from './modules/better-ui';

// Feature modules.
import copyId from './modules/copy-id';
import dashboard from './modules/dashboard';
import onlyOpenMultiple from './modules/only-open-multiple';
import imageUpscaling from './modules/image-upscaling';
import mouseLinks from './modules/mouse-links';
import quickFiltersAndSort from './modules/quick-filters-and-sort';
import quickSendSupplies from './modules/quick-send-supplies';
import wiki from './modules/wiki';

// Copies of standalone userscripts.
import itemLinks from './modules/external/item-links';
import noFooter from './modules/external/no-footer';
import noShare from './modules/external/no-share';
import noSidebar from './modules/external/no-sidebar';
import tallerWindows from './modules/external/taller-windows';

// Location HUD improvements.
import forbiddenGrove from './modules/location-hud/forbidden-grove';
import iceberg from './modules/location-hud/iceberg';
import ssh4 from './modules/location-hud/ssh4';
import labyrinth from './modules/location-hud/labyrinth';
import vrift from './modules/location-hud/vrift';

import testing from './modules/testing';

// Core 'Better' modules.
const modules = [
  {
    id: 'better-mh-core-modules',
    name: 'Core Modules',
    description: 'Interface and functionality improvements',
    modules: [
      { id: 'better-mh-better-ui', name: 'Better UI', default: true, description: '', load: betterUi },
      { id: 'better-mh-better-friends', name: 'Better Friends', default: true, description: '', load: betterFriends },
      { id: 'better-mh-better-inventory', name: 'Better Inventory', default: true, description: '', load: betterInventory },
      { id: 'better-mh-better-journal', name: 'Better Journal', default: true, description: 'Modify the journal text, layout, and styling.', load: betterJournal },
      { id: 'better-mh-quests', name: 'Better Quests', default: false, description: '', load: betterQuests },
      { id: 'better-mh-better-shops', name: 'Better Shops', default: true, description: '', load: betterShops },
    ]
  },
  {
    id: 'better-mh-feature-modules',
    name: 'Feature Modules',
    description: 'Additional features',
    modules: [
      { id: 'better-mh-dashboard', name: 'Location Dashboard', default: true, description: 'Show a location information dashboard in the top dropdown menu.', load: dashboard },
      { id: 'better-mh-image-upscaling', name: 'Image Upscaling', default: true, description: '', load: imageUpscaling },
      { id: 'better-mh-inventory-only-open-multiple', name: 'Inventory - Only open multiple', default: false, description: 'Lock opening things in your inventory unless you have multiple of them.', load: onlyOpenMultiple },
      { id: 'better-mh-item-links', name: 'Item Links', default: true, description: 'Add links to MHCT, MHWiki, mhdb in item popups..', load: itemLinks },
      { id: 'better-mh-mouse-links', name: 'Mouse Links', default: true, description: 'Add links to MHCT, MHWiki, mhdb in mouse popups.', load: mouseLinks },
      { id: 'better-mh-taller-windows', name: 'Taller Windows', default: true, description: '', load: tallerWindows },
    ]
  },
  {
    id: 'better-mh-remove-elements',
    name: 'Remove elements',
    modules: [
      { id: 'better-mh-no-footer', name: 'Remove Footer', default: true, description: '', load: noFooter },
      { id: 'better-mh-no-share', name: 'Remove Share Buttons', default: true, description: '', load: noShare },
      { id: 'better-mh-no-sidebar', name: 'Remove Sidebar', default: false, description: '', load: noSidebar },
    ],
  },
  {
    id: 'better-mh-location-hud',
    name: 'Location HUD improvements',
    description: 'Add additional information to the HUD for each location.',
    modules: [
      { id: 'better-mh-forbidden-grove', name: 'Forbidden Grove HUD Improvements', default: true, description: '', load: forbiddenGrove },
      { id: 'better-mh-iceberg', name: 'Iceberg HUD Improvements', default: true, description: '', load: iceberg },
      { id: 'better-mh-labyrinth', name: 'Labyrinth HUD Improvements', default: true, description: '', load: labyrinth },
      { id: 'better-mh-sshiv', name: 'S.S. Huntington IV HUD Improvements', default: true, description: '', load: ssh4 },
      { id: 'better-mh-vrift', name: 'Valour Rift HUD Improvements', default: true, description: '', load: vrift },
    ],
  },
  {
    // Always loaded modules.
    id: 'better-mh-always-loaded',
    modules: [
      { id: 'wiki', load: wiki, alwaysLoad: true },
      { id: 'copy-id', load: copyId, alwaysLoad: true },
      { id: 'quick-send-supplies', load: quickSendSupplies, alwaysLoad: true },
      { id: 'testing', load: testing, alwaysLoad: true },
    ],
  }
];

addSettingsTab('better-mh-settings', 'UI Settings');
// enableDebugMode();

debug('Starting MH UI');
// Add the settings for each module.
modules.forEach((module) => {
  module.modules.forEach((subModule) => {
    if (subModule.alwaysLoad) {
      return;
    }

    addSetting(
      subModule.name,
      subModule.id,
      subModule.default,
      subModule.description,
      { id: module.id, name: module.name, description: module.description },
      'better-mh-settings'
    );
  });
});

// Load the modules.
modules.forEach((module) => {
  module.modules.forEach((subModule) => {
    if (subModule.alwaysLoad) {
      subModule.load();
    } else if (getSetting(subModule.id, subModule.default)) {
      subModule.load();
    }
  });
});

addUIStyles(globalStyles);
