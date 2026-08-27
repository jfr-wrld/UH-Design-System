import type { Meta, StoryObj } from '@storybook/react';

import COVER from '../../../../packages/ui/src/components/PackageCard/fixtures/cover.svg';
import SCAN from '../../../../packages/ui/src/components/FileUpload/fixtures/scan.svg';

import { Page, Section, ValueText } from './shared.js';
import { A11ySection, Code, Do, DoDont, Dont } from './docs.js';

const meta = {
  title: 'Foundations/Imagery',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Rules: Story = {
  render: () => (
    <Page>
      <Section
        title="Purpose"
        hint="Photography is the fastest way to undo the whole direction, so the rules are strict. The weight of the journey is carried by restraint and precision - never by stacked Kaabah photography, gold gradients or ornamental borders. Respect looks like care, not decoration."
      >
        <div />
      </Section>

      <Section
        title="Placeholders never fabricate"
        hint="The two shipped fixtures state the policy: no invented photographs of pilgrims (a person who does not exist), no mock identity documents (a record that must never look real). Geometry that reads as architecture or a page is enough at thumbnail size; fixture colours are palette values living in the asset, because an image's own colours are not design tokens."
      >
        <div style={{ display: 'flex', gap: 'var(--uh-spacing-16)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-4)' }}>
            <img
              src={COVER}
              alt=""
              style={{ width: '240px', borderRadius: 'var(--uh-radius-image)', display: 'block' }}
            />
            <ValueText>cover fixture, 3:2</ValueText>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-4)' }}>
            <img
              src={SCAN}
              alt=""
              style={{ width: '96px', borderRadius: 'var(--uh-radius-image)', display: 'block' }}
            />
            <ValueText>document stand-in</ValueText>
          </div>
        </div>
      </Section>

      <Section
        title="Geometry"
        hint="Card media is 3:2 via aspect-ratio, cropped with object-fit: cover, cornered with radius.image, lazy-loaded, and backed by a flat fallback so a missing image is a designed state rather than a broken glyph. Horizontal cards give the image the media-split share (34%) of the row."
      >
        <DoDont>
          <Do title="cover-crop into a fixed ratio; the card owns the frame.">
            <div
              style={{
                aspectRatio: '3 / 2',
                overflow: 'hidden',
                borderRadius: 'var(--uh-radius-image)',
                background: 'var(--uh-color-bg-muted)',
              }}
            >
              <img
                src={COVER}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </Do>
          <Dont title="let the image dictate layout; contain leaves dead bars.">
            <div
              style={{
                aspectRatio: '3 / 2',
                overflow: 'hidden',
                borderRadius: 'var(--uh-radius-image)',
                background: 'var(--uh-color-bg-muted)',
              }}
            >
              <img
                src={SCAN}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </Dont>
        </DoDont>
      </Section>

      <Section title="Implementation">
        <Code>{`
.uh-package__media { aspect-ratio: 3 / 2; }
.uh-package__image {
  width: 100%; height: 100%;
  object-fit: cover;
}
<img src={cover} alt="" loading="lazy" />  /* decorative: the title says it */
        `}</Code>
      </Section>

      <A11ySection
        items={[
          'Decorative images take alt="" - the adjacent title already names the package; a caption that repeats it is noise twice.',
          "Informative images (review photos) take the reviewer's own alt text, falling back to a positional name.",
          'Text is never laid over an image without a scrim checked at the worst point.',
        ]}
      />
    </Page>
  ),
};
