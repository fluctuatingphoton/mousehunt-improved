const addUIStyles = (styles) => {
  const identifier = 'mh-improved-styles';

  const existingStyles = document.getElementById(identifier);
  if (existingStyles) {
    existingStyles.innerHTML += styles;
    return;
  }

  const style = document.createElement('style');
  style.id = identifier;
  style.innerHTML = styles;
  document.head.appendChild(style);
};

const addHudStyles = (id, styles) => {
  const key = `mh-improved-styles-location-hud-${id}`;

  const existingStyles = document.getElementById(key);
  if (existingStyles) {
    return;
  }

  const style = document.createElement('style');
  style.classList.add('mh-improved-styles-location-hud');
  style.id = key;
  style.innerHTML = styles;
  document.head.appendChild(style);
};

const removeHudStyles = () => {
  const styles = document.querySelectorAll('.mh-improved-styles-location-hud');
  styles.forEach((style) => {
    style.remove();
  });
};

const getCachedValue = (key) => {
  // check to see if it's in session storage first
  const isInSession = sessionStorage.getItem(key);
  if (isInSession !== null) {
    return JSON.parse(isInSession);
  }

  const localStorageContainer = localStorage.getItem('mh-improved-cache-ar');
  if (! localStorageContainer) {
    return false;
  }

  const container = JSON.parse(localStorageContainer);
  if (! container[key]) {
    return false;
  }

  return container[key];
};

const setCachedValue = (key, value, saveToSession = false) => {
  if (saveToSession) {
    sessionStorage.setItem(key, JSON.stringify(value));
    return;
  }

  const localStorageContainer = localStorage.getItem('mh-improved-cache-ar');
  let container = {};
  if (localStorageContainer) {
    container = JSON.parse(localStorageContainer);
  }

  // set the value
  container[key] = value;

  localStorage.setItem('mh-improved-cache-ar', JSON.stringify(container));
};

const getArForMouse = async (mouseId, type = 'mouse') => {
  let mhctjson = [];

  // check if the attraction rates are cached
  const cachedAr = getCachedValue(`mhct-ar-${mouseId}-${type}`);
  if (cachedAr) {
    return cachedAr;
  }

  const isItem = 'item' === type;
  const mhctPath = isItem ? 'mhct-item' : 'mhct';

  const mhctdata = await fetch(`https://api.mouse.rip/${mhctPath}/${mouseId}`);
  mhctjson = await mhctdata.json();

  if (! mhctjson || mhctjson.length === 0) {
    setCachedValue(`mhct-ar-${mouseId}-${type}`, [], true);
    return [];
  }

  if (isItem) {
    // change the 'drop_ct' to 'rate'
    mhctjson.forEach((rate) => {
      // convert from a '13.53' to 1353
      rate.rate = parseInt(rate.drop_pct * 100);
      delete rate.drop_ct;
    });
  }

  setCachedValue(`mhct-ar-${mouseId}-${type}`, mhctjson);

  return mhctjson;
};

const getArText = async (id, type = 'mouse') => {
  const rates = await getArForMouse(id, type);
  if (! rates || rates.length === 0) {
    return false;
  }

  const rate = rates[0];
  if (! rate) {
    return false;
  }

  return (rate.rate / 100).toFixed(2);
};

const getHighestArForMouse = async (mouseId, type = 'mouse') => {
  const rates = await getArForMouse(mouseId, type);
  if (! rates || rates.length === 0) {
    return 0;
  }

  // make sure the rates aren't an empty object
  if (Object.keys(rates).length === 0 && rates.constructor === Object) {
    return 0;
  }

  // sort by rate descending
  rates.sort((a, b) => b.rate - a.rate);

  const rate = rates[0];
  if (! rate) {
    return 0;
  }

  return (rate.rate / 100);
};

const getHighestArText = async (id, type = 'mouse') => {
  const highest = await getHighestArForMouse(id, type);
  return highest ? highest : false;
};

const getArEl = async (id, type = 'mouse') => {
  let ar = await getArText(id, type);
  let arType = 'location';
  if (! ar) {
    ar = await getHighestArText(id, type);
    if (! ar || ar.length === 0) {
      return makeElement('div', ['mh-ui-ar', 'mh-ui-no-ar'], '?');
    }

    arType = 'highest';
  }

  let arDifficulty = 'easy';
  if (ar >= 99) {
    arDifficulty = 'guaranteed';
  } else if (ar >= 80) {
    arDifficulty = 'super-easy';
  } else if (ar >= 50) {
    arDifficulty = 'easy';
  } else if (ar >= 40) {
    arDifficulty = 'medium';
  } else if (ar >= 20) {
    arDifficulty = 'hard';
  } else if (ar >= 10) {
    arDifficulty = 'super-hard';
  } else if (ar >= 5) {
    arDifficulty = 'extreme';
  } else {
    arDifficulty = 'impossible';
  }

  if (ar.toString().slice(-3) === '.00') {
    ar = ar.toString().slice(0, -3);
  }

  return makeElement('div', ['mh-ui-ar', `mh-ui-ar-${arType}`, `mh-ui-ar-${arDifficulty}`], `${ar}%`);
};

/**
 * Add links to the mouse details on the map.
 */
const addArDataToMap = () => {
  const overlayClasses = document.getElementById('overlayPopup').classList;
  if (! overlayClasses.contains('treasureMapPopup')) {
    return;
  }

  const mouseIcon = document.querySelectorAll('.treasureMapView-goals-group-goal');
  if (! mouseIcon || mouseIcon.length === 0) {
    setTimeout(addArDataToMap, 500);
    return;
  }

  const mapViewClasses = document.querySelector('.treasureMapView.treasure');
  if (! mapViewClasses) {
    return;
  }

  if (mapViewClasses.classList.value.indexOf('scavenger_hunt') !== -1) {
    return;
  }

  mouseIcon.forEach((mouse) => {
    const mouseType = mouse.classList.value
      .replace('treasureMapView-goals-group-goal ', '')
      .replace(' mouse', '')
      .trim();

    mouse.addEventListener('click', () => {
      const title = document.querySelector('.treasureMapView-highlight-name');
      if (! title) {
        return;
      }

      title.classList.add('mh-ui-mouse-links-map-name');

      title.addEventListener('click', () => {
        hg.views.MouseView.show(mouseType);
      });

      title.setAttribute('data-mouse-id', mouseType);

      const div = document.createElement('div');
      div.classList.add('mh-ui-mouse-links-map');
      div.innerHTML = getLinkMarkup(title.innerText);

      const envs = document.querySelector('.treasureMapView-highlight-environments');
      if (envs) {
        envs.parentNode.insertBefore(div, envs.nextSibling);
      }
    });
  });
};

/**
 * Return an anchor element with the given text and href.
 *
 * @param {string}  text          Text to use for link.
 * @param {string}  href          URL to link to.
 * @param {boolean} encodeAsSpace Encode spaces as %20.
 *
 * @return {string} HTML for link.
 */
const makeLink = (text, href, encodeAsSpace = false) => {
  if (encodeAsSpace) {
    href = href.replace(/_/g, '%20');
  }

  return `<a href="${href}" target="_mouse" class="mousehuntActionButton tiny"><span>${text}</span></a>`;
};

const showErrorMessage = (message, appendTo, classes = '', type = 'error') => {
  if (! appendTo) {
    appendTo = document.querySelector('.treasureMapRootView-subTabRow.treasureMapRootView-padding');
  }

  const typeClass = `mh-ui-${type}-message`;
  const existing = document.querySelector(`.${typeClass}`);
  if (existing) {
    existing.remove();
  }

  const error = makeElement('div', [`mh-ui-${type}-message`, 'mh-ui-fade', classes], message);
  // try catch appending the error to the appendTo element
  let success = true;
  try {
    appendTo.appendChild(error);
  } catch (e) {
    success = false;
  }

  if (! success) {
    return;
  }

  setTimeout(() => {
    error.classList.add('mh-ui-fade-in');
  }, 10);

  setTimeout(() => {
    error.classList.remove('mh-ui-fade-in');
    error.classList.add('mh-ui-fade-out');
  }, 2000);

  setTimeout(() => {
    error.remove();
  }, 2500);
};

const showSuccessMessage = (message, appendTo, classes = '') => {
  showErrorMessage(message, appendTo, classes, 'success');
};

const saveMhuiSetting = (key, value) => {
  return saveSetting(key, value, 'mousehunt-improved-settings');
};

const getMhuiSetting = (key, defaultValue = false) => {
  return getSetting(key, defaultValue, 'mousehunt-improved-settings');
};

const onNavigationPatched = (callback, options = {}) => {
  if (options.onLoad !== null) {
    onNavigation(callback, options);
  } else {
    options.onLoad = false;
    onNavigation(callback, options);
  }
};

const getFlag = (flag) => {
  const flags = JSON.parse(getMhuiSetting('override-flags'));
  if (! flags) {
    return false;
  }

  return flags[flag];
};

export {
  addUIStyles,
  addHudStyles,
  removeHudStyles,
  getArForMouse,
  getArText,
  getHighestArForMouse,
  getHighestArText,
  getArEl,
  addArDataToMap,
  makeLink,
  showErrorMessage,
  showSuccessMessage,
  saveMhuiSetting,
  getMhuiSetting,
  onNavigationPatched,
  getFlag
};
