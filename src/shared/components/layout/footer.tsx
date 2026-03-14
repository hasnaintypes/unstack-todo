import { Github, Linkedin, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ModeToggle } from "@/shared/components/mode-toggle";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold tracking-tight">
              Unstack<span className="text-primary"> Todo</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              A modern task management app built for speed and simplicity. Organize your work, stay
              focused, and get things done.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/hasnaintypes/unstack-todo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com/in/hasnainx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:hasnainoffice2024@gmail.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/features" className="hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/auth/sign-in" className="hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {currentYear} Unstack Todo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="w-px h-4 bg-border hidden md:block" />
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
