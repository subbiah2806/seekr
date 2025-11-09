import { Briefcase, MapPin, Calendar } from 'lucide-react';
import type { ExperienceItem } from '../../types/chat';

interface ExperienceSectionProps {
  experience?: ExperienceItem[];
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  if (!experience || experience.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
        <Briefcase className="h-5 w-5" />
        <span>Experience</span>
      </h2>

      <div className="space-y-6">
        {experience.map((item, index) => (
          <article
            key={index}
            className="space-y-2 border-l-2 border-border pl-4"
          >
            {/* Company & Position */}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                {item.position}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {item.company}
                </span>
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {item.startDate} - {item.endDate}
                </span>
              </div>
            </div>

            {/* Company Description */}
            {item.companyDescription && (
              <p className="text-xs italic text-muted-foreground">
                {item.companyDescription}
              </p>
            )}

            {/* Achievements */}
            {item.achievements && item.achievements.length > 0 && (
              <ul className="space-y-1.5 text-sm text-foreground">
                {item.achievements.map((achievement, achIndex) => (
                  <li key={achIndex} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span className="flex-1">{achievement}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
