// Workspace areas an administrator can grant to staff (mirrors server/config/permissions.js).
export const PERMISSIONS = [
  {
    key: "bookings",
    label: "Booking requests",
    description: "Review, confirm and cancel traveller requests.",
    icon: "calendar",
  },
  {
    key: "tours",
    label: "Journeys",
    description: "Edit prices, descriptions and publishing.",
    icon: "pin",
  },
  {
    key: "departures",
    label: "Departures",
    description: "Add dates, set capacity and assign guides.",
    icon: "clock",
  },
  {
    key: "enquiries",
    label: "Enquiries",
    description: "Answer enquiries and see newsletter subscribers.",
    icon: "mail",
  },
  {
    key: "guests",
    label: "Travellers",
    description: "View and update traveller profiles.",
    icon: "users",
  },
  {
    key: "guides",
    label: "Guides",
    description: "Manage the guiding team.",
    icon: "shield",
  },
  {
    key: "suppliers",
    label: "Suppliers",
    description: "Manage hotels, transport and experiences.",
    icon: "leaf",
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "See trip value, capacity and performance figures.",
    icon: "chart",
  },
];
export const PERMISSION_KEYS = PERMISSIONS.map((item) => item.key);
