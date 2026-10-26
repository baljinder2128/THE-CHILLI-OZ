/*
 * ============================================================
 *  THE CHILLI'OZ — SITE SETTINGS
 *  Edit the values below. Leave a value as "" to hide it.
 * ============================================================
 */
window.CHILLIOZ_CONFIG = {
  // Paste your Google Apps Script "Web app URL" here (see SETUP.md, step 2).
  // Until this is filled in, the checkout shows "online ordering coming soon".
  orderEndpoint: "",

  // Contact details shown in the footer and on the Contact page.
  phone: "",            // e.g. "03 9123 4567"
  email: "",            // e.g. "hello@thechillioz.com.au"
  address: "Melbourne, Victoria",
  mapLink: "",          // e.g. a Google Maps link to the café
  instagram: "",        // e.g. "https://instagram.com/thechillioz"
  facebook: "",         // e.g. "https://facebook.com/thechillioz"

  // Trading hours, 24-hour clock, Melbourne time. Use null for closed days.
  // 0 = Sunday, 1 = Monday … 6 = Saturday
  hours: {
    0: null,
    1: { open: "05:00", close: "17:00" },
    2: { open: "05:00", close: "17:00" },
    3: { open: "05:00", close: "17:00" },
    4: { open: "05:00", close: "17:00" },
    5: { open: "05:00", close: "17:00" },
    6: { open: "05:00", close: "14:00" }
  },

  // How many minutes customers need to wait for the earliest pickup,
  // and the last pickup slot before closing.
  prepMinutes: 15,
  lastOrderBeforeCloseMinutes: 15,

  // How many days ahead customers can pre-order.
  daysAhead: 6,

  currency: "AUD",
  timeZone: "Australia/Melbourne"
};
