export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Hire trusted fundis. Pay safely with escrow.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
          FundiGuard.ke is a marketplace for clients and verified pros. Post a job, receive bids, and pay securely.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/browse"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Browse Jobs
          </a>
          <a
            href="/post-job"
            className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium"
          >
            Post a Job
          </a>
        </div>
      </main>
    </div>
  );
}
