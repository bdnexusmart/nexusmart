const Footer = () => (
  <footer className="mt-24 border-t border-border bg-surface">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
      <div className="col-span-2 md:col-span-1">
        <div className="font-display text-lg font-bold text-ink mb-2">
          Nexus<span className="text-accent">Mart</span>
        </div>
        <p className="text-ink-muted">One marketplace, hundreds of independent vendors.</p>
      </div>
      <div>
        <h4 className="font-semibold text-ink mb-3">Shop</h4>
        <ul className="space-y-2 text-ink-muted"><li>All products</li><li>Vendors</li><li>Deals</li></ul>
      </div>
      <div>
        <h4 className="font-semibold text-ink mb-3">Sell</h4>
        <ul className="space-y-2 text-ink-muted"><li>Become a vendor</li><li>Vendor dashboard</li><li>Seller policies</li></ul>
      </div>
      <div>
        <h4 className="font-semibold text-ink mb-3">Company</h4>
        <ul className="space-y-2 text-ink-muted"><li>About Nexus Mart</li><li>Support</li><li>Terms &amp; privacy</li></ul>
      </div>
    </div>
    <div className="border-t border-border py-4 text-center text-xs text-ink-muted">
      © {new Date().getFullYear()} Nexus Mart. All rights reserved.
    </div>
  </footer>
);

export default Footer;
