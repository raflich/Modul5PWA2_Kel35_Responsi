import { useState, useEffect } from 'react'
import favoriteService from '../services/favoriteService'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => favoriteService.getFavorites())

  useEffect(() => {
    const unsubscribe = favoriteService.subscribeFavorites((updatedList) => {
      setFavorites(updatedList)
    })
    return unsubscribe
  }, [])

  const isFav = (id) => favoriteService.isFavorite(id)

  const toggle = (tent) => {
    return favoriteService.toggleFavorite(tent)
  }

  const clear = () => {
    favoriteService.clearFavorites()
  }

  return {
    favorites,
    isFav,
    toggle,
    clear,
    count: favorites.length,
  }
}
