import { useMemo } from 'react';
import { useAppStore } from '@/store';
import { getAttributesByPassportId } from '@/data/passportAttributes';
import { filterByRole } from '@/lib/permissions';
import type { PassportAttribute, PassportSection } from '@/types';

export interface PassportAttributeSection {
  section: PassportSection;
  attributes: PassportAttribute[];
}

/**
 * Typed selector hook for passport attributes.
 * Filters attributes by the current user's role into visible and restricted sets,
 * and groups visible attributes by section.
 */
export function usePassportAttributes(passportId: string) {
  const currentRole = useAppStore((s) => s.currentRole);

  const allAttributes = useMemo(() => {
    return getAttributesByPassportId(passportId);
  }, [passportId]);

  const { visible, restricted } = useMemo(() => {
    return filterByRole(allAttributes, currentRole);
  }, [allAttributes, currentRole]);

  const sections: PassportAttributeSection[] = useMemo(() => {
    const sectionMap = new Map<PassportSection, PassportAttribute[]>();
    for (const attr of visible) {
      const existing = sectionMap.get(attr.section);
      if (existing) {
        existing.push(attr);
      } else {
        sectionMap.set(attr.section, [attr]);
      }
    }
    return Array.from(sectionMap.entries()).map(([section, attributes]) => ({
      section,
      attributes,
    }));
  }, [visible]);

  return {
    visible,
    restricted,
    sections,
    totalCount: allAttributes.length,
  };
}
