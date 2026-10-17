import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Quote } from "lucide-react";
import { Logo } from "@/components/ui/ReusableComponents";

interface AuthShellProps {
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-muted flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl rounded-3xl bg-card p-2 shadow-2xl ring-1 ring-border flex flex-col md:flex-row">
        <section className="flex-1 rounded-2xl bg-background px-6 py-8 sm:px-10 md:py-10 flex flex-col">
          <Link
            href="/"
            className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>

          <div className="mx-auto w-full max-w-sm flex flex-col gap-6 pt-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <Link href="/" aria-label="Seltra home" className="-my-4">
                <Logo />
              </Link>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary text-balance">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground text-pretty">
                {subtitle}
              </p>
            </div>
            {children}
          </div>
        </section>

        <aside className="relative hidden md:flex md:w-[44%] overflow-hidden rounded-2xl">
          <Image
            src="/images/auth-panel.png"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 460px, 0px"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"
            aria-hidden="true"
          />
          <div className="relative mt-auto flex flex-col gap-3 p-8 lg:p-10 text-primary-foreground">
            <Quote className="h-6 w-6 text-accent" aria-hidden="true" />
            <p className="text-lg font-medium leading-relaxed text-pretty">
              Turn your audience into income. Seltra connects brands with
              publishers who get real results.
            </p>
            <p className="text-sm text-primary-foreground/70">
              Advertise smarter. Earn from every post.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export function AuthField({
  icon,
  children,
  trailing,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <span className="pointer-events-none absolute left-3 text-muted-foreground">
        {icon}
      </span>
      {children}
      {trailing && <span className="absolute right-1">{trailing}</span>}
    </div>
  );
}

export const authInputClass =
  "h-11 rounded-xl bg-muted/60 border-border pl-10 pr-10 focus-visible:ring-accent";
