"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import {Trash2} from "lucide-react"
import userApi from "../../api/user//user"
import { useNavigate } from "react-router-dom"

export function DeleteAccountDialog({ className, ...props }) {
  const [password, setPassword] = useState("")
  const [deleteText, setDeleteText] = useState("")
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)

  const isDeleteTextCorrect = deleteText === "delete"
  const canSubmit = password.length > 0 && deleteText.length > 0
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
   
    e.preventDefault()
    setError("")

    if (!isDeleteTextCorrect) {
      setError('Please type "delete" exactly to confirm')
      return
    }

    // Handle account deletion logic here
    
    try {
      const data = 
      {
        password,
      };
      console.log(data);

      const [res, err] = await userApi.deleteAccount(data);

      if (err) throw new Error(err);
      console.log("delete ok ");  
      localStorage.removeItem("token");    
      console.log(res.data.message);
      navigate('/auth');
    } catch (e) {
      console.error("❌ Lỗi khi xóa tài khoản:", e.message);
    }

    // Reset form
    setPassword("")
    setDeleteText("")
  }

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when dialog closes
      setPassword("")
      setDeleteText("")
      setError("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" className={className} {...props}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 py-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">Warning: This action is irreversible</p>
            </div>

            <Field>
              <FieldLabel htmlFor="password">Enter your password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="delete-confirm">Type &quot;delete&quot; to confirm</FieldLabel>
              <Input
                id="delete-confirm"
                type="text"
                placeholder="Type delete"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                required
              />
              {deleteText.length > 0 && !isDeleteTextCorrect && (
                <FieldDescription className="text-destructive">Please type &quot;delete&quot; exactly</FieldDescription>
              )}
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={!canSubmit}>
              Confirm Delete Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
