/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Merchant Category Codes (MCC)
 *
 * Standard ISO 18245 MCC codes used for transaction categorization.
 * This is a subset of commonly used codes for fraud rules and spending controls.
 */

export const MCC_CODES = {
  // Agricultural Services
  AGRICULTURAL_SERVICES: '0763',

  // Airlines
  AIRLINES: '3000-3299',
  AIRLINE_CARRIERS: '4511',

  // Car Rental
  CAR_RENTAL: '3351-3441',
  AUTO_RENTAL: '7512',

  // Hotels & Lodging
  HOTELS: '3501-3790',
  LODGING: '7011',

  // Transportation
  PASSENGER_RAILWAYS: '4112',
  BUS_LINES: '4131',
  TAXI_LIMOUSINE: '4121',
  RIDESHARE: '4121',
  TOLL_FEES: '4784',

  // Utilities
  ELECTRIC_UTILITY: '4900',
  GAS_UTILITY: '4814',
  WATER_UTILITY: '4900',
  TELECOM: '4812',
  CABLE_SATELLITE: '4899',

  // Retail
  GROCERY_STORES: '5411',
  SUPERMARKETS: '5411',
  CONVENIENCE_STORES: '5499',
  DEPARTMENT_STORES: '5311',
  DISCOUNT_STORES: '5310',
  WAREHOUSE_CLUBS: '5300',
  PHARMACIES: '5912',
  HARDWARE_STORES: '5251',
  ELECTRONICS_STORES: '5732',
  CLOTHING_STORES: '5651',
  SHOE_STORES: '5661',
  SPORTING_GOODS: '5941',
  BOOK_STORES: '5942',
  OFFICE_SUPPLIES: '5943',
  PET_STORES: '5995',
  FLORISTS: '5992',
  GIFT_SHOPS: '5947',
  JEWELRY_STORES: '5944',
  FURNITURE_STORES: '5712',
  HOME_IMPROVEMENT: '5200',

  // Food & Beverage
  RESTAURANTS: '5812',
  FAST_FOOD: '5814',
  BARS_NIGHTCLUBS: '5813',
  COFFEE_SHOPS: '5814',
  BAKERIES: '5462',
  CATERERS: '5811',

  // Automotive
  GAS_STATIONS: '5541',
  AUTO_PARTS: '5531',
  AUTO_REPAIR: '7538',
  CAR_WASHES: '7542',
  PARKING_LOTS: '7523',
  TOWING_SERVICES: '7549',
  AUTO_DEALERS_NEW: '5511',
  AUTO_DEALERS_USED: '5521',

  // Entertainment
  MOVIE_THEATERS: '7832',
  AMUSEMENT_PARKS: '7996',
  BOWLING_ALLEYS: '7933',
  GOLF_COURSES: '7992',
  GYMS_FITNESS: '7941',
  SPORTS_EVENTS: '7941',
  CONCERTS_EVENTS: '7929',
  VIDEO_GAME_ARCADE: '7994',
  STREAMING_SERVICES: '5815',

  // Travel
  TRAVEL_AGENCIES: '4722',
  CRUISE_LINES: '4411',
  TOUR_OPERATORS: '4722',

  // Financial Services
  FINANCIAL_INSTITUTIONS: '6010',
  ATM: '6011',
  MONEY_ORDERS: '6051',
  WIRE_TRANSFER: '4829',
  CURRENCY_EXCHANGE: '6051',
  SECURITIES_BROKERS: '6211',
  INSURANCE: '6300',
  CRYPTO_SERVICES: '6051',

  // Professional Services
  LEGAL_SERVICES: '8111',
  ACCOUNTING: '8931',
  MEDICAL_SERVICES: '8011',
  DENTAL_SERVICES: '8021',
  HOSPITALS: '8062',
  VETERINARY: '0742',
  REAL_ESTATE: '6513',
  CONSULTING: '7392',

  // Education
  SCHOOLS_K12: '8211',
  COLLEGES: '8220',
  TRADE_SCHOOLS: '8241',
  CHILD_CARE: '8351',

  // Government
  GOVERNMENT_SERVICES: '9211',
  POSTAL_SERVICES: '9402',
  COURT_COSTS: '9211',
  TAXES: '9311',
  FINES: '9222',

  // Miscellaneous
  CHARITIES: '8398',
  RELIGIOUS_ORGS: '8661',
  POLITICAL_ORGS: '8651',
  MEMBERSHIPS: '8699',
  DIRECT_MARKETING: '5964',
  GAMBLING: '7995',
  LOTTERY: '7995',
  ADULT_CONTENT: '5967',
  DATING_SERVICES: '7273',
  DIGITAL_GOODS: '5818',
  SOFTWARE: '5734',
  COMPUTER_SERVICES: '7372',
} as const;

export type MccCode = (typeof MCC_CODES)[keyof typeof MCC_CODES];

/**
 * MCC categories for fraud rules and spending controls
 */
export const MCC_CATEGORIES = {
  GAMBLING: ['7995', '7800', '7801', '7802'],
  ADULT: ['5967', '7273'],
  CRYPTO: ['6051'],
  ATM_CASH: ['6010', '6011'],
  HIGH_RISK: ['5962', '5966', '5967', '7995', '6051'],
  TRAVEL: ['3000-3299', '3351-3441', '3501-3790', '4511', '4722', '4411', '7011'],
  GAS: ['5541', '5542'],
  GROCERIES: ['5411', '5412', '5422', '5441', '5451', '5462', '5499'],
  RESTAURANTS: ['5811', '5812', '5813', '5814'],
  RETAIL: ['5200', '5300', '5310', '5311', '5331', '5399', '5651', '5699'],
  ENTERTAINMENT: ['7832', '7922', '7929', '7932', '7933', '7941', '7991', '7992', '7996', '7999'],
  HEALTHCARE: ['8011', '8021', '8031', '8041', '8042', '8043', '8044', '8049', '8050', '8062'],
  UTILITIES: ['4814', '4816', '4821', '4829', '4899', '4900'],
  GOVERNMENT: ['9211', '9222', '9223', '9311', '9399', '9402', '9405'],
} as const;

export const MCC_CATEGORY_OPTIONS = Object.keys(MCC_CATEGORIES).map((category) => ({
  name: category
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' '),
  value: category,
}));
