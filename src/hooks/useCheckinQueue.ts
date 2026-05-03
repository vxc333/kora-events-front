import { useCallback, useEffect, useState } from 'react'
import { performCheckin } from '@/services/checkin'

interface QueueEntry {
  id: string
  token: string
  timestamp: number
}

const DB_NAME = 'kora-checkin'
const STORE = 'queue'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function enqueue(entry: QueueEntry): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).add(entry)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function dequeue(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getAllQueued(): Promise<QueueEntry[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result as QueueEntry[])
    req.onerror = () => reject(req.error)
  })
}

export function useCheckinQueue() {
  const [queueCount, setQueueCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const refreshCount = useCallback(async () => {
    const items = await getAllQueued()
    setQueueCount(items.length)
  }, [])

  const sync = useCallback(async () => {
    if (!navigator.onLine) return
    const items = await getAllQueued()
    if (items.length === 0) return
    setIsSyncing(true)
    for (const item of items) {
      try {
        await performCheckin(item.token)
        await dequeue(item.id)
      } catch {
        // keep in queue if server error; break on network error
      }
    }
    setIsSyncing(false)
    await refreshCount()
  }, [refreshCount])

  const addToQueue = useCallback(async (token: string): Promise<void> => {
    await enqueue({ id: crypto.randomUUID(), token, timestamp: Date.now() })
    await refreshCount()
  }, [refreshCount])

  useEffect(() => {
    refreshCount()
    const handleOnline = () => { setIsOnline(true); sync() }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refreshCount, sync])

  return { queueCount, isSyncing, isOnline, addToQueue, sync }
}
