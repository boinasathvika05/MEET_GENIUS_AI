"use client"

import { motion } from "framer-motion"
import { Bot, FileText, ListChecks, Mail, ShieldAlert, Zap, ArrowRight, ArrowDown } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorkflowPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  }

  const stages = [
    {
      id: "1-supervisor",
      title: "Supervisor Agent",
      description: "Receives the raw transcript, analyzes the length and complexity, and delegates tasks to specialized worker agents in parallel.",
      icon: <Bot className="h-8 w-8 text-primary" />,
      color: "border-primary/50 bg-primary/5 text-primary"
    },
    {
      id: "2-summary",
      title: "Summary Agent",
      description: "Generates a high-level executive summary focusing on key decisions, themes, and discussion points.",
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      color: "border-blue-500/50 bg-blue-500/5 text-blue-500"
    },
    {
      id: "3-extraction",
      title: "Extraction Agent",
      description: "Scans specifically for action items, commitments, and deadlines. It strictly outputs structured JSON, marking missing data as 'Not Specified'.",
      icon: <ListChecks className="h-8 w-8 text-green-500" />,
      color: "border-green-500/50 bg-green-500/5 text-green-500"
    },
    {
      id: "4-drafting",
      title: "Drafting Agent",
      description: "Takes the outputs from the Summary and Extraction agents to compose a professional, ready-to-send follow-up email.",
      icon: <Mail className="h-8 w-8 text-yellow-500" />,
      color: "border-yellow-500/50 bg-yellow-500/5 text-yellow-500"
    },
    {
      id: "5-validation",
      title: "Validation Agent",
      description: "Cross-references the generated outputs against the original transcript to detect hallucinations and calculate a confidence score.",
      icon: <ShieldAlert className="h-8 w-8 text-purple-500" />,
      color: "border-purple-500/50 bg-purple-500/5 text-purple-500"
    },
    {
      id: "6-compilation",
      title: "Compilation & Delivery",
      description: "The Supervisor aggregates the final validated data and streams it back to the frontend in a structured format.",
      icon: <Zap className="h-8 w-8 text-rose-500" />,
      color: "border-rose-500/50 bg-rose-500/5 text-rose-500"
    }
  ]

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-6 py-4">
        <div className="flex items-center justify-between container mx-auto">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">MeetGenius</span>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">Go to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Under the Hood: <span className="text-primary">Agent Workflow</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how our multi-agent architecture processes your meetings with speed and precision.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          {/* Vertical connecting line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2 rounded-full"></div>

          <div className="space-y-12 md:space-y-0">
            {stages.map((stage, index) => {
              const isEven = index % 2 === 0
              return (
                <motion.div 
                  key={stage.id} 
                  variants={itemVariants}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Timeline dot */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-background border-4 border-muted items-center justify-center z-10 shadow-sm">
                    <span className="font-bold text-muted-foreground">{index + 1}</span>
                  </div>

                  <div className={`md:w-1/2 flex ${isEven ? 'justify-start md:pl-16' : 'justify-end md:pr-16'}`}>
                    <Card className={`w-full max-w-md border-2 ${stage.color.split(' ')[0]} shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl`}>
                      <CardHeader className="pb-3 flex flex-row items-center gap-4 space-y-0">
                        <div className={`p-3 rounded-xl ${stage.color.replace('border', 'bg').replace('/50', '/20')}`}>
                          {stage.icon}
                        </div>
                        <div>
                          <CardDescription className="font-medium tracking-wide text-xs uppercase mb-1">
                            Stage {index + 1}
                          </CardDescription>
                          <CardTitle className="text-xl">{stage.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {stage.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Mobile connector */}
                  {index < stages.length - 1 && (
                    <div className="md:hidden flex justify-center w-full my-[-1rem] z-0">
                      <ArrowDown className="text-muted-foreground h-8 w-8" />
                    </div>
                  )}
                  
                  <div className="hidden md:block md:w-1/2"></div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
        
        <div className="mt-24 text-center">
          <Link href="/dashboard">
            <Button size="lg" className="rounded-full px-8 h-14 text-lg">
              Experience the Workflow <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
