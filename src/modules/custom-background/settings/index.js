import { addMhuiSetting } from '@utils';

import gradients from '../gradients.json';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  const gradientOptions = gradients.map((gradient) => ({
    name: gradient.name,
    value: gradient.id,
  }));

  const options = [
    { name: 'Default', value: 'default' },
    { name: 'Events', value: 'group', options: [
      { name: 'Birthday', value: 'birthday' },
      { name: 'Great Winter Hunt', value: 'great_winter_hunt' },
      { name: 'Halloween', value: 'halloween' },
      { name: 'Lunar New Year', value: 'lunar_new_year' },
      { name: 'Spring Egg Hunt', value: 'spring_hunt' },
      { name: 'Valentine\'s', value: 'valentines' },
    ] },
    { name: 'Color', value: 'group', options: [
      { name: 'Blue', value: 'background-color-blue' },
      { name: 'Cyan', value: 'background-color-cyan' },
      { name: 'Green', value: 'background-color-green' },
      { name: 'Pink', value: 'background-color-pink' },
      { name: 'Purple', value: 'background-color-purple' },
      { name: 'Red', value: 'background-color-red' },
      { name: 'Faded', value: 'background-color-faded' },
    ] },
    {
      name: 'Gradients', value: 'group', options: gradientOptions,
    }
  ];

  addMhuiSetting(
    'custom-background',
    'Custom Background <a class="mh-improved-custom-bg-preview hidden">Preview</a>',
    [options[0]],
    'Change the background to an event background or a color.',
    module,
    {
      type: 'multi-select',
      number: 1,
      options,
    }
  );
}