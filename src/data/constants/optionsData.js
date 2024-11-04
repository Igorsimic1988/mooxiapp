// optionsData.js
export const optionsData = {
    itemTags: {
      subOptions: {
        packing: [
          { value: 'cp', label: '(CP) Packed by movers' },
          { value: 'pbo', label: '(PBO) Packed by customer' },
          { value: 'crating', label: 'Crating' },
          { value: 'blanketWrapped', label: 'Blanket Wrapped' },
          { value: 'paperBlanketWrapped', label: 'Paper Blanket Wrapped' },
          { value: 'purchasedBlankets', label: 'Purchased Blankets' },
          { value: 'packAndLeaveBehind', label: 'Pack and Leave Behind' },
          { value: 'keepBlanketOn', label: 'Keep Blanket On' },
          { value: 'unpacking', label: 'Unpacking' },
          { value: 'inspectAndRepack', label: 'Inspect and Repack' },
        ],
        extraAttention: [
          { value: 'bulky', label: 'Bulky' },
          { value: 'disassembly', label: 'Disassembly' },
          { value: 'assembly', label: 'Assembly' },
          { value: 'pressboard', label: 'Pressboard' },
          { value: 'fragile', label: 'Fragile' },
          { value: 'mayorAppliance', label: 'Mayor Appliance' },
          { value: 'extraordinaryValue', label: 'Extraordinary Value' },
          { value: 'kitFurnitureAssembly', label: 'Kit Furniture Assembly' },
        ],
      },
    },
    locationTags: {
      subOptions: {
        handlingInfo: [
          { value: 'excluded', label: 'Excluded' },
          { value: 'mayNotShip', label: 'May Not Ship' },
          { value: 'movingWithinPremises', label: 'Moving within premises' },
          { value: 'itemInCloset', label: 'Item in closet' },
          { value: 'hoistingOrigin', label: 'Hoisting Origin' },
          { value: 'hoistingDestination', label: 'Hoisting Destination' },
          { value: 'craneOrigin', label: 'Crane Origin' },
          { value: 'craneDestination', label: 'Crane Destination' },
        ],
        dropPoints: [
          { value: 'disposal', label: 'DISPOSAL' },
          { value: 'itemForCompanyStorage', label: 'Item for Company Storage' },
          { value: 'mainDropOff', label: 'MAIN DROP OFF' },
          { value: 'secondDrop', label: '2nd DROP' },
          { value: 'thirdDrop', label: '3rd DROP' },
          { value: 'postStorageMainDrop', label: 'Post-Storage Main Drop' },
          { value: 'postStorageSecondDrop', label: 'Post-Storage 2nd Drop' },
          { value: 'postStorageThirdDrop', label: 'Post-Storage 3rd Drop' },
        ],
      },
    },
  };
  