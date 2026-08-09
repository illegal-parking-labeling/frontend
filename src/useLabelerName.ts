import { useEffect, useState } from 'react'

const STORAGE_KEY = 'illegal-parking:labeler-name'

export function useLabelerName(): [string, (name: string) => void] {
  const [name, setName] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, name)
  }, [name])

  return [name, setName]
}
