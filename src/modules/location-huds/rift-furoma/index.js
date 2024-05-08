import { addHudStyles, makeElement, onTurn } from '@utils';

import styles from './styles.css';

const getEnergyStats = () => {
  const droid = Number.parseInt(`${user?.quests?.QuestRiftFuroma?.droid?.remaining_energy || 0}`.replaceAll(',', ''));
  const lost = Number.parseInt(`${user?.quests?.QuestRiftFuroma?.droid?.energy_lost || 0}`.replaceAll(',', ''));
  const recall = (droid - lost) / 2;
  const energy = Number.parseInt(`${user?.quests?.QuestRiftFuroma?.items?.combat_energy_stat_item?.quantity || 0}`.replaceAll(',', ''));

  return {
    droid,
    lost,
    recall,
    energy,
    afterRecall: energy + recall,
  };
};

const getBatteryStats = () => {
  const batteryInfo = [];
  const numbers = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

  for (const num of numbers) {
    const battery = user?.quests?.QuestRiftFuroma?.batteries[`charge_level_${num}`];
    if (battery) {
      batteryInfo.push({
        percent: battery.percent || 0,
        remaining: battery.remaining || 0,
        status: battery.status.split(' '),
        isActive: battery.status.includes('selected'),
        isLocked: battery.status.includes('locked'),
        isDisabled: battery.status.includes('disabled'),
        isUnlocked: battery.status.includes('unlocked'),
        isConnected: battery.status.includes('connected'),
        total: battery.total || 0,
      });
    }
  }

  return batteryInfo;
};

const addBatteryDetails = () => {
  const batteryInfo = getBatteryStats();

  // TODO: Add battery details to the batteries.
};

const addRecallCaclulation = () => {
  const { recall, afterRecall } = getEnergyStats();

  const statBlocks = document.querySelector('.riftFuromaHUD-droid-details .riftFuromaHUD-chargeLevel-stat.droid_energy');
  if (statBlocks) {
    const existingRecall = document.querySelector('.mh-improved-recall');

    const afterRecallEl = makeElement('div', 'mh-improved-recall');

    makeElement('div', 'riftFuromaHUD-chargeLevel-stat-label', 'After Recall', afterRecallEl);
    makeElement('div', 'riftFuromaHUD-chargeLevel-stat-value', afterRecall.toLocaleString(), afterRecallEl);

    if (existingRecall) {
      existingRecall.replaceWith(afterRecallEl);
    } else {
      statBlocks.append(afterRecallEl);
    }
  }

  const leave = document.querySelector('.riftFuromaHUD-leavePagoda');
  if (leave) {
    const existing = document.querySelector('.mh-improved-riftFuromaHUD-leavePagoda-amount');
    const amountEl = makeElement('div', 'mh-improved-riftFuromaHUD-leavePagoda-amount', `+ ${recall.toLocaleString()}`);

    if (existing) {
      existing.replaceWith(amountEl);
    } else {
      leave.append(amountEl);
    }
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  addRecallCaclulation();

  onTurn(() => {
    addRecallCaclulation();
  });
};
