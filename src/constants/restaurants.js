// src/constants/restaurants.js
export const RESTAURANTS = [
  { id: "montanas", name: "Montana's", discount: "20%" },
  { id: "kelseys", name: "Kelsey's", discount: "20%" },
  { id: "coras", name: "Cora's Breakfast", discount: "10%" },
  { id: "js-roadhouse", name: "J's Roadhouse", discount: "20%" },
  { id: "swiss-chalet", name: "Swiss Chalet", discount: "20%" },
  {
    id: "overtime-bar",
    name: "Overtime Bar",
    discount: "20%",
    locations: [
      { id: "overtime-sudbury", name: "Sudbury" },
      { id: "overtime-val-caron", name: "Val Caron" },
      { id: "overtime-chelmsford", name: "Chelmsford" }
    ]
  },
  { id: "lot-88", name: "Lot 88 Steakhouse", discount: "20%" },
  { id: "poke-bar", name: "Poke Bar", discount: "20%" },
  {
    id: "happy-life",
    name: "Happy Life",
    discount: "10%",
    locations: [
      { id: "happy-life-kingsway", name: "Kingsway" },
      { id: "happy-life-val-caron", name: "Val Caron" },
      { id: "happy-life-chelmsford", name: "Chelmsford" }
    ]
  }
];

// Helper functions for working with restaurants
export const getRestaurantById = (id) => RESTAURANTS.find(r => r.id === id);

export const getRestaurantDiscount = (id) => {
  const restaurant = getRestaurantById(id);
  return restaurant ? restaurant.discount : null;
};

export const getLocationById = (restaurantId, locationId) => {
  const restaurant = getRestaurantById(restaurantId);
  if (!restaurant || !restaurant.locations) return null;
  return restaurant.locations.find(l => l.id === locationId);
};

export const getFullRestaurantName = (restaurantId, locationId) => {
  const restaurant = getRestaurantById(restaurantId);
  if (!restaurant) return '';
  
  const location = getLocationById(restaurantId, locationId);
  return location ? `${restaurant.name} - ${location.name}` : restaurant.name;
};

// Get all unique locations
export const getAllLocations = () => {
  const locations = [];
  RESTAURANTS.forEach(restaurant => {
    if (restaurant.locations) {
      restaurant.locations.forEach(location => {
        locations.push({
          id: location.id,
          name: location.name,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name
        });
      });
    }
  });
  return locations;
};

// Get all restaurants with flat structure (including locations as separate entries)
export const getFlattenedRestaurants = () => {
  const flattened = [];
  RESTAURANTS.forEach(restaurant => {
    if (restaurant.locations) {
      restaurant.locations.forEach(location => {
        flattened.push({
          id: location.id,
          name: `${restaurant.name} - ${location.name}`,
          parentId: restaurant.id,
          discount: restaurant.discount
        });
      });
    } else {
      flattened.push({
        id: restaurant.id,
        name: restaurant.name,
        discount: restaurant.discount
      });
    }
  });
  return flattened;
};