"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Quote, Star } from "lucide-react"
import { motion, useAnimation, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar: string
}

export interface AnimatedTestimonialsProps {
  title?: string
  subtitle?: string
  badgeText?: React.ReactNode
  testimonials?: Testimonial[]
  autoRotateInterval?: number
  trustedCompanies?: string[]
  trustedCompaniesTitle?: string
  className?: string
  isDark?: boolean
}

export function AnimatedTestimonials({
  title = "Loved by the community",
  subtitle = "Don't just take our word for it. See what developers and companies have to say about our starter template.",
  badgeText,
  testimonials = [],
  autoRotateInterval = 6000,
  trustedCompanies = [],
  trustedCompaniesTitle = "Trusted by developers from companies worldwide",
  className,
  isDark = false,
}: AnimatedTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Refs for scroll animations
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const controls = useAnimation()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  }

  // Trigger animations when section comes into view
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  // Auto rotate testimonials
  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [autoRotateInterval, testimonials.length])

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section ref={sectionRef} id="testimonials" className={`py-16 md:py-20 overflow-hidden ${className || "bg-muted/30"}`}>
      <div className="px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="grid grid-cols-1 gap-8 md:gap-12 lg:gap-16 w-full md:grid-cols-2 max-w-5xl mx-auto"
        >
          {/* Left side: Heading and navigation */}
          <motion.div variants={itemVariants} className="flex flex-col justify-center max-w-md md:ml-auto w-full">
            <div className="space-y-6">
              {badgeText && (
                typeof badgeText === 'string' ? (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary'}`}>
                    <Star className={`mr-1 h-3.5 w-3.5 ${isDark ? 'fill-white' : 'fill-primary'}`} />
                    <span>{badgeText}</span>
                  </div>
                ) : (
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${isDark ? 'bg-white/10 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm'}`}>
                    {badgeText}
                  </div>
                )
              )}

              <h2 className={`text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl ${isDark ? 'text-white' : ''}`}>{title}</h2>

              <p className={`max-w-[600px] md:text-xl/relaxed ${isDark ? 'text-white/80' : 'text-muted-foreground'}`}>{subtitle}</p>

              <div className="flex items-center gap-3 pt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeIndex === index ? "w-10 bg-primary" : "w-2.5 bg-muted-foreground/30"
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right side: Testimonial cards */}
          <motion.div variants={itemVariants} className="relative h-full min-h-[300px] md:min-h-[400px] max-w-md w-full">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 100 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  x: activeIndex === index ? 0 : 100,
                  scale: activeIndex === index ? 1 : 0.9,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ zIndex: activeIndex === index ? 10 : 0 }}
              >
                <div className="bg-card border shadow-lg rounded-xl p-8 h-full flex flex-col">
                  <div className="mb-6 flex gap-2">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      ))}
                  </div>

                  <div className="relative mb-6 flex-1">
                    <Quote className="absolute -top-3 -left-3 h-8 w-8 text-primary/20 rotate-180 z-0" />
                    <p className="relative z-10 pl-6 text-lg font-medium leading-relaxed">"{testimonial.content}"</p>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-xl bg-primary/5"></div>
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-xl bg-primary/5"></div>
          </motion.div>
        </motion.div>

        {/* Logo cloud */}
        {trustedCompanies.length > 0 && (
          <motion.div variants={itemVariants} initial="hidden" animate={controls} className="mt-24 text-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-8">{trustedCompaniesTitle}</h3>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
              {trustedCompanies.map((company) => (
                <div key={company} className="text-2xl font-semibold text-muted-foreground/50">
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
