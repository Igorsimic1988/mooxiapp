
export interface LeadInput {
  // Customer Information
  customerName: string;
  customerPhoneNumber: string;
  customerEmail: string;
  companyName: string;
  brandId: string;
  source: string;
  
  // Service Information
  serviceType: string;
  salesName?: string;
  estimator?: string;
  surveyDate?: string;
  surveyTime?: string;
  moveDate?: string;
  fromZip?: string;
  toZip?: string;
  
  // Lead Status
  leadStatus: string;
  leadActivity?: string;
  nextAction?: string;
  isNew?: boolean;
  
  // Place Information (will be extracted for Origins creation)
  typeOfPlace?: string;
  moveSize?: string;
  howManyStories?: string;
  features?: string[]; // Array of features
  
  // Configuration
  rateType?: string;
  hasPackingDay?: boolean;
  hasInvoice?: boolean;
  activeDay?: string;
  timePromised?: boolean;
  addStorage?: boolean;
  inventoryOption?: string;
  
  // Financial Information - Estimate
  estimateQuote?: number;
  estimateFuelSurcharge?: number;
  estimateValuation?: number;
  estimatePacking?: number;
  estimateAdditionalServices?: number;
  estimateDiscount?: number;
  estimateGrandTotal?: number;
  estimateDeposit?: number;
  estimatePayment?: number;
  estimateBalanceDue?: number;
  
  // Financial Information - Invoice
  invoiceQuote?: number;
  invoiceFuelSurcharge?: number;
  invoiceValuation?: number;
  invoicePacking?: number;
  invoiceAdditionalServices?: number;
  invoiceDiscount?: number;
  invoiceGrandTotal?: number;
  invoiceDeposit?: number;
  invoicePayment?: number;
  invoiceBalanceDue?: number;
  
  // Moving Day Details
  numMovers?: number;
  numTrucks?: number;
  hourlyRate?: number;
  volume?: number;
  weight?: number;
  pricePerCuft?: number;
  pricePerLbs?: number;
  travelTime?: string;
  movingMin?: string;
  minimumCuft?: number;
  minimumLbs?: number;
  pickupWindow?: string;
  earliestDeliveryDate?: string;
  deliveryWindow?: string;
  minHours?: string;
  maxHours?: string;
  
  // Move In Details
  moveInNumTrucks?: number;
  moveInNumMovers?: number;
  moveInHourlyRate?: number;
  moveInPricePerCuft?: number;
  moveInPricePerLbs?: number;
  moveInTravelTime?: string;
  moveInMovingMin?: string;
  moveInMinimumCuft?: number;
  moveInMinimumLbs?: number;
  moveInPickupWindow?: string;
  moveInDeliveryWindow?: string;
  moveInMinHours?: string;
  moveInMaxHours?: string;
  
  // Packing Details
  numPackers?: number;
  packingHourlyRate?: number;
  packingTravelTime?: string;
  packingMinimum?: string;
  packingMinHours?: string;
  packingMaxHours?: string;
  
  // Move In Financial
  moveInTypeOfQuote?: string;
  moveInEstimateQuote?: number;
  moveInEstimateFuelSurcharge?: number;
  moveInEstimateValuation?: number;
  moveInEstimatePacking?: number;
  moveInEstimateAdditionalServices?: number;
  moveInEstimateDiscount?: number;
  moveInEstimateGrandTotal?: number;
  moveInEstimateDeposit?: number;
  moveInEstimatePayment?: number;
  moveInEstimateBalanceDue?: number;
  
  moveInInvoiceQuote?: number;
  moveInInvoiceFuelSurcharge?: number;
  moveInInvoiceValuation?: number;
  moveInInvoicePacking?: number;
  moveInInvoiceAdditionalServices?: number;
  moveInInvoiceDiscount?: number;
  moveInInvoiceGrandTotal?: number;
  moveInInvoiceDeposit?: number;
  moveInInvoicePayment?: number;
  moveInInvoiceBalanceDue?: number;
  moveInHasInvoice?: boolean;
};

  export type OriginInput = {
    address?: string;
    apt?: string;
    city?: string;
    state?: string;
    displayedRooms?: number[];
    itemsByRoom?: JSON;
    autoBoxEnabled?:boolean;
    zipCode?: string;
    typeOfPlace?: string;
    moveSize?: string;
    howManyStories?: string;
    features?: string[];
    furnishingStyle?: string;
    needsCOI?: boolean;
    biggestTruckAccess?: string;
    shuttleTruckRequired?: boolean;
    parkingAccess?: string;
    distanceDoorTruck?: string;
    howManySteps?: string;
    terrainDoorTruck?: string;
    elevatorAtStop?: boolean;
    elevatorExclusive?: boolean;
    elevatorFloors?: string;
    elevatorSize?: string;
    whatsMoving?: string;
    packingOption?: string;
    itemsToBeTakenApart?: boolean;
    hoistItems?: boolean;
    craneNeeded?: boolean;
    blanketsOption?: string;
    additionalServices?: string[];
    timeRestriction?: boolean;
    timeRestrictionOption?: string;
    timeRestrictionType?: string;
    timeRestrictionStartTime?: string;
    timeRestrictionEndTime?: string;
    isActive?: boolean;
    isVisible?:boolean;
  };
  
  
  export type DestinationsInput = {
    address?: string;
    apt?: string;
    city?: string;
    state?: string;
    displayedRooms?: number[];
    itemsByRoom?: JSON;
    autoBoxEnabled?:boolean;
    zipCode?: string;
    typeOfPlace?: string;
    moveSize?: string;
    howManyStories?: string;
    features?: string[];
    furnishingStyle?: string;
    needsCOI?: boolean;
    biggestTruckAccess?: string;
    shuttleTruckRequired?: boolean;
    parkingAccess?: string;
    distanceDoorTruck?: string;
    howManySteps?: string;
    terrainDoorTruck?: string;
    elevatorAtStop?: boolean;
    elevatorExclusive?: boolean;
    elevatorFloors?: string;
    elevatorSize?: string;
    whatsMoving?: string;
    packingOption?: string;
    itemsToBeTakenApart?: boolean;
    hoistItems?: boolean;
    craneNeeded?: boolean;
    blanketsOption?: string;
    additionalServices?: string[];
    postStorage?: boolean;
    timeRestriction?: boolean;
    timeRestrictionOption?: string;
    timeRestrictionType?: string;
    timeRestrictionStartTime?: string;
    timeRestrictionEndTime?: string;
    isActive?: boolean;
    isVisible?: boolean;
  };
  
  export type FurnitureInput = {
    name: string;
    imageName: string;
    rooms?: number[];
    letters?: string[];
    cuft?: number;
    lbs?: number;
    search?: "Y" | "N";
    tags?: string[];
    notes?: string;
    packingNeeds?: Record<string, number>;
    link?: string;
    uploadedImages?: string [];
    cameraImages?: string [];
    groupingKey?: string;
    autoAdded?: boolean;
    brandId?: string;
  };

  export type InventoryItemInput = {
    id?:string;
    furnitureItemId: number;
    roomId?: number;
    name?: string;
    imageName?: string;
    letters?: string[];
    search?: string;
    cuft?: number;
    lbs?: number;
    tags?: string[];
    notes?: string;
    packingNeeds?: Record<string, number>;
    link?: string;
    uploadedImages?: string[];
    cameraImages?: string[];
    groupingKey?: string;
    autoAdded?: boolean;
    count?: number;
  };

  

  
  
  
  
  
