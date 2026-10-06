import { career } from "@/data/career"
import { Section } from "./Section"

/** Each job is laid out like a room in a text adventure, with plain labels: Stack and Links. */
export function Career() {
  return (
    <Section id="career" title="Career">
      <div className="grid gap-x-16 gap-y-16 lg:grid-cols-2">
        {career.map((entry) => (
          <article key={entry.id} className="min-w-0 lg:even:border-l-2 lg:even:border-rule lg:even:pl-16">
            <h3 className="text-[32px] leading-10 text-amber">~ {entry.name} ~</h3>
            <p className="mt-4 text-cream">{entry.title}</p>
            <p className="text-dim">
              {entry.period}
              <br />
              {entry.place}
            </p>

            <div className="mt-6 flex max-w-[65ch] flex-col gap-4 text-cream">
              {entry.achievements.map((achievement) => (
                <p key={achievement}>{achievement}</p>
              ))}
            </div>

            {entry.stack.length > 0 && (
              <p className="mt-6 text-tan">
                <span className="text-dim">Stack:</span> {entry.stack.join(", ")}
              </p>
            )}
            <p className={entry.stack.length > 0 ? "text-dim" : "mt-6 text-dim"}>
              Links:{" "}
              {entry.exits.map((exit, i) => (
                <span key={exit.href}>
                  {i > 0 && ", "}
                  <a href={exit.href} target="_blank" rel="noopener" className="link">
                    {exit.label}
                  </a>
                </span>
              ))}
            </p>
          </article>
        ))}
      </div>
    </Section>
  )
}
