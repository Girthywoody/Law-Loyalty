export const RESTAURANTS = [
  { id: 'montanas', name: "Montana's", discount: "20%" },
  { id: 'kelseys', name: "Kelsey's", discount: "20%" },
  { id: 'coras', name: "Cora's Breakfast", discount: "10%" },
  { id: 'roadhouse', name: "J's Roadhouse", discount: "20%" },
  { id: 'swisschalet', name: "Swiss Chalet", discount: "20%" },
  {
    id: 'overtime',
    name: "Overtime Bar",
    discount: "20%",
    locations: [
      { id: 'sudbury', name: "Sudbury" },
      { id: 'valcaron', name: "Val Caron" },
      { id: 'chelmsford', name: "Chelmsford" }
    ]
  },
  { id: 'lot88', name: "Lot 88 Steakhouse", discount: "20%" },
  { id: 'pokebar', name: "Poke Bar", discount: "20%" },
  {
    id: 'happylife',
    name: "Happy Life",
    discount: "10%",
    locations: [
      { id: 'kingsway', name: "Kingsway" },
      { id: 'valcaron', name: "Val Caron" },
      { id: 'chelmsford', name: "Chelmsford" }
    ]
  }
];