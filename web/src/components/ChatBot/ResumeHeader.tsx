import { Mail, Phone, Github, Globe, Linkedin, MapPin, Plane } from 'lucide-react';
import type { ResumeData } from '../../types/chat';

interface ResumeHeaderProps {
  resume: ResumeData;
}

export function ResumeHeader({ resume }: ResumeHeaderProps) {
  const fullName = `${resume.firstName} ${resume.lastName}`;

  return (
    <header className="space-y-4">
      {/* Name */}
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">
        {fullName}
      </h1>

      {/* Contact Info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <a
          href={`mailto:${resume.email}`}
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <Mail className="h-4 w-4" />
          <span>{resume.email}</span>
        </a>

        <a
          href={`tel:${resume.phone}`}
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <Phone className="h-4 w-4" />
          <span>{resume.phone}</span>
        </a>
      </div>

      {/* Links */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {resume.github && (
          <a
            href={resume.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        )}

        {resume.website && (
          <a
            href={resume.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <Globe className="h-4 w-4" />
            <span>Website</span>
          </a>
        )}

        {resume.linkedin && (
          <a
            href={resume.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <Linkedin className="h-4 w-4" />
            <span>LinkedIn</span>
          </a>
        )}
      </div>

      {/* Additional Info */}
      {(resume.visaStatus || resume.preferredLocations || resume.openToRemote) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {resume.visaStatus && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">Visa:</span>
              <span>{resume.visaStatus}</span>
            </div>
          )}

          {resume.preferredLocations && resume.preferredLocations.length > 0 && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{resume.preferredLocations.join(', ')}</span>
            </div>
          )}

          {resume.openToRemote && (
            <div className="flex items-center gap-1.5">
              <Plane className="h-4 w-4" />
              <span>Open to Remote</span>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {resume.summary && (
        <p className="text-sm leading-relaxed text-foreground">
          {resume.summary}
        </p>
      )}
    </header>
  );
}
