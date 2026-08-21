import logo from '../assets/logo.jpg'
import './Footer.css'

const exploreLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Villas', href: '#villas' },
  { label: 'Amenities', href: '#amenities' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 4h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3Z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M7.5 10v6.5M7.5 7.5v.01M12 16.5V13a2 2 0 0 1 4 0v3.5M12 12.8v3.7" />
      </svg>
    ),
  },
]

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src={logo} alt="MS Developers" className="footer-logo" />
          <p>
            Premium luxury villas in Mangaluru, built on verified quality, honest timelines and a
            genuine understanding of how families actually want to live.
          </p>
          <div className="footer-social">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} className="footer-social-link">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-links">
          <span className="footer-links-title">Explore</span>
          <ul>
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-contact">
          <span className="footer-links-title">Get in Touch</span>
          <ul>
            <li>Premise No. 206, Second Floor, Marian Paradise Plaza, Bunts Hostel Road, Mangalore DK</li>
            <li>
              <a href="tel:+919448456279">+91 94484 56279</a>
            </li>
            <li>
              <a href="tel:+918618050684">+91 86180 50684</a>
            </li>
            <li>
              <a href="tel:+917676361375">+91 76763 61375</a>
            </li>
            <li>
              <a href="mailto:hello@msdevelopers.in">hello@msdevelopers.in</a>
            </li>
            <li>10:00 AM – 6:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} MS Developers. All rights reserved.</p>
        <p>Managed by Yatharth</p>
      </div>
    </footer>
  )
}

export default Footer
