"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Lock, LockOpen, Plus, Check, History } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface VersionInfo {
  versionNumber: number
  createdAt: Date
  description: string
  isLocked: boolean
  lockedBy?: string
  lockedAt?: Date
}

interface VersionControlProps {
  versionHistory: VersionInfo[]
  currentVersion: number
  isLocked: boolean
  isDraft: boolean
  onCreateVersion: (description: string) => Promise<void>
  onLockVersion: () => Promise<void>
  onViewVersion: (versionNumber: number) => void
  onSaveVersion: () => Promise<void>
}

export function VersionControl({
  versionHistory = [],
  currentVersion = 1,
  isLocked = false,
  isDraft = false,
  onCreateVersion,
  onLockVersion,
  onViewVersion,
  onSaveVersion
}: VersionControlProps) {
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [versionDescription, setVersionDescription] = useState("")
  
  // Format date
  const formatDate = (date: Date | string) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleString()
  }
  
  // Handle create version
  const handleCreateVersion = async () => {
    if (!versionDescription.trim()) {
      toast({
        title: "Error",
        description: "Please provide a description for the new version",
        variant: "destructive"
      })
      return
    }

    if (isLocked) {
      toast({
        title: "Error",
        description: "Cannot create a new version from a locked version",
        variant: "destructive"
      })
      return
    }
    
    try {
      await onCreateVersion(versionDescription)
      setVersionDescription("")
      setIsCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "New version created successfully"
      })
    } catch (error) {
      console.error("Error creating new version:", error)
      toast({
        title: "Error",
        description: "Failed to create new version",
        variant: "destructive"
      })
    }
  }
  
  // Handle lock version
  const handleLockVersion = async () => {
    try {
      await onLockVersion()
      toast({
        title: "Success",
        description: "Quotation version has been locked"
      })
    } catch (error) {
      console.error("Error locking version:", error)
      toast({
        title: "Error",
        description: "Failed to lock version",
        variant: "destructive"
      })
    }
  }
  
  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Version Management</span>
            <span className="text-xs bg-muted px-2 py-1 rounded-full">
              v{currentVersion}
            </span>
            {isLocked ? (
              <Lock className="h-4 w-4 text-amber-500" />
            ) : (
              <LockOpen className="h-4 w-4 text-green-500" />
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryDialogOpen(true)}
            >
              <History className="h-4 w-4 mr-1" />
              History
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide" : "Show"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Current Version: <span className="font-medium">{currentVersion}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: <span className={isLocked ? "text-amber-500" : "text-green-500"}>
                    {isLocked ? "Locked" : "Draft"}
                  </span>
                </p>
              </div>
              
              <div className="space-x-2">
                {!isLocked && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Version
                    </Button>
                    {isDraft && (
                      <Button
                        variant="secondary"
                        onClick={onSaveVersion}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save Changes
                      </Button>
                    )}
                    <Button 
                      variant="secondary"
                      onClick={handleLockVersion}
                      disabled={isDraft}
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      Lock Version
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {versionHistory.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recent Versions</h4>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versionHistory
                        .slice()
                        .sort((a, b) => b.versionNumber - a.versionNumber)
                        .slice(0, 3)
                        .map((version, index) => (
                          <TableRow key={`recent-${version.versionNumber}-${index}`}>
                            <TableCell>v{version.versionNumber}</TableCell>
                            <TableCell>{formatDate(version.createdAt)}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{version.description}</TableCell>
                            <TableCell>
                              {version.isLocked ? (
                                <span className="text-amber-500 flex items-center">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Locked
                                </span>
                              ) : (
                                <span className="text-green-500 flex items-center">
                                  <LockOpen className="h-3 w-3 mr-1" />
                                  Draft
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => onViewVersion(version.versionNumber)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      {/* Create New Version Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Create a new version of this quotation. The current state will be preserved as version {currentVersion + 1}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version-description">Version Description</Label>
              <Textarea
                id="version-description"
                placeholder="Describe the changes in this version..."
                value={versionDescription}
                onChange={(e) => setVersionDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateVersion}>
              Create Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Version History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              View all previous versions of this quotation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {versionHistory.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Locked By</TableHead>
                      <TableHead>Locked At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versionHistory
                      .slice()
                      .sort((a, b) => b.versionNumber - a.versionNumber)
                      .map((version, index) => (
                        <TableRow key={`history-${version.versionNumber}-${index}`}>
                          <TableCell>v{version.versionNumber}</TableCell>
                          <TableCell>{formatDate(version.createdAt)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{version.description}</TableCell>
                          <TableCell>
                            {version.isLocked ? (
                              <span className="text-amber-500 flex items-center">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </span>
                            ) : (
                              <span className="text-green-500 flex items-center">
                                <LockOpen className="h-3 w-3 mr-1" />
                                Draft
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{version.lockedBy || "N/A"}</TableCell>
                          <TableCell>{version.lockedAt ? formatDate(version.lockedAt) : "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                onViewVersion(version.versionNumber)
                                setIsHistoryDialogOpen(false)
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No version history available.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => setIsHistoryDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}