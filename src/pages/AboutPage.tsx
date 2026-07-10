export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">About</h1>
      <p className="mb-4 text-text-secondary">
        Invoice Generator is a fully client-side application that lets you create professional invoices
        without signing up or sending your data anywhere.
      </p>
      <p className="text-text-secondary">
        All calculations, template rendering, and PDF generation happen in your browser.
        Your business and client data never leave your device.
      </p>
    </div>
  );
}
