"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Bot, Zap, CheckCircle, Shield, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">MeetGenius</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
            <Link href="/workflow" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Workflow</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Introducing Next-Gen AI Meeting Intelligence
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground">
              Turn Chaos into Clarity.<br />
              <span className="text-primary">Instantly.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload your meeting transcripts and let our autonomous AI agents extract actionable insights, craft follow-ups, and organize your team's workflow in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                  Try it Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/workflow">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8">
                  View Workflow
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Powered by Advanced AI Agents</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform uses specialized AI agents that work together in a multi-stage pipeline to deliver perfect results every time.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                icon: <FileText className="h-10 w-10 text-blue-500" />,
                title: "Executive Summaries",
                description: "Condense hour-long meetings into concise, highly readable summaries highlighting only what matters."
              },
              {
                icon: <CheckCircle className="h-10 w-10 text-green-500" />,
                title: "Action Item Extraction",
                description: "Automatically identify tasks, owners, and deadlines. Missing data? We highlight it for you."
              },
              {
                icon: <Zap className="h-10 w-10 text-yellow-500" />,
                title: "Automated Follow-ups",
                description: "Generate professional follow-up emails instantly, ready to be sent to all participants."
              },
              {
                icon: <Shield className="h-10 w-10 text-purple-500" />,
                title: "Validation Agent",
                description: "A secondary AI cross-checks outputs against the original transcript to ensure zero hallucinations."
              },
              {
                icon: <Bot className="h-10 w-10 text-rose-500" />,
                title: "Multi-Agent Architecture",
                description: "Our supervisor agent routes tasks to specialized workers for superior quality and speed."
              },
              {
                icon: <ArrowRight className="h-10 w-10 text-teal-500" />,
                title: "Real-time Streaming",
                description: "Watch the AI agents work in real-time as they process your transcript stage by stage."
              }
            ].map((feature, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-background rounded-2xl p-8 border shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6 rounded-lg bg-muted/50 w-16 h-16 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Bot className="h-5 w-5" />
            <span className="font-semibold text-foreground">MeetGenius</span>
          </div>
          <p>© {new Date().getFullYear()} MeetGenius AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
