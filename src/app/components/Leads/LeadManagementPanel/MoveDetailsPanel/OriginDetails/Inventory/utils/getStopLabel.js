export function getStopLabel(stop, allStops) {
    if (!stop || !Array.isArray(allStops)) return '';
  
    const isDestination = stop.stopType === 'destination';
  
    if (isDestination) {
      const postStorageStops = allStops.filter(
        (s) => s.stopType === 'destination' && s.postStorage
      );
      const normalStops = allStops.filter(
        (s) => s.stopType === 'destination' && !s.postStorage
      );
  
      const group = stop.postStorage ? postStorageStops : normalStops;
      const indexInGroup = group.findIndex((s) => s.id === stop.id);
      const isFirst = indexInGroup === 0;
  
      return stop.postStorage
        ? isFirst
          ? 'Post Storage Main Drop off'
          : `Post Storage Drop off ${indexInGroup + 1}`
        : isFirst
          ? 'Main Drop Off'
          : `Drop Off ${indexInGroup + 1}`;
    } else {
      const originStops = allStops.filter((s) => s.stopType === 'origin');
      const indexInGroup = originStops.findIndex((s) => s.id === stop.id);
      return indexInGroup === 0 ? 'Main Address' : `Stop Off ${indexInGroup + 1}`;
    }
  }
  