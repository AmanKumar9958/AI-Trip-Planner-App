export const SelectBudget = [
    { iconName: "money-bill-wave", iconFamily: "FontAwesome5", budget: "Low", amount: "₹3,000 - ₹5,000" },
    { iconName: "wallet", iconFamily: "FontAwesome5", budget: "Medium", amount: "₹5,000 - ₹10,000" },
    { iconName: "sack-dollar", iconFamily: "FontAwesome5", budget: "High", amount: "₹10,000 - ₹15,000" }
];


export const SelectMembers = [
    { iconName: "airplane", iconFamily: "Ionicons", people: "Just Me", },
    { iconName: "glass-cheers", iconFamily: "FontAwesome5", people: "A Couple", },
    { iconName: "home", iconFamily: "FontAwesome5", people: "Family", },
    { iconName: "user-friends", iconFamily: "FontAwesome5", people: "Friends", }
];

export const AI_PROMPT = `
Generate a detailed travel itinerary for a trip to "{location}" for "{totalDays}" days, traveling with "{traveler}", with a budget of "{budget}".

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
- Provide at least 3 entries in HotelOptions, with realistic values.
- Do not include any text outside the JSON object.
`;

