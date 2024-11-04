// src/data/constants/optionsData.js

export const optionsData = {
    itemTags: {
      subOptions: {
        packing: [
          { value: 'cp_packed_by_movers', label: '(CP) Packed by movers' },
          { value: 'pbo_packed_by_customer', label: '(PBO) Packed by customer' },
          { value: 'crating', label: 'Crating' },
          { value: 'blanket_wrapped', label: 'Blanket Wrapped' },
          { value: 'paper_blanket_wrapped', label: 'Paper Blanket Wrapped' },
          { value: 'purchased_blankets', label: 'Purchased Blankets' },
          { value: 'pack_and_leave_behind', label: 'Pack and Leave Behind' },
          { value: 'keep_blanket_on', label: 'Keep Blanket On' },
          { value: 'unpacking', label: 'Unpacking' },
          { value: 'inspect_and_repack', label: 'Inspect and Repack' },
        ],
        extraAttention: [
          { value: 'bulky', label: 'Bulky' },
          { value: 'disassembly', label: 'Disassembly' },
          { value: 'assembly', label: 'Assembly' },
          { value: 'pressboard', label: 'Pressboard' },
          { value: 'fragile', label: 'Fragile' },
          { value: 'mayor_appliance', label: 'Mayor Appliance' },
          { value: 'extraordinary_value', label: 'Extraordinary Value' },
          { value: 'kit_furniture_assembly', label: 'Kit Furniture Assembly' },
          { value: 'excluded', label: 'Excluded' },
          { value: 'may_not_ship', label: 'May Not Ship' },
          { value: 'moving_within_premises', label: 'Moving within premises' },
          { value: 'item_in_closet', label: 'Item in closet' },
          { value: 'hoisting_origin', label: 'Hoisting Origin' },
          { value: 'hoisting_destination', label: 'Hoisting Destination' },
          { value: 'crane_origin', label: 'Crane Origin' },
          { value: 'crane_destination', label: 'Crane Destination' },
        ],
      },
    },
    locationTags: {
      subOptions: {
        handlingInfo: [
          { value: 'main_drop_off', label: 'MAIN DROP OFF' },
          { value: 'second_drop', label: '2nd DROP' },
          { value: 'third_drop', label: '3rd DROP' },
          { value: 'disposal', label: 'DISPOSAL' },
          { value: 'item_for_company_storage', label: 'Item for Company Storage' },
          { value: 'post_storage_main_drop', label: 'Post-Storage Main Drop' },
          { value: 'post_storage_second_drop', label: 'Post-Storage 2nd Drop' },
          { value: 'post_storage_third_drop', label: 'Post-Storage 3rd Drop' },
        ],
        dropPoints: [
          { value: 'main_drop_off', label: 'MAIN DROP OFF' },
          { value: 'second_drop', label: '2nd DROP' },
          { value: 'third_drop', label: '3rd DROP' },
          { value: 'disposal', label: 'DISPOSAL' },
          { value: 'item_for_company_storage', label: 'Item for Company Storage' },
          { value: 'post_storage_main_drop', label: 'Post-Storage Main Drop' },
          { value: 'post_storage_second_drop', label: 'Post-Storage 2nd Drop' },
          { value: 'post_storage_third_drop', label: 'Post-Storage 3rd Drop' },
        ],
      },
    },
  };
  