import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State pour stocker notre valeur
  // Passer la fonction d'initialisation à useState pour que la logique ne s'exécute qu'une fois
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Récupérer depuis localStorage par clé
      const item = window.localStorage.getItem(key);
      // Parser le JSON stocké ou si aucun, renvoyer initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si une erreur se produit, renvoyer initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Retourner une version wrappée de la fonction setter de useState qui ...
  // ... persiste la nouvelle valeur dans localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Autoriser la valeur à être une fonction pour que nous ayons la même API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Sauvegarder l'état
      setStoredValue(valueToStore);
      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Une erreur plus élaborée serait généralement une bonne idée
      console.log(error);
    }
  };

  return [storedValue, setValue];
}