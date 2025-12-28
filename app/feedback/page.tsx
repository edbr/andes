import { submitFeedback } from "./submit-feedback";

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-andes-surface text-foreground">
      <section className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-3xl font-semibold tracking-tight">
          Share feedback
        </h1>

        <p className="mt-4 max-w-xl text-muted-foreground">
          AndesMap is evolving. A short note about what you find useful, missing,
          or confusing is far more valuable than a feature request list.
        </p>

        <form
          action={submitFeedback}
          className="mt-10 space-y-6"
        >
          {/* Email (optional but useful) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your email (optional)
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="w-full rounded-md border border-andes-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-andes-primary"
            />
          </div>

          {/* Use case */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What are you trying to use AndesMap for?
            </label>
            <select
              name="useCase"
              className="w-full rounded-md border border-andes-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-andes-primary"
              required
            >
              <option value="">Select one</option>
              <option value="objective-planning">Objective planning</option>
              <option value="access-logistics">Access & logistics</option>
              <option value="exploration">Exploration</option>
              <option value="research">Research / curiosity</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What’s working, missing, or unclear?
            </label>
            <textarea
              name="message"
              rows={6}
              placeholder="Short and honest is perfect."
              className="w-full rounded-md border border-andes-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-andes-primary"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-andes-primary px-6 py-3 text-sm font-medium text-andes-primary-foreground hover:bg-andes-primary/90"
            >
              Send feedback
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
