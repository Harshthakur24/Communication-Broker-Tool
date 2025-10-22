'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle } from 'lucide-react'

interface ConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmText: string
    onConfirm: () => void
    onCancel: () => void
    itemName: string
    confirmButtonText?: string
    cancelButtonText?: string
    isLoading?: boolean
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onOpenChange,
    title,
    description,
    confirmText,
    onConfirm,
    onCancel,
    itemName,
    confirmButtonText = 'Delete',
    cancelButtonText = 'Cancel',
    isLoading = false
}) => {
    const [inputValue, setInputValue] = useState('')
    const [isValid, setIsValid] = useState(false)

    React.useEffect(() => {
        if (open) {
            setInputValue('')
            setIsValid(false)
        }
    }, [open])

    React.useEffect(() => {
        setIsValid(inputValue === itemName)
    }, [inputValue, itemName])

    const handleConfirm = () => {
        if (isValid) {
            onConfirm()
            onOpenChange(false)
        }
    }

    const handleCancel = () => {
        onCancel()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold text-gray-900">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 mt-1">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-800 font-medium mb-2">
                            This action cannot be undone. This will permanently delete the knowledge base document.
                        </p>
                        <p className="text-sm text-red-700">
                            To confirm deletion, please type the exact name of the document:
                        </p>
                        <p className="text-sm font-semibold text-red-900 mt-2">
                            "{itemName}"
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirm-input" className="text-sm font-medium text-gray-700">
                            Document name:
                        </label>
                        <Input
                            id="confirm-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={`Type "${itemName}" to confirm`}
                            className="w-full"
                            autoFocus
                        />
                        {inputValue && !isValid && (
                            <p className="text-xs text-red-600">
                                The name doesn't match. Please type the exact name to confirm deletion.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {cancelButtonText}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!isValid || isLoading}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Deleting...
                            </div>
                        ) : (
                            confirmButtonText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
