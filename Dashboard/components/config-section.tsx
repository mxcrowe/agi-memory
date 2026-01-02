"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { LucideIcon } from "lucide-react"

interface ConfigField {
  id: string
  label: string
  description?: string
  type: "text" | "number" | "boolean" | "select"
  value: string | number | boolean
  options?: { value: string; label: string }[]
}

interface ConfigSectionProps {
  title: string
  description: string
  icon: LucideIcon
  fields: ConfigField[]
  onFieldChange: (id: string, value: string | number | boolean) => void
}

export function ConfigSection({ title, description, icon: Icon, fields, onFieldChange }: ConfigSectionProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium text-foreground">
              {field.label}
            </Label>
            {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}

            {field.type === "text" && (
              <Input
                id={field.id}
                type="text"
                value={field.value as string}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                className="bg-background"
              />
            )}

            {field.type === "number" && (
              <Input
                id={field.id}
                type="number"
                value={field.value as number}
                onChange={(e) => onFieldChange(field.id, Number.parseFloat(e.target.value))}
                className="bg-background"
              />
            )}

            {field.type === "boolean" && (
              <div className="flex items-center gap-2">
                <Switch
                  id={field.id}
                  checked={field.value as boolean}
                  onCheckedChange={(checked) => onFieldChange(field.id, checked)}
                />
                <Label htmlFor={field.id} className="text-sm text-muted-foreground">
                  {field.value ? "Enabled" : "Disabled"}
                </Label>
              </div>
            )}

            {field.type === "select" && field.options && (
              <Select value={field.value as string} onValueChange={(value) => onFieldChange(field.id, value)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
