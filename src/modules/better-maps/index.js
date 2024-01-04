import {
  addToGlobal,
  debug,
  getMapData,
  makeElement,
  onRequest,
  setMapData
} from '@utils';

import helper from './modules/helper';

import { addSortedMapTab, hideSortedTab, showSortedTab } from './modules/tab-sorted';
import { hideGoalsTab, showGoalsTab } from './modules/tab-goals';
import { showHuntersTab } from './modules/tab-hunters';

import environments from '@data/environments.json';
import relicHunterHints from '@data/relic-hunter-hints.json';

import addMapStyles from './styles';

const addBlockClasses = () => {
  const rightBlocks = document.querySelectorAll('.treasureMapView-rightBlock > div');
  const leftBlocks = document.querySelectorAll('.treasureMapView-leftBlock > div');
  const blocks = [...rightBlocks, ...leftBlocks];

  let prevBlockType = '';
  blocks.forEach((block) => {
    if (block.classList.contains('treasureMapView-block-title')) {
      const blockType = block.innerText
        .trim()
        .toLowerCase()
        .replaceAll(' ', '-')
        .replaceAll(/[^a-z-]/g, '')
        .replace('--', '-')
        .replace('goalssearch', 'goals');
      block.classList.add(`mh-ui-${blockType}-title`);
      prevBlockType = blockType;
    } else {
      block.classList.add(`mh-ui-${prevBlockType}-block`);
    }
  });
};

const interceptMapRequest = (mapId) => {
  sessionStorage.setItem('mh-improved-map-refreshed', Date.now());

  // If we don't have data, we're done.
  if (! mapId) {
    return false;
  }

  const init = (mapData) => {
    addToGlobal('mapper', {
      mapData,
      mapModel: new hg.models.TreasureMapModel(mapData),
    });

    eventRegistry.doEvent('mapper_loaded', mapData);
    return data;
  };

  const data = getMapData(mapId, true);
  if (data) {
    return init(data);
  }

  return false;
};

const initMapper = (map) => {
  if (! map || ! map.map_id || ! map.map_type) {
    return;
  }

  // get the treasureMapRootView-content element, and if it has a loading class, wait for the class to be removed by watching the element for chagnes. once its loaded, proceed with our code
  const content = document.querySelector('.treasureMapRootView-content');
  if (content && content.classList.contains('loading')) {
    const observer = new MutationObserver((mutations, mobserver) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          ! mutation.target.classList.contains('loading')
        ) {
          mobserver.disconnect();
          // call the init function again to proceed with our code
          initMapper(map);
        }
      });
    });

    const rootOfChanges = document.querySelector('.treasureMapRootView');
    observer.observe(rootOfChanges, {
      attributes: true,
      childList: true,
      subtree: true
    });
  }

  // Add the sorted tab.
  addSortedMapTab();

  // Add the tab click events.
  const tabs = document.querySelectorAll('.treasureMapRootView-subTab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      addBlockClasses();

      eventRegistry.doEvent('map_tab_click', map);
      eventRegistry.doEvent(`map_${tab.getAttribute('data-type')}_tab_click`, map);
    });
  });

  // Fire the goals click because we default to that tab.
  eventRegistry.doEvent('map_show_goals_tab_click', map);

  // Add the block classes.
  addBlockClasses();
};

const intercept = () => {
  const parentShowMap = hg.controllers.TreasureMapController.showMap;
  hg.controllers.TreasureMapController.showMap = (id = false) => {
    parentShowMap(id);
    const intercepted = interceptMapRequest(id ?? user?.quests?.QuestRelicHunter?.default_map_id);
    setTimeout(() => {
      if (! intercepted) {
        interceptMapRequest(id ?? user?.quests?.QuestRelicHunter?.default_map_id);
      }
    }, 1000);
  };

  onRequest((data) => {
    if (data.treasure_map && data.treasure_map.map_id) {
      setMapData(data.treasure_map.map_id, data.treasure_map);
    }
  }, 'managers/ajax/users/treasuremap.php', true);
};

const clearStickyMouse = () => {
  const sticky = document.querySelector('.treasureMapView-highlight');
  if (sticky) {
    sticky.classList.remove('sticky');
    sticky.classList.remove('active');
  }

  const mapGroupGoal = document.querySelectorAll('.treasureMapView-goals-group-goal');
  if (mapGroupGoal) {
    mapGroupGoal.forEach((goal) => {
      goal.classList.remove('sticky');
    });
  }
};

const updateRelicHunterHint = () => {
  const relicHunter = document.querySelector('.treasureMapInventoryView-relicHunter-hint');
  if (! relicHunter) {
    return false;
  }

  if (relicHunter.getAttribute('data-travel-button-added')) {
    return true;
  }

  relicHunter.setAttribute('data-travel-button-added', true);

  const hint = relicHunter.innerText.trim();

  // relicHunterHints is an object with each key having an array of hints.
  // Find the key that has the hint we're looking for.
  let key = false;
  Object.keys(relicHunterHints).forEach((k) => {
    if (relicHunterHints[k].includes(hint)) {
      key = k;
    }
  });

  // Returning true to make sure we don't keep trying to update the hint.
  if (! key) {
    return true;
  }

  // Find the environment that matches the key.
  const environment = environments.find((e) => e.id === key);
  if (! environment) {
    return true;
  }

  let hintWrapper = document.querySelector('.treasureMapInventoryView-relicHunter');
  if (! hintWrapper) {
    hintWrapper = relicHunter;
  }

  makeElement('div', 'treasureMapInventoryView-relicHunter-hintSuffix', `... in ${environment.name}.`, hintWrapper);

  const travelButton = makeElement('div', ['mousehuntActionButton', 'small']);
  makeElement('span', '', 'Travel', travelButton);

  travelButton.addEventListener('click', () => {
    hg.utils.User.travel(environment.id);
  });

  hintWrapper.append(travelButton);

  return true;
};

const relicHunterUpdate = () => {
  const _showInventory = hg.controllers.TreasureMapController.showInventory;
  hg.controllers.TreasureMapController.showInventory = () => {
    _showInventory();

    // Call updateRelicHunterHint, but if it fails, try again in 250ms, but stop after 5 tries.
    let tries = 0;
    const interval = setInterval(() => {
      tries++;
      if (updateRelicHunterHint() || tries > 5) {
        clearInterval(interval);
      }
    }, 250);
  };
};

const refreshMap = () => {
  const mapId = user?.quests?.QuestRelicHunter?.default_map_id;
  if (! mapId) {
    debug('No map found, skipping refresh …');
    return;
  }

  const lastRefreshed = sessionStorage.getItem('mh-improved-map-refreshed');
  // If we've refreshed in the last 5 minutes, don't refresh again.
  if (lastRefreshed && Date.now() - lastRefreshed < 300000) {
    debug(`Map ${mapId} refreshed in the last 5 minutes, skipping …`);
    return;
  }

  debug(`🗺️️ Refreshing map ${mapId} …`);

  interceptMapRequest(mapId);
};

/**
 * Initialize the module.
 */
const init = async () => {
  addMapStyles();

  // Fire the different tab clicks.
  eventRegistry.addEventListener('map_sorted_tab_click', showSortedTab);
  eventRegistry.addEventListener('map_show_goals_tab_click', showGoalsTab);
  eventRegistry.addEventListener('map_manage_allies_tab_click', showHuntersTab);
  eventRegistry.addEventListener('map_tab_click', (map) => {
    hideGoalsTab(map);
    hideSortedTab(map);
    clearStickyMouse();
  });

  // Initialize the mapper.
  eventRegistry.addEventListener('mapper_loaded', initMapper);

  intercept();

  relicHunterUpdate();

  if (getFlag('better-maps-helper')) {
    helper();
  }

  // Refresh the map every 5 minutes.
  setInterval(refreshMap, 300000);
};

export default {
  id: 'better-maps',
  name: 'Better Maps',
  type: 'better',
  default: true,
  description: 'Adds a number of features to maps, including showing attracting rates, a sorted tab that categorizes a variety of maps, and showing more infomation on the Hunters tab.',
  load: init,
};
