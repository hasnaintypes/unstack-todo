import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Testimonials() {
  return (
    <section className="py-16 md:py-32 bg-background">
      <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center md:space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Testimonials</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight lg:text-5xl text-foreground">
            Loved by thousands of productive teams
          </h2>
          <p className="text-lg text-muted-foreground">
            See how Unstack helps teams and individuals stay organized and accomplish more every
            day.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
          <Card className="grid grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2 bg-card border-border shadow-lg">
            <CardHeader>
              <div className="text-2xl font-bold text-primary">⭐⭐⭐⭐⭐</div>
            </CardHeader>
            <CardContent>
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-xl font-medium text-foreground leading-relaxed">
                  Unstack has completely transformed how our team manages projects. The intuitive
                  interface and AI-powered features save us hours every week. We've increased our
                  productivity by 40% since switching. The task organization is seamless, and the
                  collaboration tools keep everyone on the same page.
                </p>

                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                      alt="Sarah Mitchell"
                      height="400"
                      width="400"
                      loading="lazy"
                    />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>

                  <div>
                    <cite className="text-sm font-medium text-foreground">Sarah Mitchell</cite>
                    <span className="text-muted-foreground block text-sm">
                      Product Manager, TechCorp
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>
          <Card className="md:col-span-2 bg-card border-border shadow-lg">
            <CardContent className="h-full pt-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-lg font-medium text-foreground leading-relaxed">
                  The AI task generation is a game-changer! I just describe what I need to do, and
                  Unstack breaks it down into actionable steps. No more feeling overwhelmed by large
                  projects.
                </p>

                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
                      alt="Michael Chen"
                      height="400"
                      width="400"
                      loading="lazy"
                    />
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="text-sm font-medium text-foreground">Michael Chen</cite>
                    <span className="text-muted-foreground block text-sm">Freelance Developer</span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-lg">
            <CardContent className="h-full pt-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-foreground leading-relaxed">
                  Clean interface, powerful features. Unstack strikes the perfect balance between
                  simplicity and functionality. Best todo app I've used!
                </p>

                <div className="grid items-center gap-3 [grid-template-columns:auto_1fr]">
                  <Avatar className="size-12">
                    <AvatarImage
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
                      alt="Emma Rodriguez"
                      height="400"
                      width="400"
                      loading="lazy"
                    />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="text-sm font-medium text-foreground">Emma Rodriguez</cite>
                    <span className="text-muted-foreground block text-sm">UX Designer</span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-lg">
            <CardContent className="h-full pt-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-foreground leading-relaxed">
                  The priority support is amazing! Quick responses and genuinely helpful. Unstack
                  feels like it was built specifically for our workflow.
                </p>

                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <Avatar className="size-12">
                    <AvatarImage
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=James"
                      alt="James Wilson"
                      height="400"
                      width="400"
                      loading="lazy"
                    />
                    <AvatarFallback>JW</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">James Wilson</p>
                    <span className="text-muted-foreground block text-sm">Startup Founder</span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
