export const EXCLUSIVE_LOCATION_TAGS = [
    'moving_within_premises',
    'help_with_loading',
    'disposal',
    'help_with_unloading',
    'main_drop_off',
    '2_drop',
    '3_drop',
    '4_drop',
    '5_drop',
    '6_drop',
    '7_drop',
    '8_drop',
    '9_drop',
    'post_storage_main_drop',
    'post_storage_2_drop',
    'post_storage_3_drop',
    'post_storage_4_drop',
    'post_storage_5_drop',
    'post_storage_6_drop',
    'post_storage_7_drop',
    'post_storage_8_drop',
    'post_storage_9_drop',
  ];
  
  export function buildExclusiveIncompat(tagsArr) {
    const output = {};
    for (const tag of tagsArr) {
      output[tag] = tagsArr.filter((t) => t !== tag);
    }
    return output;
  }
  
  export const BASE_INCOMPATIBLE_TAGS = {
    cp_packed_by_movers: ['pbo_packed_by_customer'],
    pbo_packed_by_customer: [
      'cp_packed_by_movers',
      'crating',
      'unpacking',
      'pack_and_leave_behind',
    ],
    paper_blanket_wrapped: ['purchased_blankets'],
    purchased_blankets: ['paper_blanket_wrapped'],
    pack_and_leave_behind: ['pbo_packed_by_customer'],
  };
  
  export const REQUIRED_TAGS = {
    crating: ['cp_packed_by_movers'],
  };
  
  export function labelToDropTag(labelString) {
    const trimmed = labelString.trim().toLowerCase();
  
    if (trimmed === 'main drop off') return 'main_drop_off';
  
    const dropXMatch = trimmed.match(/^drop off\s+(\d+)$/);
    if (dropXMatch) return `${dropXMatch[1]}_drop`;
  
    if (trimmed === 'post storage main drop off') return 'post_storage_main_drop';
  
    const psDropXMatch = trimmed.match(/^post storage drop off\s+(\d+)$/);
    if (psDropXMatch) return `post_storage_${psDropXMatch[1]}_drop`;
  
    return trimmed.replace(/\s+/g, '_').replace(/[^\w_]/g, '');
  }
  