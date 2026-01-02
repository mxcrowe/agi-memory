"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ConfigSection } from "./config-section"
import { Brain, Database, Target, Shield, Cpu, Save, RotateCcw } from "lucide-react"
import type { Configuration } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ConfigManagerProps {
  initialConfig: Configuration
}

export function ConfigManager({ initialConfig }: ConfigManagerProps) {
  const [config, setConfig] = useState(initialConfig)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleFieldChange = (section: keyof Configuration, field: string, value: string | number | boolean) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (!response.ok) throw new Error("Failed to save configuration")

      toast({
        title: "Configuration Saved",
        description: "Your changes have been applied successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(initialConfig)
    toast({
      title: "Configuration Reset",
      description: "All changes have been reverted.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Configuration Management</h2>
          <p className="text-sm text-muted-foreground">Manage agent behavior, memory, and guardrails</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ConfigSection
          title="Agent Settings"
          description="Core agent identity and behavior parameters"
          icon={Brain}
          fields={[
            {
              id: "agent.name",
              label: "Agent Name",
              type: "text",
              value: config.agent.name,
            },
            {
              id: "agent.heartbeat_interval",
              label: "Heartbeat Interval (ms)",
              description: "How often the agent runs autonomous cognition cycles",
              type: "number",
              value: config.agent.heartbeat_interval,
            },
            {
              id: "agent.max_energy",
              label: "Maximum Energy",
              description: "Total energy budget for cognitive actions",
              type: "number",
              value: config.agent.max_energy,
            },
            {
              id: "agent.energy_regen_rate",
              label: "Energy Regeneration (per minute)",
              type: "number",
              value: config.agent.energy_regen_rate,
            },
          ]}
          onFieldChange={(id, value) => {
            const [section, field] = id.split(".")
            handleFieldChange(section as keyof Configuration, field, value)
          }}
        />

        <ConfigSection
          title="LLM Configuration"
          description="Language model provider and parameters"
          icon={Cpu}
          fields={[
            {
              id: "llm.provider",
              label: "Provider",
              type: "select",
              value: config.llm.provider,
              options: [
                { value: "openai", label: "OpenAI" },
                { value: "anthropic", label: "Anthropic" },
                { value: "local", label: "Local Model" },
              ],
            },
            {
              id: "llm.model",
              label: "Model",
              type: "text",
              value: config.llm.model,
            },
            {
              id: "llm.temperature",
              label: "Temperature",
              description: "Controls randomness (0.0 - 2.0)",
              type: "number",
              value: config.llm.temperature,
            },
            {
              id: "llm.max_tokens",
              label: "Max Tokens",
              type: "number",
              value: config.llm.max_tokens,
            },
          ]}
          onFieldChange={(id, value) => {
            const [section, field] = id.split(".")
            handleFieldChange(section as keyof Configuration, field, value)
          }}
        />

        <ConfigSection
          title="Memory System"
          description="Memory retention and processing settings"
          icon={Database}
          fields={[
            {
              id: "memory.episodic_retention_days",
              label: "Episodic Memory Retention (days)",
              description: "How long to keep detailed episodic memories",
              type: "number",
              value: config.memory.episodic_retention_days,
            },
            {
              id: "memory.semantic_confidence_threshold",
              label: "Semantic Confidence Threshold",
              description: "Minimum confidence to form semantic memories (0.0 - 1.0)",
              type: "number",
              value: config.memory.semantic_confidence_threshold,
            },
            {
              id: "memory.working_memory_size",
              label: "Working Memory Size",
              description: "Number of items in active working memory",
              type: "number",
              value: config.memory.working_memory_size,
            },
          ]}
          onFieldChange={(id, value) => {
            const [section, field] = id.split(".")
            handleFieldChange(section as keyof Configuration, field, value)
          }}
        />

        <ConfigSection
          title="Goal Management"
          description="Goal prioritization and energy allocation"
          icon={Target}
          fields={[
            {
              id: "goals.max_active_goals",
              label: "Max Active Goals",
              description: "Maximum number of concurrent goals",
              type: "number",
              value: config.goals.max_active_goals,
            },
            {
              id: "goals.energy_allocation_strategy",
              label: "Energy Allocation Strategy",
              type: "select",
              value: config.goals.energy_allocation_strategy,
              options: [
                { value: "balanced", label: "Balanced" },
                { value: "priority", label: "Priority-based" },
                { value: "adaptive", label: "Adaptive" },
              ],
            },
          ]}
          onFieldChange={(id, value) => {
            const [section, field] = id.split(".")
            handleFieldChange(section as keyof Configuration, field, value)
          }}
        />

        <ConfigSection
          title="Guardrails"
          description="Safety limits and approval requirements"
          icon={Shield}
          fields={[
            {
              id: "guardrails.max_energy_per_action",
              label: "Max Energy Per Action",
              description: "Prevents excessive energy consumption",
              type: "number",
              value: config.guardrails.max_energy_per_action,
            },
            {
              id: "guardrails.require_approval_for_reach_out",
              label: "Require Approval for External Communication",
              description: "Agent must get permission before reaching out",
              type: "boolean",
              value: config.guardrails.require_approval_for_reach_out,
            },
          ]}
          onFieldChange={(id, value) => {
            const [section, field] = id.split(".")
            handleFieldChange(section as keyof Configuration, field, value)
          }}
        />
      </div>
    </div>
  )
}
