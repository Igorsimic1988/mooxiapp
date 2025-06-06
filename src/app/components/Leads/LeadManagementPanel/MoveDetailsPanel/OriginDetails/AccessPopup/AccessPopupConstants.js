export const biggestTruckAccessOptions = [
    'Semi-trailer',
    'Large 20-26 feet',
    'Medium 14-17 feet',
    'Small 9-12 feet',
  ];
  
  export const parkingAccessOptions = [
    'Private Parking',
    'Curb Side Parking',
    'Curb Side Across Street',
    'Loading Dock Parking',
    'Back Alley',
  ];
  
  export const distanceDoorTruckOptions = [
    'A few feet',
    '20 - 75 ft',
    '76 - 150 ft',
    '151- 225 ft',
    '226 ft - 300 ft',
    '301 - 450 ft',
    '451 - 600 ft',
    '600 ft +',
  ];
  
  export const howManyStepsOptions = [
    'No Steps',
    '1-10 steps',
    '11-20 steps',
    '21-30 steps',
    '31- 40 steps',
    '41+ steps',
  ];
  
  export const terrainOptions = [
    'Flat',
    'Moderate Downhill/ Uphill',
    'Steep Uphill/ Downhill',
  ];
  
  export const elevatorFloorsOptions = [
    '1–5 floors',
    '6–10 floors',
    '11–20 floors',
    '21+ floors',
  ];
  
  export const elevatorSizeOptions = [
    'Small (Up to 4 People)',
    'Medium (5-8 People)',
    'Large (9+ People)',
  ];
  
  export const allowedOriginFields = [
    'biggestTruckAccess',
    'shuttleTruckRequired',
    'parkingAccess',
    'distanceDoorTruck',
    'howManySteps',
    'terrainDoorTruck',
    'elevatorAtStop',
    'elevatorExclusive',
    'elevatorFloors',
    'elevatorSize',
  ];
  
  export const allowedDestinationFields = [...allowedOriginFields]; 