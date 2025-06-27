import { updateInventoryTags } from 'src/app/services/inventoryItemsService';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInventoryContext } from '../../../InventoryContext';
export function useUpdateInventoryTags() {
  const queryClient = useQueryClient();
  const { setInventoryByStop } = useInventoryContext();

  const mutation = useMutation({
    mutationFn: updateInventoryTags,
    onSuccess: (data, variables) => {
      console.log('✅ Tags successfully updated:', data);

      const { stopId, stopType, updatedInventoryItems } = variables;
      

      // Grupuj po roomId
      const groupedByRoom = updatedInventoryItems.reduce((acc, item) => {
        if (!acc[item.roomId]) acc[item.roomId] = [];
        acc[item.roomId].push(item);
        return acc;
      }, {});

      setInventoryByStop((prev) => {
        const stopData = prev[stopId];
        if (!stopData) return prev;

        return {
          ...prev,
          [stopId]: {
            ...stopData,
            inventoryItems: updatedInventoryItems,
            itemsByRoom: groupedByRoom,
          },
        };
      });

      const queryKey =
        stopType === 'origin'
          ? ['inventoryByOrigin', stopId]
          : ['inventoryByDestination', stopId];

      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('❌ Failed to update inventory tags:', error);
    },
  });

  return mutation;
}
