// src/services/inventoryService.js

import actualInventory from '../data/constants/actualInventory';

/**
 * getInventoryByLeadId
 * 
 * Returns the inventory record for a given lead_id (and optionally tenant_id).
 * If no match is found, returns null.
 */
export function getInventoryByLeadId(lead_id, tenant_id) {
  const found = actualInventory.find(
    (inv) =>
      inv.lead_id === lead_id &&
      inv.tenant_id === tenant_id
  );
  return found || null;
}

/**
 * createOrUpdateInventory
 * 
 * If an inventory record for (lead_id, tenant_id) already exists,
 * update its roomItemSelections; otherwise, create a new record.
 * 
 * Returns the updated (or newly created) inventory record.
 */
export function createOrUpdateInventory(lead_id, tenant_id, roomItemSelections) {
  // Find existing record
  const index = actualInventory.findIndex(
    (inv) =>
      inv.lead_id === lead_id &&
      inv.tenant_id === tenant_id
  );

  if (index !== -1) {
    // Update existing
    actualInventory[index].roomItemSelections = { ...roomItemSelections };
    return actualInventory[index];
  } else {
    // Insert new
    const newRecord = {
      lead_id,
      tenant_id,
      roomItemSelections: { ...roomItemSelections },
    };
    actualInventory.push(newRecord);
    return newRecord;
  }
}

/**
 * deleteInventory
 *
 * Removes the entire inventory record for a given lead_id + tenant_id.
 * Returns true if removed, or false if record not found.
 */
export function deleteInventory(lead_id, tenant_id) {
  const index = actualInventory.findIndex(
    (inv) =>
      inv.lead_id === lead_id &&
      inv.tenant_id === tenant_id
  );

  if (index !== -1) {
    actualInventory.splice(index, 1); // remove 1 record at that index
    return true;
  }
  return false;
}
