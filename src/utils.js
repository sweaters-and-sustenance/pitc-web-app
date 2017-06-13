
export const makeRadius = (query) => {
  return Math.sqrt(Math.pow(query.location.bounds.northEast.latitude - query.location.bounds.southWest.latitude,2) + Math.pow(query.location.bounds.northEast.longitude - query.location.bounds.southWest.longitude,2)) / 2
}
