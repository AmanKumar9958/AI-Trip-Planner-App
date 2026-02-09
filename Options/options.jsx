export const SelectBudget = [
  { id: 1, title: "Cheap", icon: "💵", budget: "Low", amount: "Under ₹5,000" },
  {
    id: 2,
    title: "Moderate",
    icon: "💰",
    budget: "Medium",
    amount: "Under ₹10,000",
  },
  {
    id: 3,
    title: "Luxury",
    icon: "💸",
    budget: "High",
    amount: "More than ₹10,000",
  },
];

export const SelectMembers = [
  { id: 1, title: "Just Me", icon: "✈️", people: "Just Me" },
  { id: 2, title: "Couple", icon: "🥂", people: "A Couple" },
  { id: 3, title: "Family", icon: "🏡", people: "Family" },
  { id: 4, title: "Friends", icon: "⛵", people: "Friends" },
];

export const AI_PROMPT = `
Generate a detailed travel itinerary for a trip to "{location}" for "{totalDays}" days, traveling with "{traveler}", with a budget of "{budget}".
Hotel required: "{includeHotel}".
Include travel allowance: "{includeTravelAllowance}".

Return output ONLY as strict JSON with EXACT key names and types as below. Do not include markdown code fences or any extra text.

{
    "tripData": {
        "HotelOptions": [
            {
                "HotelName": "string",
                "HotelAddress": "string",
                "PriceRange": 0,
                "HotelImageURL": "string",
                "GeoCoordinates": "string",
                "Rating": 0,
                "Description": "string"
            }
        ],
        "Itinerary": [
            {
                "Day": "Day 1",
                "PlaceName": "string",
                "PlaceDetails": "string",
                "PlaceImageURL": "string",
                "GeoCoordinates": "string",
                "TicketPricing": "string",
                "TravelTime": "string",
                "BestTimeToVisit": "string"
            }
        ]
    }
}

Rules:
- Provide exactly {totalDays} days in Itinerary (Day 1 .. Day {totalDays}).
- Keep all key names exactly as shown.
- {hotelRules}
- {travelAllowanceRules}
- Do not include any text outside the JSON object.
- {budgetRules}
`;
