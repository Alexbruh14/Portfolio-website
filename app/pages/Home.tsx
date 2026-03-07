import { motion } from "motion/react";
import { EditableImage } from "../components/admin/EditableImage";
import { SpotlightCard } from "../components/SpotlightCard";
import { EditableText } from "../components/admin/EditableText";
import { AdminToolbar } from "../components/admin/AdminToolbar";
import { useSiteContent } from "../contexts/SiteContentContext";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { get } = useSiteContent();
  const { user } = useAuth();

  function scrollToContact() {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  const areas = [
    { num: "01", titleKey: "area_1_title", bodyKey: "area_1_body" },
    { num: "02", titleKey: "area_2_title", bodyKey: "area_2_body" },
    { num: "03", titleKey: "area_3_title", bodyKey: "area_3_body" },
  ];

  const aims = [
    { titleKey: "aim_1_title", bodyKey: "aim_1_body" },
    { titleKey: "aim_2_title", bodyKey: "aim_2_body" },
    { titleKey: "aim_3_title", bodyKey: "aim_3_body" },
  ];

  return (
    <div className={user ? "pb-14" : ""}>

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] overflow-hidden flex items-center border-b border-border">

        <div className="absolute inset-0">
          <EditableImage
            contentKey="hero_image"
            defaultUrl="https://images.unsplash.com/photo-1600178572204-6ac8886aae63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzIxOTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Portrait"
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, #0f0c18 0%, #0f0c18 30%, rgba(15,12,24,0.85) 50%, rgba(15,12,24,0.3) 72%, transparent 100%)",
          }}
        />

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
                  <EditableText
                    contentKey="hero_label"
                    inputType="text"
                    render={v => (
                      <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">{v}</span>
                    )}
                  />
                </div>

                <EditableText
                  contentKey="hero_name"
                  inputType="text"
                  render={v => (
                    <h1 className="mb-6 text-foreground" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800 }}>
                      {v.includes(" ") ? <>{v.split(" ")[0]}<br />{v.split(" ").slice(1).join(" ")}</> : v}
                    </h1>
                  )}
                />

                <div className="w-16 h-px bg-secondary mb-6" />

                <EditableText
                  contentKey="hero_description"
                  render={v => (
                    <p className="text-lg text-muted-foreground mb-10 leading-relaxed">{v}</p>
                  )}
                />

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
              {(["intro_p1", "intro_p2", "intro_p3"] as const).map(key => (
                <EditableText
                  key={key}
                  contentKey={key}
                  render={v => <p>{v}</p>}
                />
              ))}
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
            {areas.map((area, i) => (
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
                  <EditableText
                    contentKey={area.titleKey}
                    inputType="text"
                    render={v => <h3 className="mb-4 text-foreground">{v}</h3>}
                  />
                  <EditableText
                    contentKey={area.bodyKey}
                    render={v => <p className="text-sm text-muted-foreground leading-relaxed">{v}</p>}
                  />
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
                {aims.map(aim => (
                  <div key={aim.titleKey} className="flex gap-6">
                    <div className="w-px bg-secondary/40 shrink-0 mt-1" />
                    <div>
                      <EditableText
                        contentKey={aim.titleKey}
                        inputType="text"
                        render={v => <h3 className="mb-2 text-foreground">{v}</h3>}
                      />
                      <EditableText
                        contentKey={aim.bodyKey}
                        render={v => <p className="text-sm text-muted-foreground leading-relaxed">{v}</p>}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-secondary/20" />
              <div className="relative overflow-hidden">
                <EditableImage
                  contentKey="aims_image"
                  defaultUrl="https://images.unsplash.com/photo-1639414839192-0562f4065ffd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbGlicmFyeSUyMGJvb2tzfGVufDF8fHx8MTc3MjQzMTk2M3ww&ixlib=rb-4.1.0&q=80&w=1080"
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
                  <div className="group border-b border-border pb-6">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">Email</p>
                    <EditableText
                      contentKey="contact_email"
                      inputType="text"
                      render={v => (
                        <a href={`mailto:${v}`} className="text-foreground hover:text-secondary transition-colors">{v}</a>
                      )}
                    />
                  </div>
                  <div className="group border-b border-border pb-6">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">LinkedIn</p>
                    <a
                      href="https://www.linkedin.com/in/steven-herrera-57240b3a7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-secondary transition-colors"
                    >
                      linkedin.com/in/profile
                    </a>
                  </div>
                </div>

                <div className="relative">
                  <div className="overflow-hidden">
                    <EditableImage
                      contentKey="contact_image"
                      defaultUrl="https://images.unsplash.com/photo-1631599143424-5bc234fbebf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcyMzYxMzIwfDA&ixlib=rb-4.1.0&q=80&w=1080"
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

      <AdminToolbar />
    </div>
  );
}
