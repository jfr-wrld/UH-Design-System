import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';

import {
  Alert,
  BookingStatusTracker,
  Button,
  Card,
  DateRangePicker,
  EmptyState,
  FileUpload,
  Input,
  Modal,
  NumberStepper,
  PhoneInput,
  PriceBreakdown,
  Radio,
  RadioGroup,
  Select,
  ToastProvider,
  useToast,
  type UploadFile,
} from '@umrahhaji/ui';
import { LOCALE_TAG, PRICE, type CurrencyCode, type Lang } from './fixtures.js';

/*
 * Fase 6 test screen - see FASE6-REPORT.md. No Tabs component; the three
 * steps are driven by plain state and BookingStatusTracker, which is exactly
 * what it is for. FileUpload's own internal progress bar is used rather
 * than wiring a second, separate ProgressBar next to it - see the report's
 * inconsistency section for why (FileUpload already renders progress and
 * duplicates ProgressBar internally; that is the finding, not a screen bug
 * to work around here).
 */

const STEP_LABEL: Record<Lang, string[]> = {
  en: ['Passenger Details', 'Documents', 'Review'],
  ms: ['Butiran Penumpang', 'Dokumen', 'Semakan'],
  id: ['Detail Penumpang', 'Dokumen', 'Tinjauan'],
};

const COPY: Record<
  Lang,
  {
    next: string;
    back: string;
    submit: string;
    fullName: string;
    passportNumber: string;
    nationality: string;
    phone: string;
    dob: string;
    uploadPassport: string;
    uploadHelper: string;
    documentAlert: string;
    payment: string;
    payFull: string;
    payDeposit: string;
    payInstallment: string;
    confirmTitle: string;
    confirmBody: string;
    confirmSubmit: string;
    confirmCancel: string;
    successTitle: string;
    successDesc: string;
    backHome: string;
    uploadedToast: string;
  }
> = {
  en: {
    next: 'Continue',
    back: 'Back',
    submit: 'Submit booking',
    fullName: 'Full name (as per passport)',
    passportNumber: 'Passport number',
    nationality: 'Nationality',
    phone: 'Phone number',
    dob: 'Travel dates',
    uploadPassport: 'Passport copy',
    uploadHelper: 'Clear photo or scan, JPG/PNG/PDF, up to 5 MB.',
    documentAlert: 'Passport copy is required for every passenger before you can submit.',
    payment: 'Payment plan',
    payFull: 'Pay in full',
    payDeposit: 'Deposit now, balance later',
    payInstallment: 'Monthly instalment',
    confirmTitle: 'Submit this booking?',
    confirmBody:
      'Please double check passenger names match the passport exactly before continuing.',
    confirmSubmit: 'Submit',
    confirmCancel: 'Review again',
    successTitle: 'Booking submitted',
    successDesc:
      'A confirmation has been sent to your email. Our team will verify your documents within 24 hours.',
    backHome: 'Back to homepage',
    uploadedToast: 'Passport copy uploaded.',
  },
  ms: {
    next: 'Teruskan',
    back: 'Kembali',
    submit: 'Hantar tempahan',
    fullName: 'Nama penuh (mengikut pasport)',
    passportNumber: 'Nombor pasport',
    nationality: 'Kewarganegaraan',
    phone: 'Nombor telefon',
    dob: 'Tarikh perjalanan',
    uploadPassport: 'Salinan pasport',
    uploadHelper: 'Gambar atau imbasan jelas, JPG/PNG/PDF, sehingga 5 MB.',
    documentAlert: 'Salinan pasport diperlukan untuk setiap penumpang sebelum anda boleh hantar.',
    payment: 'Pelan pembayaran',
    payFull: 'Bayar penuh',
    payDeposit: 'Deposit sekarang, baki kemudian',
    payInstallment: 'Ansuran bulanan',
    confirmTitle: 'Hantar tempahan ini?',
    confirmBody: 'Sila semak semula nama penumpang sepadan dengan pasport sebelum meneruskan.',
    confirmSubmit: 'Hantar',
    confirmCancel: 'Semak semula',
    successTitle: 'Tempahan dihantar',
    successDesc:
      'Pengesahan telah dihantar ke e-mel anda. Pasukan kami akan mengesahkan dokumen dalam masa 24 jam.',
    backHome: 'Kembali ke laman utama',
    uploadedToast: 'Salinan pasport dimuat naik.',
  },
  id: {
    next: 'Lanjutkan',
    back: 'Kembali',
    submit: 'Kirim pemesanan',
    fullName: 'Nama lengkap (sesuai paspor)',
    passportNumber: 'Nomor paspor',
    nationality: 'Kewarganegaraan',
    phone: 'Nomor telepon',
    dob: 'Tanggal perjalanan',
    uploadPassport: 'Salinan paspor',
    uploadHelper: 'Foto atau pindaian jelas, JPG/PNG/PDF, hingga 5 MB.',
    documentAlert: 'Salinan paspor wajib untuk setiap penumpang sebelum Anda dapat mengirim.',
    payment: 'Rencana pembayaran',
    payFull: 'Bayar penuh',
    payDeposit: 'Deposit sekarang, sisanya nanti',
    payInstallment: 'Cicilan bulanan',
    confirmTitle: 'Kirim pemesanan ini?',
    confirmBody: 'Mohon periksa kembali nama penumpang sudah sesuai paspor sebelum melanjutkan.',
    confirmSubmit: 'Kirim',
    confirmCancel: 'Tinjau lagi',
    successTitle: 'Pemesanan terkirim',
    successDesc:
      'Konfirmasi telah dikirim ke email Anda. Tim kami akan memverifikasi dokumen dalam 24 jam.',
    backHome: 'Kembali ke beranda',
    uploadedToast: 'Salinan paspor terunggah.',
  },
};

interface ScreenProps {
  lang: Lang;
  currency: CurrencyCode;
  theme?: 'light' | 'dark';
  mobile?: boolean;
  initialStep?: number;
  success?: boolean;
}

function CheckoutForm({
  lang,
  currency,
  theme = 'light',
  mobile = false,
  initialStep = 0,
  success = false,
}: ScreenProps) {
  const toast = useToast();
  const [step, setStep] = useState(initialStep);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(success);
  const t = COPY[lang];
  const locale = LOCALE_TAG[lang];
  const price = PRICE[currency];

  const surface: CSSProperties = {
    background: 'var(--uh-color-bg-canvas)',
    color: 'var(--uh-color-text-primary)',
    minHeight: '100vh',
  };

  function handleUpload(uploaded: File[]) {
    const next: UploadFile[] = uploaded.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      type: f.type,
      status: 'success',
      progress: 100,
    }));
    setFiles((current) => [...current, ...next]);
    toast.success(t.uploadedToast);
  }

  const priceItems = [
    { label: 'Adults', amount: price.base, type: 'base' as const, quantity: 2 },
    { label: 'Visa processing', amount: Math.round(price.base * 0.08), type: 'fee' as const },
    {
      label: 'Total',
      amount: price.base * 2 + Math.round(price.base * 0.08),
      type: 'total' as const,
    },
  ];

  const priceBlock = (
    <PriceBreakdown
      variant="card"
      currency={currency}
      locale={locale}
      passengers={{ adults: 2, children: 0, infants: 0 }}
      items={priceItems}
    />
  );

  if (submitted) {
    return (
      <div
        data-theme={theme}
        lang={lang}
        style={surface}
        className="flex flex-col items-center justify-center p-24"
      >
        <EmptyState
          title={t.successTitle}
          description={t.successDesc}
          action={{ label: t.backHome, onClick: () => {} }}
        />
      </div>
    );
  }

  return (
    <div data-theme={theme} lang={lang} style={surface} className="flex flex-col gap-24 p-24">
      <BookingStatusTracker
        steps={STEP_LABEL[lang].map((label) => ({ label }))}
        currentStep={step}
        variant={mobile ? 'vertical' : 'horizontal'}
        locale={locale}
      />

      <div
        className={
          mobile ? 'flex flex-col gap-24' : 'grid grid-cols-[1fr_var(--uh-size-rail-lg)] gap-24'
        }
      >
        {/*
         * min-width: 0 on the grid item, not the grid track - a 1fr column's
         * implicit min-width is its content's min-content size, not 0, so a
         * wide-enough form (DateRangePicker + PhoneInput here) grows the
         * column past its fair share and pushes the 360px aside off the
         * right edge. Found at exactly 768px, the one width narrow enough to
         * expose it and wide enough that Tablet768 renders the two-column
         * layout rather than the mobile stack.
         */}
        <div style={{ minWidth: 0 }}>
          <Card padding="lg">
            {step === 0 ? (
              <div className="flex flex-col gap-16">
                <Input label={t.fullName} placeholder="Ahmad bin Ismail" />
                <Input label={t.passportNumber} placeholder="A12345678" />
                <Select
                  label={t.nationality}
                  options={[
                    { value: 'my', label: 'Malaysia' },
                    { value: 'id', label: 'Indonesia' },
                    { value: 'sg', label: 'Singapore' },
                  ]}
                />
                <PhoneInput label={t.phone} />
                <DateRangePicker label={t.dob} locale={locale} />
                <NumberStepper
                  label={
                    lang === 'en'
                      ? 'Rooms needed'
                      : lang === 'ms'
                        ? 'Bilik diperlukan'
                        : 'Kamar diperlukan'
                  }
                  defaultValue={1}
                  min={1}
                  max={5}
                />
              </div>
            ) : null}

            {step === 1 ? (
              <div className="flex flex-col gap-16">
                <Alert variant="warning" title={t.documentAlert} />
                <FileUpload
                  label={t.uploadPassport}
                  helperText={t.uploadHelper}
                  accept="image/jpeg,image/png,application/pdf"
                  maxSize={5 * 1024 * 1024}
                  value={files}
                  onUpload={handleUpload}
                  onRemove={(id) => setFiles((current) => current.filter((f) => f.id !== id))}
                  locale={locale}
                />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="flex flex-col gap-16">
                <RadioGroup label={t.payment} name="payment" defaultValue="full">
                  <Radio value="full" label={t.payFull} />
                  <Radio value="deposit" label={t.payDeposit} />
                  <Radio value="installment" label={t.payInstallment} />
                </RadioGroup>
                {mobile ? priceBlock : null}
              </div>
            ) : null}

            <div className="flex justify-between pt-16">
              {step > 0 ? (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                  {t.back}
                </Button>
              ) : (
                <span />
              )}
              {step < 2 ? (
                <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
                  {t.next}
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setConfirmOpen(true)}>
                  {t.submit}
                </Button>
              )}
            </div>
          </Card>
        </div>

        {!mobile ? <aside>{priceBlock}</aside> : null}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t.confirmTitle}
        description={t.confirmBody}
        variant="confirmation"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t.confirmCancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setConfirmOpen(false);
                setSubmitted(true);
              }}
            >
              {t.confirmSubmit}
            </Button>
          </>
        }
      />
    </div>
  );
}

function CheckoutScreen(props: ScreenProps) {
  return (
    <ToastProvider position="bottom-center">
      <CheckoutForm {...props} />
    </ToastProvider>
  );
}

const meta = {
  title: 'Patterns/Checkout',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Desktop1440: Story = {
  render: () => <CheckoutScreen lang="en" currency="MYR" />,
};

export const Mobile360: Story = {
  render: () => <CheckoutScreen lang="en" currency="MYR" mobile />,
};

export const Tablet768: Story = {
  render: () => <CheckoutScreen lang="en" currency="MYR" />,
};

export const DarkMode1440: Story = {
  render: () => <CheckoutScreen lang="en" currency="MYR" theme="dark" />,
};

export const LocaleMs360: Story = {
  render: () => <CheckoutScreen lang="ms" currency="MYR" mobile />,
};

export const LocaleMs1440: Story = {
  render: () => <CheckoutScreen lang="ms" currency="MYR" />,
};

export const LocaleId360: Story = {
  render: () => <CheckoutScreen lang="id" currency="MYR" mobile />,
};

export const LocaleId1440: Story = {
  render: () => <CheckoutScreen lang="id" currency="MYR" />,
};

export const CurrencyIDR360: Story = {
  render: () => <CheckoutScreen lang="id" currency="IDR" mobile />,
};

export const CurrencyIDR1440: Story = {
  render: () => <CheckoutScreen lang="id" currency="IDR" />,
};

export const DocumentsStep: Story = {
  render: () => <CheckoutScreen lang="en" currency="MYR" initialStep={1} />,
};

export const ReviewStep: Story = {
  render: () => <CheckoutScreen lang="en" currency="MYR" initialStep={2} />,
};

export const SuccessState: Story = {
  render: () => <CheckoutScreen lang="en" currency="MYR" success />,
};
