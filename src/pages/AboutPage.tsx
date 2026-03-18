import '../styles/about.css'
import { Link } from 'react-router-dom'

const leaders = [
  { name: 'Yinka Ogunnoiki', role: 'Pastor' },
  { name: 'Tolani Adegoroye', role: 'Children' },
  { name: 'Unoma Thomas', role: 'Choir' },
  { name: 'Ifedade Thomas', role: 'Media' },
  { name: 'Tracey Godwin', role: 'Ushering' },
  { name: 'Ayo Idowu-Obolo', role: 'Women' },
  { name: 'Jonathan Pettit', role: 'Welcome' },
  { name: 'Seyi Adegoroye', role: 'Men' },
  { name: 'Betty Jackson', role: 'Prayer' },
  { name: 'Kingsley Oghagbon', role: 'Maintenance' },
  { name: 'Lewa Thomas', role: 'Young Children' },
  { name: 'Sandra Oghagbon', role: 'Hospitality' },
]

export default function AboutPage() {
  const storyImages = [
    {
      src: '/optimized/about-story-1.jpg',
      alt: 'Worship moment during service',
    },
    {
      src: '/optimized/about-story-2.jpg',
      alt: 'Worship leader singing at the front',
    },
    {
      src: '/optimized/about-story-3.jpg',
      alt: 'Speaker sharing at Sunday service',
    },
    {
      src: '/optimized/about-story-4.jpg',
      alt: 'Church leader sharing a testimony',
    },
  ]

  return (
    <section className="page about-page">
      <section className="about-story">
        <div className="about-story-text">
          <span className="about-kicker">ABOUT TEAM CHURCH</span>
          <h1>About Us</h1>
          <p>
            Team Church Glasgow is a community of people who love Jesus and are
            passionate about seeing lives transformed by His presence.
          </p>
          <p>
            For more than 20 years, our church has been part of the city of
            Glasgow. Our heart is simple: to spread the knowledge of Christ and to
            see His Kingdom come in our city.
          </p>
          <p>
            Whether you have been following Jesus for many years or you are
            looking for a church to call home, you are welcome here.
          </p>
          <div className="about-story-extension">
            <span className="about-kicker">WHAT WE ARE ABOUT</span>
            <h2>What We Are About</h2>
            <p>Everything we do centres on Jesus.</p>
            <p>
              We believe the Bible is the Word of God and that the Holy Spirit is
              actively moving today. As a Spirit-filled church, we desire to
              encounter God through worship, prayer, and the teaching of
              Scripture.
            </p>
            <p>
              Our gatherings are a place where people can experience the
              presence of God, grow in their faith, and be strengthened in
              community.
            </p>
          </div>
        </div>
        <div className="about-collage">
          {storyImages.map((image) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </section>

      <section className="tone-section about-values-tone">
        <div className="tone-inner">
          <div className="about-section-header">
            <span className="about-kicker">WHAT WE BELIEVE</span>
            <h2>Our Core Values</h2>
            <p>
              These values shape who we are and guide everything we do as a
              church family.
            </p>
          </div>
          <div className="about-values-grid">
            <article className="about-value-card">
              <span className="about-value-icon" aria-hidden="true">❤</span>
              <h3>Love God</h3>
              <p>
                We pursue an authentic, passionate relationship with Jesus that
                transforms every area of life.
              </p>
            </article>
            <article className="about-value-card">
              <span className="about-value-icon" aria-hidden="true">🎉</span>
              <h3>Love People</h3>
              <p>
                We believe everyone matters to God, so everyone matters to us.
                No perfect people allowed.
              </p>
            </article>
            <article className="about-value-card">
              <span className="about-value-icon" aria-hidden="true">🙏</span>
              <h3>Make Disciples</h3>
              <p>
                We’re committed to helping people take their next steps of faith
                and grow as followers of Jesus.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-team">
        <div className="about-section-header">
          <span className="about-kicker">OUR LEADERS</span>
          <h2>Our Leaders</h2>
          <p>
            Our leadership team are committed to serving this community with love,
            prayer, and welcome.
          </p>
        </div>
        <div className="about-team-grid about-leaders-grid">
          {leaders.map((leader) => (
            <article key={leader.name} className="about-team-card">
              <h3>{leader.name}</h3>
              <p className="about-role">{leader.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tone-section about-visit">
        <div className="tone-inner">
          <div className="about-visit-inner">
            <h2>Ready to Visit?</h2>
            <p>
              We’d love to meet you this Sunday. Plan your visit and let us know
              you’re coming!
            </p>
            <Link className="about-visit-cta" to="/connect">
              Plan Your Visit <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </section>
  )
}
