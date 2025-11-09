import { Code } from 'lucide-react';
import { Badge } from '@subbiah/reusable/components/ui/badge';
import type { ResumeData } from '../../types/chat';

interface SkillsSectionProps {
  skills: ResumeData['skills'];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const skillCategories = Object.entries(skills || {});

  if (skillCategories.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
        <Code className="h-5 w-5" />
        <span>Skills</span>
      </h2>

      <div className="space-y-3">
        {skillCategories.map(([category, skillList]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillList.map((skill, index) => (
                <Badge
                  key={index}
                  variant="primary"
                  className="bg-primary/10 text-primary"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
