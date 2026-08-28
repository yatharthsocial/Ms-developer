import logo from '../assets/logo.jpg'
import { scrollToSection } from '../utils/scrollToSection'
import './Footer.css'

const exploreLinks = [
  { label: 'Home', id: 'home' },
  { label: 'About Us', id: 'about' },
  { label: 'Villas', id: 'villas' },
  { label: 'Amenities', id: 'amenities' },
  { label: 'Gallery', id: 'gallery' },
  { label: 'Contact', id: 'contact' },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/msdevelopersmangalore?igsi=MWdkZGpsMGVqMGI3',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/919448456279',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a9 9 0 0 0-7.75 13.5L3 21l4.6-1.21A9 9 0 1 0 12 3Z" />
        <path
          d="M8.5 8.5c0-.5.4-1 1-1h.7c.3 0 .5.2.6.4l.6 1.4c.1.3 0 .6-.2.8l-.5.5c.5 1.1 1.4 2 2.5 2.5l.5-.5c.2-.2.5-.3.8-.2l1.4.6c.3.1.4.4.4.6v.8c0 .6-.5 1-1 1-3.6 0-6.5-2.9-6.5-6.5Z"
          fill="currentColor"
          stroke="none"
        />
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
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="footer-social-link"
                {...(s.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
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
                <a href={`#${link.id}`} onClick={(e) => scrollToSection(e, link.id)}>
                  {link.label}
                </a>
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
              <a href="mailto:msdevelopersmangalore@gmail.com">msdevelopersmangalore@gmail.com</a>
            </li>
            <li>10:00 AM – 6:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} MS Developers. All rights reserved.</p>
        <p>
          Managed by{' '}
          <a href="https://www.yatharthsocial.com/" target="_blank" rel="noreferrer" className="footer-credit-link">
            Yatharth
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
