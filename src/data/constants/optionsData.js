// src/data/constants/optionsData.js

export const optionsData = {
    itemTags: {
        packing: [
          { value: 'cp_packed_by_movers', label: '(CP) Packed by movers' },
          { value: 'pbo_packed_by_customer', label: '(PBO) Packed by customer' },
          { value: 'crating', label: 'Crating' },
          { value: 'blanket_wrapped', label: 'Blanket wrapped' },
          { value: 'paper_blanket_wrapped', label: 'Paper blanket wrapped' },
          { value: 'purchased_blankets', label: 'Purchased blankets' },
          { value: 'pack_and_leave_behind', label: 'Pack and leave behind' },
          { value: 'keep_blanket_on', label: 'Keep blanket on' },
          { value: 'unpacking', label: 'Unpacking' },
          { value: 'inspect_and_repack', label: 'Inspect and repack' },
        ],
        extraAttention: [
          { value: 'bulky', label: 'Bulky' },
          { value: 'disassembly', label: 'Disassembly' },
          { value: 'assembly', label: 'Assembly' },
          { value: 'pressboard', label: 'Pressboard' },
          { value: 'fragile', label: 'Fragile' },
          { value: 'mayor_appliance', label: 'Mayor appliance' },
          { value: 'extraordinary_value', label: 'Extraordinary value' },
          { value: 'kit_furniture_assembly', label: 'Kit furniture assembly' },
        ],
    },
    locationTags: {
      loadPoints: [
          { value: 'excluded', label: 'Excluded' },
          { value: 'may_not_ship', label: 'May not ship' },   
          { value: 'item_in_closet', label: 'Item in closet' },
          { value: 'hoisting_origin', label: 'Hoisting origin' },       
          { value: 'crane_origin', label: 'Crane origin' },         
          { value: 'moving_within_premises', label: 'Moving within premises' },
          { value: 'help_with_loading', label: 'Help with loading' },        
        ],
        dropPoints: [
          { value: 'disposal', label: 'Disposal' },
          { value: 'item_for_company_storage', label: 'Item for company storage' },
          { value: 'help_with_unloading', label: 'Help with unloading' },
          { value: 'hoisting_destination', label: 'Hoisting destination' },
          { value: 'crane_destination', label: 'Crane destination' },
          { value: 'main_drop_off', label: 'Main drop off' },
          { value: 'first_drop', label: 'Drop off 1' },
          { value: 'second_drop', label: 'Drop off 2' },
          { value: 'post_storage_main_drop', label: 'Post-Storage main drop' },
          { value: 'post_storage_second_drop', label: 'Post-Storage 2nd drop' },
          { value: 'post_storage_third_drop', label: 'Post-Storage 3rd drop' },
        ],
    },
  };
  