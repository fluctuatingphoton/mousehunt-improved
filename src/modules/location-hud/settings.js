import environments from '../../data/environments.json';

export default function (subModule, module) {
  const locationsToUnset = [
    'desert_oasis',
    'lost_city',
    'sand_dunes',
    'queso_geyser',
    'queso_plains',
    'queso_quarry',
    'queso_river',
    // Don't have HUD changes for these.
    'meadow',
    'harbour',
    'mountain',
    'laboratory',
    'mousoleum',
    'training_grounds',
    'foreword_farm',
    'prologue_pond',
    'seasonal_garden',
    'zugzwang_library',
    'zugzwang_tower',
  ];

  const locationsToAdd = [
    {
      name: 'Region: Living Garden',
      id: 'region-living-garden',
    },
    {
      name: 'Region: Queso Canyon',
      id: 'region-queso',
    },
  ];

  const options = [];

  environments.forEach((environment) => {
    if (! locationsToUnset.includes(environment.id)) {
      options.push(environment);
    }
  });

  // merge the locations to add with the locations to show as options
  locationsToAdd.forEach((location) => {
    options.push(location);
  });

  options.forEach((location) => {
    addSetting(
      location.name,
      location.id,
      true,
      location.description,
      {
        id: module.id,
        name: module.name,
        description: module.description
      },
      'mousehunt-improved-settings'
    );
  });
}