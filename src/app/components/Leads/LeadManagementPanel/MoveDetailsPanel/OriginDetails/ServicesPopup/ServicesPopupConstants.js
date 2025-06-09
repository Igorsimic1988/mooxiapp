export const whatsMovingOriginOptions = ['Mixed', 'Boxes Only', 'Furniture Only'];
export const packingOriginOptions = [
  'No Packing',
  'Partial Packing',
  'Full Packing',
  'Custom Packing ( tagged )',
];

export const unpackingDestinationOptions = [
  'No Unpacking',
  'Full Unpacking',
  'Custom Unpacking ( tagged )',
];

export const blanketsOriginOptions = [
  'Needed',
  'Blankets not needed',
  'Paper Blankets',
  'Custom ( tagged )',
];
export const blanketsDestinationOptions = [
  'Remove Blankets',
  'Leave Blankets On',
  'Custom ( tagged )',
];

// Additional services
export const typeOfServiceChoices = [
  { id: 1, name: 'Moving' },
  { id: 2, name: 'Move items within premises' },
  { id: 3, name: 'Junk removal' },
  { id: 4, name: 'Help with packing (Pack & Leave Service)' },
  { id: 5, name: 'Help with Loading' },
  { id: 6, name: 'Help with Unloading' },
];

export const allowedOriginFields = [
  'whatsMoving',
  'packingOption',
  'blanketsOption',
  'itemsToBeTakenApart',
  'hoistItems',
  'craneNeeded',
  'additionalServices',
  'autoBoxEnabled',
];

export const allowedDestinationFields = [
  'unpackingOption',
  'blanketsOption',
  'itemsToBeAssembled',
  'hoistItems',
  'craneNeeded',
  'additionalServices',
];