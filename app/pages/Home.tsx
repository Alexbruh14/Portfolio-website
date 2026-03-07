import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SpotlightCard } from "../components/SpotlightCard";

export default function Home() {
  function scrollToContact() {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div>

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] overflow-hidden flex items-center border-b border-border">

        {/* Background image — full bleed */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1600178572204-6ac8886aae63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzIxOTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Portrait"
            className="w-full h-full object-cover object-right"
          />
        </div>

        {/* Gradient overlay: dark on left where text lives, dissolves toward image focus on right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, #0f0c18 0%, #0f0c18 30%, rgba(15,12,24,0.85) 50%, rgba(15,12,24,0.3) 72%, transparent 100%)",
          }}
        />

        {/* Content sits in the dark zone */}
        <div className="relative z-10 w-full py-24">
          <div className="max-w-6xl mx-auto px-8">
            <div className="max-w-lg">

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-px w-8 bg-secondary/40" />
                  <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">
                    Graduate Student
                  </span>
                </div>

                <h1 className="mb-6 text-foreground" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800 }}>Alex<br />Herrera</h1>

                <div className="w-16 h-px bg-secondary mb-6" />

                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                  Politics & Legal Studies — specializing in constitutional theory,
                  judicial interpretation, and the foundations of democratic governance.
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={scrollToContact}
                    className="px-6 py-3 bg-secondary text-secondary-foreground text-xs font-semibold uppercase tracking-widest hover:bg-secondary/90 transition-colors"
                  >
                    Get in touch
                  </button>
                  <a
                    href="https://www.linkedin.com/in/steven-herrera-57240b3a7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 border border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    LinkedIn ↗
                  </a>
                </div>
              </motion.div>

            </div>
          </div>
        </div>

      </section>

      {/* ── Introduction ── */}
      <section className="py-28 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            className="grid md:grid-cols-12 gap-12"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="md:col-span-3">
              <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Introduction</span>
            </div>
            <div className="md:col-span-9 space-y-5 text-muted-foreground text-lg">
              <p>
                Welcome to my scholarly portfolio. I am a graduate student specializing in Politics
                and Legal Studies, with particular interests in constitutional theory, judicial
                interpretation, and the philosophical underpinnings of democratic governance.
              </p>
              <p>
                My work examines the intersection of political philosophy and legal doctrine, seeking
                to understand how theoretical frameworks inform practical questions of law and policy.
              </p>
              <p>
                Through rigorous analysis and careful argumentation, I explore the tensions between
                individual liberty and collective governance, between constitutional stability and
                democratic responsiveness.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Areas of Inquiry ── */}
      <section className="py-28 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-8">
          <div className="mb-16">
            <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Research</span>
            <h2 className="mt-3 text-foreground">Areas of Inquiry</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-border">
            {[
              {
                num: "01",
                title: "Constitutional Theory & Judicial Review",
                body: "Examining the theoretical foundations of constitutional interpretation, the role of judicial review in democratic systems, and the evolving doctrine of constitutional rights and limitations.",
              },
              {
                num: "02",
                title: "Political Philosophy & Democratic Theory",
                body: "Investigating classical and contemporary theories of democracy, justice, and political obligation, with attention to the relationship between philosophical ideals and institutional realities.",
              },
              {
                num: "03",
                title: "Civil Liberties & Individual Rights",
                body: "Analyzing the legal and philosophical dimensions of civil rights, focusing on the balance between individual freedoms and legitimate governmental authority in contemporary contexts.",
              },
            ].map((area, i) => (
              <motion.div
                key={area.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.12 }}
              >
                <SpotlightCard className="bg-card p-10 group h-full">
                  <span className="text-4xl font-light text-secondary/40 block mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {area.num}
                  </span>
                  <h3 className="mb-4 text-foreground">{area.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{area.body}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scholarly Aims ── */}
      <section className="py-28 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            className="grid md:grid-cols-2 gap-20 items-start"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >

            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Research</span>
              <h2 className="mt-3 mb-12 text-foreground">Scholarly Aims</h2>

              <div className="space-y-10">
                {[
                  {
                    title: "Current Research",
                    body: "Completing a doctoral dissertation examining the role of precedent in common law systems, with particular attention to how judicial reasoning accommodates both stability and change.",
                  },
                  {
                    title: "Academic Aspirations",
                    body: "Aspiring to contribute to academic discourse through peer-reviewed publications and to teach at the university level, fostering scholars committed to understanding law and politics in full complexity.",
                  },
                  {
                    title: "Long-Term Vision",
                    body: "Contributing to a deeper public understanding of constitutional governance and the philosophical principles that sustain free societies.",
                  },
                ].map((aim) => (
                  <div key={aim.title} className="flex gap-6">
                    <div className="w-px bg-secondary/40 shrink-0 mt-1" />
                    <div>
                      <h3 className="mb-2 text-foreground">{aim.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{aim.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-secondary/20" />
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1639414839192-0562f4065ffd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbGlicmFyeSUyMGJvb2tzfGVufDF8fHx8MTc3MjQzMTk2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Library books"
                  className="w-full aspect-[4/3] object-cover brightness-75"
                />
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-28 bg-background">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-3">
              <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Contact</span>
              <h2 className="mt-3 text-foreground">Get in Touch</h2>
            </div>

            <div className="md:col-span-9">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  {[
                    { label: "Email", value: "your.email@university.edu", href: "mailto:your.email@university.edu" },
                    { label: "LinkedIn", value: "linkedin.com/in/profile", href: "https://www.linkedin.com/in/steven-herrera-57240b3a7" },
                  ].map(({ label, value, href }) => (
                    <div key={label} className="group border-b border-border pb-6">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">{label}</p>
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-secondary transition-colors"
                      >
                        {value}
                      </a>
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <div className="overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1631599143424-5bc234fbebf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcyMzYxMzIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="University campus"
                      className="w-full aspect-video object-cover brightness-75"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
