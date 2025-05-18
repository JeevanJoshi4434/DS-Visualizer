"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface TreeTypeSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function TreeTypeSelector({ value, onChange }: TreeTypeSelectorProps) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="bst" id="bst" />
        <Label htmlFor="bst">Binary Search Tree (BST)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="avl" id="avl" />
        <Label htmlFor="avl">AVL Tree (Self-balancing)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="redblack" id="redblack" />
        <Label htmlFor="redblack">Red-Black Tree</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="general" id="general" />
        <Label htmlFor="general">General Binary Tree</Label>
      </div>
    </RadioGroup>
  )
}
