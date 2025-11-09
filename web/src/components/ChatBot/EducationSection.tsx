import { GraduationCap, Calendar } from 'lucide-react';
import type { EducationItem } from '../../types/chat';

interface EducationSectionProps {
  education?: EducationItem[];
}

export function EducationSection({ education }: EducationSectionProps) {
  if (!education || education.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
        <GraduationCap className="h-5 w-5" />
        <span>Education</span>
      </h2>

      <div className="space-y-4">
        {education.map((item, index) => (
          <article
            key={index}
            className="space-y-1 border-l-2 border-border pl-4"
          >
            <h3 className="font-semibold text-foreground">
              {item.degree}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {item.institution}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {item.startDate} - {item.endDate}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
