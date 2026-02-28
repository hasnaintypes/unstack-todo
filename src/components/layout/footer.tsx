import { Github, Twitter, Linkedin } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold tracking-tight">
              Hasnain<span className="text-primary">.dev</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Building digital experiences with precision and passion. Open source contributor and
              full-stack explorer.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Project</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Showcase
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Source Code
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Hasnain. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="w-px h-4 bg-border hidden md:block" />
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
