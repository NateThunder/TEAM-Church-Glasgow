import '../styles/about.css'
import { Link } from 'react-router-dom'
import collageImage from '../assets/join.png'

export default function AboutPage() {
  return (
    <section className="page about-page">
      <section className="about-story">
        <div className="about-story-text">
          <span className="about-kicker">OUR STORY</span>
          <h1>A Church For Glasgow</h1>
          <p>
            Team Church Glasgow began in 2010 when a small group of
            Christ-followers gathered with a simple dream: to build a church
            where everyone belongs and faith comes alive.
          </p>
          <p>
            What started as 30 people meeting in a community centre has grown
            into a vibrant, diverse community of hundreds who gather each week
            to worship, grow, and serve together.
          </p>
          <p>
            We’re not perfect people. We’re simply ordinary people who have
            encountered the extraordinary love of Jesus and want to share that
            with our city. Whether you’re exploring faith or have followed Jesus
            for decades, there’s a place for you here.
          </p>
        </div>
        <div className="about-collage">
          <img src={collageImage} alt="Church community" />
          <img src={collageImage} alt="Worship gathering" />
          <img src={collageImage} alt="Small group" />
          <img src={collageImage} alt="Sunday service" />
        </div>
      </section>

      <section className="about-mission">
        <div className="about-mission-inner">
          <span className="about-kicker light">OUR MISSION</span>
          <h2>Helping People Find &amp; Follow Jesus</h2>
          <p>
            Everything we do flows from this simple mission. We want to create
            environments where people can encounter God, connect with
            community, and discover their purpose.
          </p>
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
              <span className="about-value-icon" aria-hidden="true">👥</span>
              <h3>Love People</h3>
              <p>
                We believe everyone matters to God, so everyone matters to us.
                No perfect people allowed.
              </p>
            </article>
            <article className="about-value-card">
              <span className="about-value-icon" aria-hidden="true">🌍</span>
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
          <span className="about-kicker">LEADERSHIP</span>
          <h2>Meet Our Team</h2>
          <p>
            Our pastoral team is passionate about serving this community and
            helping you grow.
          </p>
        </div>
        <div className="about-team-grid">
          <article className="about-team-card">
            <div className="about-team-photo">
              <img src={collageImage} alt="Pastor James and Sarah Mitchell" />
            </div>
            <h3>Pastor Yinka</h3>
            <span className="about-role">Head Pastors</span>
            <p>
              Pastor Yinka founded Team Church Glasgow in 2010 with a vision
              to see lives transformed by the Gospel.
            </p>
          </article>
          <article className="about-team-card">
            <div className="about-team-photo">
              <img src={collageImage} alt="David Thompson" />
            </div>
            <h3>Unoma Thomas</h3>
            <span className="about-role">Worship Leader</span>
            <p>
              David leads our worship ministry and is passionate about creating
              space for authentic encounters with God.
            </p>
          </article>
          <article className="about-team-card">
            <div className="about-team-photo">
              <img src={collageImage} alt="Emma Robertson" />
            </div>
            <h3>Emma Robertson</h3>
            <span className="about-role">Community Pastor</span>
            <p>
              Emma oversees our small groups and connection ministries, helping
              everyone find their place in community.
            </p>
          </article>
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
