import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemCount: number
}

export function DeleteConfirmDialog({ isOpen, onClose, onConfirm, itemCount }: DeleteConfirmDialogProps) {
  console.log('\n=== DELETE CONFIRM DIALOG RENDER ===')
  console.log('isOpen:', isOpen)
  console.log('itemCount:', itemCount)
  console.log('onClose type:', typeof onClose)
  console.log('onConfirm type:', typeof onConfirm)

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {itemCount} {itemCount === 1 ? 'card' : 'cards'}? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={() => {
              console.log('🔴 DELETE DIALOG CANCEL CLICKED')
              onClose()
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => {
              console.log('🔴 DELETE DIALOG CONFIRM CLICKED')
              onConfirm()
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete {itemCount} {itemCount === 1 ? 'Card' : 'Cards'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}