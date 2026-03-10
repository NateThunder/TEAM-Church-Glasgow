import { useState } from 'react'

type BeforeOpenHandler = () => void

export function useCrudDialogState() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openCreate = (beforeOpen?: BeforeOpenHandler) => {
    setEditingId(null)
    beforeOpen?.()
    setIsFormOpen(true)
  }

  const openEdit = (id: string, beforeOpen?: BeforeOpenHandler) => {
    setEditingId(id)
    beforeOpen?.()
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
  }

  const openDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const closeDelete = () => {
    setIsDeleteOpen(false)
    setDeleteId(null)
  }

  return {
    isFormOpen,
    isDeleteOpen,
    editingId,
    deleteId,
    openCreate,
    openEdit,
    closeForm,
    openDelete,
    closeDelete,
  }
}
